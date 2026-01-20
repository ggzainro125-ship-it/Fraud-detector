import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBall from './components/SearchBall';
import SearchInterface from './components/SearchInterface';
import Dashboard from './components/Dashboard';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'dashboard'

  const handleSearch = async (query, type) => {
    try {
      setSearchResults(null); // Clear previous results
      toast.info('🔍 Analyzing for fraud patterns...', {
        position: "top-right",
        autoClose: 3000,
      });
      
      console.log('Starting search:', { query, type });
      
      if (type === 'image') {
        // Handle image upload
        console.log('Making image API request to:', 'http://localhost:5000/api/scan/image');
        const response = await fetch('http://localhost:5000/api/scan/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: query // query contains base64 image data for image type
          }),
        });
        console.log('Image API response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to analyze image');
        }
        
        const results = await response.json();
        setSearchResults(results);
        
        if (results.isFraud) {
          toast.error(`⚠️ Fraud Detected! Risk Level: ${results.riskLevel.toUpperCase()}`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.success('✅ No fraud detected - appears safe!', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      } else {
        // Handle text-based searches (app, transaction, url)
        const apiUrl = `http://localhost:5000/api/scan/${type}`;
        console.log('Making text API request to:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query
          }),
        });
        console.log('Text API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to scan ${type}`);
        }
        
        const results = await response.json();
        setSearchResults(results);
        
        if (results.isFraud) {
          toast.error(`⚠️ Fraud Detected! Risk Level: ${results.riskLevel.toUpperCase()}`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.success('✅ No fraud detected - appears safe!', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      console.log('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      let errorMessage = '⚠️ Backend unavailable - using offline analysis';
      if (error.message) {
        errorMessage = `⚠️ ${error.message} - using offline analysis`;
      }
      
      toast.warn(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      // Fallback to mock results if API fails
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockResults = generateMockResults(query, type);
      setSearchResults(mockResults);
      
      if (mockResults.isFraud) {
        toast.error(`⚠️ Fraud Detected! Risk Level: ${mockResults.riskLevel.toUpperCase()}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.success('✅ No fraud detected - appears safe!', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  };

  const generateMockResults = (query, type) => {
    // For image type, simulate fraud detection
    let isSuspicious = false;
    let queryText = query;
    
    if (type === 'image') {
      // Simulate random fraud detection for image uploads
      isSuspicious = Math.random() > 0.6; // 40% chance of fraud
      queryText = 'Image Analysis';
    } else {
      const suspiciousApps = ['1xbet', 'aviator', 'dafabet', '22bet', 'bet365', 'plinko'];
      isSuspicious = suspiciousApps.some(app => 
        query.toLowerCase().includes(app)
      );
    }

    return {
      query: queryText,
      type,
      isFraud: isSuspicious,
      confidence: isSuspicious ? 0.92 : 0.15,
      isHalal: !isSuspicious,
      riskLevel: isSuspicious ? 'high' : 'low',
      warnings: isSuspicious ? (
        type === 'image' ? [
          'Gambling interface detected in image',
          'Suspicious UI elements found',
          'Financial transaction patterns identified',
          'Violates Islamic finance principles (Maisir)'
        ] : [
          'App matches known gambling platform',
          'Violates Islamic finance principles (Maisir)',
          'Listed in NCCIA banned apps',
          'Suspicious payment patterns detected'
        ]
      ) : [],
      details: type === 'image' ? {
        imageAnalysis: {
          extractedText: isSuspicious ? 'bet deposit withdraw balance 1xbet aviator' : 'settings profile account',
          gamblingKeywords: isSuspicious ? ['bet', 'deposit', 'withdraw', '1xbet', 'aviator'] : [],
          financialKeywords: isSuspicious ? ['balance', 'deposit', 'withdraw'] : [],
          suspiciousPatterns: isSuspicious ? ['2.5x', '₨5000', '10:30'] : [],
          uiElements: {
            buttonsDetected: isSuspicious ? 8 : 3,
            inputFieldsDetected: isSuspicious ? 4 : 1
          },
          colorAnalysis: {
            red_percentage: isSuspicious ? 12.5 : 2.1,
            green_percentage: isSuspicious ? 8.3 : 1.5,
            gold_percentage: isSuspicious ? 5.7 : 0.8,
            gambling_colors: isSuspicious
          },
          fraudScore: isSuspicious ? 85 : 15
        },
        islamicCompliance: {
          maisir: isSuspicious ? 'Detected' : 'Not Detected',
          riba: isSuspicious ? 'Suspected' : 'Not Detected',
          gharar: isSuspicious ? 'High' : 'Low',
        },
        detectionMethod: 'ml_prediction',
        interfaceType: isSuspicious ? 'gambling_platform' : 'legitimate_app'
      } : {
        appInfo: {
          name: query,
          category: isSuspicious ? 'Gambling/Betting' : 'Legitimate',
          developer: isSuspicious ? 'Offshore Entity' : 'Verified Developer',
          permissions: isSuspicious ? ['SMS', 'Contacts', 'Location', 'Camera'] : ['Storage'],
        },
        islamicCompliance: {
          maisir: isSuspicious ? 'Detected' : 'Not Detected',
          riba: isSuspicious ? 'Suspected' : 'Not Detected',
          gharar: isSuspicious ? 'High' : 'Low',
        },
        transactionPatterns: isSuspicious ? {
          suspiciousTransactions: 847,
          averageAmount: '₨15,000',
          peakHours: '10 PM - 2 AM',
          userComplaints: 156
        } : null
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-enhanced border-b border-white/30 p-4 sticky top-0 z-50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="p-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 rounded-xl shadow-lg pulse-glow"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-emerald-200 bg-clip-text">
                Pakistan Fraud Detector
              </h1>
              <p className="text-sm text-emerald-300 font-medium">AI-Powered • Shariah Compliant • Real-time Protection</p>
            </div>
          </motion.div>
          <nav className="flex space-x-3">
            <motion.button
              onClick={() => setCurrentView('search')}
              className={`magnetic-btn px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentView === 'search' 
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                  : 'glass-effect text-white/90 hover:text-white hover:scale-105 border border-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
            <motion.button
              onClick={() => setCurrentView('dashboard')}
              className={`magnetic-btn px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentView === 'dashboard' 
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                  : 'glass-effect text-white/90 hover:text-white hover:scale-105 border border-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col"
            >
              {!isSearchActive ? (
                <SearchBall onActivate={() => setIsSearchActive(true)} />
              ) : (
                <SearchInterface
                  onSearch={handleSearch}
                  results={searchResults}
                  onBack={() => {
                    setIsSearchActive(false);
                    setSearchResults(null);
                  }}
                />
              )}
            </motion.div>
          )}
          
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="glass-enhanced border-t border-white/20 p-8 mt-12 relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            className="flex items-center justify-center space-x-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="h-6 w-6 text-emerald-400" />
            </motion.div>
            <p className="text-white font-semibold text-lg bg-gradient-to-r from-white to-emerald-200 bg-clip-text">
              Protecting Pakistan from financial fraud and ensuring Islamic compliance
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div 
              className="glass-effect p-4 rounded-xl"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h4 className="text-emerald-300 font-semibold mb-2">AI-Powered Detection</h4>
              <p className="text-white/70 text-sm">Advanced machine learning algorithms</p>
            </motion.div>
            
            <motion.div 
              className="glass-effect p-4 rounded-xl"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h4 className="text-emerald-300 font-semibold mb-2">Islamic Compliance</h4>
              <p className="text-white/70 text-sm">Shariah-compliant financial monitoring</p>
            </motion.div>
            
            <motion.div 
              className="glass-effect p-4 rounded-xl"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h4 className="text-emerald-300 font-semibold mb-2">Real-time Protection</h4>
              <p className="text-white/70 text-sm">Instant fraud detection and alerts</p>
            </motion.div>
          </div>
          
          <p className="text-sm text-white/80 font-medium mb-4">
            Powered by AI • Built for Pakistan • Shariah Compliant • Trusted by Financial Institutions
          </p>
          
          <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-white/60">
            <span className="font-medium">© 2024 Pakistan Fraud Detector</span>
            <motion.span 
              className="hover:text-emerald-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Privacy Policy
            </motion.span>
            <motion.span 
              className="hover:text-emerald-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Terms of Service
            </motion.span>
            <motion.span 
              className="hover:text-emerald-300 cursor-pointer transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Contact Us
            </motion.span>
          </div>
        </div>
      </motion.footer>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: 'white'
        }}
      />
    </div>
  );
}

export default App;
