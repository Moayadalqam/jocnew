import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, FileText, Download, Calendar, User, Printer,
  Share2, BarChart, ChevronRight, Award, Target, Clock,
  Plus, Trash2, Edit3
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { analysisService } from '../services/supabaseClient';

const ProgressReportsTab = ({ sessions, setSessions, athletes, setAthletes, analysisData }) => {
  const [activeView, setActiveView] = useState('progress');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [reportType, setReportType] = useState('individual');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);
  const [newAthleteName, setNewAthleteName] = useState('');
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = async () => {
      const { data } = await analysisService.getRecent(20);
      if (data && data.length > 0 && (!sessions || sessions.length === 0)) {
        setSessions(data);
      }
    };
    loadSessions();
  }, []);

  const metrics = [
    { id: 'overall', name: 'Overall Score', color: '#D4AF37' },
    { id: 'form', name: 'Form Score', color: '#10B981' },
    { id: 'power', name: 'Power Score', color: '#3B82F6' },
    { id: 'balance', name: 'Balance Score', color: '#8B5CF6' },
  ];

  const reportTypes = [
    { id: 'individual', name: 'Individual Analysis', icon: '🎯', description: 'Detailed single session report' },
    { id: 'progress', name: 'Progress Report', icon: '📈', description: 'Track improvement over time' },
    { id: 'summary', name: 'Summary Report', icon: '📊', description: 'Overview of all sessions' },
  ];

  const hasSessions = sessions && sessions.length > 0;

  // Build progress data from sessions
  const progressData = hasSessions
    ? sessions.map((session, idx) => ({
        date: session.date || `Session ${idx + 1}`,
        overall: session.overallScore || 0,
        form: session.formScore || 0,
        power: session.powerScore || 0,
        balance: session.balanceScore || 0,
      }))
    : [];

  // Calculate statistics
  const latestSession = progressData.length > 0 ? progressData[progressData.length - 1] : null;
  const avgScore = progressData.length > 0
    ? progressData.reduce((acc, s) => acc + s.overall, 0) / progressData.length
    : 0;
  const improvement = progressData.length > 1
    ? progressData[progressData.length - 1].overall - progressData[0].overall
    : 0;
  const bestScore = progressData.length > 0
    ? Math.max(...progressData.map(s => s.overall))
    : 0;

  const generateReport = async () => {
    setGenerating(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create report content
    const reportContent = {
      title: `JOC Taekwondo Analysis Report`,
      type: reportType,
      dateRange: dateRange,
      generatedAt: new Date().toISOString(),
      sessions: sessions?.length || 0,
      averageScore: avgScore.toFixed(1),
      latestScore: latestSession?.overall || 0,
      improvement: improvement.toFixed(1),
    };

    // Create downloadable HTML report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>JOC Taekwondo Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { display: flex; align-items: center; gap: 20px; }
    .logo-circle { width: 60px; height: 60px; background: linear-gradient(135deg, #D4AF37, #F59E0B); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1a1a2e; font-size: 18px; }
    h1 { color: #1a1a2e; margin: 0; }
    .subtitle { color: #666; margin-top: 5px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
    .metric { background: #f5f5f5; padding: 20px; border-radius: 12px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: bold; color: #D4AF37; }
    .metric-label { color: #666; font-size: 14px; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1a1a2e; margin-bottom: 15px; border-left: 4px solid #D4AF37; padding-left: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-circle">JOC</div>
      <div>
        <h1>Taekwondo Analyzer Pro</h1>
        <p class="subtitle">Jordan Olympic Committee - Performance Report</p>
      </div>
    </div>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${sessions?.length || 0}</div>
      <div class="metric-label">Total Sessions</div>
    </div>
    <div class="metric">
      <div class="metric-value">${avgScore.toFixed(0)}%</div>
      <div class="metric-label">Average Score</div>
    </div>
    <div class="metric">
      <div class="metric-value">${latestSession?.overall || 0}%</div>
      <div class="metric-label">Latest Score</div>
    </div>
    <div class="metric">
      <div class="metric-value">${improvement >= 0 ? '+' : ''}${improvement.toFixed(0)}%</div>
      <div class="metric-label">Improvement</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Session History</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Kick Type</th>
          <th>Overall</th>
          <th>Form</th>
          <th>Power</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        ${(sessions || []).slice(-10).map(s => `
          <tr>
            <td>${s.date || 'N/A'}</td>
            <td>${(s.kickType || 'N/A').replace(/_/g, ' ')}</td>
            <td>${s.overallScore || 0}%</td>
            <td>${s.formScore || 0}%</td>
            <td>${s.powerScore || 0}%</td>
            <td>${s.balanceScore || 0}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by JOC Taekwondo Analyzer Pro</p>
    <p>Powered by QUALIA SOLUTIONS for Jordan Olympic Committee</p>
    <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  </div>
</body>
</html>`;

    // Download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JOC_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Add to recent reports
    setRecentReports(prev => [{
      id: Date.now(),
      name: `${reportTypes.find(r => r.id === reportType)?.name} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      type: reportType,
    }, ...prev.slice(0, 4)]);

    setGenerating(false);
  };

  const addAthlete = () => {
    if (newAthleteName.trim()) {
      setAthletes(prev => [...prev, {
        id: Date.now(),
        name: newAthleteName.trim(),
        sessions: 0,
        avgScore: 0,
        createdAt: new Date().toISOString(),
      }]);
      setNewAthleteName('');
      setShowAddAthlete(false);
    }
  };

  const removeAthlete = (id) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
  };

  const exportData = (format) => {
    const data = sessions || [];
    let content, filename, type;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'joc_sessions.json';
      type = 'application/json';
    } else if (format === 'csv') {
      const headers = ['Date', 'Kick Type', 'Overall', 'Form', 'Power', 'Balance'];
      const rows = data.map(s => [
        s.date || '',
        s.kickType || '',
        s.overallScore || 0,
        s.formScore || 0,
        s.powerScore || 0,
        s.balanceScore || 0,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = 'joc_sessions.csv';
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Progress & Reports</h2>
            <p className="text-sm text-gray-400">Track improvement and generate reports</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveView('progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'progress'
                ? 'bg-joc-gold text-joc-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart size={16} />
              Progress
            </span>
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'reports'
                ? 'bg-joc-gold text-joc-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} />
              Reports
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'progress' ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {!hasSessions ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-joc-gold/20 to-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart size={40} className="text-joc-gold/50" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Session History</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  Analyze videos in the Video Analysis tab to build your progress history. Each analysis will be tracked here.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {['Analyze Videos', 'Build History', 'Track Progress'].map((step, idx) => (
                    <div key={step} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-joc-gold/20 flex items-center justify-center mx-auto mb-3 text-joc-gold font-bold">
                        {idx + 1}
                      </div>
                      <p className="font-medium text-white">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-joc-gold/10 to-amber-500/5 border border-joc-gold/20"
                  >
                    <div className="text-3xl font-bold text-joc-gold">{sessions.length}</div>
                    <div className="text-sm text-gray-400">Total Sessions</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="text-3xl font-bold text-green-400">{avgScore.toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="text-3xl font-bold text-blue-400">{latestSession?.overall || 0}%</div>
                    <div className="text-sm text-gray-400">Latest Score</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {improvement >= 0 ? '+' : ''}{improvement.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Improvement</div>
                  </motion.div>
                </div>

                {/* Metric Selector */}
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedMetric === metric.id
                          ? 'bg-joc-gold text-joc-dark'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {metric.name}
                    </button>
                  ))}
                </div>

                {/* Progress Chart */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {metrics.find(m => m.id === selectedMetric)?.name} Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} />
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

                {/* Recent Sessions */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
                  <div className="space-y-2">
                    {progressData.slice(-5).reverse().map((session, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-joc-gold/10 flex items-center justify-center">
                            <Calendar size={18} className="text-joc-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{session.date}</p>
                            <p className="text-xs text-gray-500">
                              Form: {session.form}% | Power: {session.power}% | Balance: {session.balance}%
                            </p>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-joc-gold">{session.overall}%</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Report Type Selection */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Generate Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      reportType === type.id
                        ? 'bg-gradient-to-br from-joc-gold/20 to-amber-500/10 border-2 border-joc-gold'
                        : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <h4 className={`font-semibold ${reportType === type.id ? 'text-joc-gold' : 'text-white'}`}>
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Report Options & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-lg font-semibold text-white">Report Options</h3>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-joc-gold focus:outline-none"
                  >
                    <option value="session">Single Session</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Include Sections</label>
                  <div className="space-y-2">
                    {['Performance Metrics', 'Session History', 'Progress Charts', 'Recommendations'].map((section) => (
                      <label key={section} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-gray-600 text-joc-gold focus:ring-joc-gold" />
                        <span className="text-sm text-gray-300">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                <div className="bg-white rounded-xl p-4 text-gray-900">
                  <div className="flex items-center justify-between border-b-2 border-joc-gold pb-3 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-joc-dark">JOC Taekwondo Analyzer</h4>
                      <p className="text-xs text-gray-500">Jordan Olympic Committee</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-joc-gold to-amber-500 flex items-center justify-center text-joc-dark font-bold text-sm">
                      JOC
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Report Type:</span>
                      <span className="font-medium">{reportTypes.find(r => r.id === reportType)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sessions:</span>
                      <span className="font-medium">{sessions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average Score:</span>
                      <span className="font-medium">{avgScore.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Generated:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t text-xs text-gray-400 text-center">
                    Generated by QUALIA SOLUTIONS for JOC
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateReport}
                disabled={generating}
                className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-joc-gold via-yellow-500 to-amber-500 text-joc-dark shadow-lg shadow-joc-gold/20 flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-joc-dark border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Generate HTML Report
                  </>
                )}
              </motion.button>
            </div>

            {/* Export Data */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => exportData('csv')}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-all"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-white">CSV</div>
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-all"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium text-white">JSON</div>
                </button>
              </div>
            </div>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
                <div className="space-y-2">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{reportTypes.find(r => r.id === report.type)?.icon}</div>
                        <div>
                          <p className="font-medium text-white">{report.name}</p>
                          <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressReportsTab;
