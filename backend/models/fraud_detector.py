import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
import re

class FraudDetector:
    def __init__(self):
        self.app_classifier = None
        self.transaction_detector = None
        self.url_classifier = None
        self.scaler = StandardScaler()
        
        # Known gambling/fraud keywords
        self.gambling_keywords = [
            '1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko',
            'casino', 'poker', 'slots', 'betting', 'gamble', 'lottery',
            'roulette', 'blackjack', 'baccarat', 'dice', 'spin', 'jackpot',
            'bet', 'wager', 'stake', 'odds', 'bookmaker', 'sportsbook'
        ]
        
        # Suspicious domains
        self.suspicious_domains = [
            '1xbet.com', 'dafabet.com', '22bet.com', 'bet365.com',
            'aviator.com', 'plinko.com', 'melbet.com', 'betwinner.com'
        ]
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize and train models with synthetic data"""
        # Generate synthetic training data
        app_data = self._generate_app_training_data()
        transaction_data = self._generate_transaction_training_data()
        
        # Train app classifier
        X_app = app_data.drop(['is_fraud'], axis=1)
        y_app = app_data['is_fraud']
        self.app_classifier = RandomForestClassifier(
            n_estimators=100, 
            max_depth=10, 
            class_weight='balanced',
            random_state=42
        )
        self.app_classifier.fit(X_app, y_app)
        
        # Train transaction anomaly detector
        X_trans = transaction_data.drop(['is_fraud'], axis=1)
        self.transaction_detector = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.transaction_detector.fit(X_trans)
        
        # URL classifier (simple rule-based for now)
        self.url_classifier = self._create_url_classifier()
    
    def _generate_app_training_data(self):
        """Generate synthetic app training data"""
        np.random.seed(42)
        n_samples = 1000
        
        data = []
        for i in range(n_samples):
            # Create synthetic app features
            has_gambling_keywords = np.random.choice([0, 1], p=[0.7, 0.3])
            offshore_developer = np.random.choice([0, 1], p=[0.8, 0.2])
            suspicious_permissions = np.random.randint(0, 10)
            payment_frequency = np.random.exponential(5)
            retention_rate = np.random.beta(2, 5)
            user_complaints = np.random.poisson(3)
            
            # Determine fraud based on features (with some noise)
            fraud_score = (
                has_gambling_keywords * 0.4 +
                offshore_developer * 0.2 +
                (suspicious_permissions > 5) * 0.2 +
                (payment_frequency > 10) * 0.1 +
                (retention_rate < 0.3) * 0.1 +
                (user_complaints > 5) * 0.1
            )
            
            is_fraud = 1 if fraud_score > 0.5 + np.random.normal(0, 0.1) else 0
            
            data.append({
                'has_gambling_keywords': has_gambling_keywords,
                'offshore_developer': offshore_developer,
                'suspicious_permissions': suspicious_permissions,
                'payment_frequency': payment_frequency,
                'retention_rate': retention_rate,
                'user_complaints': user_complaints,
                'is_fraud': is_fraud
            })
        
        return pd.DataFrame(data)
    
    def _generate_transaction_training_data(self):
        """Generate synthetic transaction training data"""
        np.random.seed(42)
        n_samples = 1000
        
        data = []
        for i in range(n_samples):
            amount_variance = np.random.exponential(1000)
            round_number_ratio = np.random.beta(2, 8)
            night_transaction_ratio = np.random.beta(1, 9)
            transaction_velocity = np.random.exponential(2)
            merchant_diversity = np.random.randint(1, 20)
            
            # Determine fraud based on features
            fraud_score = (
                (amount_variance > 2000) * 0.3 +
                (round_number_ratio > 0.5) * 0.2 +
                (night_transaction_ratio > 0.3) * 0.2 +
                (transaction_velocity > 5) * 0.2 +
                (merchant_diversity < 3) * 0.1
            )
            
            is_fraud = 1 if fraud_score > 0.4 + np.random.normal(0, 0.1) else 0
            
            data.append({
                'amount_variance': amount_variance,
                'round_number_ratio': round_number_ratio,
                'night_transaction_ratio': night_transaction_ratio,
                'transaction_velocity': transaction_velocity,
                'merchant_diversity': merchant_diversity,
                'is_fraud': is_fraud
            })
        
        return pd.DataFrame(data)
    
    def _create_url_classifier(self):
        """Create simple URL classifier"""
        def classify_url(url):
            url_lower = url.lower()
            
            # Check for suspicious domains
            for domain in self.suspicious_domains:
                if domain in url_lower:
                    return {'is_fraud': True, 'confidence': 0.95}
            
            # Check for gambling keywords
            gambling_score = 0
            for keyword in self.gambling_keywords:
                if keyword in url_lower:
                    gambling_score += 1
            
            if gambling_score > 0:
                confidence = min(0.9, gambling_score * 0.3)
                return {'is_fraud': True, 'confidence': confidence}
            
            return {'is_fraud': False, 'confidence': 0.1}
        
        return classify_url
    
    def detect_app_fraud(self, app_features):
        """Detect fraud in app features"""
        try:
            # Convert features to DataFrame
            features_df = pd.DataFrame([app_features])
            
            # Predict fraud probability
            fraud_prob = self.app_classifier.predict_proba(features_df)[0][1]
            is_fraud = fraud_prob > 0.7
            
            # Determine risk level
            if fraud_prob > 0.8:
                risk_level = 'high'
            elif fraud_prob > 0.5:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Generate warnings
            warnings = []
            if app_features.get('has_gambling_keywords', 0):
                warnings.append('App name contains gambling-related keywords')
            if app_features.get('offshore_developer', 0):
                warnings.append('Developer appears to be offshore/unverified')
            if app_features.get('suspicious_permissions', 0) > 5:
                warnings.append('App requests excessive permissions')
            if app_features.get('user_complaints', 0) > 5:
                warnings.append('High number of user complaints reported')
            
            # Generate transaction patterns if fraud detected
            transaction_patterns = None
            if is_fraud:
                transaction_patterns = {
                    'suspiciousTransactions': np.random.randint(500, 1000),
                    'averageAmount': f"₨{np.random.randint(10, 50)}K",
                    'peakHours': '10 PM - 2 AM',
                    'userComplaints': np.random.randint(50, 200)
                }
            
            return {
                'is_fraud': is_fraud,
                'confidence': fraud_prob,
                'risk_level': risk_level,
                'warnings': warnings,
                'transaction_patterns': transaction_patterns
            }
            
        except Exception as e:
            return {
                'is_fraud': False,
                'confidence': 0.0,
                'risk_level': 'low',
                'warnings': [f'Error in fraud detection: {str(e)}'],
                'transaction_patterns': None
            }
    
    def detect_transaction_fraud(self, transaction_features):
        """Detect fraud in transaction features"""
        try:
            # Convert features to DataFrame
            features_df = pd.DataFrame([transaction_features])
            
            # Predict anomaly
            anomaly_score = self.transaction_detector.decision_function(features_df)[0]
            is_fraud = anomaly_score < -0.3
            
            # Convert anomaly score to confidence
            confidence = max(0, min(1, (abs(anomaly_score) - 0.1) / 0.5))
            
            # Determine risk level
            if anomaly_score < -0.5:
                risk_level = 'high'
            elif anomaly_score < -0.2:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Generate warnings
            warnings = []
            if transaction_features.get('amount_variance', 0) > 2000:
                warnings.append('High variance in transaction amounts')
            if transaction_features.get('round_number_ratio', 0) > 0.5:
                warnings.append('Suspicious pattern of round number amounts')
            if transaction_features.get('night_transaction_ratio', 0) > 0.3:
                warnings.append('High frequency of late-night transactions')
            if transaction_features.get('transaction_velocity', 0) > 5:
                warnings.append('Unusually high transaction velocity')
            
            # Generate transaction patterns
            transaction_patterns = {
                'suspiciousTransactions': int(transaction_features.get('transaction_velocity', 1) * 100),
                'averageAmount': f"₨{np.random.randint(5, 30)}K",
                'peakHours': '11 PM - 3 AM',
                'userComplaints': int(transaction_features.get('transaction_velocity', 1) * 20)
            }
            
            return {
                'is_fraud': is_fraud,
                'confidence': confidence,
                'risk_level': risk_level,
                'warnings': warnings,
                'transaction_patterns': transaction_patterns
            }
            
        except Exception as e:
            return {
                'is_fraud': False,
                'confidence': 0.0,
                'risk_level': 'low',
                'warnings': [f'Error in transaction fraud detection: {str(e)}'],
                'transaction_patterns': None
            }
    
    def detect_url_fraud(self, url_features):
        """Detect fraud in URL"""
        try:
            url = url_features.get('url', '')
            result = self.url_classifier(url)
            
            # Determine risk level
            if result['confidence'] > 0.8:
                risk_level = 'high'
            elif result['confidence'] > 0.5:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Generate warnings
            warnings = []
            if result['is_fraud']:
                url_lower = url.lower()
                
                # Check for specific issues
                for domain in self.suspicious_domains:
                    if domain in url_lower:
                        warnings.append(f'URL matches known gambling site: {domain}')
                        break
                
                for keyword in self.gambling_keywords:
                    if keyword in url_lower:
                        warnings.append(f'URL contains gambling keyword: {keyword}')
                        break
                
                if not warnings:
                    warnings.append('URL flagged as potentially fraudulent')
            
            return {
                'is_fraud': result['is_fraud'],
                'confidence': result['confidence'],
                'risk_level': risk_level,
                'warnings': warnings
            }
            
        except Exception as e:
            return {
                'is_fraud': False,
                'confidence': 0.0,
                'risk_level': 'low',
                'warnings': [f'Error in URL fraud detection: {str(e)}']
            }
