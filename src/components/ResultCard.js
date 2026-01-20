import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Shield, Eye, TrendingUp, Clock, Users, DollarSign, Camera, FileText, Palette, MousePointer } from 'lucide-react';

const ResultCard = ({ results }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (isFraud) => {
    return isFraud ? (
      <XCircle className="h-8 w-8 text-red-500" />
    ) : (
      <CheckCircle className="h-8 w-8 text-green-500" />
    );
  };

  const getHalalIcon = (isHalal) => {
    return isHalal ? (
      <CheckCircle className="h-6 w-6 text-green-500" />
    ) : (
      <XCircle className="h-6 w-6 text-red-500" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="result-card rounded-2xl p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getStatusIcon(results.isFraud)}
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {results.isFraud ? 'FRAUD DETECTED' : 'SAFE'}
            </h3>
            <p className="text-gray-600">Analysis for: {results.query}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getRiskColor(results.riskLevel)}`}>
            Risk: {results.riskLevel.toUpperCase()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Confidence: {(results.confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Islamic Compliance Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl mb-6">
        <div className="flex items-center space-x-3">
          {getHalalIcon(results.isHalal)}
          <div>
            <h4 className="font-semibold text-gray-800">
              Islamic Compliance: {results.isHalal ? 'HALAL ✓' : 'HARAM ✗'}
            </h4>
            <p className="text-sm text-gray-600">
              {results.isHalal 
                ? 'This appears to comply with Islamic finance principles'
                : 'This violates Islamic finance principles'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {results.warnings && results.warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Security Warnings</h4>
              <ul className="space-y-1">
                {results.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-700">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Analysis */}
        {results.details.imageAnalysis && (
          <div className="bg-purple-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Image Analysis Results
            </h4>
            <div className="space-y-4">
              {/* Extracted Text */}
              {results.details.imageAnalysis.extractedText && (
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Extracted Text:</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-sm text-gray-700 border">
                    {results.details.imageAnalysis.extractedText || 'No text detected'}
                  </div>
                </div>
              )}
              
              {/* Keywords Found */}
              <div className="grid grid-cols-1 gap-3">
                {results.details.imageAnalysis.gamblingKeywords?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Gambling Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {results.details.imageAnalysis.gamblingKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.details.imageAnalysis.financialKeywords?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Financial Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {results.details.imageAnalysis.financialKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fraud Score */}
              <div className="bg-white p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Fraud Score:</span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${
                    results.details.imageAnalysis.fraudScore >= 70 ? 'bg-red-100 text-red-700' :
                    results.details.imageAnalysis.fraudScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {results.details.imageAnalysis.fraudScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* App Information */}
        {results.details.appInfo && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              App Analysis
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  results.details.appInfo.category.includes('Gambling') 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {results.details.appInfo.category}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Developer:</span>
                <span className="ml-2 text-sm text-gray-800">{results.details.appInfo.developer}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {results.details.appInfo.permissions.map((permission, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Islamic Compliance Details */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Islamic Finance Check
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Maisir (Gambling):</span>
              <span className={`px-2 py-1 rounded text-xs ${
                results.details.islamicCompliance.maisir === 'Detected' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {results.details.islamicCompliance.maisir}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Riba (Interest):</span>
              <span className={`px-2 py-1 rounded text-xs ${
                results.details.islamicCompliance.riba === 'Suspected' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {results.details.islamicCompliance.riba}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Gharar (Uncertainty):</span>
              <span className={`px-2 py-1 rounded text-xs ${
                results.details.islamicCompliance.gharar === 'High' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {results.details.islamicCompliance.gharar}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Patterns (if available) */}
      {results.details.transactionPatterns && (
        <div className="mt-6 bg-yellow-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Suspicious Transaction Patterns
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.transactionPatterns.suspiciousTransactions}
              </div>
              <div className="text-xs text-gray-600">Suspicious Transactions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.transactionPatterns.averageAmount}
              </div>
              <div className="text-xs text-gray-600">Average Amount</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.transactionPatterns.peakHours}
              </div>
              <div className="text-xs text-gray-600">Peak Hours</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.transactionPatterns.userComplaints}
              </div>
              <div className="text-xs text-gray-600">User Complaints</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analysis (for images) */}
      {results.details.imageAnalysis?.uiElements && (
        <div className="mt-6 bg-indigo-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <MousePointer className="h-5 w-5 mr-2" />
            Visual Interface Analysis
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MousePointer className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.imageAnalysis.uiElements.buttonsDetected}
              </div>
              <div className="text-xs text-gray-600">Buttons Detected</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {results.details.imageAnalysis.uiElements.inputFieldsDetected}
              </div>
              <div className="text-xs text-gray-600">Input Fields</div>
            </div>
            {results.details.imageAnalysis.colorAnalysis && (
              <>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {results.details.imageAnalysis.colorAnalysis.red_percentage?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Red Colors</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {results.details.imageAnalysis.colorAnalysis.green_percentage?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Green Colors</div>
                </div>
              </>
            )}
          </div>
          
          {results.details.imageAnalysis.colorAnalysis?.gambling_colors && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Gambling-associated color scheme detected
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Report to Authorities
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
        >
          Save Report
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResultCard;
