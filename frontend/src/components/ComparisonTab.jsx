import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, ArrowRight, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts';

const ComparisonTab = ({ analysisData }) => {
  const [video2Data, setVideo2Data] = useState(null);

  // Demo comparison data
  const demoComparison = {
    video1: analysisData?.metrics || {
      kneeAngle: { avg: 142 },
      hipFlexion: { avg: 95 },
      kickHeight: { avg: 78 },
      peakVelocity: 18.5,
      formScore: 82,
      powerScore: 88,
      balanceScore: 85,
    },
    video2: {
      kneeAngle: { avg: 155 },
      hipFlexion: { avg: 105 },
      kickHeight: { avg: 85 },
      peakVelocity: 20.2,
      formScore: 88,
      powerScore: 92,
      balanceScore: 90,
    },
    label1: 'Current Performance',
    label2: 'Ideal Technique',
  };

  const comparisonMetrics = [
    { name: 'Knee Angle', v1: demoComparison.video1.kneeAngle.avg, v2: demoComparison.video2.kneeAngle.avg, unit: '°' },
    { name: 'Hip Flexion', v1: demoComparison.video1.hipFlexion.avg, v2: demoComparison.video2.hipFlexion.avg, unit: '°' },
    { name: 'Kick Height', v1: demoComparison.video1.kickHeight.avg, v2: demoComparison.video2.kickHeight.avg, unit: '%' },
    { name: 'Peak Velocity', v1: demoComparison.video1.peakVelocity, v2: demoComparison.video2.peakVelocity, unit: 'm/s' },
    { name: 'Form Score', v1: demoComparison.video1.formScore, v2: demoComparison.video2.formScore, unit: '%' },
    { name: 'Power Score', v1: demoComparison.video1.powerScore, v2: demoComparison.video2.powerScore, unit: '%' },
    { name: 'Balance Score', v1: demoComparison.video1.balanceScore, v2: demoComparison.video2.balanceScore, unit: '%' },
  ];

  const barChartData = comparisonMetrics.map(m => ({
    name: m.name,
    'Current': m.v1,
    'Ideal': m.v2,
  }));

  const radarData = [
    { metric: 'Form', current: demoComparison.video1.formScore, ideal: demoComparison.video2.formScore },
    { metric: 'Power', current: demoComparison.video1.powerScore, ideal: demoComparison.video2.powerScore },
    { metric: 'Balance', current: demoComparison.video1.balanceScore, ideal: demoComparison.video2.balanceScore },
    { metric: 'Height', current: demoComparison.video1.kickHeight.avg, ideal: demoComparison.video2.kickHeight.avg },
    { metric: 'Speed', current: (demoComparison.video1.peakVelocity / 25) * 100, ideal: (demoComparison.video2.peakVelocity / 25) * 100 },
  ];

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

  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Users size={64} className="mb-4 opacity-50" />
        <p className="text-lg">No analysis data for comparison</p>
        <p className="text-sm">Analyze a video first, then compare with another</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Video Comparison</h2>
      </div>

      {/* Video Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Video 1 - Current</h3>
          <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center border border-blue-500/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <p className="text-blue-400">Current Performance</p>
              <p className="text-sm text-gray-500">Analysis loaded</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Video 2 - Reference</h3>
          <div className="aspect-video bg-black/30 rounded-lg flex items-center justify-center border border-green-500/30 cursor-pointer hover:bg-green-500/10 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <p className="text-green-400">Ideal Technique</p>
              <p className="text-sm text-gray-500">Reference loaded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Metric Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Metric</th>
                <th className="text-center py-3 px-4 text-blue-400">Current</th>
                <th className="text-center py-3 px-4 text-gray-400">vs</th>
                <th className="text-center py-3 px-4 text-green-400">Ideal</th>
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
              <Bar dataKey="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ideal" fill="#10B981" radius={[4, 4, 0, 0]} />
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
                name="Current"
                dataKey="current"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Radar
                name="Ideal"
                dataKey="ideal"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement Summary */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4">Improvement Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <h4 className="font-medium text-red-400 mb-2">Priority Focus</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Increase knee extension by 13°</li>
              <li>- Improve kick height by 7%</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <h4 className="font-medium text-yellow-400 mb-2">Secondary Focus</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Hip flexion needs +10°</li>
              <li>- Balance score gap: 5%</li>
            </ul>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="font-medium text-green-400 mb-2">Strengths</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Power generation is close to ideal</li>
              <li>- Good form foundation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTab;
