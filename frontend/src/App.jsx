import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Activity, TrendingUp, Zap, Shield, Star, Award
} from 'lucide-react';
import VideoAnalyzer from './components/VideoAnalyzer';
import BiomechanicsCompareTab from './components/BiomechanicsCompareTab';
import ProgressReportsTab from './components/ProgressReportsTab';

const tabs = [
  { id: 'analyze', name: 'Video Analysis', icon: Play, description: 'Upload & Analyze', color: 'from-amber-500 to-orange-600' },
  { id: 'biomechanics', name: 'Biomechanics', icon: Activity, description: 'Metrics & Compare', color: 'from-blue-500 to-cyan-600' },
  { id: 'progress', name: 'Progress', icon: TrendingUp, description: 'Track & Reports', color: 'from-emerald-500 to-teal-600' },
];

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-joc-gold/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisData, setAnalysisData] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [comparisonVideo, setComparisonVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyze':
        return (
          <VideoAnalyzer
            videoFile={videoFile}
            setVideoFile={setVideoFile}
            analysisData={analysisData}
            setAnalysisData={setAnalysisData}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            sessions={sessions}
            setSessions={setSessions}
          />
        );
      case 'biomechanics':
        return (
          <BiomechanicsCompareTab
            analysisData={analysisData}
            videoFile={videoFile}
            comparisonVideo={comparisonVideo}
            setComparisonVideo={setComparisonVideo}
          />
        );
      case 'progress':
        return (
          <ProgressReportsTab
            sessions={sessions}
            setSessions={setSessions}
            athletes={athletes}
            setAthletes={setAthletes}
            analysisData={analysisData}
          />
        );
      default:
        return (
          <VideoAnalyzer
            videoFile={videoFile}
            setVideoFile={setVideoFile}
            analysisData={analysisData}
            setAnalysisData={setAnalysisData}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            sessions={sessions}
            setSessions={setSessions}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 bg-[#030308]">
        {/* Main ambient gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-joc-gold/8 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-blue-600/5 via-transparent to-transparent" />
        </div>

        {/* Glowing orbs */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <FloatingParticles />

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Premium Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f0f18] via-[#141420] to-[#0f0f18] border border-white/5 shadow-2xl shadow-black/50">
            {/* Header glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-joc-gold/5 via-transparent to-joc-gold/5" />

            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-joc-gold/50 to-transparent" />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Logo & Title */}
                <div className="flex items-center gap-6">
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Glow behind logo */}
                    <div className="absolute inset-0 bg-joc-gold/30 rounded-2xl blur-xl group-hover:bg-joc-gold/40 transition-all duration-500" />

                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-joc-gold via-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-joc-gold/30 overflow-hidden">
                      {/* Inner shine */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

                      <span className="relative text-3xl md:text-4xl font-black text-[#0a0a12] tracking-tighter">JOC</span>
                    </div>

                    {/* Status indicator */}
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-3 border-[#0f0f18] flex items-center justify-center shadow-lg shadow-green-500/30"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap size={14} className="text-white" />
                    </motion.div>
                  </motion.div>

                  <div>
                    <motion.h1
                      className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="bg-gradient-to-r from-joc-gold via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
                        Taekwondo Analyzer
                      </span>
                      <span className="text-white ml-2 font-light">Pro</span>
                    </motion.h1>
                    <motion.div
                      className="flex items-center gap-3 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-joc-gold" />
                        <span className="text-sm text-gray-400">Jordan Olympic Committee</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-joc-gold" />
                        <span className="text-sm text-gray-400">AI-Powered Analysis</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Right side - Status & Info */}
                <div className="flex items-center gap-6">
                  {/* AI Status */}
                  <motion.div
                    className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">System Online</p>
                      <p className="text-xs text-emerald-500/70">Gemini AI + MediaPipe</p>
                    </div>
                  </motion.div>

                  {/* Time & Branding */}
                  <motion.div
                    className="text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-2xl font-light text-white tabular-nums">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">by</span>
                      <span className="text-sm font-bold bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                        QUALIA SOLUTIONS
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Premium Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="relative inline-flex gap-3 p-2 rounded-2xl bg-[#0a0a12]/80 backdrop-blur-2xl border border-white/5 shadow-xl shadow-black/30">
              {/* Background highlight for active tab */}
              <motion.div
                className="absolute top-2 bottom-2 rounded-xl bg-gradient-to-r from-joc-gold to-amber-500 shadow-lg shadow-joc-gold/30"
                layoutId="activeTabBg"
                style={{
                  left: `calc(${tabs.findIndex(t => t.id === activeTab) * 33.33}% + 8px)`,
                  width: 'calc(33.33% - 12px)',
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />

              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex items-center gap-3 px-6 md:px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-[#0a0a12]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <div className="text-left hidden sm:block">
                      <div className={`text-sm font-bold ${isActive ? '' : ''}`}>
                        {tab.name}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-[#0a0a12]/70' : 'text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.nav>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a12] via-[#0f0f18] to-[#0a0a12] border border-white/5 shadow-2xl shadow-black/50 min-h-[650px]">
              {/* Content area inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-joc-gold/3 via-transparent to-blue-600/3" />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-joc-gold/10 to-transparent rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-600/10 to-transparent rounded-tl-full" />

              <div className="relative p-6 md:p-8 lg:p-10">
                {renderTabContent()}
              </div>
            </div>
          </motion.main>
        </AnimatePresence>

        {/* Premium Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-6 sm:px-8 py-4 rounded-2xl bg-[#0a0a12]/60 backdrop-blur-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-joc-gold" />
              <span className="text-sm font-semibold text-white">
                JOC Analyzer Pro
              </span>
              <span className="px-2 py-0.5 rounded-full bg-joc-gold/10 border border-joc-gold/20 text-xs font-bold text-joc-gold">
                v3.0
              </span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/10" />

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                React
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                MediaPipe
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Gemini AI
              </span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/10" />

            <span className="text-xs text-gray-500">
              © 2024 Jordan Olympic Committee
            </span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
