import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Loader2, AlertTriangle, CheckCircle, XCircle, Shield, Zap, Eye, Camera, Upload, X } from 'lucide-react';
import LiveDetection from './LiveDetection';
import ResultCard from './ResultCard';

const SearchInterface = ({ onSearch, results, onBack }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('app');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchType === 'image' && !selectedImage) {
      alert('Please select an image to analyze');
      return;
    }
    if (searchType !== 'image' && !query.trim()) return;

    setIsLoading(true);
    if (searchType === 'image') {
      await onSearch(selectedImage, searchType);
    } else {
      await onSearch(query, searchType);
    }
    setIsLoading(false);
  };

  const handleImageSelect = (e) => {
    console.log('Image select triggered', e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('File read successfully');
        const base64String = event.target.result;
        setSelectedImage(base64String);
        setImagePreview(base64String);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      console.log('File dropped:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please drop a valid image file (PNG, JPG, JPEG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('Dropped file read successfully');
        const base64String = event.target.result;
        setSelectedImage(base64String);
        setImagePreview(base64String);
      };
      reader.onerror = (error) => {
        console.error('Error reading dropped file:', error);
        alert('Error reading the dropped file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlaceholder = () => {
    if (searchType === 'app') {
      return 'Enter app name (e.g., "1xBet", "Aviator Games")';
    } else if (searchType === 'transaction') {
      return 'Enter transaction details or merchant name';
    } else {
      return 'Enter website URL to check';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Enhanced Back Button */}
        <motion.button
          onClick={onBack}
          className="magnetic-btn flex items-center space-x-3 text-white/80 hover:text-white mb-8 transition-all duration-300 glass-effect px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Back to Search</span>
        </motion.button>

        {/* Enhanced Search Form */}
        <motion.div 
          className="glass-enhanced rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-20"
                animate={{
                  x: [0, 100, -50, 0],
                  y: [0, -100, 50, 0],
                  scale: [1, 1.5, 0.5, 1],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                }}
              />
            ))}
          </div>

          <motion.div 
            className="flex items-center space-x-4 mb-6 relative z-10"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div 
              className="p-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-xl shadow-lg pulse-glow"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Search className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-emerald-200 bg-clip-text">
                Fraud Detection Scanner
              </h2>
              <p className="text-white/80 font-medium">AI-powered fraud detection for Pakistan • Real-time Analysis</p>
            </div>
          </motion.div>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Enhanced Search Type Selector */}
            <motion.div 
              className="grid grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={() => {
                  setSearchType('app');
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className={`magnetic-btn p-5 rounded-xl transition-all duration-300 flex flex-col items-center space-y-3 relative overflow-hidden ${
                  searchType === 'app'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'glass-effect text-white/80 hover:text-white hover:scale-105 border border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm font-semibold">App</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setSearchType('transaction');
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className={`magnetic-btn p-5 rounded-xl transition-all duration-300 flex flex-col items-center space-y-3 relative overflow-hidden ${
                  searchType === 'transaction'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'glass-effect text-white/80 hover:text-white hover:scale-105 border border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-6 w-6" />
                <span className="text-sm font-semibold">Transaction</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setSearchType('url');
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className={`magnetic-btn p-5 rounded-xl transition-all duration-300 flex flex-col items-center space-y-3 relative overflow-hidden ${
                  searchType === 'url'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'glass-effect text-white/80 hover:text-white hover:scale-105 border border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="h-6 w-6" />
                <span className="text-sm font-semibold">URL</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setSearchType('image');
                }}
                className={`magnetic-btn p-5 rounded-xl transition-all duration-300 flex flex-col items-center space-y-3 relative overflow-hidden ${
                  searchType === 'image'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'glass-effect text-white/80 hover:text-white hover:scale-105 border border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm font-semibold">Image</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  setSearchType('live');
                }}
                className={`magnetic-btn p-5 rounded-xl transition-all duration-300 flex flex-col items-center space-y-3 relative overflow-hidden ${
                  searchType === 'live'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'glass-effect text-white/80 hover:text-white hover:scale-105 border border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm font-semibold">Live</span>
              </motion.button>
            </motion.div>

            {/* Enhanced Search Input or Image Upload */}
            {searchType === 'image' ? (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload-input"
                />
                
                {/* Enhanced Image upload area with drag and drop */}
                {!imagePreview ? (
                  <motion.div
                    onClick={() => {
                      console.log('Upload area clicked');
                      if (fileInputRef.current) {
                        console.log('Triggering file input click');
                        fileInputRef.current.click();
                      } else {
                        console.error('File input ref is null');
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`glass-enhanced border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                      isDragOver 
                        ? 'border-emerald-400 bg-emerald-500/10 scale-105' 
                        : 'border-white/40 hover:border-emerald-400/60 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: isDragOver ? 1.05 : 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      scale: isDragOver ? 1.05 : 1,
                      borderColor: isDragOver ? '#10b981' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="h-16 w-16 text-white/60 mx-auto mb-4 group-hover:text-emerald-400 transition-colors duration-300" />
                    </motion.div>
                    
                    <h3 className={`mb-3 font-bold text-lg transition-colors duration-300 ${
                      isDragOver ? 'text-emerald-300' : 'text-white/90 group-hover:text-white'
                    }`}>
                      {isDragOver ? 'Drop image here' : 'Click to upload an image'}
                    </h3>
                    <p className={`text-sm mb-2 transition-colors duration-300 ${
                      isDragOver ? 'text-emerald-200' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                      {isDragOver ? 'Release to upload' : 'Drag and drop or click to select'}
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDragOver ? 'text-emerald-100' : 'text-white/50 group-hover:text-white/70'
                    }`}>
                      Supports PNG, JPG, JPEG, GIF, WebP (max 5MB)
                    </p>
                    
                    {/* Upload icon animation */}
                    <motion.div
                      className="absolute top-4 right-4 w-3 h-3 bg-emerald-400/60 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="relative group glass-enhanced rounded-xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={imagePreview}
                      alt="Selected for analysis"
                      className="w-full h-64 object-cover"
                    />
                    
                    {/* Overlay with image info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-semibold">Image ready for analysis</p>
                        <p className="text-sm text-white/80">Click scan to detect fraud patterns</p>
                      </div>
                    </div>
                    
                    {/* Clear button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-4 right-4 p-3 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                    
                    {/* Replace button */}
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-emerald-500 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Replace
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="relative bg-white/10 rounded-xl p-4 border border-white/20">
                <input
                  type="text"
                  value={query || ''}
                  onChange={(e) => setQuery(e.target.value || '')}
                  placeholder={getPlaceholder()}
                  className="w-full bg-transparent text-white placeholder-white/50 outline-none text-lg"
                  disabled={isLoading}
                />
                <Search className="absolute right-4 top-4 h-6 w-6 text-white/60" />
              </div>
            )}

            {/* Enhanced Search Button */}
            <motion.button
              type="submit"
              disabled={isLoading || (searchType !== 'image' && !query.trim()) || (searchType === 'image' && !selectedImage)}
              className="magnetic-btn w-full px-8 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              animate={isLoading ? { 
                background: ["linear-gradient(45deg, #10b981, #06b6d4)", "linear-gradient(45deg, #06b6d4, #8b5cf6)", "linear-gradient(45deg, #8b5cf6, #10b981)"]
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Search className="h-6 w-6" />
                  <span>Scan for Fraud</span>
                </>
              )}
            </motion.button>
          </form>

          {searchType === 'live' && (
            <div className="mt-6">
              <LiveDetection onClose={() => setSearchType('app')} />
            </div>
          )}

          {/* Enhanced Quick Examples */}
          {searchType !== 'image' && (
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-white/70 text-sm mb-4 font-medium">Quick examples:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['1xBet', 'Aviator Games', 'Dafabet', '22Bet', 'Plinko'].map((example, index) => (
                  <motion.button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="magnetic-btn px-4 py-2 glass-effect text-white/90 rounded-xl text-sm font-medium hover:bg-white/30 hover:text-white transition-all duration-300 border border-white/20 hover:border-white/40"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <ResultCard results={results} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Information Cards */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: AlertTriangle,
                title: "Banned Apps Detection",
                description: "Our AI checks against NCCIA's list of 46+ banned gambling apps including 1xBet, Aviator, and Dafabet.",
                color: "yellow",
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                icon: Shield,
                title: "Islamic Compliance",
                description: "Automatically detects Maisir (gambling), Riba (interest), and Gharar (excessive uncertainty).",
                color: "emerald",
                gradient: "from-emerald-400 to-teal-500"
              },
              {
                icon: Zap,
                title: "Real-time Analysis",
                description: "Advanced ML models analyze app behavior, transaction patterns, and compliance in real-time.",
                color: "cyan",
                gradient: "from-cyan-400 to-blue-500"
              }
            ].map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.title}
                  className="glass-enhanced p-6 rounded-xl group hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <motion.div
                    className={`p-3 bg-gradient-to-r ${card.gradient} rounded-xl w-fit mb-4 shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-white font-bold mb-3 text-lg group-hover:text-emerald-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                    {card.description}
                  </p>
                  
                  {/* Animated border */}
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchInterface;
