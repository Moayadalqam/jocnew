import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Target, Zap, TrendingUp, Upload, ArrowRight,
  BarChart3, GitCompare, ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';

const BiomechanicsCompareTab = ({ analysisData, videoFile, comparisonVideo, setComparisonVideo }) => {
  const [activeView, setActiveView] = useState('biomechanics');
  const [comparisonData, setComparisonData] = useState(null);
  const fileInputRef = useRef(null);

  // No data state
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-joc-gold/20 to-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Activity size={40} className="text-joc-gold/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Analysis Data</h3>
          <p className="text-gray-400 max-w-md">
            Upload and analyze a video in the Video Analysis tab to see biomechanical metrics and comparisons.
          </p>
        </motion.div>
      </div>
    );
  }

  const { metrics } = analysisData;

  // Generate time series data based on actual metrics
  const generateTimeSeriesData = () => {
    if (!metrics) return [];
    const frames = 30;
    return Array(frames).fill(null).map((_, i) => {
      const progress = i / frames;
      // Simulate kick phases: chamber (0-0.3), extension (0.3-0.6), retraction (0.6-1.0)
      let kneeAngle, velocity;
      if (progress < 0.3) {
        // Chamber phase - knee flexes
        kneeAngle = metrics.kneeAngle?.max - (metrics.kneeAngle?.max - metrics.kneeAngle?.min) * (progress / 0.3);
        velocity = metrics.peakVelocity * (progress / 0.3) * 0.5;
      } else if (progress < 0.6) {
        // Extension phase - knee extends, peak velocity
        const extProgress = (progress - 0.3) / 0.3;
        kneeAngle = metrics.kneeAngle?.min + (metrics.kneeAngle?.max - metrics.kneeAngle?.min) * extProgress;
        velocity = metrics.peakVelocity * (0.5 + extProgress * 0.5);
      } else {
        // Retraction phase
        const retProgress = (progress - 0.6) / 0.4;
        kneeAngle = metrics.kneeAngle?.max - (metrics.kneeAngle?.max - metrics.kneeAngle?.avg) * retProgress;
        velocity = metrics.peakVelocity * (1 - retProgress * 0.8);
      }

      return {
        frame: i + 1,
        time: ((i / frames) * (metrics.totalTime || 0.6) * 1000).toFixed(0),
        kneeAngle: Math.round(kneeAngle || 135),
        hipFlexion: Math.round(metrics.hipFlexion?.avg + (Math.sin(progress * Math.PI) * 20) || 95),
        kickHeight: Math.round(metrics.kickHeight?.min + (metrics.kickHeight?.max - metrics.kickHeight?.min) * Math.sin(progress * Math.PI) || 75),
        velocity: Math.round(velocity * 10) / 10 || 10,
      };
    });
  };

  const timeSeriesData = generateTimeSeriesData();

  const radarData = metrics ? [
    { metric: 'Form', value: metrics.formScore || 0, fullMark: 100 },
    { metric: 'Power', value: metrics.powerScore || 0, fullMark: 100 },
    { metric: 'Balance', value: metrics.balanceScore || 0, fullMark: 100 },
    { metric: 'Speed', value: Math.round((metrics.peakVelocity || 0) / 25 * 100), fullMark: 100 },
    { metric: 'Height', value: metrics.kickHeight?.avg || 0, fullMark: 100 },
    { metric: 'Timing', value: Math.round((1 - (metrics.totalTime || 0.6) / 1.0) * 100), fullMark: 100 },
  ] : [];

  const phaseData = metrics ? [
    { name: 'Chamber', time: (metrics.chamberTime || 0.2) * 1000, percentage: ((metrics.chamberTime || 0.2) / (metrics.totalTime || 0.6)) * 100 },
    { name: 'Extension', time: (metrics.extensionTime || 0.18) * 1000, percentage: ((metrics.extensionTime || 0.18) / (metrics.totalTime || 0.6)) * 100 },
    { name: 'Retraction', time: (metrics.retractionTime || 0.2) * 1000, percentage: ((metrics.retractionTime || 0.2) / (metrics.totalTime || 0.6)) * 100 },
  ] : [];

  const handleComparisonUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComparisonVideo(file);
      // In a real app, this would trigger analysis of the second video
      // For now, we'll set placeholder comparison data
      setComparisonData({
        metrics: {
          ...metrics,
          overallScore: Math.max(0, (metrics?.overallScore || 80) - 5 + Math.random() * 10),
          formScore: Math.max(0, (metrics?.formScore || 75) - 5 + Math.random() * 10),
          powerScore: Math.max(0, (metrics?.powerScore || 80) - 5 + Math.random() * 10),
          balanceScore: Math.max(0, (metrics?.balanceScore || 78) - 5 + Math.random() * 10),
        }
      });
    }
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, subtext, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>
        {value}<span className="text-lg ml-1 opacity-70">{unit}</span>
      </div>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {trend > 0 ? <ChevronUp size={14} /> : trend < 0 ? <ChevronDown size={14} /> : <Minus size={14} />}
          {Math.abs(trend)}% vs previous
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Biomechanics & Compare</h2>
            <p className="text-sm text-gray-400">Detailed metrics and video comparison</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveView('biomechanics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'biomechanics'
                ? 'bg-joc-gold text-joc-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={16} />
              Biomechanics
            </span>
          </button>
          <button
            onClick={() => setActiveView('compare')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'compare'
                ? 'bg-joc-gold text-joc-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <GitCompare size={16} />
              Compare
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'biomechanics' ? (
          <motion.div
            key="biomechanics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Knee Angle"
                value={Math.round(metrics?.kneeAngle?.avg || 0)}
                unit="°"
                icon={Target}
                color="text-blue-400"
                subtext={`Range: ${Math.round(metrics?.kneeAngle?.min || 0)}° - ${Math.round(metrics?.kneeAngle?.max || 0)}°`}
              />
              <MetricCard
                title="Hip Flexion"
                value={Math.round(metrics?.hipFlexion?.avg || 0)}
                unit="°"
                icon={Activity}
                color="text-green-400"
                subtext={`Range: ${Math.round(metrics?.hipFlexion?.min || 0)}° - ${Math.round(metrics?.hipFlexion?.max || 0)}°`}
              />
              <MetricCard
                title="Kick Height"
                value={Math.round(metrics?.kickHeight?.avg || 0)}
                unit="%"
                icon={TrendingUp}
                color="text-purple-400"
                subtext="Relative to hip height"
              />
              <MetricCard
                title="Peak Velocity"
                value={(metrics?.peakVelocity || 0).toFixed(1)}
                unit="m/s"
                icon={Zap}
                color="text-amber-400"
                subtext="Maximum foot speed"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Knee Angle Over Time */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Joint Angles Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="kneeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hipGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" label={{ value: 'ms', position: 'right', fill: '#666' }} />
                    <YAxis stroke="#666" domain={[60, 180]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #D4AF37',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="kneeAngle" stroke="#3B82F6" fill="url(#kneeGradient)" name="Knee (°)" />
                    <Area type="monotone" dataKey="hipFlexion" stroke="#10B981" fill="url(#hipGradient)" name="Hip (°)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Radar */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Profile</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="metric" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" tick={{ fill: '#666' }} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#D4AF37"
                      fill="#D4AF37"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Kick Phase Timing */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Kick Phase Timing</h3>
              <div className="grid grid-cols-3 gap-6">
                {phaseData.map((phase, idx) => (
                  <div key={phase.name} className="text-center">
                    <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.2 }}
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                    <div className={`text-2xl font-bold ${
                      idx === 0 ? 'text-blue-400' : idx === 1 ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {phase.time.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-400">{phase.name}</div>
                    <div className="text-xs text-gray-500">{phase.percentage.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center p-4 rounded-xl bg-joc-gold/10 border border-joc-gold/30">
                <div className="text-3xl font-bold text-joc-gold">
                  {((metrics?.totalTime || 0.6) * 1000).toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-400">Total Kick Duration</div>
              </div>
            </div>

            {/* Velocity Profile */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Velocity Profile</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 20]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #D4AF37',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={false}
                    name="Velocity (m/s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Video Comparison Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video 1 - Current */}
              <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">1</div>
                  Current Analysis
                </h3>
                <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Activity size={48} className="mx-auto mb-3 text-blue-400/50" />
                    <p className="text-blue-400">{analysisData.kickType?.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500">Score: {metrics?.overallScore || 0}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">Form:</span>
                    <span className="float-right text-blue-400 font-semibold">{metrics?.formScore || 0}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400">Power:</span>
                    <span className="float-right text-blue-400 font-semibold">{metrics?.powerScore || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Video 2 - Comparison */}
              <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">2</div>
                  Compare With
                </h3>
                {comparisonData ? (
                  <>
                    <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Activity size={48} className="mx-auto mb-3 text-green-400/50" />
                        <p className="text-green-400">Comparison Video</p>
                        <p className="text-sm text-gray-500">Score: {comparisonData.metrics?.overallScore?.toFixed(0) || 0}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-gray-400">Form:</span>
                        <span className="float-right text-green-400 font-semibold">{comparisonData.metrics?.formScore?.toFixed(0) || 0}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-gray-400">Power:</span>
                        <span className="float-right text-green-400 font-semibold">{comparisonData.metrics?.powerScore?.toFixed(0) || 0}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <label className="aspect-video bg-black/30 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleComparisonUpload}
                      className="hidden"
                    />
                    <Upload size={48} className="mb-3 text-green-400/50" />
                    <p className="text-green-400">Upload Comparison Video</p>
                    <p className="text-xs text-gray-500 mt-1">Click or drag to upload</p>
                  </label>
                )}
              </div>
            </div>

            {/* Comparison Results */}
            {comparisonData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Comparison Bar Chart */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Score Comparison</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Form', video1: metrics?.formScore || 0, video2: comparisonData.metrics?.formScore || 0 },
                      { name: 'Power', video1: metrics?.powerScore || 0, video2: comparisonData.metrics?.powerScore || 0 },
                      { name: 'Balance', video1: metrics?.balanceScore || 0, video2: comparisonData.metrics?.balanceScore || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #D4AF37',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="video1" name="Video 1" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="video2" name="Video 2" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Overlay */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Performance Overlay</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { metric: 'Form', video1: metrics?.formScore || 0, video2: comparisonData.metrics?.formScore || 0 },
                      { metric: 'Power', video1: metrics?.powerScore || 0, video2: comparisonData.metrics?.powerScore || 0 },
                      { metric: 'Balance', video1: metrics?.balanceScore || 0, video2: comparisonData.metrics?.balanceScore || 0 },
                      { metric: 'Overall', video1: metrics?.overallScore || 0, video2: comparisonData.metrics?.overallScore || 0 },
                    ]}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="metric" stroke="#666" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                      <Radar name="Video 1" dataKey="video1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Video 2" dataKey="video2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Clear Comparison */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setComparisonVideo(null);
                      setComparisonData(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    Clear Comparison
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiomechanicsCompareTab;
