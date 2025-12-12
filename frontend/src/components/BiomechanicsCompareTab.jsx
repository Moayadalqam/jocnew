import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Target, Zap, TrendingUp, Upload,
  BarChart3, GitCompare, ChevronUp, ChevronDown, Minus,
  Download, Info, ArrowRight, Layers
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

  // No data state - Premium empty state
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[550px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10 flex items-center justify-center">
              <Activity size={50} className="text-blue-400/50" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-3">No Analysis Data Yet</h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Upload and analyze a video in the Video Analysis tab to unlock detailed biomechanical metrics and video comparison tools.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-joc-gold">
            <Info size={16} />
            <span>Go to Video Analysis tab to get started</span>
            <ArrowRight size={16} />
          </div>
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
      let kneeAngle, velocity;
      if (progress < 0.3) {
        kneeAngle = metrics.kneeAngle?.max - (metrics.kneeAngle?.max - metrics.kneeAngle?.min) * (progress / 0.3);
        velocity = metrics.peakVelocity * (progress / 0.3) * 0.5;
      } else if (progress < 0.6) {
        const extProgress = (progress - 0.3) / 0.3;
        kneeAngle = metrics.kneeAngle?.min + (metrics.kneeAngle?.max - metrics.kneeAngle?.min) * extProgress;
        velocity = metrics.peakVelocity * (0.5 + extProgress * 0.5);
      } else {
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
    { name: 'Chamber', time: (metrics.chamberTime || 0.2) * 1000, percentage: ((metrics.chamberTime || 0.2) / (metrics.totalTime || 0.6)) * 100, color: 'blue' },
    { name: 'Extension', time: (metrics.extensionTime || 0.18) * 1000, percentage: ((metrics.extensionTime || 0.18) / (metrics.totalTime || 0.6)) * 100, color: 'emerald' },
    { name: 'Retraction', time: (metrics.retractionTime || 0.2) * 1000, percentage: ((metrics.retractionTime || 0.2) / (metrics.totalTime || 0.6)) * 100, color: 'amber' },
  ] : [];

  const handleComparisonUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComparisonVideo(file);
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

  // Premium Metric Card Component
  const MetricCard = ({ title, value, unit, icon: Icon, color, subtext, trend, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all overflow-hidden group"
    >
      {/* Background glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color === 'blue' ? 'from-blue-500/10' : color === 'green' ? 'from-emerald-500/10' : color === 'purple' ? 'from-purple-500/10' : 'from-amber-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm text-gray-400 font-medium">{title}</span>
          <div className={`p-2.5 rounded-xl ${color === 'blue' ? 'bg-blue-500/10' : color === 'green' ? 'bg-emerald-500/10' : color === 'purple' ? 'bg-purple-500/10' : 'bg-amber-500/10'}`}>
            <Icon size={18} className={color === 'blue' ? 'text-blue-400' : color === 'green' ? 'text-emerald-400' : color === 'purple' ? 'text-purple-400' : 'text-amber-400'} />
          </div>
        </div>
        <div className={`text-4xl font-black mb-2 ${color === 'blue' ? 'text-blue-400' : color === 'green' ? 'text-emerald-400' : color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>
          {value}<span className="text-xl ml-1 opacity-70">{unit}</span>
        </div>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trend > 0 ? <ChevronUp size={14} /> : trend < 0 ? <ChevronDown size={14} /> : <Minus size={14} />}
            {Math.abs(trend)}% vs previous
          </div>
        )}
      </div>
    </motion.div>
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f18] border border-joc-gold/30 rounded-xl p-4 shadow-2xl shadow-black/50">
          <p className="text-sm text-gray-400 mb-2">{label}ms</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Angle') || entry.name.includes('Hip') ? '°' : entry.name.includes('Velocity') ? ' m/s' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
              <Activity size={26} className="text-white" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Biomechanics & Compare</h2>
            <p className="text-gray-400">Detailed metrics and video comparison tools</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5">
          {[
            { id: 'biomechanics', label: 'Biomechanics', icon: BarChart3 },
            { id: 'compare', label: 'Compare', icon: GitCompare },
          ].map((view) => (
            <motion.button
              key={view.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-joc-gold to-amber-500 text-[#0a0a12] shadow-lg shadow-joc-gold/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <view.icon size={18} />
              {view.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeView === 'biomechanics' ? (
          <motion.div
            key="biomechanics"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Knee Angle"
                value={Math.round(metrics?.kneeAngle?.avg || 0)}
                unit="°"
                icon={Target}
                color="blue"
                subtext={`Range: ${Math.round(metrics?.kneeAngle?.min || 0)}° - ${Math.round(metrics?.kneeAngle?.max || 0)}°`}
                delay={0}
              />
              <MetricCard
                title="Hip Flexion"
                value={Math.round(metrics?.hipFlexion?.avg || 0)}
                unit="°"
                icon={Activity}
                color="green"
                subtext={`Range: ${Math.round(metrics?.hipFlexion?.min || 0)}° - ${Math.round(metrics?.hipFlexion?.max || 0)}°`}
                delay={0.1}
              />
              <MetricCard
                title="Kick Height"
                value={Math.round(metrics?.kickHeight?.avg || 0)}
                unit="%"
                icon={TrendingUp}
                color="purple"
                subtext="Relative to hip height"
                delay={0.2}
              />
              <MetricCard
                title="Peak Velocity"
                value={(metrics?.peakVelocity || 0).toFixed(1)}
                unit="m/s"
                icon={Zap}
                color="amber"
                subtext="Maximum foot speed"
                delay={0.3}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Joint Angles Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Joint Angles</h3>
                    <p className="text-sm text-gray-500">Over kick duration</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="kneeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="hipGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" domain={[60, 180]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="kneeAngle" stroke="#3B82F6" strokeWidth={2} fill="url(#kneeGradient)" name="Knee Angle" />
                    <Area type="monotone" dataKey="hipFlexion" stroke="#10B981" strokeWidth={2} fill="url(#hipGradient)" name="Hip Flexion" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Performance Radar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-joc-gold/10 flex items-center justify-center">
                    <Layers size={20} className="text-joc-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Performance Profile</h3>
                    <p className="text-sm text-gray-500">Multi-dimensional analysis</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#D4AF37"
                      fill="#D4AF37"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Kick Phase Timing - Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Zap size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kick Phase Timing</h3>
                  <p className="text-sm text-gray-500">Breakdown of kick execution phases</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8">
                {phaseData.map((phase, idx) => (
                  <motion.div
                    key={phase.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${phase.percentage}%` }}
                          transition={{ duration: 1, delay: 0.6 + idx * 0.2, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            phase.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                            phase.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                            'bg-gradient-to-r from-amber-500 to-amber-400'
                          }`}
                        />
                      </div>
                    </div>
                    <div className={`text-3xl font-black ${
                      phase.color === 'blue' ? 'text-blue-400' :
                      phase.color === 'emerald' ? 'text-emerald-400' :
                      'text-amber-400'
                    }`}>
                      {phase.time.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-white font-medium mt-1">{phase.name}</div>
                    <div className="text-xs text-gray-500">{phase.percentage.toFixed(0)}% of total</div>
                  </motion.div>
                ))}
              </div>

              {/* Total Duration Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-joc-gold/10 to-amber-500/5 border border-joc-gold/30 text-center"
              >
                <div className="text-5xl font-black text-joc-gold mb-2">
                  {((metrics?.totalTime || 0.6) * 1000).toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-400">Total Kick Duration</div>
              </motion.div>
            </motion.div>

            {/* Velocity Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Velocity Profile</h3>
                    <p className="text-sm text-gray-500">Foot speed throughout kick</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-400 hover:text-white transition-all"
                >
                  <Download size={16} />
                  Export Data
                </motion.button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 20]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="velocity" stroke="#F59E0B" strokeWidth={0} fill="url(#velocityGradient)" />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={false}
                    name="Velocity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        ) : (
          /* Compare View */
          <motion.div
            key="compare"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Video Comparison Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video 1 - Current */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-blue-400">Current Analysis</h3>
                </div>

                <div className="aspect-video bg-gradient-to-br from-black/50 to-black/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/10">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                      <Activity size={32} className="text-blue-400" />
                    </div>
                    <p className="text-blue-400 font-medium capitalize">{analysisData.kickType?.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500 mt-1">Score: {metrics?.overallScore || 0}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Form', value: metrics?.formScore || 0 },
                    { label: 'Power', value: metrics?.powerScore || 0 },
                    { label: 'Balance', value: metrics?.balanceScore || 0 },
                    { label: 'Overall', value: metrics?.overallScore || 0 },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <div className="text-xl font-bold text-blue-400">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Video 2 - Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02] border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-emerald-400">Compare With</h3>
                </div>

                {comparisonData ? (
                  <>
                    <div className="aspect-video bg-gradient-to-br from-black/50 to-black/30 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/10">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                          <Activity size={32} className="text-emerald-400" />
                        </div>
                        <p className="text-emerald-400 font-medium">Comparison Video</p>
                        <p className="text-sm text-gray-500 mt-1">Score: {comparisonData.metrics?.overallScore?.toFixed(0) || 0}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Form', value: comparisonData.metrics?.formScore?.toFixed(0) || 0 },
                        { label: 'Power', value: comparisonData.metrics?.powerScore?.toFixed(0) || 0 },
                        { label: 'Balance', value: comparisonData.metrics?.balanceScore?.toFixed(0) || 0 },
                        { label: 'Overall', value: comparisonData.metrics?.overallScore?.toFixed(0) || 0 },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-xs text-gray-400">{item.label}</span>
                          <div className="text-xl font-bold text-emerald-400">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <label className="aspect-video bg-gradient-to-br from-black/30 to-black/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleComparisonUpload}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                      <Upload size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 font-medium">Upload Comparison Video</p>
                    <p className="text-xs text-gray-500 mt-2">Click or drag to upload</p>
                  </label>
                )}
              </motion.div>
            </div>

            {/* Comparison Results */}
            {comparisonData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Comparison Bar Chart */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-6">Score Comparison</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { name: 'Form', video1: metrics?.formScore || 0, video2: comparisonData.metrics?.formScore || 0 },
                      { name: 'Power', video1: metrics?.powerScore || 0, video2: comparisonData.metrics?.powerScore || 0 },
                      { name: 'Balance', video1: metrics?.balanceScore || 0, video2: comparisonData.metrics?.balanceScore || 0 },
                      { name: 'Overall', video1: metrics?.overallScore || 0, video2: comparisonData.metrics?.overallScore || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="video1" name="Video 1" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="video2" name="Video 2" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Overlay */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-6">Performance Overlay</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={[
                      { metric: 'Form', video1: metrics?.formScore || 0, video2: comparisonData.metrics?.formScore || 0 },
                      { metric: 'Power', video1: metrics?.powerScore || 0, video2: comparisonData.metrics?.powerScore || 0 },
                      { metric: 'Balance', video1: metrics?.balanceScore || 0, video2: comparisonData.metrics?.balanceScore || 0 },
                      { metric: 'Overall', video1: metrics?.overallScore || 0, video2: comparisonData.metrics?.overallScore || 0 },
                    ]}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                      <Radar name="Video 1" dataKey="video1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Video 2" dataKey="video2" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Clear Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setComparisonVideo(null);
                      setComparisonData(null);
                    }}
                    className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all font-medium"
                  >
                    Clear Comparison
                  </motion.button>
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
