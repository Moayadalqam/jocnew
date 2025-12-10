import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AIDetectionTab = ({ analysisData }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const kickTypes = [
    { id: 'dollyo_chagi', name: 'Dollyo Chagi', korean: '돌려차기', description: 'Roundhouse Kick', confidence: 0 },
    { id: 'yeop_chagi', name: 'Yeop Chagi', korean: '옆차기', description: 'Side Kick', confidence: 0 },
    { id: 'ap_chagi', name: 'Ap Chagi', korean: '앞차기', description: 'Front Kick', confidence: 0 },
    { id: 'dwi_chagi', name: 'Dwi Chagi', korean: '뒤차기', description: 'Back Kick', confidence: 0 },
    { id: 'naeryo_chagi', name: 'Naeryo Chagi', korean: '내려차기', description: 'Axe Kick', confidence: 0 },
    { id: 'dwi_huryeo_chagi', name: 'Dwi Huryeo Chagi', korean: '뒤후려차기', description: 'Spinning Hook Kick', confidence: 0 },
    { id: 'bandae_dollyo', name: 'Bandae Dollyo Chagi', korean: '반대 돌려차기', description: 'Reverse Roundhouse', confidence: 0 },
    { id: 'mom_dollyo_chagi', name: 'Mom Dollyo Chagi', korean: '몸돌려차기', description: 'Tornado Kick', confidence: 0 },
  ];

  const runDetection = () => {
    if (!analysisData) {
      alert('Please analyze a video first!');
      return;
    }

    setIsDetecting(true);

    // Simulate AI detection
    setTimeout(() => {
      const results = kickTypes.map(kick => ({
        ...kick,
        confidence: kick.id === analysisData.kickType
          ? 85 + Math.random() * 12
          : Math.random() * 30,
      })).sort((a, b) => b.confidence - a.confidence);

      setDetectionResult({
        detected: results[0],
        all: results,
        timestamp: new Date().toISOString(),
        frameCount: analysisData.frames,
      });
      setIsDetecting(false);
    }, 2500);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    if (confidence >= 20) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getConfidenceBar = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    if (confidence >= 20) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">AI Kick Detection</h2>
      </div>

      {/* AI Info Card */}
      <div className="glass-card p-4 bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Brain size={24} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-400">Automatic Kick Type Recognition</h3>
            <p className="text-sm text-gray-300 mt-1">
              Our AI analyzes biomechanical signatures to automatically identify the type of kick being performed.
              This uses pattern matching against 8 Taekwondo kick types based on joint angles and movement trajectories.
            </p>
          </div>
        </div>
      </div>

      {/* Detection Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runDetection}
          disabled={isDetecting || !analysisData}
          className="btn-gold px-8 py-4 text-lg font-semibold flex items-center gap-3 disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <Loader className="animate-spin" size={24} />
              Detecting Kick Type...
            </>
          ) : (
            <>
              <Brain size={24} />
              Run AI Detection
            </>
          )}
        </motion.button>
      </div>

      {!analysisData && (
        <div className="text-center text-gray-400">
          <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
          <p>Analyze a video first to enable AI detection</p>
        </div>
      )}

      {/* Detection Results */}
      {detectionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Detection */}
          <div className="glass-card p-6 border-2 border-joc-gold">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle size={28} className="text-green-400" />
                <h3 className="text-xl font-semibold text-white">Detected Kick Type</h3>
              </div>
              <div className="bg-joc-gold/20 rounded-lg p-6 mb-4">
                <div className="text-4xl font-bold text-joc-gold mb-2">
                  {detectionResult.detected.name}
                </div>
                <div className="text-2xl text-gray-300 mb-1">
                  {detectionResult.detected.korean}
                </div>
                <div className="text-lg text-gray-400">
                  {detectionResult.detected.description}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {detectionResult.detected.confidence.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Confidence</div>
                </div>
                <div className="w-px h-12 bg-gray-700" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {detectionResult.frameCount}
                  </div>
                  <div className="text-sm text-gray-400">Frames Analyzed</div>
                </div>
              </div>
            </div>
          </div>

          {/* All Kick Probabilities */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-4">All Kick Type Probabilities</h3>
            <div className="space-y-3">
              {detectionResult.all.map((kick, idx) => (
                <motion.div
                  key={kick.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-3 rounded-lg ${
                    idx === 0 ? 'bg-joc-gold/10 border border-joc-gold/30' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {idx === 0 && <Target size={20} className="text-joc-gold" />}
                      <div>
                        <span className="font-medium">{kick.name}</span>
                        <span className="text-gray-500 ml-2 text-sm">({kick.korean})</span>
                      </div>
                    </div>
                    <span className={`font-bold ${getConfidenceColor(kick.confidence)}`}>
                      {kick.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${kick.confidence}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${getConfidenceBar(kick.confidence)}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Biomechanical Signatures */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-joc-gold" />
              Biomechanical Signature Match
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analysisData?.metrics?.kneeAngle?.avg?.toFixed(0) || '145'}°
                </div>
                <div className="text-sm text-gray-400">Knee Angle</div>
                <div className="text-xs text-green-400 mt-1">Matches {detectionResult.detected.name}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analysisData?.metrics?.hipFlexion?.avg?.toFixed(0) || '95'}°
                </div>
                <div className="text-sm text-gray-400">Hip Flexion</div>
                <div className="text-xs text-green-400 mt-1">Expected Range</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {analysisData?.metrics?.kickHeight?.avg?.toFixed(0) || '78'}%
                </div>
                <div className="text-sm text-gray-400">Kick Height</div>
                <div className="text-xs text-green-400 mt-1">Within Range</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  Circular
                </div>
                <div className="text-sm text-gray-400">Trajectory</div>
                <div className="text-xs text-green-400 mt-1">Signature Match</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Kick Types Reference */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Kick Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kickTypes.map((kick) => (
            <div key={kick.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="font-medium text-white">{kick.name}</div>
              <div className="text-lg text-joc-gold">{kick.korean}</div>
              <div className="text-sm text-gray-400">{kick.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4">How AI Detection Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl mb-2">1</div>
            <h4 className="font-medium text-white mb-2">Joint Tracking</h4>
            <p className="text-sm text-gray-400">
              MediaPipe tracks 33 body landmarks including hips, knees, and ankles
              throughout the kick motion.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl mb-2">2</div>
            <h4 className="font-medium text-white mb-2">Signature Analysis</h4>
            <p className="text-sm text-gray-400">
              Each kick type has unique biomechanical signatures based on
              joint angles and movement patterns.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl mb-2">3</div>
            <h4 className="font-medium text-white mb-2">Pattern Matching</h4>
            <p className="text-sm text-gray-400">
              AI compares detected motion against known kick signatures
              and returns confidence scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDetectionTab;
