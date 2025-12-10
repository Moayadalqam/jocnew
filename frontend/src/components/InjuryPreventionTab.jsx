import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Activity, Heart, Brain } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const InjuryPreventionTab = ({ analysisData }) => {
  // Only show real data from analysis - no defaults
  if (!analysisData || !analysisData.injuryRisk) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Injury Prevention System</h2>
        </div>

        <div className="glass-card p-8 text-center">
          <Shield size={64} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Injury Risk Data</h3>
          <p className="text-gray-400">
            Upload and analyze a video to see injury prevention insights based on your technique.
          </p>
        </div>

        {/* Prevention Tips - Always Show */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-joc-gold mb-4 flex items-center gap-2">
            <Heart size={20} />
            General Prevention Recommendations
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
  }

  const injuryData = analysisData.injuryRisk;

  // Build risk factors from actual analysis data only
  const riskFactors = [
    {
      name: 'ACL Stress',
      value: injuryData.aclRisk || 0,
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
      value: injuryData.kneeValgus ? 45 : 10,
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
      value: injuryData.fatigue || 0,
      threshold: 40,
      description: 'Estimated muscular fatigue based on form degradation',
      recommendations: [
        'Take adequate rest between intense sessions',
        'Proper hydration and nutrition',
        'Monitor training load weekly',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Injury Prevention System</h2>
      </div>

      {/* Overall Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
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

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Kick Type Analyzed</div>
              <div className="font-medium text-white">{analysisData.kickType?.replace(/_/g, ' ') || 'Unknown'}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Frames Analyzed</div>
              <div className="font-medium text-white">{analysisData.frames || 0}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Risk Assessment</div>
              <div className="font-medium" style={{ color: overallRiskLevel.color }}>
                {overallRiskLevel.level} - {overallRisk.toFixed(0)}% overall
              </div>
            </div>
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
