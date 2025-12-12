import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Activity, TrendingUp, Zap
} from 'lucide-react';
import VideoAnalyzer from './components/VideoAnalyzer';
import BiomechanicsCompareTab from './components/BiomechanicsCompareTab';
import ProgressReportsTab from './components/ProgressReportsTab';

const tabs = [
  { id: 'analyze', name: 'Video Analysis', icon: Play, description: 'Upload & Analyze' },
  { id: 'biomechanics', name: 'Biomechanics & Compare', icon: Activity, description: 'Metrics & Comparison' },
  { id: 'progress', name: 'Progress & Reports', icon: TrendingUp, description: 'Track & Export' },
];

function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisData, setAnalysisData] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [comparisonVideo, setComparisonVideo] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-joc-darker via-joc-dark to-[#0a0a0f]">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-joc-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 md:p-6 mb-6 border border-joc-gold/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-joc-gold via-yellow-400 to-amber-500 flex items-center justify-center shadow-xl shadow-joc-gold/20">
                  <span className="text-2xl md:text-3xl font-black text-joc-dark tracking-tight">JOC</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-joc-dark flex items-center justify-center">
                  <Zap size={10} className="text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-joc-gold via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                    Taekwondo Analyzer
                  </span>
                  <span className="text-white ml-2">Pro</span>
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">
                  Jordan Olympic Committee • AI-Powered Biomechanical Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">AI Engine Active</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Powered by</p>
                <p className="text-sm font-semibold text-gray-300">QUALIA SOLUTIONS</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Premium Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex justify-center">
            <div className="inline-flex gap-2 p-2 rounded-2xl bg-joc-dark/50 backdrop-blur-xl border border-white/5">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-joc-gold to-amber-500 text-joc-dark shadow-lg shadow-joc-gold/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-joc-dark' : ''} />
                    <div className="text-left hidden sm:block">
                      <div className={`text-sm font-semibold ${isActive ? 'text-joc-dark' : ''}`}>
                        {tab.name}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-joc-dark/70' : 'text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-joc-gold to-amber-500 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card p-5 md:p-6 lg:p-8 border border-white/5 min-h-[600px]"
          >
            {renderTabContent()}
          </motion.main>
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-joc-dark/30 backdrop-blur border border-white/5">
            <p className="text-sm text-gray-400">
              JOC Taekwondo Analyzer Pro <span className="text-joc-gold font-semibold">v3.0</span>
            </p>
            <div className="w-px h-4 bg-gray-700"></div>
            <p className="text-xs text-gray-500">
              React + MediaPipe + Gemini AI
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
