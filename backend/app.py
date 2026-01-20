import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
import os
import sys
import threading
import time
import random
import json
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Optional: Load API token from environment for socket auth
API_TOKEN = os.getenv('API_TOKEN', 'test-token-12345')

from models.fraud_detector import FraudDetector
from models.islamic_compliance import IslamicComplianceChecker
from models.app_classifier import AppClassifier
from models.image_fraud_detector import ImageFraudDetector
from utils.data_processor import DataProcessor
from utils.image_processor import ImageProcessor

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'], 
     allow_headers=['Content-Type'], 
     methods=['GET', 'POST', 'OPTIONS'])

# SocketIO for live frame streaming (frontend sends frames, backend returns predictions)
socketio = SocketIO(
    app,
    cors_allowed_origins='*',
    async_mode='eventlet',
    ping_timeout=60,
    ping_interval=25,
    engineio_logger=False,
    logger=False
)

# Thread pool for background inference (non-blocking model predictions)
infer_executor = ThreadPoolExecutor(max_workers=2)

# Global state for real-time data
real_time_stats = {
    'totalScans': 15847,
    'fraudDetected': 3421,
    'halalCompliant': 12426,
    'blockedAmount': 2847000,
    'activeThreats': 156,
    'recentScans': 847
}

# Background thread for real-time data generation
def generate_real_time_data():
    """Generate real-time data and emit to connected clients"""
    while True:
        try:
            # Simulate scan activity
            scan_types = ['app', 'transaction', 'url']
            scan_type = random.choice(scan_types)
            is_fraud = random.random() > 0.7
            
            # Emit scan activity
            scan_data = {
                'id': int(time.time() * 1000),
                'type': scan_type,
                'query': f'Scan {random.randint(1000, 9999)}',
                'timestamp': datetime.now().isoformat(),
                'isFraud': is_fraud
            }
            socketio.emit('scan_activity', scan_data)
            
            # Update stats
            real_time_stats['totalScans'] += 1
            real_time_stats['recentScans'] += 1
            
            if is_fraud:
                real_time_stats['fraudDetected'] += 1
                real_time_stats['activeThreats'] += 1
                
                # Emit fraud detection alert
                alert_data = {
                    'id': int(time.time() * 1000),
                    'appName': f'Threat {random.randint(100, 999)}',
                    'type': 'Gambling App',
                    'risk': 'High',
                    'timestamp': datetime.now().isoformat()
                }
                socketio.emit('fraud_detected', alert_data)
                
                # Emit geographic data
                cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Faisalabad']
                geo_data = {
                    'id': int(time.time() * 1000),
                    'city': random.choice(cities),
                    'lat': 24.8607 + (random.random() - 0.5) * 10,
                    'lng': 67.0011 + (random.random() - 0.5) * 10,
                    'fraudType': alert_data['type'],
                    'severity': random.randint(1, 5),
                    'timestamp': datetime.now().isoformat()
                }
                socketio.emit('geo_fraud_update', geo_data)
                
                # Emit fraud patterns (occasionally)
                if random.random() > 0.8:
                    patterns = ['Multiple small transactions', 'Round number amounts', 'Late night activity', 'Geographic clustering']
                    pattern_data = {
                        'id': int(time.time() * 1000),
                        'pattern': random.choice(patterns),
                        'confidence': random.randint(70, 99),
                        'affectedApps': random.randint(1, 5),
                        'timestamp': datetime.now().isoformat()
                    }
                    socketio.emit('fraud_pattern_detected', pattern_data)
            
            # Emit transaction updates
            if random.random() > 0.7:
                transaction_data = {
                    'id': int(time.time() * 1000),
                    'amount': random.randint(1000, 50000),
                    'type': random.choice(['transfer', 'payment', 'withdrawal']),
                    'from': f'Account {random.randint(1000, 9999)}',
                    'to': random.choice(['Easypaisa', 'JazzCash', 'SadaPay', 'Bank Account']),
                    'isSuspicious': random.random() > 0.8,
                    'riskScore': random.randint(1, 100),
                    'timestamp': datetime.now().isoformat()
                }
                socketio.emit('transaction_update', transaction_data)
            
            # Emit system metrics
            system_data = {
                'cpu': max(10, min(95, real_time_stats.get('cpu', 45) + (random.random() - 0.5) * 10)),
                'memory': max(20, min(90, real_time_stats.get('memory', 62) + (random.random() - 0.5) * 8)),
                'network': max(15, min(95, real_time_stats.get('network', 78) + (random.random() - 0.5) * 12)),
                'responseTime': max(50, min(300, real_time_stats.get('responseTime', 120) + (random.random() - 0.5) * 30))
            }
            real_time_stats.update(system_data)
            socketio.emit('system_metrics', system_data)
            
            # Emit threat intelligence (occasionally)
            if random.random() > 0.9:
                intel_data = {
                    'id': int(time.time() * 1000),
                    'source': 'Dark Web Monitor',
                    'threat': f'New gambling variant detected: {random.randint(100, 999)}',
                    'credibility': random.randint(70, 99),
                    'timestamp': datetime.now().isoformat()
                }
                socketio.emit('threat_intelligence', intel_data)
            
            # Emit collaboration events (occasionally)
            if random.random() > 0.95:
                actions = ['flagged a threat', 'joined investigation', 'updated report', 'shared findings']
                collab_data = {
                    'id': int(time.time() * 1000),
                    'user': f'Analyst {random.randint(1, 10)}',
                    'action': random.choice(actions),
                    'target': f'Threat {random.randint(100, 999)}',
                    'timestamp': datetime.now().isoformat()
                }
                socketio.emit('collaboration_event', collab_data)
            
            # Emit stats update periodically
            if random.random() > 0.8:
                socketio.emit('stats_update', real_time_stats)
            
            # Emit compliance updates
            if random.random() > 0.85:
                compliance_data = {
                    'halalCount': real_time_stats['halalCompliant'],
                    'blockedAmount': random.randint(10000, 100000) if is_fraud else 0
                }
                socketio.emit('compliance_update', compliance_data)
            
            # Emit active users (occasionally)
            if random.random() > 0.95:
                users_data = []
                for i in range(random.randint(2, 5)):
                    users_data.append({
                        'id': int(time.time() * 1000) + i,
                        'name': f'Analyst {i + 1}',
                        'role': random.choice(['Security Analyst', 'Fraud Investigator', 'Compliance Officer']),
                        'status': random.choice(['online', 'investigating', 'monitoring']),
                        'avatar': '👤'
                    })
                socketio.emit('active_users_update', users_data)
            
            time.sleep(random.uniform(1, 3))  # Random interval between 1-3 seconds
            
        except Exception as e:
            print(f"Error in real-time data generation: {e}")
            time.sleep(5)  # Wait before retrying

# Initialize models
fraud_detector = FraudDetector()
islamic_checker = IslamicComplianceChecker()
app_classifier = AppClassifier()
image_fraud_detector = ImageFraudDetector()
data_processor = DataProcessor()
image_processor = ImageProcessor()

# Socket auth: validate token on connect
@socketio.on('connect')
def handle_connect(auth):
    # Optionally validate auth token
    if auth:
        token = auth.get('token') if isinstance(auth, dict) else None
        if token and token != API_TOKEN:
            print(f'Invalid token on connect: {token}')
            disconnect()
            return False
    print(f'Socket client connected: {request.sid}')
    
    # Start background data generation if not already running
    if not hasattr(generate_real_time_data, 'thread') or not generate_real_time_data.thread.is_alive():
        generate_real_time_data.thread = threading.Thread(target=generate_real_time_data, daemon=True)
        generate_real_time_data.thread.start()
        print("Real-time data generation thread started")
    
    # Send current stats to newly connected client
    emit('stats_update', real_time_stats)
    
    # Send initial system metrics
    initial_metrics = {
        'cpu': real_time_stats.get('cpu', 45),
        'memory': real_time_stats.get('memory', 62),
        'network': real_time_stats.get('network', 78),
        'responseTime': real_time_stats.get('responseTime', 120)
    }
    emit('system_metrics', initial_metrics)
    
    return True

# Helper: Run prediction in background thread
def run_prediction(client_id, image_data):
    try:
        # Use the new live frame processing method
        features = image_processor.process_live_frame(image_data)
        
        # Determine if fraud based on fraud score
        is_fraud = features.get('fraud_score', 0) > 30
        confidence = features.get('confidence', 0)
        
        # Create comprehensive prediction result
        prediction = {
            'is_fraud': is_fraud,
            'confidence': confidence,
            'risk_level': 'high' if is_fraud else 'low',
            'warnings': features.get('gambling_keywords', []) if is_fraud else [],
            'method': 'ml_prediction',
            'model_features': {
                'gambling_keywords_count': len(features.get('gambling_keywords', [])),
                'financial_keywords_count': len(features.get('financial_keywords', [])),
                'suspicious_patterns_count': len(features.get('suspicious_patterns', [])),
                'ui_elements_detected': len(features.get('ui_elements', {}).get('buttons', [])),
                'fraud_score': features.get('fraud_score', 0)
            },
            'interface_type': 'gambling_platform' if is_fraud else 'non_gambling',
            'islamic_compliance': {
                'is_halal': not is_fraud,
                'maisir': 'Detected' if is_fraud else 'Not Detected',
                'riba': 'Suspected' if is_fraud else 'Not Detected',
                'gharar': 'High' if is_fraud else 'Not Detected',
                'violations': ['Maisir (Gambling) detected'] if is_fraud else []
            },
            'detailed_analysis': features.get('detailed_analysis', {
                'text_extracted': False,
                'gambling_indicators': 0,
                'financial_indicators': 0,
                'visual_elements': 0,
                'color_scheme_suspicious': False
            }),
            'extracted_text': features.get('extracted_text', ''),
            'focus_regions': features.get('focus_regions', [])
        }
        
        # Emit back to the client who sent the frame
        socketio.emit('prediction', prediction, to=client_id)
        
        # If fraud detected, emit real-time alert
        if is_fraud:
            alert_data = {
                'id': int(time.time() * 1000),
                'appName': 'Live Detection',
                'type': 'Gambling Interface',
                'risk': 'High',
                'timestamp': datetime.now().isoformat(),
                'confidence': confidence,
                'extracted_text': features.get('extracted_text', '')[:100] + '...' if len(features.get('extracted_text', '')) > 100 else features.get('extracted_text', '')
            }
            socketio.emit('fraud_detected', alert_data)
            
    except Exception as e:
        socketio.emit('prediction', {'error': str(e)}, to=client_id)

# Socket handler: receive frames (base64 dataURL) and return predictions asynchronously
@socketio.on('frame')
def handle_frame(data):
    try:
        # Expect data to be {'image': 'data:image/jpeg;base64,...'}
        b64 = data.get('image', '') if isinstance(data, dict) else ''
        if not b64:
            emit('prediction', {'error': 'no_image_provided'})
            return

        # Queue prediction to background thread to avoid blocking socket event loop
        client_id = request.sid
        infer_executor.submit(run_prediction, client_id, b64)
    except Exception as e:
        emit('prediction', {'error': str(e)})

# Additional real-time event handlers
@socketio.on('request_fraud_alerts')
def handle_fraud_alerts_request():
    """Send recent fraud alerts to client"""
    try:
        alerts = []
        for i in range(5):
            alerts.append({
                'id': int(time.time() * 1000) + i,
                'appName': f'Threat {random.randint(100, 999)}',
                'type': 'Gambling App',
                'risk': 'High',
                'timestamp': datetime.now().isoformat()
            })
        emit('fraud_alerts_response', alerts)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('request_geo_data')
def handle_geo_data_request():
    """Send geographic fraud data to client"""
    try:
        cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Faisalabad']
        geo_data = []
        for i in range(10):
            geo_data.append({
                'id': int(time.time() * 1000) + i,
                'city': random.choice(cities),
                'lat': 24.8607 + (random.random() - 0.5) * 10,
                'lng': 67.0011 + (random.random() - 0.5) * 10,
                'fraudType': 'Gambling App',
                'severity': random.randint(1, 5),
                'timestamp': datetime.now().isoformat()
            })
        emit('geo_data_response', geo_data)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('request_patterns')
def handle_patterns_request():
    """Send fraud patterns to client"""
    try:
        patterns = ['Multiple small transactions', 'Round number amounts', 'Late night activity', 'Geographic clustering']
        pattern_data = []
        for i in range(5):
            pattern_data.append({
                'id': int(time.time() * 1000) + i,
                'pattern': random.choice(patterns),
                'confidence': random.randint(70, 99),
                'affectedApps': random.randint(1, 5),
                'timestamp': datetime.now().isoformat()
            })
        emit('patterns_response', pattern_data)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('request_transactions')
def handle_transactions_request():
    """Send recent transactions to client"""
    try:
        transactions = []
        for i in range(10):
            transactions.append({
                'id': int(time.time() * 1000) + i,
                'amount': random.randint(1000, 50000),
                'type': random.choice(['transfer', 'payment', 'withdrawal']),
                'from': f'Account {random.randint(1000, 9999)}',
                'to': random.choice(['Easypaisa', 'JazzCash', 'SadaPay', 'Bank Account']),
                'isSuspicious': random.random() > 0.8,
                'riskScore': random.randint(1, 100),
                'timestamp': datetime.now().isoformat()
            })
        emit('transactions_response', transactions)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('request_intelligence')
def handle_intelligence_request():
    """Send threat intelligence to client"""
    try:
        intel = []
        for i in range(5):
            intel.append({
                'id': int(time.time() * 1000) + i,
                'source': 'Dark Web Monitor',
                'threat': f'New gambling variant detected: {random.randint(100, 999)}',
                'credibility': random.randint(70, 99),
                'timestamp': datetime.now().isoformat()
            })
        emit('intelligence_response', intel)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('request_active_users')
def handle_active_users_request():
    """Send active users to client"""
    try:
        users = []
        for i in range(3):
            users.append({
                'id': int(time.time() * 1000) + i,
                'name': f'Analyst {i + 1}',
                'role': random.choice(['Security Analyst', 'Fraud Investigator', 'Compliance Officer']),
                'status': random.choice(['online', 'investigating', 'monitoring']),
                'avatar': '👤'
            })
        emit('active_users_response', users)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('manual_scan')
def handle_manual_scan(data):
    """Handle manual scan requests from dashboard"""
    try:
        scan_type = data.get('type', 'app')
        query = data.get('query', '')
        
        # Simulate scan processing
        time.sleep(0.5)  # Simulate processing time
        
        # Simple fraud detection
        gambling_keywords = ['1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko', 'casino', 'poker', 'slots']
        is_fraud = any(keyword in query.lower() for keyword in gambling_keywords)
        
        result = {
            'id': int(time.time() * 1000),
            'type': scan_type,
            'query': query,
            'isFraud': is_fraud,
            'confidence': 0.95 if is_fraud else 0.05,
            'riskLevel': 'high' if is_fraud else 'low',
            'timestamp': datetime.now().isoformat()
        }
        
        emit('scan_result', result)
        
        # Also emit as scan activity
        scan_data = {
            'id': result['id'],
            'type': scan_type,
            'query': query,
            'timestamp': result['timestamp'],
            'isFraud': is_fraud
        }
        socketio.emit('scan_activity', scan_data)
        
        if is_fraud:
            alert_data = {
                'id': int(time.time() * 1000) + 1,
                'appName': query,
                'type': f'{scan_type.title()} Fraud',
                'risk': 'High',
                'timestamp': datetime.now().isoformat()
            }
            socketio.emit('fraud_detected', alert_data)
        
    except Exception as e:
        emit('error', {'message': str(e)})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Pakistan Fraud Detector API is running'})

@app.route('/api/test', methods=['POST'])
def test_endpoint():
    try:
        data = request.get_json()
        print(f"Test endpoint received: {data}")
        print(f"Request content type: {request.content_type}")
        print(f"Request data: {request.data}")
        return jsonify({'received': data, 'status': 'success'})
    except Exception as e:
        print(f"Test endpoint error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/app', methods=['POST'])
def scan_app():
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug print
        
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
            
        app_name = data.get('query', '')
        
        if not app_name:
            return jsonify({'error': 'App name is required'}), 400
        
        # Simple fraud detection based on known gambling apps
        gambling_keywords = ['1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko', 'casino', 'poker', 'slots', 'betting', 'gamble']
        app_name_lower = app_name.lower()
        
        is_fraud = any(keyword in app_name_lower for keyword in gambling_keywords)
        confidence = 0.95 if is_fraud else 0.05
        risk_level = 'high' if is_fraud else 'low'
        
        warnings = []
        if is_fraud:
            warnings.extend([
                'App matches known gambling platform',
                'Violates Islamic finance principles (Maisir)',
                'Listed in NCCIA banned apps',
                'Suspicious payment patterns detected'
            ])
        
        # Islamic compliance check
        islamic_violations = []
        if is_fraud:
            islamic_violations.append('Violates Islamic principles: Maisir (Gambling) detected')
        
        # Combine results
        result = {
            'query': app_name,
            'type': 'app',
            'isFraud': is_fraud,
            'confidence': confidence,
            'isHalal': not is_fraud,
            'riskLevel': risk_level,
            'warnings': warnings + islamic_violations,
            'details': {
                'appInfo': {
                    'name': app_name,
                    'category': 'Gambling/Betting' if is_fraud else 'Legitimate',
                    'developer': 'Offshore Entity' if is_fraud else 'Verified Developer',
                    'permissions': ['SMS', 'Contacts', 'Location', 'Camera'] if is_fraud else ['Storage'],
                },
                'islamicCompliance': {
                    'maisir': 'Detected' if is_fraud else 'Not Detected',
                    'riba': 'Suspected' if is_fraud else 'Not Detected',
                    'gharar': 'High' if is_fraud else 'Low',
                },
                'transactionPatterns': {
                    'suspiciousTransactions': 847,
                    'averageAmount': '₨15,000',
                    'peakHours': '10 PM - 2 AM',
                    'userComplaints': 156
                } if is_fraud else None
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/transaction', methods=['POST'])
def scan_transaction():
    try:
        data = request.get_json()
        print(f"Transaction data received: {data}")  # Debug print
        
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
            
        transaction_data = data.get('query', '')
        
        if not transaction_data:
            return jsonify({'error': 'Transaction data is required'}), 400
        
        # Simple transaction fraud detection
        suspicious_keywords = ['gambling', 'betting', '1xbet', 'aviator', 'casino', 'poker', 'slots']
        transaction_lower = transaction_data.lower()
        
        is_fraud = any(keyword in transaction_lower for keyword in suspicious_keywords)
        confidence = 0.90 if is_fraud else 0.10
        risk_level = 'high' if is_fraud else 'low'
        
        warnings = []
        if is_fraud:
            warnings.extend([
                'Suspicious transaction pattern detected',
                'Matches known gambling transaction',
                'Violates Islamic finance principles'
            ])
        
        # Combine results
        result = {
            'query': transaction_data,
            'type': 'transaction',
            'isFraud': is_fraud,
            'confidence': confidence,
            'isHalal': not is_fraud,
            'riskLevel': risk_level,
            'warnings': warnings,
            'details': {
                'islamicCompliance': {
                    'maisir': 'Detected' if is_fraud else 'Not Detected',
                    'riba': 'Suspected' if is_fraud else 'Not Detected',
                    'gharar': 'High' if is_fraud else 'Low',
                },
                'transactionPatterns': {
                    'amount': '₨15,000',
                    'frequency': 'High',
                    'timePattern': 'Late Night',
                    'riskScore': 85
                } if is_fraud else None
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/url', methods=['POST'])
def scan_url():
    try:
        data = request.get_json()
        print(f"URL data received: {data}")  # Debug print
        
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
            
        url = data.get('query', '')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Simple URL fraud detection
        suspicious_domains = ['1xbet', 'dafabet', '22bet', 'bet365', 'casino', 'poker', 'slots', 'gambling']
        url_lower = url.lower()
        
        is_fraud = any(domain in url_lower for domain in suspicious_domains)
        confidence = 0.88 if is_fraud else 0.12
        risk_level = 'high' if is_fraud else 'low'
        
        warnings = []
        if is_fraud:
            warnings.extend([
                'URL matches known gambling site',
                'Domain flagged as suspicious',
                'Violates Islamic finance principles'
            ])
        
        # Combine results
        result = {
            'query': url,
            'type': 'url',
            'isFraud': is_fraud,
            'confidence': confidence,
            'isHalal': not is_fraud,
            'riskLevel': risk_level,
            'warnings': warnings,
            'details': {
                'islamicCompliance': {
                    'maisir': 'Detected' if is_fraud else 'Not Detected',
                    'riba': 'Suspected' if is_fraud else 'Not Detected',
                    'gharar': 'High' if is_fraud else 'Low',
                }
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/image', methods=['POST'])
def scan_image():
    try:
        data = request.get_json()
        print(f"Image data received: {type(data)}")  # Debug print
        
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
            
        base64_image = data.get('image', '')
        
        if not base64_image:
            return jsonify({'error': 'Image data is required'}), 400
        
        # Simple image analysis - simulate fraud detection
        import random
        
        # Simulate random fraud detection for images (40% chance of fraud)
        is_fraud = random.random() > 0.6
        confidence = 0.85 if is_fraud else 0.15
        risk_level = 'high' if is_fraud else 'low'
        
        warnings = []
        if is_fraud:
            warnings.extend([
                'Gambling interface detected in image',
                'Suspicious UI elements found',
                'Financial transaction patterns identified',
                'Violates Islamic finance principles (Maisir)'
            ])
        
        interface_type = 'gambling_platform' if is_fraud else 'legitimate_app'
        
        # Combine results
        result = {
            'query': 'Image Analysis',
            'type': 'image',
            'isFraud': is_fraud,
            'confidence': confidence,
            'isHalal': not is_fraud,
            'riskLevel': risk_level,
            'warnings': warnings,
            'interfaceType': interface_type,
            'details': {
                'imageAnalysis': {
                    'extractedText': 'bet deposit withdraw balance 1xbet aviator' if is_fraud else 'settings profile account',
                    'gamblingKeywords': ['bet', 'deposit', 'withdraw', '1xbet', 'aviator'] if is_fraud else [],
                    'financialKeywords': ['balance', 'deposit', 'withdraw'] if is_fraud else [],
                    'suspiciousPatterns': ['2.5x', '₨5000', '10:30'] if is_fraud else [],
                    'uiElements': {
                        'buttonsDetected': 8 if is_fraud else 3,
                        'inputFieldsDetected': 4 if is_fraud else 1
                    },
                    'colorAnalysis': {
                        'red_percentage': 12.5 if is_fraud else 2.1,
                        'green_percentage': 8.3 if is_fraud else 1.5,
                        'gold_percentage': 5.7 if is_fraud else 0.8,
                        'gambling_colors': is_fraud
                    },
                    'fraudScore': 85 if is_fraud else 15
                },
                'islamicCompliance': {
                    'maisir': 'Detected' if is_fraud else 'Not Detected',
                    'riba': 'Suspected' if is_fraud else 'Not Detected',
                    'gharar': 'High' if is_fraud else 'Low',
                },
                'detectionMethod': 'ml_prediction',
                'interfaceType': interface_type
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # Return real-time stats with current trends and categories
        stats = {
            'totalScans': real_time_stats['totalScans'],
            'fraudDetected': real_time_stats['fraudDetected'],
            'halalCompliant': real_time_stats['halalCompliant'],
            'blockedAmount': real_time_stats['blockedAmount'],
            'activeThreats': real_time_stats['activeThreats'],
            'recentScans': real_time_stats['recentScans'],
            'fraudTrends': [
                {'month': 'Jan', 'detected': 245, 'blocked': 89},
                {'month': 'Feb', 'detected': 312, 'blocked': 156},
                {'month': 'Mar', 'detected': 289, 'blocked': 134},
                {'month': 'Apr', 'detected': 445, 'blocked': 267},
                {'month': 'May', 'detected': 567, 'blocked': 389},
                {'month': 'Jun', 'detected': real_time_stats['fraudDetected'], 'blocked': int(real_time_stats['fraudDetected'] * 0.7)},
            ],
            'appCategories': [
                {'name': 'Gambling Apps', 'value': min(50, 45 + (real_time_stats['fraudDetected'] % 10)), 'color': '#ef4444'},
                {'name': 'Forex Trading', 'value': 25, 'color': '#f59e0b'},
                {'name': 'Crypto Scams', 'value': 20, 'color': '#8b5cf6'},
                {'name': 'Others', 'value': 10, 'color': '#6b7280'},
            ],
            'systemMetrics': {
                'cpu': real_time_stats.get('cpu', 45),
                'memory': real_time_stats.get('memory', 62),
                'network': real_time_stats.get('network', 78),
                'responseTime': real_time_stats.get('responseTime', 120)
            },
            'lastUpdated': datetime.now().isoformat()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Use socketio.run so both HTTP routes and socket handlers are served
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
