import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Play, Pause, SkipBack, SkipForward,
  RotateCcw, Download, Maximize2, Volume2, VolumeX,
  Loader, CheckCircle, AlertCircle
} from 'lucide-react';
import { usePoseDetection } from '../hooks/usePoseDetection';

const VideoAnalyzer = ({
  videoFile,
  setVideoFile,
  analysisData,
  setAnalysisData,
  isAnalyzing,
  setIsAnalyzing
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

  const { detectPose, isModelLoaded } = usePoseDetection();

  const kickTypes = [
    { id: 'dollyo_chagi', name: 'Dollyo Chagi (Roundhouse)' },
    { id: 'yeop_chagi', name: 'Yeop Chagi (Side Kick)' },
    { id: 'ap_chagi', name: 'Ap Chagi (Front Kick)' },
    { id: 'dwi_chagi', name: 'Dwi Chagi (Back Kick)' },
    { id: 'naeryo_chagi', name: 'Naeryo Chagi (Axe Kick)' },
    { id: 'dwi_huryeo_chagi', name: 'Dwi Huryeo Chagi (Spinning Hook)' },
    { id: 'bandae_dollyo', name: 'Bandae Dollyo (Reverse Roundhouse)' },
    { id: 'mom_dollyo_chagi', name: 'Mom Dollyo Chagi (Tornado)' },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAnalysisData(null);
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
    if (!videoFile || !isModelLoaded) return;

    setIsAnalyzing(true);

    // Simulate analysis with demo data
    // In production, this would call the backend API
    setTimeout(() => {
      const demoAnalysis = {
        kickType: selectedKickType,
        frames: 120,
        fps: 30,
        metrics: {
          kneeAngle: { avg: 142, min: 98, max: 175 },
          hipFlexion: { avg: 95, min: 45, max: 140 },
          kickHeight: { avg: 78, min: 65, max: 92 },
          chamberTime: 0.23,
          extensionTime: 0.18,
          retractionTime: 0.21,
          totalTime: 0.62,
          peakVelocity: 18.5,
          balanceScore: 85,
          formScore: 82,
          powerScore: 88,
          overallScore: 85,
        },
        landmarks: [],
        recommendations: [
          { type: 'improvement', message: 'Increase hip rotation for more power' },
          { type: 'good', message: 'Excellent knee chamber angle' },
          { type: 'warning', message: 'Support leg slightly bent - maintain straight for stability' },
        ],
        injuryRisk: {
          overall: 'low',
          aclRisk: 15,
          kneeValgus: false,
          fatigue: 22,
        }
      };

      setAnalysisData(demoAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Upload / Display Area */}
        <div className="space-y-4">
          {!videoUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="file-upload min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload size={48} className="text-joc-gold mb-4" />
              <p className="text-lg font-medium text-white mb-2">
                Upload Taekwondo Video
              </p>
              <p className="text-sm text-gray-400">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports MP4, AVI, MOV (max 100MB)
              </p>
            </div>
          ) : (
            <div className="video-container">
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full rounded-lg"
                muted={isMuted}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          )}

          {/* Video Controls */}
          {videoUrl && (
            <div className="glass-card p-4 space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-12">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  step="0.033"
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-joc-gold"
                />
                <span className="text-sm text-gray-400 w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => skipFrames(-10)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Back 10 frames"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => skipFrames(-1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Back 1 frame"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full btn-gold"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={() => skipFrames(1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Forward 1 frame"
                >
                  <RotateCcw size={20} className="transform scale-x-[-1]" />
                </button>
                <button
                  onClick={() => skipFrames(10)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Forward 10 frames"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              {/* Speed and Volume */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Speed:</span>
                  {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`px-2 py-1 text-xs rounded ${
                        playbackSpeed === speed
                          ? 'bg-joc-gold text-joc-dark'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          {/* Kick Type Selection */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-joc-gold mb-4">
              Select Kick Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {kickTypes.map((kick) => (
                <button
                  key={kick.id}
                  onClick={() => setSelectedKickType(kick.id)}
                  className={`p-3 text-sm rounded-lg text-left transition-all ${
                    selectedKickType === kick.id
                      ? 'bg-joc-gold/20 border border-joc-gold text-joc-gold'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {kick.name}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          {videoUrl && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeVideo}
              disabled={isAnalyzing || !isModelLoaded}
              className="w-full btn-gold py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play size={24} />
                  Analyze Technique
                </>
              )}
            </motion.button>
          )}

          {/* Quick Results */}
          {analysisData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 space-y-4"
            >
              <h3 className="text-lg font-semibold text-joc-gold flex items-center gap-2">
                <CheckCircle size={20} />
                Analysis Complete
              </h3>

              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="metric-card">
                  <div className="text-3xl font-bold text-joc-gold">
                    {analysisData.metrics.overallScore}%
                  </div>
                  <div className="text-sm text-gray-400">Overall Score</div>
                </div>
                <div className="metric-card">
                  <div className="text-3xl font-bold text-green-400">
                    {analysisData.metrics.formScore}%
                  </div>
                  <div className="text-sm text-gray-400">Form Score</div>
                </div>
                <div className="metric-card">
                  <div className="text-3xl font-bold text-blue-400">
                    {analysisData.metrics.powerScore}%
                  </div>
                  <div className="text-sm text-gray-400">Power Score</div>
                </div>
                <div className="metric-card">
                  <div className="text-3xl font-bold text-purple-400">
                    {analysisData.metrics.balanceScore}%
                  </div>
                  <div className="text-sm text-gray-400">Balance Score</div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium text-white">Feedback</h4>
                {analysisData.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      rec.type === 'good'
                        ? 'bg-green-500/10 border border-green-500/30'
                        : rec.type === 'warning'
                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                        : 'bg-blue-500/10 border border-blue-500/30'
                    }`}
                  >
                    {rec.type === 'good' ? (
                      <CheckCircle size={18} className="text-green-400 mt-0.5" />
                    ) : rec.type === 'warning' ? (
                      <AlertCircle size={18} className="text-yellow-400 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="text-blue-400 mt-0.5" />
                    )}
                    <span className="text-sm">{rec.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload New Video Button */}
      {videoUrl && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setVideoUrl(null);
              setVideoFile(null);
              setAnalysisData(null);
              setCurrentTime(0);
              setDuration(0);
            }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload size={20} />
            Upload New Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;
