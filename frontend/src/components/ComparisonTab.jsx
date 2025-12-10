import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, ArrowRight, BarChart3, TrendingUp, TrendingDown, Minus, Video } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';

const ComparisonTab = ({ analysisData, video2Data, setVideo2Data }) => {
  const [video2File, setVideo2File] = useState(null);

  // Only show comparison when both videos are analyzed
  const hasComparison = analysisData && video2Data;

  const handleVideo2Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo2File(file);
      // Note: In production, this would trigger actual video analysis
      // For now, user needs to analyze second video separately
    }
  };

  const getDiffIcon = (v1, v2) => {
    const diff = v2 - v1;
    if (diff > 0) return <TrendingUp size={16} className="text-red-400" />;
    if (diff < 0) return <TrendingDown size={16} className="text-green-400" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getDiffColor = (v1, v2) => {
    const diff = v2 - v1;
    if (diff > 0) return 'text-red-400';
    if (diff < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  // Show upload prompt if no analysis data
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Users size={64} className="mb-4 opacity-50" />
        <p className="text-lg">No analysis data for comparison</p>
        <p className="text-sm">Analyze a video first in the Video Analyzer tab</p>
      </div>
    );
  }

  // Build comparison metrics only if we have real data
  const comparisonMetrics = hasComparison ? [
    { name: 'Knee Angle', v1: analysisData.metrics.kneeAngle.avg, v2: video2Data.metrics.kneeAngle.avg, unit: '°' },
    { name: 'Hip Flexion', v1: analysisData.metrics.hipFlexion.avg, v2: video2Data.metrics.hipFlexion.avg, unit: '°' },
    { name: 'Kick Height', v1: analysisData.metrics.kickHeight.avg, v2: video2Data.metrics.kickHeight.avg, unit: '%' },
    { name: 'Peak Velocity', v1: analysisData.metrics.peakVelocity, v2: video2Data.metrics.peakVelocity, unit: 'm/s' },
    { name: 'Form Score', v1: analysisData.metrics.formScore, v2: video2Data.metrics.formScore, unit: '%' },
    { name: 'Power Score', v1: analysisData.metrics.powerScore, v2: video2Data.metrics.powerScore, unit: '%' },
    { name: 'Balance Score', v1: analysisData.metrics.balanceScore, v2: video2Data.metrics.balanceScore, unit: '%' },
  ] : [];

  const barChartData = comparisonMetrics.map(m => ({
    name: m.name,
    'Video 1': m.v1,
    'Video 2': m.v2,
  }));

  const radarData = hasComparison ? [
    { metric: 'Form', video1: analysisData.metrics.formScore, video2: video2Data.metrics.formScore },
    { metric: 'Power', video1: analysisData.metrics.powerScore, video2: video2Data.metrics.powerScore },
    { metric: 'Balance', video1: analysisData.metrics.balanceScore, video2: video2Data.metrics.balanceScore },
    { metric: 'Height', video1: analysisData.metrics.kickHeight.avg, video2: video2Data.metrics.kickHeight.avg },
    { metric: 'Speed', video1: (analysisData.metrics.peakVelocity / 25) * 100, video2: (video2Data.metrics.peakVelocity / 25) * 100 },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Video Comparison</h2>
      </div>

      {/* Video Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Video 1 - Current Analysis</h3>
          <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center border border-blue-500/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <p className="text-blue-400">Analysis Loaded</p>
              <p className="text-sm text-gray-500">{analysisData.kickType?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">Score: {analysisData.metrics.overallScore}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Video 2 - Compare With</h3>
          {video2Data ? (
            <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center border border-green-500/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <p className="text-green-400">Analysis Loaded</p>
                <p className="text-sm text-gray-500">{video2Data.kickType?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">Score: {video2Data.metrics.overallScore}%</p>
              </div>
            </div>
          ) : (
            <label className="aspect-video bg-black/30 rounded-lg flex items-center justify-center border-2 border-dashed border-green-500/30 cursor-pointer hover:bg-green-500/10 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideo2Upload}
                className="hidden"
              />
              <div className="text-center">
                <Upload size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
                <p className="text-green-400">Upload Second Video</p>
                <p className="text-sm text-gray-500">Analyze another video to compare</p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Show comparison only if we have both videos analyzed */}
      {hasComparison ? (
        <>
          {/* Comparison Table */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Metric Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Metric</th>
                    <th className="text-center py-3 px-4 text-blue-400">Video 1</th>
                    <th className="text-center py-3 px-4 text-gray-400">vs</th>
                    <th className="text-center py-3 px-4 text-green-400">Video 2</th>
                    <th className="text-center py-3 px-4 text-gray-400">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((metric, idx) => (
                    <motion.tr
                      key={metric.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-gray-800 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 font-medium">{metric.name}</td>
                      <td className="py-3 px-4 text-center text-blue-400 font-mono">
                        {metric.v1.toFixed(1)}{metric.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ArrowRight size={16} className="mx-auto text-gray-500" />
                      </td>
                      <td className="py-3 px-4 text-center text-green-400 font-mono">
                        {metric.v2.toFixed(1)}{metric.unit}
                      </td>
                      <td className={`py-3 px-4 text-center font-mono ${getDiffColor(metric.v1, metric.v2)}`}>
                        <div className="flex items-center justify-center gap-2">
                          {getDiffIcon(metric.v1, metric.v2)}
                          {Math.abs(metric.v2 - metric.v1).toFixed(1)}{metric.unit}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Score Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData.slice(-3)}>
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
                  <Bar dataKey="Video 1" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Video 2" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart Comparison */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Overlay</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="metric" stroke="#666" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
                  <Radar
                    name="Video 1"
                    dataKey="video1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Video 2"
                    dataKey="video2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Improvement Summary - Based on actual data */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-joc-gold mb-4">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-400 mb-2">Video 1 Highlights</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>- Overall Score: {analysisData.metrics.overallScore}%</li>
                  <li>- Kick Type: {analysisData.kickType?.replace('_', ' ')}</li>
                </ul>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <h4 className="font-medium text-green-400 mb-2">Video 2 Highlights</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>- Overall Score: {video2Data.metrics.overallScore}%</li>
                  <li>- Kick Type: {video2Data.kickType?.replace('_', ' ')}</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <h4 className="font-medium text-yellow-400 mb-2">Key Differences</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>- Score Diff: {(video2Data.metrics.overallScore - analysisData.metrics.overallScore).toFixed(1)}%</li>
                  <li>- Form Diff: {(video2Data.metrics.formScore - analysisData.metrics.formScore).toFixed(1)}%</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <Video size={64} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Second Video to Compare</h3>
          <p className="text-gray-400">
            Analyze another video to see side-by-side comparison of metrics, scores, and performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonTab;
