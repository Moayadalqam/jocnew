import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Play, Pause, SkipBack, SkipForward, Camera,
  Activity, Target, Trophy, Users, FileText, Settings,
  Zap, Brain, Shield, TrendingUp, ChevronLeft, ChevronRight,
  Download, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';
import VideoAnalyzer from './components/VideoAnalyzer';
import BiomechanicsTab from './components/BiomechanicsTab';
import ComparisonTab from './components/ComparisonTab';
import InjuryPreventionTab from './components/InjuryPreventionTab';
import ScoringTab from './components/ScoringTab';
import ProgressTab from './components/ProgressTab';
import TeamTab from './components/TeamTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import MobileCameraTab from './components/MobileCameraTab';
import AIDetectionTab from './components/AIDetectionTab';
import AnnotationTab from './components/AnnotationTab';
import SessionHistoryTab from './components/SessionHistoryTab';

const tabs = [
  { id: 'analyze', name: 'Video Analysis', icon: Play },
  { id: 'biomechanics', name: 'Biomechanics', icon: Activity },
  { id: 'comparison', name: 'Compare', icon: Users },
  { id: 'injury', name: 'Injury Prevention', icon: Shield },
  { id: 'scoring', name: 'WT Scoring', icon: Trophy },
  { id: 'progress', name: 'Progress', icon: TrendingUp },
  { id: 'team', name: 'Team', icon: Users },
  { id: 'annotation', name: 'Annotations', icon: Target },
  { id: 'history', name: 'History', icon: FileText },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'camera', name: 'Mobile Camera', icon: Camera },
  { id: 'ai', name: 'AI Detection', icon: Brain },
  { id: 'settings', name: 'Settings', icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisData, setAnalysisData] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const tabsContainerRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
          />
        );
      case 'biomechanics':
        return <BiomechanicsTab analysisData={analysisData} />;
      case 'comparison':
        return <ComparisonTab analysisData={analysisData} />;
      case 'injury':
        return <InjuryPreventionTab analysisData={analysisData} />;
      case 'scoring':
        return <ScoringTab analysisData={analysisData} />;
      case 'progress':
        return <ProgressTab sessions={sessions} />;
      case 'team':
        return <TeamTab athletes={athletes} setAthletes={setAthletes} />;
      case 'annotation':
        return <AnnotationTab analysisData={analysisData} annotations={annotations} setAnnotations={setAnnotations} />;
      case 'history':
        return <SessionHistoryTab sessions={sessions} setSessions={setSessions} />;
      case 'reports':
        return <ReportsTab analysisData={analysisData} />;
      case 'camera':
        return <MobileCameraTab setAnalysisData={setAnalysisData} />;
      case 'ai':
        return <AIDetectionTab analysisData={analysisData} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <VideoAnalyzer />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 md:p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-joc-gold to-yellow-300 flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-joc-dark">JOC</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-joc-gold to-yellow-300 bg-clip-text text-transparent">
                Taekwondo Analyzer Pro
              </h1>
              <p className="text-sm md:text-base text-gray-400">
                Jordan Olympic Committee - AI-Powered Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>AI Engine Active</span>
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              Powered by QUALIA SOLUTIONS
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabs Navigation */}
      <div className="relative mb-6">
        <button
          onClick={() => scrollTabs('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-joc-dark/80 rounded-full text-joc-gold hover:bg-joc-gold hover:text-joc-dark transition-all md:hidden"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={tabsContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-8 md:px-0 md:flex-wrap md:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.name}</span>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-joc-dark/80 rounded-full text-joc-gold hover:bg-joc-gold hover:text-joc-dark transition-all md:hidden"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-4 md:p-6"
        >
          {renderTabContent()}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-sm text-gray-500"
      >
        <p>Jordan Olympic Committee Taekwondo Analyzer Pro v2.0</p>
        <p className="text-xs mt-1">Built with React + MediaPipe by QUALIA SOLUTIONS</p>
      </motion.footer>
    </div>
  );
}

export default App;
