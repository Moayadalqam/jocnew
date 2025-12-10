import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, ChevronDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const ProgressTab = ({ sessions }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Demo progress data
  const progressData = Array(12).fill(null).map((_, i) => ({
    date: `Week ${i + 1}`,
    overall: 65 + Math.random() * 25,
    form: 60 + Math.random() * 30,
    power: 55 + Math.random() * 35,
    balance: 70 + Math.random() * 20,
    speed: 50 + Math.random() * 40,
  }));

  const metrics = [
    { id: 'overall', name: 'Overall Score', color: '#D4AF37' },
    { id: 'form', name: 'Form Score', color: '#10B981' },
    { id: 'power', name: 'Power Score', color: '#3B82F6' },
    { id: 'balance', name: 'Balance Score', color: '#8B5CF6' },
    { id: 'speed', name: 'Speed Score', color: '#F59E0B' },
  ];

  const milestones = [
    { date: 'Week 3', title: 'First 80+ Score', achieved: true },
    { date: 'Week 5', title: 'Consistent Form', achieved: true },
    { date: 'Week 8', title: '90+ Power Score', achieved: true },
    { date: 'Week 10', title: 'Competition Ready', achieved: false },
    { date: 'Week 12', title: 'Elite Level', achieved: false },
  ];

  const weeklyGoals = [
    { goal: 'Complete 5 analysis sessions', progress: 80, target: 5, current: 4 },
    { goal: 'Achieve 85+ form score', progress: 100, target: 85, current: 87 },
    { goal: 'Reduce injury risk to <20%', progress: 60, target: 20, current: 24 },
    { goal: 'Increase kick height by 5%', progress: 70, target: 5, current: 3.5 },
  ];

  const latestStats = progressData[progressData.length - 1];
  const previousStats = progressData[progressData.length - 2];

  const getChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      positive: change >= 0,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                timeRange === range
                  ? 'bg-joc-gold text-joc-dark font-semibold'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const change = getChange(latestStats[metric.id], previousStats[metric.id]);
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`metric-card cursor-pointer transition-all ${
                selectedMetric === metric.id ? 'ring-2 ring-joc-gold' : ''
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="text-3xl font-bold" style={{ color: metric.color }}>
                {latestStats[metric.id].toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">{metric.name}</div>
              <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${
                change.positive ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp size={12} className={!change.positive ? 'rotate-180' : ''} />
                {change.value}%
              </div>
            </motion.div>
          );
        })}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goals */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-joc-gold" />
            Weekly Goals
          </h3>
          <div className="space-y-4">
            {weeklyGoals.map((goal, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{goal.goal}</span>
                  <span className={goal.progress >= 100 ? 'text-green-400' : 'text-gray-400'}>
                    {goal.progress >= 100 ? 'Completed!' : `${goal.current}/${goal.target}`}
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, goal.progress)}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className="progress-fill"
                    style={{
                      background: goal.progress >= 100
                        ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : 'linear-gradient(90deg, #D4AF37, #f4d03f)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-joc-gold" />
            Milestones
          </h3>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  milestone.achieved
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-white/5 border border-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  milestone.achieved ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {milestone.achieved ? (
                    <Award size={20} className="text-white" />
                  ) : (
                    <span className="text-gray-400 text-sm">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${milestone.achieved ? 'text-green-400' : 'text-gray-400'}`}>
                    {milestone.title}
                  </div>
                  <div className="text-xs text-gray-500">{milestone.date}</div>
                </div>
                {milestone.achieved && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                    Achieved
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
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

      {/* Training Recommendations */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4">Training Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <h4 className="font-medium text-blue-400 mb-2">This Week's Focus</h4>
            <p className="text-sm text-gray-300">
              Based on your progress, focus on improving power generation through
              explosive hip rotation drills.
            </p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="font-medium text-green-400 mb-2">Strength Identified</h4>
            <p className="text-sm text-gray-300">
              Your balance scores have improved significantly. Continue with
              current stability exercises.
            </p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <h4 className="font-medium text-yellow-400 mb-2">Next Milestone</h4>
            <p className="text-sm text-gray-300">
              You're 70% of the way to "Competition Ready" status.
              Keep up the consistent training!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
