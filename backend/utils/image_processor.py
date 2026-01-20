import cv2
import numpy as np
from PIL import Image
import pytesseract
import easyocr
import re
import base64
import io
from typing import Dict, List, Tuple, Optional

class ImageProcessor:
    """
    Image processing utility for fraud detection from screenshots and images
    """
    
    def __init__(self):
        # Initialize EasyOCR with verbose=False to avoid Unicode progress bar issues on Windows
        self.reader = easyocr.Reader(['en', 'ur'], verbose=False)  # English and Urdu support
        self.gambling_keywords = [
            'bet', 'casino', 'poker', 'roulette', 'jackpot', 'lottery', 'gamble',
            'aviator', 'crash', 'plinko', 'mines', 'dice', 'slots', 'spin',
            '1xbet', 'dafabet', '22bet', 'bet365', 'betway', 'melbet',
            'deposit', 'withdraw', 'balance', 'bonus', 'odds', 'stake'
        ]
        
        self.financial_keywords = [
            'easypaisa', 'jazzcash', 'sadapay', 'bank', 'transfer', 'payment',
            'account', 'transaction', 'money', 'rupees', 'pkr', 'rs'
        ]
        
        self.suspicious_patterns = [
            r'\b\d+x\b',  # Multiplier patterns like 2x, 10x
            r'\b\d+\.\d+x\b',  # Decimal multipliers like 1.5x, 2.3x
            r'₹\s?\d+',  # Currency amounts
            r'PKR\s?\d+',  # Pakistani Rupee amounts
            r'Rs\.\s?\d+',  # Rupee amounts
            r'\b\d+:\d+\b',  # Time patterns (betting times)
        ]
    
    def decode_base64_image(self, base64_string: str) -> np.ndarray:
        """
        Decode base64 image string to OpenCV format
        """
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return cv_image
        except Exception as e:
            raise ValueError(f"Failed to decode image: {str(e)}")
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for better OCR results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Morphological operations to clean up
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def extract_text_easyocr(self, image: np.ndarray) -> List[str]:
        """
        Extract text using EasyOCR
        """
        try:
            results = self.reader.readtext(image)
            texts = [result[1] for result in results if result[2] > 0.5]  # Confidence > 0.5
            return texts
        except Exception as e:
            print(f"EasyOCR extraction failed: {str(e)}")
            return []
    
    def extract_text_tesseract(self, image: np.ndarray) -> str:
        """
        Extract text using Tesseract OCR (optional, not required with EasyOCR)
        """
        # Tesseract not required; EasyOCR is primary
        return ""
    
    def detect_ui_elements(self, image: np.ndarray) -> Dict:
        """
        Detect common gambling app UI elements
        """
        ui_elements = {
            'buttons': [],
            'input_fields': [],
            'balance_display': False,
            'betting_interface': False,
            'game_elements': False
        }
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect rectangular shapes (buttons, input fields)
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h
            area = cv2.contourArea(contour)
            
            # Filter by size and aspect ratio
            if area > 1000 and 0.2 < aspect_ratio < 5:
                if 2 < aspect_ratio < 5:  # Button-like
                    ui_elements['buttons'].append((x, y, w, h))
                elif 0.8 < aspect_ratio < 1.2:  # Square-like (input fields)
                    ui_elements['input_fields'].append((x, y, w, h))
        
        return ui_elements
    
    def analyze_color_scheme(self, image: np.ndarray) -> Dict:
        """
        Analyze color scheme for gambling app indicators
        """
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Define color ranges for gambling-associated colors
        red_lower = np.array([0, 50, 50])
        red_upper = np.array([10, 255, 255])
        red_mask = cv2.inRange(hsv, red_lower, red_upper)
        
        green_lower = np.array([50, 50, 50])
        green_upper = np.array([70, 255, 255])
        green_mask = cv2.inRange(hsv, green_lower, green_upper)
        
        gold_lower = np.array([15, 50, 50])
        gold_upper = np.array([35, 255, 255])
        gold_mask = cv2.inRange(hsv, gold_lower, gold_upper)
        
        total_pixels = image.shape[0] * image.shape[1]
        red_percentage = (np.sum(red_mask > 0) / total_pixels) * 100
        green_percentage = (np.sum(green_mask > 0) / total_pixels) * 100
        gold_percentage = (np.sum(gold_mask > 0) / total_pixels) * 100
        
        return {
            'red_percentage': float(red_percentage),
            'green_percentage': float(green_percentage),
            'gold_percentage': float(gold_percentage),
            'gambling_colors': bool(red_percentage > 5 or green_percentage > 5 or gold_percentage > 3)
        }
    
    def extract_features_from_image(self, base64_image: str) -> Dict:
        """
        Extract comprehensive features from uploaded image
        """
        try:
            # Decode image
            image = self.decode_base64_image(base64_image)
            
            # Extract text using both OCR methods
            easyocr_texts = self.extract_text_easyocr(image)
            tesseract_text = self.extract_text_tesseract(image)
            
            # Combine all extracted text
            all_text = ' '.join(easyocr_texts) + ' ' + tesseract_text
            all_text = all_text.lower()
            
            # Detect gambling keywords
            gambling_matches = [keyword for keyword in self.gambling_keywords if keyword in all_text]
            
            # Detect financial keywords
            financial_matches = [keyword for keyword in self.financial_keywords if keyword in all_text]
            
            # Find suspicious patterns
            pattern_matches = []
            for pattern in self.suspicious_patterns:
                matches = re.findall(pattern, all_text, re.IGNORECASE)
                pattern_matches.extend(matches)
            
            # Analyze UI elements
            ui_analysis = self.detect_ui_elements(image)
            
            # Analyze color scheme
            color_analysis = self.analyze_color_scheme(image)
            
            # Calculate fraud indicators
            fraud_score = self._calculate_fraud_score(
                gambling_matches, financial_matches, pattern_matches, 
                ui_analysis, color_analysis
            )
            
            return {
                'extracted_text': all_text,
                'gambling_keywords': gambling_matches,
                'financial_keywords': financial_matches,
                'suspicious_patterns': pattern_matches,
                'ui_elements': ui_analysis,
                'color_analysis': color_analysis,
                'fraud_score': fraud_score,
                'confidence': min(0.95, fraud_score / 100),
                'text_extraction_methods': {
                    'easyocr_results': easyocr_texts,
                    'tesseract_result': tesseract_text
                }
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'fraud_score': 0,
                'confidence': 0
            }
    
    def _calculate_fraud_score(self, gambling_matches: List[str], financial_matches: List[str], 
                              pattern_matches: List[str], ui_analysis: Dict, color_analysis: Dict) -> float:
        """
        Calculate fraud probability score based on extracted features
        """
        score = 0
        
        # Gambling keywords (high weight)
        score += len(gambling_matches) * 15
        
        # Financial keywords combined with gambling (very high weight)
        if gambling_matches and financial_matches:
            score += 25
        
        # Suspicious patterns
        score += len(pattern_matches) * 8
        
        # UI elements indicating betting interface
        if len(ui_analysis['buttons']) > 5:
            score += 10
        
        # Color scheme analysis
        if color_analysis['gambling_colors']:
            score += 12
        
        # Specific high-risk combinations
        high_risk_combinations = [
            ('bet', 'balance'), ('casino', 'deposit'), ('aviator', 'crash'),
            ('1xbet', 'login'), ('withdraw', 'bonus')
        ]
        
        for combo in high_risk_combinations:
            if all(keyword in ' '.join(gambling_matches + financial_matches) for keyword in combo):
                score += 20
        
        # Cap score at 100
        return float(min(100, score))
    
    def process_live_frame(self, base64_image: str, focus_regions=None):
        """Process live camera frame with enhanced text extraction"""
        try:
            image = self.decode_base64_image(base64_image)
            preprocessed = self.preprocess_image(image)
            easyocr_texts = self.extract_text_easyocr(preprocessed)
            all_text = ' '.join(easyocr_texts).lower()
            
            gambling_matches = [kw for kw in self.gambling_keywords if kw in all_text]
            financial_matches = [kw for kw in self.financial_keywords if kw in all_text]
            
            ui_analysis = self.detect_ui_elements(image)
            color_analysis = self.analyze_color_scheme(image)
            
            fraud_score = self._calculate_fraud_score(
                gambling_matches, financial_matches, [], ui_analysis, color_analysis
            )
            
            return {
                'extracted_text': all_text,
                'gambling_keywords': gambling_matches,
                'financial_keywords': financial_matches,
                'ui_elements': ui_analysis,
                'color_analysis': color_analysis,
                'fraud_score': fraud_score,
                'confidence': min(0.95, fraud_score / 100),
                'text_extracted': len(all_text.strip()) > 0,
                'detailed_analysis': {
                    'text_extracted': len(all_text.strip()) > 0,
                    'gambling_indicators': len(gambling_matches),
                    'financial_indicators': len(financial_matches),
                    'visual_elements': len(ui_analysis['buttons']) + len(ui_analysis['input_fields']),
                    'color_scheme_suspicious': color_analysis.get('gambling_colors', False)
                }
            }
        except Exception as e:
            return {
                'error': str(e),
                'fraud_score': 0,
                'confidence': 0,
                'detailed_analysis': {
                    'text_extracted': False,
                    'gambling_indicators': 0,
                    'financial_indicators': 0,
                    'visual_elements': 0,
                    'color_scheme_suspicious': False
                }
            }
    
    def detect_app_interface_type(self, features: Dict) -> str:
        """
        Classify type of interface detected in image
        """
        gambling_keywords = features.get('gambling_keywords', [])
        financial_keywords = features.get('financial_keywords', [])
        
        if any(keyword in ['aviator', 'crash', 'mines', 'plinko'] for keyword in gambling_keywords):
            return 'gambling_game'
        elif any(keyword in ['1xbet', 'dafabet', '22bet'] for keyword in gambling_keywords):
            return 'betting_platform'
        elif gambling_keywords and financial_keywords:
            return 'financial_gambling'
        elif financial_keywords:
            return 'financial_app'
        else:
            return 'unknown'
        
