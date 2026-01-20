import re
import nltk
from textblob import TextBlob
import numpy as np

class IslamicComplianceChecker:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        # Maisir (Gambling) indicators
        self.maisir_keywords = [
            'bet', 'betting', 'gamble', 'gambling', 'casino', 'poker', 'slots',
            'lottery', 'roulette', 'blackjack', 'baccarat', 'dice', 'spin',
            'jackpot', 'wager', 'stake', 'odds', 'bookmaker', 'sportsbook',
            'aviator', 'crash', 'mines', 'plinko', 'wheel', 'fortune',
            '1xbet', 'dafabet', '22bet', 'bet365', 'melbet', 'betwinner'
        ]
        
        # Riba (Interest) indicators
        self.riba_keywords = [
            'interest', 'loan', 'credit', 'debt', 'mortgage', 'installment',
            'apr', 'annual percentage rate', 'compound interest', 'usury',
            'lending', 'borrowing', 'finance charge', 'late fee',
            'guaranteed return', 'fixed return', 'interest rate'
        ]
        
        # Gharar (Excessive Uncertainty) indicators
        self.gharar_keywords = [
            'speculation', 'speculative', 'uncertain', 'unknown outcome',
            'random', 'chance', 'luck', 'fortune', 'mystery box',
            'surprise', 'unknown', 'variable', 'unpredictable',
            'high risk', 'volatile', 'fluctuating'
        ]
        
        # Halal business categories
        self.halal_categories = [
            'food', 'clothing', 'technology', 'education', 'healthcare',
            'transportation', 'real estate', 'manufacturing', 'agriculture',
            'retail', 'consulting', 'software', 'telecommunications'
        ]
        
        # Haram business categories
        self.haram_categories = [
            'gambling', 'casino', 'betting', 'alcohol', 'pork', 'adult',
            'interest-based banking', 'conventional insurance', 'tobacco'
        ]
    
    def check_app_compliance(self, app_name, app_features):
        """Check Islamic compliance for an app"""
        try:
            app_name_lower = app_name.lower()
            
            # Check for Maisir (Gambling)
            maisir_detected = self._check_maisir(app_name_lower, app_features)
            
            # Check for Riba (Interest)
            riba_detected = self._check_riba(app_name_lower, app_features)
            
            # Check for Gharar (Excessive Uncertainty)
            gharar_level = self._check_gharar(app_name_lower, app_features)
            
            # Overall compliance
            is_halal = not (maisir_detected or riba_detected or gharar_level == 'High')
            
            # Generate warnings
            warnings = []
            if maisir_detected:
                warnings.append('Violates Islamic principles: Maisir (Gambling) detected')
            if riba_detected:
                warnings.append('Violates Islamic principles: Riba (Interest) suspected')
            if gharar_level == 'High':
                warnings.append('Violates Islamic principles: Excessive Gharar (Uncertainty)')
            
            return {
                'is_halal': is_halal,
                'maisir': 'Detected' if maisir_detected else 'Not Detected',
                'riba': 'Suspected' if riba_detected else 'Not Detected',
                'gharar': gharar_level,
                'warnings': warnings
            }
            
        except Exception as e:
            return {
                'is_halal': True,
                'maisir': 'Error',
                'riba': 'Error',
                'gharar': 'Error',
                'warnings': [f'Error in Islamic compliance check: {str(e)}']
            }
    
    def check_transaction_compliance(self, transaction_data):
        """Check Islamic compliance for a transaction"""
        try:
            transaction_lower = transaction_data.lower()
            
            # Check for Maisir
            maisir_detected = any(keyword in transaction_lower for keyword in self.maisir_keywords)
            
            # Check for Riba
            riba_detected = any(keyword in transaction_lower for keyword in self.riba_keywords)
            
            # Check for Gharar
            gharar_score = sum(1 for keyword in self.gharar_keywords if keyword in transaction_lower)
            if gharar_score >= 3:
                gharar_level = 'High'
            elif gharar_score >= 1:
                gharar_level = 'Medium'
            else:
                gharar_level = 'Low'
            
            # Overall compliance
            is_halal = not (maisir_detected or riba_detected or gharar_level == 'High')
            
            # Generate warnings
            warnings = []
            if maisir_detected:
                warnings.append('Transaction involves Maisir (Gambling)')
            if riba_detected:
                warnings.append('Transaction may involve Riba (Interest)')
            if gharar_level == 'High':
                warnings.append('Transaction has excessive Gharar (Uncertainty)')
            
            return {
                'is_halal': is_halal,
                'maisir': 'Detected' if maisir_detected else 'Not Detected',
                'riba': 'Suspected' if riba_detected else 'Not Detected',
                'gharar': gharar_level,
                'warnings': warnings
            }
            
        except Exception as e:
            return {
                'is_halal': True,
                'maisir': 'Error',
                'riba': 'Error',
                'gharar': 'Error',
                'warnings': [f'Error in transaction compliance check: {str(e)}']
            }
    
    def check_url_compliance(self, url):
        """Check Islamic compliance for a URL"""
        try:
            url_lower = url.lower()
            
            # Check for Maisir
            maisir_detected = any(keyword in url_lower for keyword in self.maisir_keywords)
            
            # Check for Riba
            riba_detected = any(keyword in url_lower for keyword in self.riba_keywords)
            
            # Check for Gharar
            gharar_score = sum(1 for keyword in self.gharar_keywords if keyword in url_lower)
            if gharar_score >= 2:
                gharar_level = 'High'
            elif gharar_score >= 1:
                gharar_level = 'Medium'
            else:
                gharar_level = 'Low'
            
            # Overall compliance
            is_halal = not (maisir_detected or riba_detected or gharar_level == 'High')
            
            # Generate warnings
            warnings = []
            if maisir_detected:
                warnings.append('Website involves Maisir (Gambling)')
            if riba_detected:
                warnings.append('Website may involve Riba (Interest)')
            if gharar_level == 'High':
                warnings.append('Website has excessive Gharar (Uncertainty)')
            
            return {
                'is_halal': is_halal,
                'maisir': 'Detected' if maisir_detected else 'Not Detected',
                'riba': 'Suspected' if riba_detected else 'Not Detected',
                'gharar': gharar_level,
                'warnings': warnings
            }
            
        except Exception as e:
            return {
                'is_halal': True,
                'maisir': 'Error',
                'riba': 'Error',
                'gharar': 'Error',
                'warnings': [f'Error in URL compliance check: {str(e)}']
            }
    
    def _check_maisir(self, text, features=None):
        """Check for Maisir (Gambling) indicators"""
        # Direct keyword matching
        keyword_match = any(keyword in text for keyword in self.maisir_keywords)
        
        # Feature-based detection
        feature_indicators = False
        if features:
            # High payment frequency might indicate gambling
            if features.get('payment_frequency', 0) > 10:
                feature_indicators = True
            
            # Low retention with high complaints suggests gambling app
            if (features.get('retention_rate', 1) < 0.3 and 
                features.get('user_complaints', 0) > 5):
                feature_indicators = True
        
        return keyword_match or feature_indicators
    
    def _check_riba(self, text, features=None):
        """Check for Riba (Interest) indicators"""
        # Direct keyword matching
        keyword_match = any(keyword in text for keyword in self.riba_keywords)
        
        # Pattern matching for interest rates
        interest_pattern = re.search(r'\d+(\.\d+)?%?\s*(interest|apr|rate)', text)
        guaranteed_return_pattern = re.search(r'guaranteed.*\d+%', text)
        
        return keyword_match or bool(interest_pattern) or bool(guaranteed_return_pattern)
    
    def _check_gharar(self, text, features=None):
        """Check for Gharar (Excessive Uncertainty) indicators"""
        # Count gharar keywords
        gharar_score = sum(1 for keyword in self.gharar_keywords if keyword in text)
        
        # Feature-based indicators
        if features:
            # High variance in payments suggests uncertainty
            if features.get('amount_variance', 0) > 2000:
                gharar_score += 1
            
            # Offshore developers add uncertainty
            if features.get('offshore_developer', 0):
                gharar_score += 1
        
        # Determine level
        if gharar_score >= 3:
            return 'High'
        elif gharar_score >= 1:
            return 'Medium'
        else:
            return 'Low'
    
    def get_shariah_ruling(self, analysis_result):
        """Get detailed Shariah ruling based on analysis"""
        ruling = {
            'verdict': 'Halal' if analysis_result['is_halal'] else 'Haram',
            'confidence': 'High',
            'reasoning': [],
            'recommendations': []
        }
        
        if analysis_result['maisir'] == 'Detected':
            ruling['reasoning'].append(
                'Contains Maisir (gambling) which is explicitly prohibited in Islam'
            )
            ruling['recommendations'].append(
                'Avoid this app/transaction as it involves gambling'
            )
        
        if analysis_result['riba'] == 'Suspected':
            ruling['reasoning'].append(
                'May involve Riba (interest) which is forbidden in Islamic finance'
            )
            ruling['recommendations'].append(
                'Seek Shariah-compliant alternatives for financial services'
            )
        
        if analysis_result['gharar'] == 'High':
            ruling['reasoning'].append(
                'Contains excessive Gharar (uncertainty) which violates Islamic principles'
            )
            ruling['recommendations'].append(
                'Look for more transparent and certain business models'
            )
        
        if analysis_result['is_halal']:
            ruling['reasoning'].append(
                'No major Islamic compliance violations detected'
            )
            ruling['recommendations'].append(
                'Appears to be permissible under Islamic law'
            )
        
        return ruling
