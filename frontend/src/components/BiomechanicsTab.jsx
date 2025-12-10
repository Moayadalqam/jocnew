import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { Activity, Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';

const BiomechanicsTab = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Activity size={64} className="mb-4 opacity-50" />
        <p className="text-lg">No analysis data available</p>
        <p className="text-sm">Upload and analyze a video first</p>
      </div>
    );
  }

  const { metrics } = analysisData;

  // Generate time series data for charts
  const timeSeriesData = Array(30).fill(null).map((_, i) => ({
    frame: i + 1,
    kneeAngle: metrics.kneeAngle.min + Math.random() * (metrics.kneeAngle.max - metrics.kneeAngle.min),
    hipFlexion: metrics.hipFlexion.min + Math.random() * (metrics.hipFlexion.max - metrics.hipFlexion.min),
    kickHeight: metrics.kickHeight.min + Math.random() * (metrics.kickHeight.max - metrics.kickHeight.min),
    velocity: Math.random() * metrics.peakVelocity,
  }));

  const radarData = [
    { metric: 'Form', value: metrics.formScore },
    { metric: 'Power', value: metrics.powerScore },
    { metric: 'Balance', value: metrics.balanceScore },
    { metric: 'Speed', value: Math.round(metrics.peakVelocity / 25 * 100) },
    { metric: 'Height', value: metrics.kickHeight.avg },
    { metric: 'Chamber', value: Math.round((1 - metrics.chamberTime / 0.5) * 100) },
  ];

  const phaseData = [
    { name: 'Chamber', time: metrics.chamberTime, color: '#3B82F6' },
    { name: 'Extension', time: metrics.extensionTime, color: '#10B981' },
    { name: 'Retraction', time: metrics.retractionTime, color: '#F59E0B' },
  ];

  const MetricCard = ({ title, value, unit, icon: Icon, color, description }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="metric-card"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        <Icon size={20} className={color} />
      </div>
      <div className={`text-3xl font-bold ${color}`}>
        {value}<span className="text-lg ml-1">{unit}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Biomechanical Analysis</h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Knee Angle"
          value={Math.round(metrics.kneeAngle.avg)}
          unit="°"
          icon={Target}
          color="text-blue-400"
          description={`Range: ${Math.round(metrics.kneeAngle.min)}° - ${Math.round(metrics.kneeAngle.max)}°`}
        />
        <MetricCard
          title="Hip Flexion"
          value={Math.round(metrics.hipFlexion.avg)}
          unit="°"
          icon={Activity}
          color="text-green-400"
          description={`Range: ${Math.round(metrics.hipFlexion.min)}° - ${Math.round(metrics.hipFlexion.max)}°`}
        />
        <MetricCard
          title="Kick Height"
          value={Math.round(metrics.kickHeight.avg)}
          unit="%"
          icon={TrendingUp}
          color="text-purple-400"
          description="Relative to hip height"
        />
        <MetricCard
          title="Peak Velocity"
          value={metrics.peakVelocity.toFixed(1)}
          unit="m/s"
          icon={Zap}
          color="text-yellow-400"
          description="Maximum foot speed"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knee Angle Over Time */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Knee Angle Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="kneeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="frame" stroke="#666" />
              <YAxis stroke="#666" domain={[80, 180]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #D4AF37',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="kneeAngle"
                stroke="#3B82F6"
                fill="url(#kneeGradient)"
                name="Knee Angle (°)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" stroke="#666" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#D4AF37"
                fill="#D4AF37"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kick Phases */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Kick Phase Timing</h3>
        <div className="grid grid-cols-3 gap-4">
          {phaseData.map((phase) => (
            <div key={phase.name} className="text-center">
              <div
                className="w-full h-4 rounded-full overflow-hidden mb-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(phase.time / metrics.totalTime) * 100}%`,
                    backgroundColor: phase.color,
                  }}
                />
              </div>
              <div className="text-2xl font-bold" style={{ color: phase.color }}>
                {(phase.time * 1000).toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-400">{phase.name}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-joc-gold">
            {(metrics.totalTime * 1000).toFixed(0)}ms
          </div>
          <div className="text-sm text-gray-400">Total Kick Duration</div>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Velocity Profile</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="frame" stroke="#666" />
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
              strokeWidth={2}
              dot={false}
              name="Velocity (m/s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Notes */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-joc-gold" />
          Biomechanical Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">Knee Extension</h4>
            <p className="text-sm text-gray-400">
              {metrics.kneeAngle.avg > 160
                ? 'Excellent full extension achieved during kick'
                : metrics.kneeAngle.avg > 140
                ? 'Good extension, aim for 160°+ at peak'
                : 'Work on achieving fuller knee extension'}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Hip Flexibility</h4>
            <p className="text-sm text-gray-400">
              {metrics.hipFlexion.avg > 100
                ? 'Excellent hip flexion range'
                : metrics.hipFlexion.avg > 80
                ? 'Good flexibility, continue stretching'
                : 'Focus on hip flexibility exercises'}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="font-medium text-purple-400 mb-2">Kick Height</h4>
            <p className="text-sm text-gray-400">
              {metrics.kickHeight.avg > 85
                ? 'Competition-level kick height'
                : metrics.kickHeight.avg > 70
                ? 'Good height for body/head targeting'
                : 'Work on hip flexibility for higher kicks'}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="font-medium text-yellow-400 mb-2">Power Generation</h4>
            <p className="text-sm text-gray-400">
              {metrics.peakVelocity > 15
                ? 'Excellent power transfer to foot'
                : metrics.peakVelocity > 10
                ? 'Good velocity, focus on hip rotation'
                : 'Work on explosive hip rotation'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomechanicsTab;
