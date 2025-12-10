import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Search, Filter, Eye, Trash2, Download, Clock, TrendingUp } from 'lucide-react';

const SessionHistoryTab = ({ sessions, setSessions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Demo session history
  const demoSessions = [
    {
      id: 1,
      date: '2024-12-08',
      time: '14:30',
      athlete: 'Ahmad Al-Hussein',
      kickType: 'Dollyo Chagi',
      overallScore: 87,
      duration: '2:34',
      frames: 152,
    },
    {
      id: 2,
      date: '2024-12-07',
      time: '10:15',
      athlete: 'Sara Mohammad',
      kickType: 'Yeop Chagi',
      overallScore: 82,
      duration: '1:45',
      frames: 105,
    },
    {
      id: 3,
      date: '2024-12-06',
      time: '16:00',
      athlete: 'Omar Khalid',
      kickType: 'Dwi Chagi',
      overallScore: 91,
      duration: '3:12',
      frames: 192,
    },
    {
      id: 4,
      date: '2024-12-05',
      time: '09:45',
      athlete: 'Layla Nasser',
      kickType: 'Naeryo Chagi',
      overallScore: 78,
      duration: '2:05',
      frames: 125,
    },
    {
      id: 5,
      date: '2024-12-04',
      time: '11:30',
      athlete: 'Yousef Tariq',
      kickType: 'Mom Dollyo Chagi',
      overallScore: 94,
      duration: '2:50',
      frames: 170,
    },
    {
      id: 6,
      date: '2024-12-03',
      time: '15:20',
      athlete: 'Ahmad Al-Hussein',
      kickType: 'Bandae Dollyo',
      overallScore: 85,
      duration: '2:18',
      frames: 138,
    },
    {
      id: 7,
      date: '2024-12-02',
      time: '14:00',
      athlete: 'Sara Mohammad',
      kickType: 'Dollyo Chagi',
      overallScore: 80,
      duration: '1:55',
      frames: 115,
    },
    {
      id: 8,
      date: '2024-12-01',
      time: '10:00',
      athlete: 'Omar Khalid',
      kickType: 'Dwi Huryeo Chagi',
      overallScore: 89,
      duration: '2:40',
      frames: 160,
    },
  ];

  const allSessions = sessions.length > 0 ? sessions : demoSessions;

  const filteredSessions = allSessions
    .filter(s => {
      const matchesSearch =
        s.athlete.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kickType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' ||
        (filterType === 'high' && s.overallScore >= 85) ||
        (filterType === 'medium' && s.overallScore >= 70 && s.overallScore < 85) ||
        (filterType === 'low' && s.overallScore < 70);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'athlete') return a.athlete.localeCompare(b.athlete);
      return 0;
    });

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const handleDeleteSession = (id) => {
    if (confirm('Are you sure you want to delete this session?')) {
      setSessions(allSessions.filter(s => s.id !== id));
    }
  };

  // Statistics
  const avgScore = allSessions.reduce((acc, s) => acc + s.overallScore, 0) / allSessions.length;
  const highScoreSessions = allSessions.filter(s => s.overallScore >= 85).length;
  const totalFrames = allSessions.reduce((acc, s) => acc + s.frames, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Session History</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <FileText className="mx-auto mb-2 text-joc-gold" size={24} />
          <div className="text-3xl font-bold text-joc-gold">{allSessions.length}</div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
        <div className="metric-card">
          <TrendingUp className="mx-auto mb-2 text-green-400" size={24} />
          <div className="text-3xl font-bold text-green-400">{avgScore.toFixed(0)}%</div>
          <div className="text-sm text-gray-400">Average Score</div>
        </div>
        <div className="metric-card">
          <Clock className="mx-auto mb-2 text-blue-400" size={24} />
          <div className="text-3xl font-bold text-blue-400">{highScoreSessions}</div>
          <div className="text-sm text-gray-400">High Scores (85+)</div>
        </div>
        <div className="metric-card">
          <Eye className="mx-auto mb-2 text-purple-400" size={24} />
          <div className="text-3xl font-bold text-purple-400">{totalFrames.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Frames Analyzed</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by athlete or kick type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/5 border border-gray-700"
          >
            <option value="all">All Scores</option>
            <option value="high">High (85+)</option>
            <option value="medium">Medium (70-84)</option>
            <option value="low">Low (&lt;70)</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/5 border border-gray-700"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="athlete">Sort by Athlete</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Sessions ({filteredSessions.length})
          </h3>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
            <Download size={18} />
            Export All
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No sessions found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(session.overallScore)}`}>
                    <span className={`text-lg font-bold ${getScoreColor(session.overallScore)}`}>
                      {session.overallScore}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{session.athlete}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {session.date} {session.time}
                      </span>
                      <span>{session.kickType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-400 hidden md:block">
                    <div>{session.duration}</div>
                    <div>{session.frames} frames</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 hover:bg-white/10 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={18} className="text-gray-400 hover:text-joc-gold" />
                    </button>
                    <button
                      className="p-2 hover:bg-white/10 rounded-lg"
                      title="Download"
                    >
                      <Download size={18} className="text-gray-400 hover:text-joc-gold" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 hover:bg-white/10 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity by Athlete */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Sessions by Athlete</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...new Set(allSessions.map(s => s.athlete))].map((athlete) => {
            const athleteSessions = allSessions.filter(s => s.athlete === athlete);
            const avgAthleteScore = athleteSessions.reduce((acc, s) => acc + s.overallScore, 0) / athleteSessions.length;
            return (
              <div key={athlete} className="p-4 bg-white/5 rounded-lg">
                <div className="font-medium text-white mb-2">{athlete}</div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{athleteSessions.length} sessions</span>
                  <span className={getScoreColor(avgAthleteScore)}>
                    Avg: {avgAthleteScore.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-joc-gold rounded-full"
                    style={{ width: `${avgAthleteScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Export to CSV
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Generate Summary Report
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Compare Sessions
          </button>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
            Clear Old Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryTab;
