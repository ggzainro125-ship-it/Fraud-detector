import React from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Zap, Eye, AlertTriangle, CheckCircle, Lock, Globe } from 'lucide-react';

const SearchBall = ({ onActivate }) => {
  // Generate floating balls data
  const floatingBalls = [
    { id: 1, size: 'w-16 h-16', icon: Shield, delay: 0, x: '10%', y: '20%', duration: 6 },
    { id: 2, size: 'w-12 h-12', icon: Eye, delay: 1, x: '85%', y: '15%', duration: 8 },
    { id: 3, size: 'w-20 h-20', icon: AlertTriangle, delay: 2, x: '15%', y: '70%', duration: 7 },
    { id: 4, size: 'w-14 h-14', icon: CheckCircle, delay: 0.5, x: '80%', y: '75%', duration: 9 },
    { id: 5, size: 'w-10 h-10', icon: Lock, delay: 1.5, x: '5%', y: '45%', duration: 5 },
    { id: 6, size: 'w-18 h-18', icon: Globe, delay: 2.5, x: '90%', y: '45%', duration: 6 },
    { id: 7, size: 'w-8 h-8', icon: Zap, delay: 3, x: '25%', y: '10%', duration: 4 },
    { id: 8, size: 'w-12 h-12', icon: Search, delay: 1.8, x: '75%', y: '25%', duration: 7 },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Floating Background Balls */}
      {floatingBalls.map((ball) => {
        const IconComponent = ball.icon;
        return (
          <motion.div
            key={ball.id}
            className={`absolute ${ball.size} rounded-full floating-ball flex items-center justify-center cursor-pointer`}
            style={{ left: ball.x, top: ball.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.7, 0.4, 0.7, 0.2, 0.7],
              scale: [0, 1, 1.2, 0.9, 1.1, 1],
              y: [0, -20, -40, -60, -30, 0],
              rotate: [0, 90, 180, 270, 360],
              x: [0, 5, -5, 3, -3, 0]
            }}
            transition={{ 
              duration: ball.duration,
              repeat: Infinity,
              delay: ball.delay,
              ease: "easeInOut"
            }}
            whileHover={{ 
              scale: 1.3,
              rotate: 45,
              transition: { duration: 0.3 }
            }}
          >
            <IconComponent className="w-1/2 h-1/2 text-white/60" />
          </motion.div>
        );
      })}

      <div className="text-center relative z-10">
        {/* Main Search Ball - Made Bigger */}
        <motion.div
          className="relative mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        >
          {/* Outer glow rings - Made Bigger */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            style={{ width: '550px', height: '550px', left: '-75px', top: '-75px' }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            style={{ width: '600px', height: '600px', left: '-100px', top: '-100px' }}
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.05, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />

          {/* Enhanced Main Ball - Made Much Bigger */}
          <motion.button
            onClick={onActivate}
            className="search-ball w-96 h-96 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 magnetic-btn group relative overflow-hidden"
            whileHover={{ 
              scale: 1.08,
              rotate: [0, -2, 2, 0],
            }}
            whileTap={{ scale: 0.92 }}
            animate={{ 
              y: [0, -20, 0],
            }}
            transition={{ 
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 0.3, ease: "easeOut" }
            }}
          >
            {/* Pulsing rings inside the ball */}
            <motion.div
              className="absolute inset-8 border-2 border-white/20 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute inset-16 border border-white/30 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            
            <div className="text-center relative z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Search className="h-28 w-28 text-white mb-6 mx-auto drop-shadow-2xl" />
                {/* Orbiting particles around the search icon */}
                <motion.div
                  className="absolute top-0 left-1/2 w-3 h-3 bg-white/60 rounded-full"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  style={{ transformOrigin: '0 64px' }}
                />
                <motion.div
                  className="absolute top-8 right-0 w-2 h-2 bg-emerald-300/80 rounded-full"
                  animate={{ 
                    rotate: -360,
                    scale: [1, 2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, delay: 1 }
                  }}
                  style={{ transformOrigin: '-32px 48px' }}
                />
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 40px rgba(16,185,129,0.5)",
                    "0 0 20px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                AI Fraud Detector
              </motion.h2>
              
              <motion.p 
                className="text-white/90 text-xl font-medium group-hover:text-emerald-200 transition-colors duration-300"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Click to start scanning
              </motion.p>
              
              {/* Pulse indicator */}
              <motion.div
                className="w-4 h-4 bg-emerald-400 rounded-full mx-auto mt-4"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.button>

          {/* Floating icons around main ball - Repositioned for bigger ball */}
          <motion.div
            className="absolute top-12 -right-12"
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <Shield className="h-16 w-16 text-white/60" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-12 -left-12"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            <Zap className="h-14 w-14 text-white/60" />
          </motion.div>

          {/* Additional floating icons for bigger ball */}
          <motion.div
            className="absolute top-1/2 -left-16"
            animate={{ 
              x: [0, -10, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
          >
            <Eye className="h-12 w-12 text-white/50" />
          </motion.div>

          <motion.div
            className="absolute top-1/2 -right-16"
            animate={{ 
              x: [0, 10, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 2 }}
          >
            <CheckCircle className="h-12 w-12 text-white/50" />
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Protect Pakistan from Financial Fraud
          </h1>
          <p className="text-xl text-white/90 mb-6">
            AI-powered detection of gambling apps, money laundering, and Islamic compliance violations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: Shield,
                title: "App Detection",
                description: "Identify fraudulent gambling and betting apps with 95% accuracy",
                gradient: "from-emerald-400 to-teal-500",
                delay: 0.7
              },
              {
                icon: Search,
                title: "Transaction Analysis",
                description: "Detect suspicious payment patterns and money laundering schemes",
                gradient: "from-cyan-400 to-blue-500",
                delay: 0.9
              },
              {
                icon: Zap,
                title: "Islamic Compliance",
                description: "Ensure Halal transactions and detect Haram activities instantly",
                gradient: "from-purple-400 to-pink-500",
                delay: 1.1
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass-enhanced p-8 rounded-2xl group cursor-pointer relative overflow-hidden"
                  whileHover={{ scale: 1.05, y: -10 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: feature.delay,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    initial={false}
                  />
                  
                  {/* Floating icon with enhanced animation */}
                  <motion.div
                    className={`p-4 bg-gradient-to-r ${feature.gradient} rounded-xl w-fit mx-auto mb-4 shadow-lg`}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    animate={{
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      y: { duration: 3, repeat: Infinity, delay: index * 0.5 },
                      rotate: { duration: 0.6 },
                      scale: { duration: 0.3 }
                    }}
                  >
                    <IconComponent className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-white font-bold mb-3 text-xl group-hover:text-emerald-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/95 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Animated bottom border */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-700 ease-out`}
                  />
                  
                  {/* Corner accent */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors duration-300" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchBall;
