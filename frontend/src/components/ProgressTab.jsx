import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, BarChart } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const ProgressTab = ({ sessions }) => {
  const [selectedMetric, setSelectedMetric] = useState('overall');

  const metrics = [
    { id: 'overall', name: 'Overall Score', color: '#D4AF37' },
    { id: 'form', name: 'Form Score', color: '#10B981' },
    { id: 'power', name: 'Power Score', color: '#3B82F6' },
    { id: 'balance', name: 'Balance Score', color: '#8B5CF6' },
  ];

  // Only use real session data - no demo data
  const hasSessions = sessions && sessions.length > 0;

  // Build progress data from real sessions
  const progressData = hasSessions ? sessions.map((session, idx) => ({
    date: session.date || `Session ${idx + 1}`,
    overall: session.overallScore || 0,
    form: session.formScore || 0,
    power: session.powerScore || 0,
    balance: session.balanceScore || 0,
  })) : [];

  if (!hasSessions) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
        </div>

        <div className="glass-card p-8 text-center">
          <BarChart size={64} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Session History</h3>
          <p className="text-gray-400">
            Analyze videos to build your progress history. Each analysis will be saved as a session.
          </p>
        </div>

        {/* Empty State Tips */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-joc-gold mb-4">How Progress Tracking Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-2xl mb-2">1</div>
              <h4 className="font-medium text-white mb-2">Analyze Videos</h4>
              <p className="text-sm text-gray-400">
                Upload and analyze your Taekwondo technique videos in the Video Analyzer tab.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-2xl mb-2">2</div>
              <h4 className="font-medium text-white mb-2">Build History</h4>
              <p className="text-sm text-gray-400">
                Each analysis is saved as a session with scores for form, power, and balance.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="text-2xl mb-2">3</div>
              <h4 className="font-medium text-white mb-2">Track Progress</h4>
              <p className="text-sm text-gray-400">
                View your improvement over time with charts and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const latestSession = progressData[progressData.length - 1];
  const avgScore = progressData.reduce((acc, s) => acc + s.overall, 0) / progressData.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-3xl font-bold text-joc-gold">{sessions.length}</div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
        <div className="metric-card">
          <div className="text-3xl font-bold text-green-400">{avgScore.toFixed(0)}%</div>
          <div className="text-sm text-gray-400">Average Score</div>
        </div>
        <div className="metric-card">
          <div className="text-3xl font-bold text-blue-400">{latestSession?.overall?.toFixed(0) || 0}%</div>
          <div className="text-sm text-gray-400">Latest Score</div>
        </div>
        <div className="metric-card">
          <div className="text-3xl font-bold text-purple-400">
            {progressData.length > 1
              ? `${(latestSession.overall - progressData[0].overall).toFixed(0)}%`
              : '0%'}
          </div>
          <div className="text-sm text-gray-400">Improvement</div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedMetric === metric.id
                ? 'bg-joc-gold text-joc-dark font-semibold'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {metric.name}
          </button>
        ))}
      </div>

      {/* Main Progress Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          {metrics.find(m => m.id === selectedMetric)?.name} Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={metrics.find(m => m.id === selectedMetric)?.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={metrics.find(m => m.id === selectedMetric)?.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={metrics.find(m => m.id === selectedMetric)?.color}
              fill="url(#progressGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* All Metrics Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">All Metrics Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
              }}
            />
            {metrics.map((metric) => (
              <Line
                key={metric.id}
                type="monotone"
                dataKey={metric.id}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                name={metric.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-sm text-gray-400">{metric.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session List */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-2">
          {progressData.slice(-5).reverse().map((session, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">{session.date}</div>
              <div className="flex gap-4">
                <span className="text-joc-gold font-medium">{session.overall.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
