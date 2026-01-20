import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, Shield, Users, DollarSign, Clock, Eye, CheckCircle, Activity, Wifi, WifiOff, MapPin, Globe, Zap, Database, Cpu } from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 15847,
    fraudDetected: 3421,
    halalCompliant: 12426,
    blockedAmount: 2847000,
    activeThreats: 156,
    recentScans: 847
  });

  const [isConnected, setIsConnected] = useState(false);
  const [liveScans, setLiveScans] = useState([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [geoLocations, setGeoLocations] = useState([]);
  const [fraudPatterns, setFraudPatterns] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    network: 78,
    responseTime: 120
  });
  const [threatIntelligence, setThreatIntelligence] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [collaborationEvents, setCollaborationEvents] = useState([]);
  const socketRef = useRef(null);

  // WebSocket connection for real-time data
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to real-time server');
      toast.success('🟢 Real-time connection established', {
        position: "bottom-right",
        autoClose: 3000,
      });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time server');
      toast.warn('🟡 Real-time connection lost', {
        position: "bottom-right",
        autoClose: 3000,
      });
    });

    // Listen for real-time fraud detections
    socketRef.current.on('fraud_detected', (data) => {
      setRealTimeAlerts(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 alerts
      setStats(prev => ({
        ...prev,
        fraudDetected: prev.fraudDetected + 1,
        activeThreats: prev.activeThreats + 1
      }));
      
      toast.error(`🚨 Fraud Detected: ${data.appName}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Listen for new scan activities
    socketRef.current.on('scan_activity', (data) => {
      setLiveScans(prev => [data, ...prev.slice(0, 19)]); // Keep last 20 scans
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + 1,
        recentScans: prev.recentScans + 1
      }));
    });

    // Listen for stats updates
    socketRef.current.on('stats_update', (newStats) => {
      setStats(prev => ({
        ...prev,
        ...newStats
      }));
    });

    // Listen for Islamic compliance updates
    socketRef.current.on('compliance_update', (data) => {
      setStats(prev => ({
        ...prev,
        halalCompliant: data.halalCount,
        blockedAmount: prev.blockedAmount + (data.blockedAmount || 0)
      }));
    });

    // Listen for geographic fraud data
    socketRef.current.on('geo_fraud_update', (data) => {
      setGeoLocations(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 locations
    });

    // Listen for fraud pattern detection
    socketRef.current.on('fraud_pattern_detected', (data) => {
      setFraudPatterns(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 patterns
      toast.error(`🧠 Fraud Pattern Detected: ${data.pattern}`, {
        position: "top-right",
        autoClose: 6000,
      });
    });

    // Listen for system metrics
    socketRef.current.on('system_metrics', (data) => {
      setSystemMetrics(data);
    });

    // Listen for threat intelligence
    socketRef.current.on('threat_intelligence', (data) => {
      setThreatIntelligence(prev => [data, ...prev.slice(0, 19)]); // Keep last 20
    });

    // Listen for financial transactions
    socketRef.current.on('transaction_update', (data) => {
      setTransactions(prev => [data, ...prev.slice(0, 29)]); // Keep last 30
      if (data.isSuspicious) {
        toast.warning(`💳 Suspicious Transaction: ₨${data.amount.toLocaleString()}`, {
          position: "bottom-right",
          autoClose: 4000,
        });
      }
    });

    // Listen for active users
    socketRef.current.on('active_users_update', (data) => {
      setActiveUsers(data);
    });

    // Listen for collaboration events
    socketRef.current.on('collaboration_event', (data) => {
      setCollaborationEvents(prev => [data, ...prev.slice(0, 19)]);
      toast.info(`👥 ${data.user} ${data.action}`, {
        position: "bottom-left",
        autoClose: 3000,
      });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Simulate real-time data when backend is not available
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        // Simulate random scan activity
        const scanData = {
          id: Date.now(),
          type: ['app', 'transaction', 'url'][Math.floor(Math.random() * 3)],
          query: `Scan ${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          isFraud: Math.random() > 0.7
        };
        
        setLiveScans(prev => [scanData, ...prev.slice(0, 19)]);
        
        if (scanData.isFraud) {
          const alertData = {
            id: Date.now(),
            appName: `Threat ${Math.floor(Math.random() * 100)}`,
            type: 'Gambling App',
            risk: 'High',
            timestamp: new Date().toISOString()
          };
          
          setRealTimeAlerts(prev => [alertData, ...prev.slice(0, 9)]);
          setStats(prev => ({
            ...prev,
            fraudDetected: prev.fraudDetected + 1,
            activeThreats: prev.activeThreats + 1
          }));

          // Simulate geographic data
          const cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Faisalabad'];
          const geoData = {
            id: Date.now(),
            city: cities[Math.floor(Math.random() * cities.length)],
            lat: 24.8607 + (Math.random() - 0.5) * 10,
            lng: 67.0011 + (Math.random() - 0.5) * 10,
            fraudType: alertData.type,
            severity: Math.floor(Math.random() * 5) + 1,
            timestamp: new Date().toISOString()
          };
          setGeoLocations(prev => [geoData, ...prev.slice(0, 49)]);

          // Simulate fraud patterns
          if (Math.random() > 0.8) {
            const patterns = ['Multiple small transactions', 'Round number amounts', 'Late night activity', 'Geographic clustering'];
            const patternData = {
              id: Date.now(),
              pattern: patterns[Math.floor(Math.random() * patterns.length)],
              confidence: Math.floor(Math.random() * 30) + 70,
              affectedApps: Math.floor(Math.random() * 5) + 1,
              timestamp: new Date().toISOString()
            };
            setFraudPatterns(prev => [patternData, ...prev.slice(0, 9)]);
          }
        }
        
        setStats(prev => ({
          ...prev,
          totalScans: prev.totalScans + 1,
          recentScans: prev.recentScans + 1
        }));

        // Update system metrics
        setSystemMetrics(prev => ({
          cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
          network: Math.max(15, Math.min(95, prev.network + (Math.random() - 0.5) * 12)),
          responseTime: Math.max(50, Math.min(300, prev.responseTime + (Math.random() - 0.5) * 30))
        }));

        // Simulate threat intelligence
        if (Math.random() > 0.9) {
          const intelData = {
            id: Date.now(),
            source: 'Dark Web Monitor',
            threat: `New gambling variant detected: ${Math.random().toString(36).substring(7)}`,
            credibility: Math.floor(Math.random() * 30) + 70,
            timestamp: new Date().toISOString()
          };
          setThreatIntelligence(prev => [intelData, ...prev.slice(0, 19)]);
        }

        // Simulate financial transactions
        if (Math.random() > 0.7) {
          const transactionData = {
            id: Date.now(),
            amount: Math.floor(Math.random() * 50000) + 1000,
            type: ['transfer', 'payment', 'withdrawal'][Math.floor(Math.random() * 3)],
            from: `Account ${Math.floor(Math.random() * 9000) + 1000}`,
            to: ['Easypaisa', 'JazzCash', 'SadaPay', 'Bank Account'][Math.floor(Math.random() * 4)],
            isSuspicious: Math.random() > 0.8,
            riskScore: Math.floor(Math.random() * 100),
            timestamp: new Date().toISOString()
          };
          setTransactions(prev => [transactionData, ...prev.slice(0, 29)]);
        }

        // Simulate active users
        if (Math.random() > 0.95) {
          const userData = {
            id: Date.now(),
            name: `Analyst ${Math.floor(Math.random() * 10) + 1}`,
            role: ['Security Analyst', 'Fraud Investigator', 'Compliance Officer'][Math.floor(Math.random() * 3)],
            status: ['online', 'investigating', 'monitoring'][Math.floor(Math.random() * 3)],
            avatar: `👤`
          };
          setActiveUsers(prev => {
            const existing = prev.find(u => u.name === userData.name);
            if (existing) {
              return prev.map(u => u.name === userData.name ? userData : u);
            }
            return [...prev.slice(0, 4), userData];
          });
        }

        // Simulate collaboration events
        if (Math.random() > 0.9) {
          const actions = ['flagged a threat', 'joined investigation', 'updated report', 'shared findings'];
          const eventData = {
            id: Date.now(),
            user: `Analyst ${Math.floor(Math.random() * 10) + 1}`,
            action: actions[Math.floor(Math.random() * actions.length)],
            target: `Threat ${Math.floor(Math.random() * 100)}`,
            timestamp: new Date().toISOString()
          };
          setCollaborationEvents(prev => [eventData, ...prev.slice(0, 19)]);
        }
      }, 2000); // Update every 2 seconds for more activity

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Mock data for charts - will be updated with real-time data
  const [fraudTrends, setFraudTrends] = useState([
    { month: 'Jan', detected: 245, blocked: 89 },
    { month: 'Feb', detected: 312, blocked: 156 },
    { month: 'Mar', detected: 289, blocked: 134 },
    { month: 'Apr', detected: 445, blocked: 267 },
    { month: 'May', detected: 567, blocked: 389 },
    { month: 'Jun', detected: 623, blocked: 445 },
  ]);

  const [appCategories, setAppCategories] = useState([
    { name: 'Gambling Apps', value: 45, color: '#ef4444' },
    { name: 'Forex Trading', value: 25, color: '#f59e0b' },
    { name: 'Crypto Scams', value: 20, color: '#8b5cf6' },
    { name: 'Others', value: 10, color: '#6b7280' },
  ]);

  // Update charts with real-time data
  useEffect(() => {
    if (!isConnected && stats.fraudDetected > 3421) {
      // Update current month data when stats change
      const currentMonth = new Date().toLocaleString('default', { month: 'short' });
      setFraudTrends(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        if (newData[lastIndex].month === currentMonth) {
          newData[lastIndex].detected = stats.fraudDetected;
          newData[lastIndex].blocked = Math.floor(stats.fraudDetected * 0.7);
        } else {
          newData.push({
            month: currentMonth,
            detected: stats.fraudDetected,
            blocked: Math.floor(stats.fraudDetected * 0.7)
          });
        }
        return newData.slice(-6); // Keep last 6 months
      });

      // Update app categories based on real-time alerts
      if (realTimeAlerts.length > 0) {
        setAppCategories(prev => {
          const gamblingApps = prev.find(cat => cat.name === 'Gambling Apps');
          if (gamblingApps) {
            gamblingApps.value = Math.min(50, gamblingApps.value + realTimeAlerts.length);
          }
          return [...prev];
        });
      }
    }
  }, [stats, realTimeAlerts, isConnected]);

  const recentThreats = [
    { id: 1, name: '1xBet Mobile', type: 'Gambling App', risk: 'High', detected: '2 hours ago' },
    { id: 2, name: 'Aviator Pro', type: 'Betting Game', risk: 'High', detected: '4 hours ago' },
    { id: 3, name: 'Quick Forex', type: 'Trading Scam', risk: 'Medium', detected: '6 hours ago' },
    { id: 4, name: 'Lucky Slots', type: 'Casino App', risk: 'High', detected: '8 hours ago' },
    { id: 5, name: 'Crypto Trader', type: 'Investment Scam', risk: 'Medium', detected: '12 hours ago' },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'emerald' }) => {
    const colorMap = {
      emerald: 'from-emerald-500 to-teal-500',
      red: 'from-red-500 to-pink-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-indigo-500',
      yellow: 'from-yellow-500 to-orange-500',
      indigo: 'from-indigo-500 to-purple-500',
      blue: 'from-blue-500 to-cyan-500'
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtitle && <p className="text-white/50 text-xs mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorMap[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Real-time Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fraud Detection Dashboard</h1>
            <p className="text-white/80">Real-time monitoring of financial fraud and Islamic compliance in Pakistan</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              isConnected 
                ? 'bg-emerald-500/20 border border-emerald-400/50' 
                : 'bg-red-500/20 border border-red-400/50'
            }`}>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-emerald-400 animate-pulse" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                isConnected ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
              <div className="text-sm text-white/60">Real-time Updates</div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Alerts Section */}
        {realTimeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
                Live Fraud Alerts ({realTimeAlerts.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {realTimeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-red-500/10 rounded-lg p-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">{alert.appName}</span>
                      <span className="text-white/60 text-sm">{alert.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-red-400/20 text-red-300 text-xs rounded-full">
                        {alert.risk} Risk
                      </span>
                      <span className="text-white/40 text-xs">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            icon={Eye}
            title="Total Scans"
            value={stats.totalScans.toLocaleString()}
            subtitle="This month"
            color="blue"
          />
          <StatCard
            icon={AlertTriangle}
            title="Fraud Detected"
            value={stats.fraudDetected.toLocaleString()}
            subtitle="21.6% of scans"
            color="red"
          />
          <StatCard
            icon={CheckCircle}
            title="Halal Compliant"
            value={stats.halalCompliant.toLocaleString()}
            subtitle="78.4% of scans"
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Amount Blocked"
            value={`₨${(stats.blockedAmount / 1000000).toFixed(1)}M`}
            subtitle="Potential losses prevented"
            color="purple"
          />
          <StatCard
            icon={Shield}
            title="Active Threats"
            value={stats.activeThreats}
            subtitle="Currently monitored"
            color="yellow"
          />
          <StatCard
            icon={Clock}
            title="Recent Scans"
            value={stats.recentScans}
            subtitle="Last 24 hours"
            color="indigo"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Fraud Detection Trends - Real-time */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Fraud Detection Trends</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-white/60">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fraudTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="detected" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="blocked" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* App Categories - Real-time */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Fraud by Category</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-white/60">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Advanced Real-time Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Geographic Fraud Detection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-emerald-400" />
                Geographic Fraud Hotspots
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs ${
                isConnected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-red-400/20 text-red-300'
              }`}>
                {geoLocations.length} Active
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {geoLocations.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Waiting for geographic data...
                </div>
              ) : (
                geoLocations.slice(0, 8).map((location) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-red-400" />
                      <div>
                        <div className="text-white font-medium">{location.city}</div>
                        <div className="text-white/60 text-xs">{location.fraudType}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        location.severity >= 4 
                          ? 'bg-red-400/20 text-red-300'
                          : location.severity >= 2
                          ? 'bg-yellow-400/20 text-yellow-300'
                          : 'bg-emerald-400/20 text-emerald-300'
                      }`}>
                        Severity {location.severity}/5
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        {new Date(location.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Fraud Pattern Recognition */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                AI Pattern Detection
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs ${
                isConnected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-red-400/20 text-red-300'
              }`}>
                {fraudPatterns.length} Patterns
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fraudPatterns.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  AI analyzing patterns...
                </div>
              ) : (
                fraudPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-400/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{pattern.pattern}</span>
                      <span className="px-2 py-1 bg-yellow-400/20 text-yellow-300 text-xs rounded-full">
                        {pattern.confidence}% Confidence
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{pattern.affectedApps} apps affected</span>
                      <span className="text-white/40 text-xs">
                        {new Date(pattern.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* System Performance & Threat Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-blue-400" />
              System Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">CPU Usage</span>
                  <span className="text-white font-medium">{systemMetrics.cpu}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.cpu}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Memory Usage</span>
                  <span className="text-white font-medium">{systemMetrics.memory}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.memory}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Network Activity</span>
                  <span className="text-white font-medium">{systemMetrics.network}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.network}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Response Time</span>
                  <span className="text-white font-medium">{systemMetrics.responseTime}ms</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemMetrics.responseTime < 100 
                        ? 'bg-gradient-to-r from-emerald-400 to-green-400'
                        : systemMetrics.responseTime < 200
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        : 'bg-gradient-to-r from-red-400 to-pink-400'
                    }`}
                    style={{ width: `${Math.min(100, (systemMetrics.responseTime / 300) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Threat Intelligence Feed */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-400" />
              Threat Intelligence Feed
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {threatIntelligence.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Monitoring threat feeds...
                </div>
              ) : (
                threatIntelligence.slice(0, 8).map((intel) => (
                  <motion.div
                    key={intel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-purple-500/10 rounded-lg border border-purple-400/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{intel.source}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        intel.credibility >= 80
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : intel.credibility >= 60
                          ? 'bg-yellow-400/20 text-yellow-300'
                          : 'bg-red-400/20 text-red-300'
                      }`}>
                        {intel.credibility}% Credibility
                      </span>
                    </div>
                    <div className="text-white/80 text-sm mb-1">{intel.threat}</div>
                    <div className="text-white/40 text-xs">
                      {new Date(intel.timestamp).toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400 animate-pulse" />
            Live Transaction Monitoring ({transactions.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Monitoring transactions...
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${
                      transaction.isSuspicious 
                        ? 'bg-red-500/10 border-red-400/20' 
                        : 'bg-emerald-500/10 border-emerald-400/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">₨{transaction.amount.toLocaleString()}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.isSuspicious 
                            ? 'bg-red-400/20 text-red-300' 
                            : 'bg-emerald-400/20 text-emerald-300'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.riskScore >= 70
                          ? 'bg-red-400/20 text-red-300'
                          : transaction.riskScore >= 40
                          ? 'bg-yellow-400/20 text-yellow-300'
                          : 'bg-emerald-400/20 text-emerald-300'
                      }`}>
                        Risk {transaction.riskScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-white/60">
                        {transaction.from} → {transaction.to}
                      </div>
                      <div className="text-white/40 text-xs">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Transaction Volume Chart */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Transaction Volume (Last Hour)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={
                  // Generate hourly data
                  Array.from({ length: 12 }, (_, i) => ({
                    time: `${i * 5}m`,
                    volume: Math.floor(Math.random() * 100) + 20,
                    suspicious: Math.floor(Math.random() * 30) + 5
                  }))
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="suspicious" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Live Scan Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-emerald-400 animate-pulse" />
            Live Scan Activity ({liveScans.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {liveScans.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                Waiting for scan activity...
              </div>
            ) : (
              liveScans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    scan.isFraud 
                      ? 'bg-red-500/10 border border-red-400/20' 
                      : 'bg-emerald-500/10 border border-emerald-400/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      scan.isFraud ? 'bg-red-400' : 'bg-emerald-400'
                    }`}></div>
                    <div>
                      <span className="text-white font-medium">{scan.query}</span>
                      <span className="text-white/60 text-sm ml-2">
                        {scan.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      scan.isFraud 
                        ? 'bg-red-400/20 text-red-300' 
                        : 'bg-emerald-400/20 text-emerald-300'
                    }`}>
                      {scan.isFraud ? 'Fraud' : 'Safe'}
                    </span>
                    <span className="text-white/40 text-xs">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Threats Table - Updated with Real-time Data */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Threats Detected</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-white/90">Threat Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-white/90">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-white/90">Risk Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-white/90">Detected</th>
                  <th className="text-left py-3 px-4 font-semibold text-white/90">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...recentThreats, ...realTimeAlerts].slice(0, 5).map((threat, index) => (
                  <tr key={`${threat.id}-${index}`} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-white">{threat.name || threat.appName}</td>
                    <td className="py-3 px-4 text-white/70">{threat.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        threat.risk === 'High' 
                          ? 'bg-red-100 text-red-700'
                          : threat.risk === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {threat.risk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {threat.detected || new Date(threat.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Real-time Collaboration Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Team Members */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Active Team Members ({activeUsers.length})
            </h3>
            <div className="space-y-3">
              {activeUsers.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Team members connecting...
                </div>
              ) : (
                activeUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-white/60 text-sm">{user.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-emerald-400' :
                        user.status === 'investigating' ? 'bg-yellow-400 animate-pulse' :
                        'bg-blue-400'
                      }`}></div>
                      <span className="text-white/60 text-xs capitalize">{user.status}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Team Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-400" />
              Team Activity ({collaborationEvents.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborationEvents.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Team activity will appear here...
                </div>
              ) : (
                collaborationEvents.slice(0, 10).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-purple-500/10 rounded-lg border border-purple-400/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{event.user}</span>
                      <span className="text-white/40 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-white/80 text-sm">
                      {event.action} → <span className="text-purple-300">{event.target}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-emerald-400 animate-pulse" />
            Islamic Compliance Overview - Live Monitoring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {((stats.halalCompliant / stats.totalScans) * 100).toFixed(1)}%
              </div>
              <div className="text-white font-medium">Halal Transactions</div>
              <div className="text-sm text-white/60">{stats.halalCompliant.toLocaleString()} compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {((stats.fraudDetected / stats.totalScans) * 100).toFixed(1)}%
              </div>
              <div className="text-white font-medium">Maisir Detected</div>
              <div className="text-sm text-white/60">{stats.fraudDetected.toLocaleString()} gambling activities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {((stats.blockedAmount / 1000000).toFixed(1))}M PKR
              </div>
              <div className="text-white font-medium">Amount Blocked</div>
              <div className="text-sm text-white/60">Potential haram transactions prevented</div>
            </div>
          </div>
          
          {/* Real-time Compliance Status */}
          <div className="mt-6 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span className="text-white font-medium">
                  {isConnected ? 'Live Compliance Monitoring Active' : 'Compliance Monitoring Offline'}
                </span>
              </div>
              <div className="text-sm text-white/60">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
