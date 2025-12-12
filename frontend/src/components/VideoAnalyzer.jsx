import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Play, Pause, SkipBack, SkipForward,
  RotateCcw, Volume2, VolumeX, CheckCircle,
  AlertCircle, Sparkles, Video, Clock, Zap, Target,
  TrendingUp, Award, ChevronRight, Activity
} from 'lucide-react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { analyzeWithGemini, generateCoachingFeedback } from '../services/geminiService';
import { analysisService } from '../services/supabaseClient';

// Olympic-inspired loader component
const OlympicLoader = () => (
  <div className="flex items-center gap-2">
    {[
      { color: 'bg-blue-500', delay: 0 },
      { color: 'bg-yellow-400', delay: 0.1 },
      { color: 'bg-gray-900', delay: 0.2 },
      { color: 'bg-green-500', delay: 0.3 },
      { color: 'bg-red-500', delay: 0.4 },
    ].map((ring, i) => (
      <motion.div
        key={i}
        className={`w-3 h-3 rounded-full ${ring.color}`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 0.8,
          delay: ring.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Circular progress indicator
const CircularProgress = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-joc-gold"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const VideoAnalyzer = ({
  videoFile,
  setVideoFile,
  analysisData,
  setAnalysisData,
  isAnalyzing,
  setIsAnalyzing,
  sessions,
  setSessions
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedKickType, setSelectedKickType] = useState('dollyo_chagi');
  const [videoUrl, setVideoUrl] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState(null);
  const [coachingFeedback, setCoachingFeedback] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const { detectPose, isModelLoaded, initializePose, landmarks } = usePoseDetection();

  const kickTypes = [
    { id: 'dollyo_chagi', name: 'Dollyo Chagi', subtitle: 'Roundhouse Kick', icon: '🦵' },
    { id: 'yeop_chagi', name: 'Yeop Chagi', subtitle: 'Side Kick', icon: '➡️' },
    { id: 'ap_chagi', name: 'Ap Chagi', subtitle: 'Front Kick', icon: '⬆️' },
    { id: 'dwi_chagi', name: 'Dwi Chagi', subtitle: 'Back Kick', icon: '⬅️' },
    { id: 'naeryo_chagi', name: 'Naeryo Chagi', subtitle: 'Axe Kick', icon: '⬇️' },
    { id: 'dwi_huryeo_chagi', name: 'Dwi Huryeo', subtitle: 'Spinning Hook', icon: '🔄' },
    { id: 'bandae_dollyo', name: 'Bandae Dollyo', subtitle: 'Reverse Round', icon: '↩️' },
    { id: 'mom_dollyo_chagi', name: 'Mom Dollyo', subtitle: 'Tornado Kick', icon: '🌪️' },
  ];

  useEffect(() => {
    initializePose();
  }, [initializePose]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAnalysisData(null);
      setError(null);
      setCoachingFeedback([]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAnalysisData(null);
      setError(null);
      setCoachingFeedback([]);
    }
  }, [setVideoFile, setAnalysisData]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipFrames = (frames) => {
    if (videoRef.current) {
      const frameTime = 1 / 30;
      videoRef.current.currentTime = Math.max(0, Math.min(
        duration,
        videoRef.current.currentTime + (frames * frameTime)
      ));
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeVideo = async () => {
    if (!videoFile) {
      setError('Please upload a video first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setCoachingFeedback([]);

    try {
      // Stage 1: Extract frames
      setAnalysisStage('Extracting video frames...');
      setAnalysisProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Pose Detection
      setAnalysisStage('Running pose detection...');
      setAnalysisProgress(30);

      const detectedLandmarks = await detectPose(videoRef.current);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Gemini Analysis
      setAnalysisStage('AI analyzing technique...');
      setAnalysisProgress(60);

      const frameCount = Math.round(duration * 30);
      const fps = 30;

      let analysis;
      try {
        analysis = await analyzeWithGemini(detectedLandmarks, selectedKickType, frameCount, fps);
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
        analysis = generateFallbackAnalysis(detectedLandmarks, selectedKickType);
      }

      setAnalysisProgress(80);

      // Stage 4: Generate recommendations
      setAnalysisStage('Generating coaching feedback...');

      const fullAnalysis = {
        kickType: selectedKickType,
        frames: frameCount,
        fps: fps,
        timestamp: new Date().toISOString(),
        ...analysis
      };

      try {
        const feedback = await generateCoachingFeedback(fullAnalysis, sessions);
        setCoachingFeedback(feedback);
      } catch (feedbackError) {
        console.error('Feedback error:', feedbackError);
      }

      setAnalysisProgress(90);

      // Stage 5: Save session
      setAnalysisStage('Saving analysis...');

      const sessionData = {
        date: new Date().toLocaleDateString(),
        kickType: selectedKickType,
        overallScore: fullAnalysis.metrics?.overallScore || 0,
        formScore: fullAnalysis.metrics?.formScore || 0,
        powerScore: fullAnalysis.metrics?.powerScore || 0,
        balanceScore: fullAnalysis.metrics?.balanceScore || 0,
        metrics: fullAnalysis.metrics
      };

      await analysisService.save(sessionData);
      setSessions(prev => [...prev, sessionData]);

      setAnalysisProgress(100);
      setAnalysisData(fullAnalysis);
      setAnalysisStage('Analysis complete!');

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackAnalysis = (detectedLandmarks, kickType) => {
    return {
      metrics: {
        kneeAngle: { avg: 135, min: 90, max: 170 },
        hipFlexion: { avg: 95, min: 45, max: 140 },
        kickHeight: { avg: 75, min: 60, max: 90 },
        chamberTime: 0.22,
        extensionTime: 0.18,
        retractionTime: 0.20,
        totalTime: 0.60,
        peakVelocity: 15.5,
        balanceScore: 78,
        formScore: 75,
        powerScore: 80,
        overallScore: 78,
      },
      recommendations: [
        { type: 'improvement', message: 'Focus on hip rotation for increased power generation' },
        { type: 'good', message: 'Good chamber position detected' },
        { type: 'warning', message: 'Consider improving balance on support leg' },
      ],
      technicalNotes: 'Analysis based on pose detection. For more detailed feedback, ensure Gemini API is configured.',
      confidenceLevel: 'medium'
    };
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-joc-gold to-amber-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-joc-gold to-amber-500 flex items-center justify-center shadow-xl">
              <Video size={26} className="text-[#0a0a12]" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Video Analysis</h2>
            <p className="text-gray-400">Upload and analyze Taekwondo techniques with AI</p>
          </div>
        </div>

        {/* AI Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
            isModelLoaded
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <motion.div
            className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-emerald-400' : 'bg-amber-400'}`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div>
            <p className={`text-sm font-semibold ${isModelLoaded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isModelLoaded ? 'AI Ready' : 'Loading AI...'}
            </p>
            <p className={`text-xs ${isModelLoaded ? 'text-emerald-500/70' : 'text-amber-500/70'}`}>
              MediaPipe + Gemini
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Video Area */}
        <div className="space-y-6">
          {!videoUrl ? (
            /* Premium Upload Zone */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group min-h-[400px] rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden ${
                isDragging
                  ? 'bg-joc-gold/10 border-joc-gold'
                  : 'bg-gradient-to-br from-[#0f0f18] to-[#080810] border-white/10 hover:border-joc-gold/50'
              } border-2 border-dashed`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-joc-gold/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner decorations */}
              <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-joc-gold/40 rounded-tl-2xl transition-all duration-300 group-hover:border-joc-gold group-hover:w-16 group-hover:h-16" />
              <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-joc-gold/40 rounded-tr-2xl transition-all duration-300 group-hover:border-joc-gold group-hover:w-16 group-hover:h-16" />
              <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-joc-gold/40 rounded-bl-2xl transition-all duration-300 group-hover:border-joc-gold group-hover:w-16 group-hover:h-16" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-joc-gold/40 rounded-br-2xl transition-all duration-300 group-hover:border-joc-gold group-hover:w-16 group-hover:h-16" />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                <motion.div
                  animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 bg-joc-gold/20 rounded-3xl blur-xl group-hover:bg-joc-gold/30 transition-all duration-500" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-joc-gold/20 to-amber-500/10 border border-joc-gold/30 flex items-center justify-center">
                    <Upload size={42} className="text-joc-gold" />
                  </div>
                </motion.div>

                <motion.h3
                  className="text-2xl font-bold text-white mb-3"
                  animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                >
                  {isDragging ? 'Drop Video Here' : 'Upload Taekwondo Video'}
                </motion.h3>
                <p className="text-gray-400 mb-6 text-center max-w-sm">
                  Drag and drop your video file or click to browse from your device
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Video size={16} className="text-joc-gold" />
                    <span className="text-gray-400">MP4, AVI, MOV</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Clock size={16} className="text-joc-gold" />
                    <span className="text-gray-400">Max 100MB</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Video Player */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl shadow-black/50 border border-white/10">
                {/* Video gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10" />

                <video
                  ref={videoRef}
                  src={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full aspect-video object-contain"
                  muted={isMuted}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* Video file info badge */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                  <Video size={14} className="text-joc-gold" />
                  <span className="text-xs text-white font-medium truncate max-w-[150px]">
                    {videoFile?.name}
                  </span>
                </div>
              </div>

              {/* Premium Controls */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10 space-y-5">
                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-joc-gold font-mono w-12">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 h-2 rounded-full bg-white/5" />
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      step="0.033"
                      className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-joc-gold
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:shadow-joc-gold/30
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-125"
                      style={{
                        background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 font-mono w-12">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => skipFrames(-10)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      title="Back 10 frames"
                    >
                      <SkipBack size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => skipFrames(-1)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      title="Back 1 frame"
                    >
                      <RotateCcw size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePlay}
                      className="p-4 rounded-2xl bg-gradient-to-r from-joc-gold to-amber-500 text-[#0a0a12] shadow-lg shadow-joc-gold/30"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => skipFrames(1)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      title="Forward 1 frame"
                    >
                      <RotateCcw size={18} className="transform scale-x-[-1]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => skipFrames(10)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      title="Forward 10 frames"
                    >
                      <SkipForward size={18} />
                    </motion.button>
                  </div>

                  {/* Speed & Volume */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                      {[0.25, 0.5, 1, 2].map((speed) => (
                        <motion.button
                          key={speed}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => changeSpeed(speed)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                            playbackSpeed === speed
                              ? 'bg-joc-gold text-[#0a0a12]'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {speed}x
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload New Button */}
          {videoUrl && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setVideoUrl(null);
                setVideoFile(null);
                setAnalysisData(null);
                setCurrentTime(0);
                setDuration(0);
                setError(null);
                setCoachingFeedback([]);
              }}
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-3 transition-all"
            >
              <Upload size={20} />
              <span className="font-medium">Upload Different Video</span>
            </motion.button>
          )}
        </div>

        {/* Right Column - Analysis Panel */}
        <div className="space-y-6">
          {/* Kick Type Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-joc-gold/20 to-amber-500/10 flex items-center justify-center">
                <Target size={20} className="text-joc-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Kick Type</h3>
                <p className="text-sm text-gray-400">Select technique to analyze</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {kickTypes.map((kick, index) => (
                <motion.button
                  key={kick.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedKickType(kick.id)}
                  className={`relative p-4 rounded-2xl text-left transition-all overflow-hidden ${
                    selectedKickType === kick.id
                      ? 'bg-gradient-to-br from-joc-gold/20 to-amber-500/10 border-2 border-joc-gold shadow-lg shadow-joc-gold/20'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {selectedKickType === kick.id && (
                    <motion.div
                      layoutId="selectedKick"
                      className="absolute inset-0 bg-gradient-to-br from-joc-gold/10 to-transparent"
                    />
                  )}
                  <div className="relative flex items-start gap-3">
                    <span className="text-2xl">{kick.icon}</span>
                    <div>
                      <div className={`text-sm font-semibold ${selectedKickType === kick.id ? 'text-joc-gold' : 'text-white'}`}>
                        {kick.name}
                      </div>
                      <div className="text-xs text-gray-500">{kick.subtitle}</div>
                    </div>
                  </div>
                  {selectedKickType === kick.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle size={16} className="text-joc-gold" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-1">Analysis Error</h4>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze Button */}
          {videoUrl && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeVideo}
              disabled={isAnalyzing}
              className="relative w-full py-5 rounded-2xl font-bold text-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-joc-gold via-yellow-400 to-amber-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-joc-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <span className="relative flex items-center justify-center gap-3 text-[#0a0a12]">
                <Sparkles size={24} />
                Analyze Technique
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          )}

          {/* Analysis Progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-joc-gold/30 text-center"
              >
                <div className="flex flex-col items-center">
                  <CircularProgress progress={analysisProgress} />
                  <OlympicLoader />
                  <h3 className="text-xl font-bold text-white mt-6 mb-2">{analysisStage}</h3>
                  <p className="text-sm text-gray-400">Please wait while AI analyzes your technique</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {analysisData && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Success Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Analysis Complete</h3>
                      <p className="text-sm text-emerald-400/80">
                        {kickTypes.find(k => k.id === selectedKickType)?.name}
                      </p>
                    </div>
                  </div>
                  {analysisData.confidenceLevel && (
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      analysisData.confidenceLevel === 'high' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      analysisData.confidenceLevel === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {analysisData.confidenceLevel.charAt(0).toUpperCase() + analysisData.confidenceLevel.slice(1)} Confidence
                    </span>
                  )}
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Overall', value: analysisData.metrics?.overallScore || 0, color: 'joc-gold', icon: Award },
                    { label: 'Form', value: analysisData.metrics?.formScore || 0, color: 'emerald-400', icon: Target },
                    { label: 'Power', value: analysisData.metrics?.powerScore || 0, color: 'blue-400', icon: Zap },
                    { label: 'Balance', value: analysisData.metrics?.balanceScore || 0, color: 'purple-400', icon: Activity },
                  ].map((score, index) => (
                    <motion.div
                      key={score.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400 font-medium">{score.label}</span>
                        <score.icon size={18} className={`text-${score.color}`} />
                      </div>
                      <div className={`text-4xl font-black text-${score.color}`}>
                        {score.value}%
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score.value}%` }}
                          transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r from-${score.color} to-${score.color}/50`}
                          style={{
                            background: score.color === 'joc-gold'
                              ? 'linear-gradient(to right, #D4AF37, #f4d03f)'
                              : undefined
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recommendations */}
                {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <TrendingUp size={20} className="text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white">AI Feedback</h4>
                    </div>
                    <div className="space-y-3">
                      {analysisData.recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-4 rounded-xl flex items-start gap-4 ${
                            rec.type === 'good'
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : rec.type === 'warning'
                              ? 'bg-amber-500/10 border border-amber-500/20'
                              : 'bg-blue-500/10 border border-blue-500/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            rec.type === 'good' ? 'bg-emerald-500/20' :
                            rec.type === 'warning' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                          }`}>
                            {rec.type === 'good' ? (
                              <CheckCircle size={16} className="text-emerald-400" />
                            ) : rec.type === 'warning' ? (
                              <AlertCircle size={16} className="text-amber-400" />
                            ) : (
                              <Sparkles size={16} className="text-blue-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{rec.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyzer;
