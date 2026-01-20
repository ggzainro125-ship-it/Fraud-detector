import re
import numpy as np
import pandas as pd
from urllib.parse import urlparse
import hashlib

class DataProcessor:
    def __init__(self):
        # Known gambling keywords for feature extraction
        self.gambling_keywords = [
            '1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko',
            'casino', 'poker', 'slots', 'betting', 'gamble', 'lottery',
            'roulette', 'blackjack', 'baccarat', 'dice', 'spin', 'jackpot'
        ]
        
        # Offshore developer indicators
        self.offshore_indicators = [
            'curacao', 'malta', 'gibraltar', 'cyprus', 'offshore',
            'international', 'global', 'worldwide', 'ltd', 'inc'
        ]
        
        # Suspicious permission patterns
        self.risky_permissions = [
            'READ_SMS', 'SEND_SMS', 'READ_CONTACTS', 'ACCESS_FINE_LOCATION',
            'CAMERA', 'RECORD_AUDIO', 'READ_PHONE_STATE', 'CALL_PHONE',
            'WRITE_EXTERNAL_STORAGE', 'READ_EXTERNAL_STORAGE'
        ]
    
    def extract_app_features(self, app_name, additional_data=None):
        """Extract features from app data for ML models"""
        features = {}
        
        # Basic app name analysis
        app_name_lower = app_name.lower()
        
        # Gambling keyword detection
        features['has_gambling_keywords'] = int(
            any(keyword in app_name_lower for keyword in self.gambling_keywords)
        )
        
        # Count gambling keywords
        features['gambling_keyword_count'] = sum(
            1 for keyword in self.gambling_keywords if keyword in app_name_lower
        )
        
        # App name characteristics
        features['app_name_length'] = len(app_name)
        features['has_numbers'] = int(bool(re.search(r'\d', app_name)))
        features['has_special_chars'] = int(bool(re.search(r'[^a-zA-Z0-9\s]', app_name)))
        features['word_count'] = len(app_name.split())
        
        # Developer analysis (if available)
        if additional_data and 'developer' in additional_data:
            developer = additional_data['developer'].lower()
            features['offshore_developer'] = int(
                any(indicator in developer for indicator in self.offshore_indicators)
            )
        else:
            # Estimate based on app name patterns
            features['offshore_developer'] = int(
                features['has_gambling_keywords'] or 
                any(indicator in app_name_lower for indicator in self.offshore_indicators)
            )
        
        # Permission analysis (if available)
        if additional_data and 'permissions' in additional_data:
            permissions = additional_data['permissions']
            features['suspicious_permissions'] = sum(
                1 for perm in permissions if perm in self.risky_permissions
            )
            features['total_permissions'] = len(permissions)
        else:
            # Estimate based on app type
            if features['has_gambling_keywords']:
                features['suspicious_permissions'] = np.random.randint(5, 10)
                features['total_permissions'] = np.random.randint(8, 15)
            else:
                features['suspicious_permissions'] = np.random.randint(0, 3)
                features['total_permissions'] = np.random.randint(3, 8)
        
        # App behavior patterns (synthetic/estimated)
        if additional_data:
            features['payment_frequency'] = additional_data.get('payment_frequency', 
                np.random.exponential(10) if features['has_gambling_keywords'] else np.random.exponential(2)
            )
            features['retention_rate'] = additional_data.get('retention_rate',
                np.random.beta(1, 4) if features['has_gambling_keywords'] else np.random.beta(3, 2)
            )
            features['user_complaints'] = additional_data.get('user_complaints',
                np.random.poisson(8) if features['has_gambling_keywords'] else np.random.poisson(1)
            )
        else:
            # Generate synthetic features based on gambling indicators
            if features['has_gambling_keywords']:
                features['payment_frequency'] = np.random.exponential(10)
                features['retention_rate'] = np.random.beta(1, 4)
                features['user_complaints'] = np.random.poisson(8)
            else:
                features['payment_frequency'] = np.random.exponential(2)
                features['retention_rate'] = np.random.beta(3, 2)
                features['user_complaints'] = np.random.poisson(1)
        
        # App store metrics (synthetic)
        if additional_data:
            features['download_count'] = additional_data.get('downloads', 
                np.random.randint(1000, 100000)
            )
            features['rating'] = additional_data.get('rating',
                np.random.uniform(2.0, 3.5) if features['has_gambling_keywords'] else np.random.uniform(3.5, 4.8)
            )
        else:
            features['download_count'] = np.random.randint(1000, 100000)
            features['rating'] = (
                np.random.uniform(2.0, 3.5) if features['has_gambling_keywords'] 
                else np.random.uniform(3.5, 4.8)
            )
        
        return features
    
    def extract_transaction_features(self, transaction_data):
        """Extract features from transaction data"""
        features = {}
        
        # If transaction_data is a string, parse it
        if isinstance(transaction_data, str):
            # Try to extract amount if present
            amount_match = re.search(r'[\d,]+\.?\d*', transaction_data)
            if amount_match:
                amount = float(amount_match.group().replace(',', ''))
                features['amount'] = amount
                features['is_round_number'] = int(amount % 100 == 0)
            else:
                features['amount'] = np.random.uniform(100, 50000)
                features['is_round_number'] = 0
            
            # Check for gambling-related terms
            transaction_lower = transaction_data.lower()
            features['has_gambling_terms'] = int(
                any(keyword in transaction_lower for keyword in self.gambling_keywords)
            )
            
            # Synthetic features based on content
            if features['has_gambling_terms']:
                features['amount_variance'] = np.random.exponential(3000)
                features['round_number_ratio'] = np.random.beta(3, 2)
                features['night_transaction_ratio'] = np.random.beta(2, 3)
                features['transaction_velocity'] = np.random.exponential(8)
                features['merchant_diversity'] = np.random.randint(1, 5)
            else:
                features['amount_variance'] = np.random.exponential(800)
                features['round_number_ratio'] = np.random.beta(1, 4)
                features['night_transaction_ratio'] = np.random.beta(1, 9)
                features['transaction_velocity'] = np.random.exponential(2)
                features['merchant_diversity'] = np.random.randint(5, 20)
        
        else:
            # If it's already structured data
            features.update(transaction_data)
        
        return features
    
    def extract_url_features(self, url):
        """Extract features from URL data"""
        features = {'url': url}
        
        try:
            parsed_url = urlparse(url)
            
            # Basic URL characteristics
            features['domain'] = parsed_url.netloc.lower()
            features['path'] = parsed_url.path.lower()
            features['has_subdomain'] = int(len(parsed_url.netloc.split('.')) > 2)
            features['url_length'] = len(url)
            features['path_length'] = len(parsed_url.path)
            
            # Domain analysis
            domain_parts = parsed_url.netloc.split('.')
            features['domain_length'] = len(parsed_url.netloc)
            features['has_numbers_in_domain'] = int(bool(re.search(r'\d', parsed_url.netloc)))
            features['has_hyphens_in_domain'] = int('-' in parsed_url.netloc)
            
            # Check for gambling keywords in URL
            full_url_lower = url.lower()
            features['has_gambling_keywords'] = int(
                any(keyword in full_url_lower for keyword in self.gambling_keywords)
            )
            
            # Check for suspicious TLD
            suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.cc', '.pw', '.top']
            tld = '.' + domain_parts[-1] if domain_parts else ''
            features['suspicious_tld'] = int(tld in suspicious_tlds)
            
            # Check for URL shorteners
            shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly']
            features['is_url_shortener'] = int(
                any(shortener in parsed_url.netloc for shortener in shorteners)
            )
            
            # HTTPS check
            features['is_https'] = int(parsed_url.scheme == 'https')
            
        except Exception as e:
            # If URL parsing fails, set default values
            features.update({
                'domain': '',
                'path': '',
                'has_subdomain': 0,
                'url_length': len(url),
                'path_length': 0,
                'domain_length': 0,
                'has_numbers_in_domain': 0,
                'has_hyphens_in_domain': 0,
                'has_gambling_keywords': 0,
                'suspicious_tld': 0,
                'is_url_shortener': 0,
                'is_https': 0
            })
        
        return features
    
    def preprocess_text(self, text):
        """Preprocess text for NLP analysis"""
        if not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_behavioral_features(self, user_data):
        """Extract behavioral features from user interaction data"""
        features = {}
        
        if not user_data:
            return features
        
        # Transaction timing patterns
        if 'transaction_times' in user_data:
            times = user_data['transaction_times']
            night_transactions = sum(1 for t in times if 22 <= t.hour or t.hour <= 6)
            features['night_transaction_ratio'] = night_transactions / len(times) if times else 0
        
        # Amount patterns
        if 'transaction_amounts' in user_data:
            amounts = user_data['transaction_amounts']
            features['amount_variance'] = np.var(amounts) if amounts else 0
            features['amount_mean'] = np.mean(amounts) if amounts else 0
            features['round_number_ratio'] = sum(1 for a in amounts if a % 100 == 0) / len(amounts) if amounts else 0
        
        # Frequency patterns
        if 'transaction_dates' in user_data:
            dates = user_data['transaction_dates']
            if len(dates) > 1:
                date_diffs = [(dates[i] - dates[i-1]).days for i in range(1, len(dates))]
                features['avg_days_between_transactions'] = np.mean(date_diffs)
                features['transaction_frequency_variance'] = np.var(date_diffs)
        
        return features
    
    def normalize_features(self, features):
        """Normalize feature values for ML models"""
        normalized = features.copy()
        
        # Log transform for highly skewed features
        log_transform_features = ['payment_frequency', 'amount_variance', 'user_complaints']
        for feature in log_transform_features:
            if feature in normalized:
                normalized[feature] = np.log1p(normalized[feature])
        
        # Clip extreme values
        clip_features = {
            'retention_rate': (0, 1),
            'rating': (1, 5),
            'suspicious_permissions': (0, 20)
        }
        
        for feature, (min_val, max_val) in clip_features.items():
            if feature in normalized:
                normalized[feature] = np.clip(normalized[feature], min_val, max_val)
        
        return normalized
    
    def create_feature_hash(self, features):
        """Create a hash of features for caching/comparison"""
        feature_str = str(sorted(features.items()))
        return hashlib.md5(feature_str.encode()).hexdigest()[:16]
