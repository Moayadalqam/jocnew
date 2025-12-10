import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Info } from 'lucide-react';

const ScoringTab = ({ analysisData }) => {
  const scoringZones = [
    { name: 'Trunk Protector', points: 1, color: '#3B82F6', description: 'Basic punch to trunk' },
    { name: 'Trunk Kick', points: 2, color: '#10B981', description: 'Valid kick to trunk protector' },
    { name: 'Trunk Turning Kick', points: 4, color: '#F59E0B', description: 'Turning kick to trunk' },
    { name: 'Head Kick', points: 3, color: '#8B5CF6', description: 'Valid kick to head' },
    { name: 'Head Turning Kick', points: 5, color: '#EF4444', description: 'Turning kick to head' },
  ];

  // Calculate estimated score from analyzed kick
  const getEstimatedScore = () => {
    if (!analysisData) return null;

    const kickType = analysisData.kickType;
    const height = analysisData.metrics?.kickHeight?.avg || 0;
    const isHeadLevel = height > 85;
    const isTurning = ['bandae_dollyo', 'dwi_huryeo_chagi', 'mom_dollyo_chagi'].includes(kickType);

    if (isHeadLevel && isTurning) return { points: 5, type: 'Head Turning Kick' };
    if (isHeadLevel) return { points: 3, type: 'Head Kick' };
    if (isTurning) return { points: 4, type: 'Trunk Turning Kick' };
    return { points: 2, type: 'Trunk Kick' };
  };

  const estimatedScore = getEstimatedScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">World Taekwondo Scoring</h2>
      </div>

      {/* Estimated Score from Analysis */}
      {analysisData && estimatedScore ? (
        <div className="glass-card p-6 border-2 border-joc-gold">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Analyzed Technique Score</h3>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-joc-gold/20 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold text-joc-gold">{estimatedScore.points}</span>
            </div>
            <div className="text-xl font-semibold text-white">{estimatedScore.type}</div>
            <div className="text-sm text-gray-400 mt-2">
              Based on: {analysisData.kickType?.replace('_', ' ')} at {analysisData.metrics?.kickHeight?.avg?.toFixed(0)}% height
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <Trophy size={64} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
          <p className="text-gray-400">
            Upload and analyze a video to see the estimated WT scoring for the technique.
          </p>
        </div>
      )}

      {/* Scoring Guide */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">WT Scoring System</h3>
        <div className="space-y-3">
          {scoringZones.map((zone) => (
            <div
              key={zone.name}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl"
                style={{ backgroundColor: zone.color }}
              >
                {zone.points}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{zone.name}</div>
                <div className="text-sm text-gray-400">{zone.description}</div>
              </div>
              <Target size={20} className="text-gray-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Rules Reference */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4 flex items-center gap-2">
          <Info size={20} />
          WT Competition Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-2">
            <p><strong className="text-white">Match Format:</strong> 3 rounds x 2 minutes</p>
            <p><strong className="text-white">Rest Period:</strong> 1 minute between rounds</p>
            <p><strong className="text-white">Point Gap:</strong> 20-point difference ends match</p>
          </div>
          <div className="space-y-2">
            <p><strong className="text-white">Valid Areas:</strong> Trunk protector and head</p>
            <p><strong className="text-white">Penalties:</strong> Gam-jeom = 1 point to opponent</p>
            <p><strong className="text-white">Golden Round:</strong> 4th round if tied (first to score)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringTab;
