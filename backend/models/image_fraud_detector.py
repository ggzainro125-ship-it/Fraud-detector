import numpy as np
from typing import Dict, List, Tuple
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import pickle
import cv2
import base64
import io

class ImageFraudDetector:
    """
    AI model for detecting fraud from image analysis results
    """
    
    def __init__(self):
        self.model = None
        self.text_vectorizer = None
        self.feature_scaler = None
        self.is_trained = False
        
        # Load pre-trained model if available
        self._load_model()
        
        # If no model exists, create and train a basic one
        if not self.is_trained:
            self._create_basic_model()
    
    def _load_model(self):
        """
        Load pre-trained model from disk
        """
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'saved_models')
            
            if os.path.exists(os.path.join(model_dir, 'image_fraud_model.pkl')):
                self.model = joblib.load(os.path.join(model_dir, 'image_fraud_model.pkl'))
                self.text_vectorizer = joblib.load(os.path.join(model_dir, 'text_vectorizer.pkl'))
                self.feature_scaler = joblib.load(os.path.join(model_dir, 'feature_scaler.pkl'))
                self.is_trained = True
                print("Loaded pre-trained image fraud detection model")
        except Exception as e:
            print(f"Could not load pre-trained model: {str(e)}")
    
    def _create_basic_model(self):
        """
        Create and train a basic model with synthetic data
        """
        print("Creating basic image fraud detection model...")
        
        # Initialize components
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.text_vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words='english'
        )
        self.feature_scaler = StandardScaler()
        
        # Generate synthetic training data
        X_text, X_features, y = self._generate_synthetic_data()
        
        # Fit text vectorizer
        X_text_vectorized = self.text_vectorizer.fit_transform(X_text)
        
        # Scale numerical features
        X_features_scaled = self.feature_scaler.fit_transform(X_features)
        
        # Combine features
        X_combined = np.hstack([
            X_text_vectorized.toarray(),
            X_features_scaled
        ])
        
        # Train model
        self.model.fit(X_combined, y)
        self.is_trained = True
        
        # Save model
        self._save_model()
        
        print("Basic image fraud detection model created and trained")
    
    def _generate_synthetic_data(self) -> Tuple[List[str], np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for the model
        """
        # Fraudulent examples
        fraud_texts = [
            "1xbet login deposit withdraw balance betting odds",
            "aviator crash game multiplier bet win lose",
            "dafabet casino poker roulette jackpot bonus",
            "22bet sports betting live odds stake profit",
            "plinko mines dice slots spin win money",
            "bet365 football cricket betting odds live",
            "melbet casino games deposit bonus withdraw",
            "gambling app bet money win lose jackpot",
            "easypaisa jazzcash deposit betting account transfer",
            "balance pkr rupees withdraw deposit gambling"
        ]
        
        # Legitimate examples
        legitimate_texts = [
            "banking app account balance transfer payment",
            "ecommerce shopping cart checkout payment gateway",
            "social media posts likes comments share",
            "news app articles headlines breaking news",
            "weather forecast temperature rain sunny cloudy",
            "calculator math operations numbers results",
            "messaging app chat send receive messages",
            "music player songs playlist play pause",
            "photo gallery images pictures albums share",
            "settings preferences notifications privacy security"
        ]
        
        # Create feature vectors
        fraud_features = []
        legitimate_features = []
        
        # Features: [gambling_keywords_count, financial_keywords_count, suspicious_patterns_count, 
        #           ui_buttons_count, fraud_score, red_percentage, green_percentage, gold_percentage]
        
        # Fraudulent features (higher values for fraud indicators)
        for _ in range(len(fraud_texts)):
            fraud_features.append([
                np.random.randint(3, 8),    # gambling_keywords_count
                np.random.randint(2, 5),    # financial_keywords_count
                np.random.randint(1, 4),    # suspicious_patterns_count
                np.random.randint(5, 15),   # ui_buttons_count
                np.random.uniform(60, 95),  # fraud_score
                np.random.uniform(5, 20),   # red_percentage
                np.random.uniform(3, 15),   # green_percentage
                np.random.uniform(2, 10)    # gold_percentage
            ])
        
        # Legitimate features (lower values for fraud indicators)
        for _ in range(len(legitimate_texts)):
            legitimate_features.append([
                np.random.randint(0, 2),    # gambling_keywords_count
                np.random.randint(0, 2),    # financial_keywords_count
                np.random.randint(0, 1),    # suspicious_patterns_count
                np.random.randint(1, 6),    # ui_buttons_count
                np.random.uniform(0, 25),   # fraud_score
                np.random.uniform(0, 5),    # red_percentage
                np.random.uniform(0, 5),    # green_percentage
                np.random.uniform(0, 3)     # gold_percentage
            ])
        
        # Combine data
        X_text = fraud_texts + legitimate_texts
        X_features = np.array(fraud_features + legitimate_features)
        y = np.array([1] * len(fraud_texts) + [0] * len(legitimate_texts))
        
        return X_text, X_features, y
    
    def _save_model(self):
        """
        Save trained model to disk
        """
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'saved_models')
            os.makedirs(model_dir, exist_ok=True)
            
            joblib.dump(self.model, os.path.join(model_dir, 'image_fraud_model.pkl'))
            joblib.dump(self.text_vectorizer, os.path.join(model_dir, 'text_vectorizer.pkl'))
            joblib.dump(self.feature_scaler, os.path.join(model_dir, 'feature_scaler.pkl'))
            
            print("Image fraud detection model saved successfully")
        except Exception as e:
            print(f"Could not save model: {str(e)}")
    
    def extract_model_features(self, image_features: Dict) -> np.ndarray:
        """
        Extract features for the ML model from image analysis results
        """
        gambling_keywords = image_features.get('gambling_keywords', [])
        financial_keywords = image_features.get('financial_keywords', [])
        suspicious_patterns = image_features.get('suspicious_patterns', [])
        ui_elements = image_features.get('ui_elements', {})
        color_analysis = image_features.get('color_analysis', {})
        
        features = [
            len(gambling_keywords),
            len(financial_keywords),
            len(suspicious_patterns),
            len(ui_elements.get('buttons', [])),
            image_features.get('fraud_score', 0),
            color_analysis.get('red_percentage', 0),
            color_analysis.get('green_percentage', 0),
            color_analysis.get('gold_percentage', 0)
        ]
        
        return np.array(features).reshape(1, -1)
    
    def predict_fraud(self, image_features: Dict) -> Dict:
        """
        Predict fraud probability from image analysis results
        """
        if not self.is_trained:
            return {
                'is_fraud': False,
                'confidence': 0.0,
                'risk_level': 'unknown',
                'warnings': ['Model not trained'],
                'method': 'rule_based_fallback'
            }
        
        try:
            # Extract text and features
            extracted_text = image_features.get('extracted_text', '')
            numerical_features = self.extract_model_features(image_features)
            
            # Vectorize text
            text_features = self.text_vectorizer.transform([extracted_text])
            
            # Scale numerical features
            scaled_features = self.feature_scaler.transform(numerical_features)
            
            # Combine features
            combined_features = np.hstack([
                text_features.toarray(),
                scaled_features
            ])
            
            # Make prediction
            fraud_probability = self.model.predict_proba(combined_features)[0][1]
            is_fraud = fraud_probability > 0.5
            
            # Determine risk level
            if fraud_probability >= 0.8:
                risk_level = 'critical'
            elif fraud_probability >= 0.6:
                risk_level = 'high'
            elif fraud_probability >= 0.3:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Generate warnings
            warnings = self._generate_warnings(image_features, fraud_probability)
            
            return {
                'is_fraud': bool(is_fraud),
                'confidence': float(fraud_probability),
                'risk_level': risk_level,
                'warnings': warnings,
                'method': 'ml_prediction',
                'model_features': {
                    'gambling_keywords_count': len(image_features.get('gambling_keywords', [])),
                    'financial_keywords_count': len(image_features.get('financial_keywords', [])),
                    'suspicious_patterns_count': len(image_features.get('suspicious_patterns', [])),
                    'ui_elements_detected': len(image_features.get('ui_elements', {}).get('buttons', [])),
                    'fraud_score': float(image_features.get('fraud_score', 0))
                }
            }
            
        except Exception as e:
            # Fallback to rule-based detection
            return self._rule_based_prediction(image_features, str(e))
    
    def _rule_based_prediction(self, image_features: Dict, error: str = None) -> Dict:
        """
        Fallback rule-based prediction when ML model fails
        """
        gambling_keywords = image_features.get('gambling_keywords', [])
        financial_keywords = image_features.get('financial_keywords', [])
        fraud_score = image_features.get('fraud_score', 0)
        
        # Simple rule-based logic
        is_fraud = (
            len(gambling_keywords) >= 2 or
            fraud_score >= 50 or
            (len(gambling_keywords) >= 1 and len(financial_keywords) >= 1)
        )
        
        confidence = min(0.8, fraud_score / 100) if is_fraud else max(0.2, (100 - fraud_score) / 100)
        
        risk_level = 'high' if fraud_score >= 70 else 'medium' if fraud_score >= 40 else 'low'
        
        warnings = ['Using rule-based detection (ML model unavailable)']
        if error:
            warnings.append(f'ML model error: {error}')
        
        warnings.extend(self._generate_warnings(image_features, confidence))
        
        return {
            'is_fraud': bool(is_fraud),
            'confidence': float(confidence),
            'risk_level': risk_level,
            'warnings': warnings,
            'method': 'rule_based'
        }
    
    def _generate_warnings(self, image_features: Dict, confidence: float) -> List[str]:
        """
        Generate specific warnings based on detected features
        """
        warnings = []
        
        gambling_keywords = image_features.get('gambling_keywords', [])
        financial_keywords = image_features.get('financial_keywords', [])
        suspicious_patterns = image_features.get('suspicious_patterns', [])
        
        if gambling_keywords:
            warnings.append(f"Gambling-related content detected: {', '.join(gambling_keywords[:3])}")
        
        if financial_keywords and gambling_keywords:
            warnings.append("Financial and gambling elements combined - high fraud risk")
        
        if suspicious_patterns:
            warnings.append(f"Suspicious betting patterns found: {len(suspicious_patterns)} instances")
        
        if any(keyword in gambling_keywords for keyword in ['1xbet', 'dafabet', '22bet']):
            warnings.append("Known banned gambling platform detected")
        
        if confidence > 0.8:
            warnings.append("Very high confidence fraud detection - immediate action recommended")
        
        return warnings
    
    def analyze_image_fraud(self, image_features: Dict) -> Dict:
        """
        Complete image fraud analysis
        """
        # Get ML prediction
        prediction = self.predict_fraud(image_features)
        
        # Add additional analysis
        interface_type = self._detect_interface_type(image_features)
        islamic_compliance = self._check_islamic_compliance(image_features)
        
        return {
            **prediction,
            'interface_type': interface_type,
            'islamic_compliance': islamic_compliance,
            'detailed_analysis': {
                'text_extracted': len(image_features.get('extracted_text', '')) > 10,
                'gambling_indicators': len(image_features.get('gambling_keywords', [])),
                'financial_indicators': len(image_features.get('financial_keywords', [])),
                'visual_elements': len(image_features.get('ui_elements', {}).get('buttons', [])),
                'color_scheme_suspicious': image_features.get('color_analysis', {}).get('gambling_colors', False)
            }
        }
    
    def _detect_interface_type(self, image_features: Dict) -> str:
        """
        Detect the type of interface from the image
        """
        gambling_keywords = image_features.get('gambling_keywords', [])
        
        if any(keyword in gambling_keywords for keyword in ['aviator', 'crash', 'mines']):
            return 'gambling_game'
        elif any(keyword in gambling_keywords for keyword in ['1xbet', 'dafabet', 'bet365']):
            return 'betting_platform'
        elif any(keyword in gambling_keywords for keyword in ['casino', 'poker', 'roulette']):
            return 'casino_game'
        elif gambling_keywords:
            return 'gambling_related'
        else:
            return 'non_gambling'
    
    def _check_islamic_compliance(self, image_features: Dict) -> Dict:
        """
        Check Islamic compliance based on detected content
        """
        gambling_keywords = image_features.get('gambling_keywords', [])
        
        # Maisir (gambling) detection
        maisir_detected = len(gambling_keywords) > 0
        
        # Riba (interest) detection - look for interest-related terms
        riba_keywords = ['interest', 'loan', 'credit', 'apr', 'rate']
        extracted_text = image_features.get('extracted_text', '').lower()
        riba_detected = any(keyword in extracted_text for keyword in riba_keywords)
        
        # Gharar (excessive uncertainty) detection
        gharar_keywords = ['lottery', 'random', 'chance', 'luck', 'jackpot']
        gharar_detected = any(keyword in extracted_text for keyword in gharar_keywords)
        
        is_halal = not (maisir_detected or riba_detected or gharar_detected)
        
        return {
            'is_halal': is_halal,
            'maisir': 'Detected' if maisir_detected else 'Not Detected',
            'riba': 'Detected' if riba_detected else 'Not Detected',
            'gharar': 'Detected' if gharar_detected else 'Not Detected',
            'violations': [
                violation for violation, detected in [
                    ('Maisir (Gambling)', maisir_detected),
                    ('Riba (Interest)', riba_detected),
                    ('Gharar (Uncertainty)', gharar_detected)
                ] if detected
            ]
        }

    def predict_base64_image(self, base64_image: str) -> Dict:
        """
        Accept a base64 data URL (or raw base64 string), extract features using ImageProcessor,
        and return the fraud analysis result.
        """
        try:
            from utils.image_processor import ImageProcessor
            if not hasattr(self, '_image_processor') or self._image_processor is None:
                # Cache the processor to avoid reinitializing heavy OCR engines repeatedly
                self._image_processor = ImageProcessor()

            features = self._image_processor.extract_features_from_image(base64_image)
            return self.analyze_image_fraud(features)
        except Exception as e:
            return {'error': str(e)}

    def predict_frame(self, frame: np.ndarray) -> Dict:
        """
        Accept an OpenCV BGR image (`np.ndarray`), encode to JPEG base64 and run prediction.
        """
        try:
            # Encode frame to JPEG bytes
            success, buf = cv2.imencode('.jpg', frame)
            if not success:
                return {'error': 'frame_encoding_failed'}

            b64 = base64.b64encode(buf.tobytes()).decode('utf-8')
            data_url = f'data:image/jpeg;base64,{b64}'
            return self.predict_base64_image(data_url)
        except Exception as e:
            return {'error': str(e)}
