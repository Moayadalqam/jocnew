import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Medal, TrendingUp, User, X, Edit } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const TeamTab = ({ athletes, setAthletes }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    age: '',
    weight: '',
    beltRank: 'white',
    specialty: '',
  });

  // Demo athletes data
  const demoAthletes = [
    {
      id: 1,
      name: 'Ahmad Al-Hussein',
      age: 22,
      weight: 68,
      beltRank: 'black',
      specialty: 'Dollyo Chagi',
      sessions: 45,
      avgScore: 87,
      improvement: 12,
      avatar: 'A',
    },
    {
      id: 2,
      name: 'Sara Mohammad',
      age: 19,
      weight: 57,
      beltRank: 'red',
      specialty: 'Yeop Chagi',
      sessions: 38,
      avgScore: 82,
      improvement: 8,
      avatar: 'S',
    },
    {
      id: 3,
      name: 'Omar Khalid',
      age: 24,
      weight: 74,
      beltRank: 'black',
      specialty: 'Dwi Chagi',
      sessions: 52,
      avgScore: 91,
      improvement: 15,
      avatar: 'O',
    },
    {
      id: 4,
      name: 'Layla Nasser',
      age: 17,
      weight: 52,
      beltRank: 'blue',
      specialty: 'Naeryo Chagi',
      sessions: 28,
      avgScore: 78,
      improvement: 20,
      avatar: 'L',
    },
    {
      id: 5,
      name: 'Yousef Tariq',
      age: 21,
      weight: 80,
      beltRank: 'black',
      specialty: 'Mom Dollyo Chagi',
      sessions: 60,
      avgScore: 94,
      improvement: 5,
      avatar: 'Y',
    },
  ];

  const teamAthletes = athletes.length > 0 ? athletes : demoAthletes;

  const filteredAthletes = teamAthletes.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const comparisonData = teamAthletes.map(a => ({
    name: a.name.split(' ')[0],
    score: a.avgScore,
    sessions: a.sessions,
    improvement: a.improvement,
  }));

  const beltColors = {
    white: { bg: 'bg-gray-100', text: 'text-gray-800' },
    yellow: { bg: 'bg-yellow-400', text: 'text-yellow-900' },
    green: { bg: 'bg-green-500', text: 'text-white' },
    blue: { bg: 'bg-blue-500', text: 'text-white' },
    red: { bg: 'bg-red-500', text: 'text-white' },
    black: { bg: 'bg-gray-900', text: 'text-white' },
  };

  const handleAddAthlete = () => {
    if (newAthlete.name && newAthlete.age) {
      const athlete = {
        id: Date.now(),
        ...newAthlete,
        age: parseInt(newAthlete.age),
        weight: parseInt(newAthlete.weight),
        sessions: 0,
        avgScore: 0,
        improvement: 0,
        avatar: newAthlete.name.charAt(0).toUpperCase(),
      };
      setAthletes([...teamAthletes, athlete]);
      setNewAthlete({ name: '', age: '', weight: '', beltRank: 'white', specialty: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Team Management</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={20} />
          Add Athlete
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search athletes by name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg"
        />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <Users className="mx-auto mb-2 text-joc-gold" size={24} />
          <div className="text-3xl font-bold text-joc-gold">{teamAthletes.length}</div>
          <div className="text-sm text-gray-400">Total Athletes</div>
        </div>
        <div className="metric-card">
          <Medal className="mx-auto mb-2 text-yellow-400" size={24} />
          <div className="text-3xl font-bold text-yellow-400">
            {teamAthletes.filter(a => a.beltRank === 'black').length}
          </div>
          <div className="text-sm text-gray-400">Black Belts</div>
        </div>
        <div className="metric-card">
          <TrendingUp className="mx-auto mb-2 text-green-400" size={24} />
          <div className="text-3xl font-bold text-green-400">
            {(teamAthletes.reduce((acc, a) => acc + a.avgScore, 0) / teamAthletes.length).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400">Team Average</div>
        </div>
        <div className="metric-card">
          <TrendingUp className="mx-auto mb-2 text-blue-400" size={24} />
          <div className="text-3xl font-bold text-blue-400">
            {teamAthletes.reduce((acc, a) => acc + a.sessions, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
      </div>

      {/* Athletes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete, idx) => (
          <motion.div
            key={athlete.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 cursor-pointer hover:border-joc-gold transition-all"
            onClick={() => setSelectedAthlete(athlete)}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-joc-gold to-yellow-300 flex items-center justify-center text-xl font-bold text-joc-dark">
                {athlete.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{athlete.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${beltColors[athlete.beltRank].bg} ${beltColors[athlete.beltRank].text}`}>
                    {athlete.beltRank.charAt(0).toUpperCase() + athlete.beltRank.slice(1)} Belt
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {athlete.age} years | {athlete.weight} kg
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/5 rounded">
                <div className="text-lg font-bold text-joc-gold">{athlete.avgScore}%</div>
                <div className="text-xs text-gray-400">Avg Score</div>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <div className="text-lg font-bold text-blue-400">{athlete.sessions}</div>
                <div className="text-xs text-gray-400">Sessions</div>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <div className="text-lg font-bold text-green-400">+{athlete.improvement}%</div>
                <div className="text-xs text-gray-400">Growth</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              Specialty: <span className="text-white">{athlete.specialty}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Comparison Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Team Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="score" fill="#D4AF37" name="Avg Score" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add Athlete Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Athlete</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newAthlete.name}
                onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Age"
                  value={newAthlete.age}
                  onChange={(e) => setNewAthlete({ ...newAthlete, age: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={newAthlete.weight}
                  onChange={(e) => setNewAthlete({ ...newAthlete, weight: e.target.value })}
                />
              </div>
              <select
                value={newAthlete.beltRank}
                onChange={(e) => setNewAthlete({ ...newAthlete, beltRank: e.target.value })}
                className="w-full"
              >
                <option value="white">White Belt</option>
                <option value="yellow">Yellow Belt</option>
                <option value="green">Green Belt</option>
                <option value="blue">Blue Belt</option>
                <option value="red">Red Belt</option>
                <option value="black">Black Belt</option>
              </select>
              <input
                type="text"
                placeholder="Specialty (e.g., Dollyo Chagi)"
                value={newAthlete.specialty}
                onChange={(e) => setNewAthlete({ ...newAthlete, specialty: e.target.value })}
                className="w-full"
              />
              <button
                onClick={handleAddAthlete}
                className="w-full btn-gold py-3"
              >
                Add Athlete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Athlete Detail Modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-joc-gold to-yellow-300 flex items-center justify-center text-2xl font-bold text-joc-dark">
                  {selectedAthlete.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedAthlete.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${beltColors[selectedAthlete.beltRank].bg} ${beltColors[selectedAthlete.beltRank].text}`}>
                    {selectedAthlete.beltRank.charAt(0).toUpperCase() + selectedAthlete.beltRank.slice(1)} Belt
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAthlete(null)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Age</div>
                <div className="text-xl font-bold">{selectedAthlete.age} years</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Weight</div>
                <div className="text-xl font-bold">{selectedAthlete.weight} kg</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Average Score</div>
                <div className="text-xl font-bold text-joc-gold">{selectedAthlete.avgScore}%</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Sessions</div>
                <div className="text-xl font-bold text-blue-400">{selectedAthlete.sessions}</div>
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg mb-4">
              <div className="text-sm text-gray-400">Specialty</div>
              <div className="text-lg font-medium">{selectedAthlete.specialty}</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-sm text-green-400">Improvement</div>
              <div className="text-2xl font-bold text-green-400">+{selectedAthlete.improvement}%</div>
              <div className="text-xs text-gray-400">Since joining the program</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamTab;
