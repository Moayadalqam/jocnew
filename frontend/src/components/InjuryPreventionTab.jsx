import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Activity, Heart, Brain } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const InjuryPreventionTab = ({ analysisData }) => {
  const injuryData = analysisData?.injuryRisk || {
    overall: 'low',
    aclRisk: 15,
    kneeValgus: false,
    fatigue: 22,
  };

  const riskFactors = [
    {
      name: 'ACL Stress',
      value: injuryData.aclRisk,
      threshold: 30,
      description: 'Anterior cruciate ligament stress during landing',
      recommendations: [
        'Strengthen quadriceps and hamstrings equally',
        'Focus on proper landing mechanics',
        'Avoid excessive knee valgus during jumps',
      ],
    },
    {
      name: 'Knee Valgus',
      value: injuryData.kneeValgus ? 45 : 12,
      threshold: 25,
      description: 'Inward knee collapse during kicks and landings',
      recommendations: [
        'Hip abductor strengthening exercises',
        'Single-leg balance training',
        'Glute activation exercises before training',
      ],
    },
    {
      name: 'Fatigue Level',
      value: injuryData.fatigue,
      threshold: 40,
      description: 'Estimated muscular fatigue based on form degradation',
      recommendations: [
        'Take adequate rest between intense sessions',
        'Proper hydration and nutrition',
        'Monitor training load weekly',
      ],
    },
    {
      name: 'Hip Mobility',
      value: 18,
      threshold: 35,
      description: 'Hip joint mobility assessment',
      recommendations: [
        'Daily hip flexor stretches',
        'Dynamic warm-up before training',
        'Foam rolling for hip muscles',
      ],
    },
    {
      name: 'Ankle Stability',
      value: 22,
      threshold: 30,
      description: 'Ankle joint stability during pivoting movements',
      recommendations: [
        'Proprioception exercises',
        'Ankle strengthening routine',
        'Proper footwear selection',
      ],
    },
  ];

  const getRiskLevel = (value, threshold) => {
    if (value < threshold * 0.5) return { level: 'Low', color: '#10B981' };
    if (value < threshold) return { level: 'Moderate', color: '#F59E0B' };
    return { level: 'High', color: '#EF4444' };
  };

  const overallRisk = riskFactors.reduce((acc, r) => acc + r.value, 0) / riskFactors.length;
  const overallRiskLevel = getRiskLevel(overallRisk, 30);

  const pieData = [
    { name: 'Safe', value: 100 - overallRisk },
    { name: 'Risk', value: overallRisk },
  ];

  const fatigueHistory = Array(10).fill(null).map((_, i) => ({
    session: `S${i + 1}`,
    fatigue: 15 + Math.random() * 25,
    threshold: 40,
  }));

  const bodyParts = [
    { name: 'Left Knee', status: 'good', icon: '🦵' },
    { name: 'Right Knee', status: 'good', icon: '🦵' },
    { name: 'Left Hip', status: 'warning', icon: '🦴' },
    { name: 'Right Hip', status: 'good', icon: '🦴' },
    { name: 'Lower Back', status: 'good', icon: '🔙' },
    { name: 'Ankles', status: 'good', icon: '🦶' },
  ];

  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Shield size={64} className="mb-4 opacity-50" />
        <p className="text-lg">No analysis data available</p>
        <p className="text-sm">Upload and analyze a video first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Injury Prevention System</h2>
      </div>

      {/* Overall Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Overall Risk Level</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill={overallRiskLevel.color} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-24">
            <div className={`text-4xl font-bold`} style={{ color: overallRiskLevel.color }}>
              {overallRisk.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">{overallRiskLevel.level} Risk</div>
          </div>
        </div>

        <div className="glass-card p-6 col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Body Area Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bodyParts.map((part) => (
              <div
                key={part.name}
                className={`p-4 rounded-lg border ${
                  part.status === 'good'
                    ? 'bg-green-500/10 border-green-500/30'
                    : part.status === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{part.icon}</span>
                  <div>
                    <div className="font-medium">{part.name}</div>
                    <div className={`text-xs ${
                      part.status === 'good' ? 'text-green-400' :
                      part.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {part.status === 'good' ? 'Normal' :
                       part.status === 'warning' ? 'Monitor' : 'Attention'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskFactors.map((risk, idx) => {
          const riskLevel = getRiskLevel(risk.value, risk.threshold);
          return (
            <motion.div
              key={risk.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{risk.name}</h4>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${riskLevel.color}20`,
                    color: riskLevel.color,
                  }}
                >
                  {riskLevel.level}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${risk.value}%`,
                    backgroundColor: riskLevel.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>{risk.value}%</span>
                <span>Threshold: {risk.threshold}%</span>
              </div>

              <p className="text-xs text-gray-400 mb-3">{risk.description}</p>

              {/* Recommendations */}
              <div className="space-y-1">
                {risk.recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fatigue Tracking */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-joc-gold" />
          Fatigue Tracking Over Sessions
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={fatigueHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="session" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 60]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="fatigue"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B' }}
              name="Fatigue %"
            />
            <Line
              type="monotone"
              dataKey="threshold"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Risk Threshold"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prevention Tips */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4 flex items-center gap-2">
          <Heart size={20} />
          Prevention Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle size={18} />
              Warm-Up Protocol
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>1. 5 min light cardio (jogging/skipping)</li>
              <li>2. Dynamic stretches (leg swings, hip circles)</li>
              <li>3. Technique-specific movements at 50% intensity</li>
              <li>4. Gradually increase intensity over 10 minutes</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
              <Brain size={18} />
              Recovery Protocol
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>1. Cool-down stretches after each session</li>
              <li>2. Ice any areas of discomfort for 15-20 min</li>
              <li>3. Foam rolling for major muscle groups</li>
              <li>4. Adequate sleep (8+ hours recommended)</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 md:col-span-2">
            <h4 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} />
              Warning Signs to Watch
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
              <div>- Sharp pain during kicks</div>
              <div>- Joint swelling after training</div>
              <div>- Decreased range of motion</div>
              <div>- Persistent muscle soreness</div>
              <div>- Clicking/popping in joints</div>
              <div>- Numbness or tingling</div>
              <div>- Unusual fatigue</div>
              <div>- Loss of strength</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InjuryPreventionTab;
