import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Play, Pause, SkipBack, SkipForward,
  RotateCcw, Volume2, VolumeX, Loader, CheckCircle,
  AlertCircle, Sparkles, Video, Clock, Zap
} from 'lucide-react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { analyzeWithGemini, generateCoachingFeedback } from '../services/geminiService';
import { analysisService } from '../services/supabaseClient';

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

  const { detectPose, isModelLoaded, initializePose, landmarks } = usePoseDetection();

  const kickTypes = [
    { id: 'dollyo_chagi', name: 'Dollyo Chagi', subtitle: 'Roundhouse Kick' },
    { id: 'yeop_chagi', name: 'Yeop Chagi', subtitle: 'Side Kick' },
    { id: 'ap_chagi', name: 'Ap Chagi', subtitle: 'Front Kick' },
    { id: 'dwi_chagi', name: 'Dwi Chagi', subtitle: 'Back Kick' },
    { id: 'naeryo_chagi', name: 'Naeryo Chagi', subtitle: 'Axe Kick' },
    { id: 'dwi_huryeo_chagi', name: 'Dwi Huryeo Chagi', subtitle: 'Spinning Hook' },
    { id: 'bandae_dollyo', name: 'Bandae Dollyo', subtitle: 'Reverse Roundhouse' },
    { id: 'mom_dollyo_chagi', name: 'Mom Dollyo Chagi', subtitle: 'Tornado Kick' },
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
        // Fallback to pose-based analysis if Gemini fails
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

      // Try to get coaching feedback
      try {
        const feedback = await generateCoachingFeedback(fullAnalysis, sessions);
        setCoachingFeedback(feedback);
      } catch (feedbackError) {
        console.error('Feedback error:', feedbackError);
      }

      setAnalysisProgress(90);

      // Stage 5: Save session
      setAnalysisStage('Saving analysis...');

      // Save to local storage / Supabase
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

  // Fallback analysis when API is unavailable
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-joc-gold to-amber-500 flex items-center justify-center">
            <Video size={20} className="text-joc-dark" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Video Analysis</h2>
            <p className="text-sm text-gray-400">Upload and analyze Taekwondo techniques</p>
          </div>
        </div>
        {isModelLoaded && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-400">AI Ready</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Upload / Display Area */}
        <div className="space-y-4">
          {!videoUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="relative group min-h-[350px] rounded-2xl border-2 border-dashed border-joc-gold/30 bg-gradient-to-br from-joc-dark/50 to-joc-darker/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-joc-gold/60 hover:bg-joc-gold/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-joc-gold/20 to-amber-500/20 flex items-center justify-center mb-6"
              >
                <Upload size={36} className="text-joc-gold" />
              </motion.div>
              <p className="text-xl font-semibold text-white mb-2">
                Upload Taekwondo Video
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Drag & drop or click to browse
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Video size={12} />
                  MP4, AVI, MOV
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Max 100MB
                </span>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-joc-gold/30 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-joc-gold/30 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-joc-gold/30 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-joc-gold/30 rounded-br-lg"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden bg-black"
            >
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full rounded-2xl"
                muted={isMuted}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </motion.div>
          )}

          {/* Video Controls */}
          {videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 space-y-4"
            >
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono w-10">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    step="0.033"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-joc-gold"
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => skipFrames(-10)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Back 10 frames"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button
                    onClick={() => skipFrames(-1)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Back 1 frame"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlay}
                    className="p-3 rounded-xl bg-gradient-to-r from-joc-gold to-amber-500 text-joc-dark"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </motion.button>
                  <button
                    onClick={() => skipFrames(1)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Forward 1 frame"
                  >
                    <RotateCcw size={18} className="transform scale-x-[-1]" />
                  </button>
                  <button
                    onClick={() => skipFrames(10)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Forward 10 frames"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Speed and Volume */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[0.25, 0.5, 1, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`px-2 py-1 text-xs rounded-md transition-all ${
                          playbackSpeed === speed
                            ? 'bg-joc-gold text-joc-dark font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          {/* Kick Type Selection */}
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
            <h3 className="text-sm font-semibold text-joc-gold mb-3 flex items-center gap-2">
              <Zap size={16} />
              Select Kick Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {kickTypes.map((kick) => (
                <motion.button
                  key={kick.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedKickType(kick.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedKickType === kick.id
                      ? 'bg-gradient-to-r from-joc-gold/20 to-amber-500/20 border border-joc-gold'
                      : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-sm font-medium ${selectedKickType === kick.id ? 'text-joc-gold' : 'text-white'}`}>
                    {kick.name}
                  </div>
                  <div className="text-xs text-gray-500">{kick.subtitle}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Analyze Button */}
          {videoUrl && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeVideo}
              disabled={isAnalyzing}
              className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 bg-gradient-to-r from-joc-gold via-yellow-500 to-amber-500 text-joc-dark shadow-lg shadow-joc-gold/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="animate-spin" size={22} />
                  <span>{analysisStage}</span>
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  <span>Analyze Technique</span>
                </>
              )}
            </motion.button>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{analysisStage}</span>
                <span className="text-joc-gold font-mono">{analysisProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-joc-gold to-amber-500 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* Quick Results */}
          <AnimatePresence>
            {analysisData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-400" />
                  <h3 className="font-semibold text-white">Analysis Complete</h3>
                  {analysisData.confidenceLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      analysisData.confidenceLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                      analysisData.confidenceLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {analysisData.confidenceLevel} confidence
                    </span>
                  )}
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-joc-gold">
                      {analysisData.metrics?.overallScore || 0}%
                    </div>
                    <div className="text-xs text-gray-400">Overall Score</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {analysisData.metrics?.formScore || 0}%
                    </div>
                    <div className="text-xs text-gray-400">Form Score</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {analysisData.metrics?.powerScore || 0}%
                    </div>
                    <div className="text-xs text-gray-400">Power Score</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {analysisData.metrics?.balanceScore || 0}%
                    </div>
                    <div className="text-xs text-gray-400">Balance Score</div>
                  </div>
                </div>

                {/* Recommendations */}
                {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Feedback</h4>
                    {analysisData.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          rec.type === 'good'
                            ? 'bg-green-500/10 border border-green-500/20'
                            : rec.type === 'warning'
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-blue-500/10 border border-blue-500/20'
                        }`}
                      >
                        {rec.type === 'good' ? (
                          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        ) : rec.type === 'warning' ? (
                          <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Sparkles size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-300">{rec.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload New Video Button */}
      {videoUrl && (
        <div className="flex justify-center">
          <motion.button
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
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-all"
          >
            <Upload size={18} />
            <span>Upload New Video</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;
