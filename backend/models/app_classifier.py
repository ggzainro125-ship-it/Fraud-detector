import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib

class AppClassifier:
    def __init__(self):
        # Known banned apps from NCCIA list
        self.banned_apps = [
            '1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko',
            'melbet', 'betwinner', 'mostbet', 'parimatch', 'betway',
            'william hill', 'ladbrokes', 'coral', 'paddy power',
            'betfair', 'unibet', 'bwin', 'pokerstars', 'partypoker',
            'casino.com', 'royal panda', 'casumo', 'mr green',
            'leovegas', 'betsson', 'cherry casino', 'rizk',
            'guts casino', 'dunder', 'videoslots', 'karamba',
            'thrills', 'ovo casino', 'playojo', 'casino heroes',
            'lucky days', 'frank casino', 'bob casino', 'bitstarz',
            'king billy', 'playamo', 'casino cruise', 'casino room',
            'spin palace', 'jackpot city', 'ruby fortune'
        ]
        
        # Gambling app indicators
        self.gambling_indicators = [
            'bet', 'casino', 'poker', 'slots', 'lottery', 'roulette',
            'blackjack', 'baccarat', 'dice', 'spin', 'jackpot',
            'wager', 'stake', 'odds', 'bookmaker', 'sportsbook',
            'aviator', 'crash', 'mines', 'plinko', 'wheel'
        ]
        
        # Legitimate app categories
        self.legitimate_categories = [
            'banking', 'finance', 'education', 'productivity', 'health',
            'shopping', 'social', 'news', 'weather', 'travel',
            'food', 'utilities', 'business', 'lifestyle'
        ]
        
        # Suspicious permissions that gambling apps often request
        self.suspicious_permissions = [
            'READ_SMS', 'SEND_SMS', 'READ_CONTACTS', 'ACCESS_FINE_LOCATION',
            'CAMERA', 'RECORD_AUDIO', 'READ_PHONE_STATE', 'CALL_PHONE'
        ]
        
        # Initialize classifier
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.classifier = MultinomialNB()
        self._train_classifier()
    
    def _train_classifier(self):
        """Train the app classifier with synthetic data"""
        # Generate training data
        training_data = []
        labels = []
        
        # Add banned apps (fraud)
        for app in self.banned_apps:
            training_data.append(app)
            labels.append(1)  # fraud
            
            # Add variations
            training_data.append(f"{app} mobile")
            labels.append(1)
            training_data.append(f"{app} app")
            labels.append(1)
            training_data.append(f"{app} official")
            labels.append(1)
        
        # Add gambling-related apps (fraud)
        gambling_apps = [
            'lucky slots casino', 'mega jackpot slots', 'poker master',
            'blackjack 21', 'roulette royal', 'dice dreams',
            'spin to win', 'betting tips pro', 'sports bet',
            'casino royale', 'slot machine', 'bingo blast'
        ]
        
        for app in gambling_apps:
            training_data.append(app)
            labels.append(1)  # fraud
        
        # Add legitimate apps (not fraud)
        legitimate_apps = [
            'easypaisa', 'jazzcash', 'sadapay', 'bank alfalah',
            'hbl mobile', 'ubl mobile', 'mcb mobile', 'nayapay',
            'whatsapp', 'facebook', 'instagram', 'youtube',
            'google maps', 'uber', 'careem', 'foodpanda',
            'daraz', 'olx', 'zameen', 'pakwheels',
            'weather app', 'calculator', 'calendar', 'notes',
            'microsoft office', 'zoom', 'skype', 'telegram'
        ]
        
        for app in legitimate_apps:
            training_data.append(app)
            labels.append(0)  # not fraud
        
        # Train the classifier
        X = self.vectorizer.fit_transform(training_data)
        self.classifier.fit(X, labels)
    
    def classify_app(self, app_features):
        """Classify an app based on its features"""
        app_name = app_features.get('app_name', '')
        
        # Check if app is in banned list
        if self._is_banned_app(app_name):
            return {
                'category': 'Gambling/Betting (BANNED)',
                'developer': 'Offshore Entity',
                'permissions': self._get_suspicious_permissions(),
                'risk_score': 0.95,
                'is_legitimate': False
            }
        
        # Use ML classifier
        app_vector = self.vectorizer.transform([app_name])
        fraud_probability = self.classifier.predict_proba(app_vector)[0][1]
        
        # Determine category based on analysis
        if fraud_probability > 0.7 or self._has_gambling_indicators(app_name):
            category = 'Gambling/Betting'
            developer = 'Offshore Entity'
            permissions = self._get_suspicious_permissions()
            is_legitimate = False
        elif fraud_probability > 0.4:
            category = 'Suspicious/Unverified'
            developer = 'Unverified Developer'
            permissions = self._get_moderate_permissions()
            is_legitimate = False
        else:
            category = self._determine_legitimate_category(app_name)
            developer = 'Verified Developer'
            permissions = self._get_normal_permissions()
            is_legitimate = True
        
        return {
            'category': category,
            'developer': developer,
            'permissions': permissions,
            'risk_score': fraud_probability,
            'is_legitimate': is_legitimate
        }
    
    def _is_banned_app(self, app_name):
        """Check if app is in NCCIA banned list"""
        app_name_lower = app_name.lower()
        return any(banned_app in app_name_lower for banned_app in self.banned_apps)
    
    def _has_gambling_indicators(self, app_name):
        """Check if app name contains gambling indicators"""
        app_name_lower = app_name.lower()
        return any(indicator in app_name_lower for indicator in self.gambling_indicators)
    
    def _determine_legitimate_category(self, app_name):
        """Determine category for legitimate apps"""
        app_name_lower = app_name.lower()
        
        # Banking/Finance
        if any(word in app_name_lower for word in ['bank', 'pay', 'wallet', 'finance']):
            return 'Banking/Finance'
        
        # Social
        if any(word in app_name_lower for word in ['chat', 'social', 'message', 'call']):
            return 'Social/Communication'
        
        # Shopping
        if any(word in app_name_lower for word in ['shop', 'buy', 'store', 'market']):
            return 'Shopping/E-commerce'
        
        # Utility
        if any(word in app_name_lower for word in ['weather', 'calculator', 'calendar', 'note']):
            return 'Utility'
        
        # Default
        return 'General/Utility'
    
    def _get_suspicious_permissions(self):
        """Get list of suspicious permissions for gambling apps"""
        return ['SMS', 'Contacts', 'Location', 'Camera', 'Microphone', 'Phone']
    
    def _get_moderate_permissions(self):
        """Get moderate permissions for suspicious apps"""
        return ['Storage', 'Location', 'Camera']
    
    def _get_normal_permissions(self):
        """Get normal permissions for legitimate apps"""
        return ['Storage', 'Network']
    
    def get_app_risk_assessment(self, app_name):
        """Get detailed risk assessment for an app"""
        app_features = {'app_name': app_name}
        classification = self.classify_app(app_features)
        
        # Determine risk level
        risk_score = classification['risk_score']
        if risk_score > 0.8:
            risk_level = 'CRITICAL'
            risk_description = 'Extremely high risk - likely gambling/fraud app'
        elif risk_score > 0.6:
            risk_level = 'HIGH'
            risk_description = 'High risk - suspicious gambling indicators'
        elif risk_score > 0.4:
            risk_level = 'MEDIUM'
            risk_description = 'Medium risk - requires verification'
        else:
            risk_level = 'LOW'
            risk_description = 'Low risk - appears legitimate'
        
        # Generate recommendations
        recommendations = []
        if not classification['is_legitimate']:
            recommendations.extend([
                'Do not download or use this app',
                'Report to Pakistan Telecommunication Authority (PTA)',
                'Check NCCIA banned apps list',
                'Use verified alternatives from official app stores'
            ])
        else:
            recommendations.extend([
                'App appears safe to use',
                'Verify permissions before installation',
                'Download only from official sources',
                'Keep app updated for security'
            ])
        
        return {
            'app_name': app_name,
            'risk_level': risk_level,
            'risk_score': risk_score,
            'risk_description': risk_description,
            'category': classification['category'],
            'developer_type': classification['developer'],
            'permissions_required': classification['permissions'],
            'is_legitimate': classification['is_legitimate'],
            'is_banned': self._is_banned_app(app_name),
            'recommendations': recommendations
        }
