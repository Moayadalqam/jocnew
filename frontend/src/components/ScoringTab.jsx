import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Award, Medal } from 'lucide-react';

const ScoringTab = ({ analysisData }) => {
  const [selectedRound, setSelectedRound] = useState(1);

  const scoringZones = [
    { name: 'Trunk Protector', points: 1, color: '#3B82F6', description: 'Basic punch to trunk' },
    { name: 'Trunk Kick', points: 2, color: '#10B981', description: 'Valid kick to trunk protector' },
    { name: 'Trunk Turning Kick', points: 4, color: '#F59E0B', description: 'Turning kick to trunk' },
    { name: 'Head Kick', points: 3, color: '#8B5CF6', description: 'Valid kick to head' },
    { name: 'Head Turning Kick', points: 5, color: '#EF4444', description: 'Turning kick to head' },
  ];

  // Demo scoring data
  const roundData = {
    1: { blue: 8, red: 6, techniques: [
      { time: '0:23', athlete: 'blue', type: 'Trunk Kick', points: 2 },
      { time: '0:45', athlete: 'red', type: 'Trunk Kick', points: 2 },
      { time: '1:12', athlete: 'blue', type: 'Head Kick', points: 3 },
      { time: '1:38', athlete: 'red', type: 'Trunk Turning Kick', points: 4 },
      { time: '1:55', athlete: 'blue', type: 'Trunk Kick', points: 2 },
      { time: '2:00', athlete: 'blue', type: 'Trunk Protector', points: 1 },
    ]},
    2: { blue: 5, red: 7, techniques: [
      { time: '0:15', athlete: 'red', type: 'Trunk Kick', points: 2 },
      { time: '0:42', athlete: 'blue', type: 'Trunk Turning Kick', points: 4 },
      { time: '1:18', athlete: 'red', type: 'Head Kick', points: 3 },
      { time: '1:45', athlete: 'blue', type: 'Trunk Protector', points: 1 },
      { time: '1:58', athlete: 'red', type: 'Trunk Kick', points: 2 },
    ]},
    3: { blue: 9, red: 4, techniques: [
      { time: '0:28', athlete: 'blue', type: 'Head Turning Kick', points: 5 },
      { time: '0:55', athlete: 'red', type: 'Trunk Kick', points: 2 },
      { time: '1:22', athlete: 'blue', type: 'Trunk Kick', points: 2 },
      { time: '1:48', athlete: 'red', type: 'Trunk Kick', points: 2 },
      { time: '2:05', athlete: 'blue', type: 'Trunk Kick', points: 2 },
    ]},
  };

  const totalBlue = Object.values(roundData).reduce((acc, r) => acc + r.blue, 0);
  const totalRed = Object.values(roundData).reduce((acc, r) => acc + r.red, 0);

  const currentRound = roundData[selectedRound];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">World Taekwondo Scoring Simulation</h2>
      </div>

      {/* Main Scoreboard */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Blue Corner */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{totalBlue}</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400">BLUE</h3>
            <p className="text-sm text-gray-400">Chung</p>
          </div>

          {/* Center Info */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {totalBlue} - {totalRed}
            </div>
            <div className="text-joc-gold font-semibold">FINAL SCORE</div>
            <div className="mt-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                totalBlue > totalRed ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {totalBlue > totalRed ? 'BLUE WINS' : totalRed > totalBlue ? 'RED WINS' : 'DRAW'}
              </span>
            </div>
          </div>

          {/* Red Corner */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{totalRed}</span>
            </div>
            <h3 className="text-xl font-bold text-red-400">RED</h3>
            <p className="text-sm text-gray-400">Hong</p>
          </div>
        </div>
      </div>

      {/* Round Selector */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((round) => (
          <button
            key={round}
            onClick={() => setSelectedRound(round)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedRound === round
                ? 'bg-joc-gold text-joc-dark'
                : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            Round {round}
            <div className="text-xs mt-1 opacity-75">
              {roundData[round].blue} - {roundData[round].red}
            </div>
          </button>
        ))}
      </div>

      {/* Round Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technique Timeline */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Round {selectedRound} Timeline</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {currentRound.techniques.map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: tech.athlete === 'blue' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  tech.athlete === 'blue'
                    ? 'bg-blue-500/10 border-l-4 border-blue-500'
                    : 'bg-red-500/10 border-r-4 border-red-500 flex-row-reverse'
                }`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: tech.athlete === 'blue' ? '#3B82F6' : '#EF4444' }}>
                  +{tech.points}
                </div>
                <div className={tech.athlete === 'red' ? 'text-right' : ''}>
                  <div className="font-medium">{tech.type}</div>
                  <div className="text-sm text-gray-400">{tech.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
      </div>

      {/* Statistics */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Match Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <Zap className="mx-auto mb-2 text-blue-400" size={24} />
            <div className="text-2xl font-bold text-blue-400">
              {currentRound.techniques.filter(t => t.athlete === 'blue').length}
            </div>
            <div className="text-sm text-gray-400">Blue Techniques</div>
          </div>
          <div className="metric-card">
            <Zap className="mx-auto mb-2 text-red-400" size={24} />
            <div className="text-2xl font-bold text-red-400">
              {currentRound.techniques.filter(t => t.athlete === 'red').length}
            </div>
            <div className="text-sm text-gray-400">Red Techniques</div>
          </div>
          <div className="metric-card">
            <Award className="mx-auto mb-2 text-yellow-400" size={24} />
            <div className="text-2xl font-bold text-yellow-400">
              {Math.max(...currentRound.techniques.map(t => t.points))}
            </div>
            <div className="text-sm text-gray-400">Highest Score</div>
          </div>
          <div className="metric-card">
            <Medal className="mx-auto mb-2 text-joc-gold" size={24} />
            <div className="text-2xl font-bold text-joc-gold">
              {currentRound.techniques.length}
            </div>
            <div className="text-sm text-gray-400">Total Scores</div>
          </div>
        </div>
      </div>

      {/* Rules Reference */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-joc-gold mb-4">WT Competition Rules</h3>
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
