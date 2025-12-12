import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, FileText, Download, Calendar, BarChart, ChevronRight,
  Award, Target, Clock, ArrowRight, Info, LineChart as LineChartIcon,
  FileSpreadsheet, FileJson, Check
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { analysisService } from '../services/supabaseClient';

const ProgressReportsTab = ({ sessions, setSessions, athletes, setAthletes, analysisData }) => {
  const [activeView, setActiveView] = useState('progress');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [reportType, setReportType] = useState('progress');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [reportSections, setReportSections] = useState({
    metrics: true,
    history: true,
    charts: true,
    recommendations: true,
  });

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
    { id: 'overall', name: 'Overall Score', color: '#D4AF37', icon: Award },
    { id: 'form', name: 'Form Score', color: '#10B981', icon: Target },
    { id: 'power', name: 'Power Score', color: '#3B82F6', icon: TrendingUp },
    { id: 'balance', name: 'Balance Score', color: '#8B5CF6', icon: Clock },
  ];

  const reportTypes = [
    { id: 'individual', name: 'Individual Analysis', icon: Target, description: 'Detailed single session report', color: 'blue' },
    { id: 'progress', name: 'Progress Report', icon: TrendingUp, description: 'Track improvement over time', color: 'emerald' },
    { id: 'summary', name: 'Summary Report', icon: BarChart, description: 'Overview of all sessions', color: 'amber' },
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
    await new Promise(resolve => setTimeout(resolve, 1500));

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>JOC Taekwondo Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #fff;
      min-height: 100vh;
      padding: 40px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
    }
    .logo-container { display: flex; align-items: center; gap: 20px; }
    .logo {
      width: 70px; height: 70px;
      background: linear-gradient(135deg, #D4AF37, #F59E0B);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 22px; color: #1a1a2e;
    }
    .header-title { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #D4AF37, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header-subtitle { color: rgba(255,255,255,0.6); margin-top: 5px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
    .metric-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }
    .metric-value { font-size: 36px; font-weight: bold; color: #D4AF37; }
    .metric-label { color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 8px; }
    .section {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
      margin: 20px 0;
    }
    .section-title {
      font-size: 18px; font-weight: bold; color: #fff;
      padding-left: 12px;
      border-left: 3px solid #D4AF37;
      margin-bottom: 20px;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
    th { color: rgba(255,255,255,0.5); font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { color: #fff; }
    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
    }
    .score-high { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .score-medium { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
    .score-low { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
    .footer {
      text-align: center;
      padding: 30px;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
    }
    .footer-logo { color: #D4AF37; font-weight: bold; }
    @media print {
      body { background: #fff; color: #333; }
      .metric-card { border: 1px solid #ddd; }
      .section { border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <div class="logo">JOC</div>
        <div>
          <div class="header-title">Taekwondo Analyzer Pro</div>
          <div class="header-subtitle">Jordan Olympic Committee - Performance Report</div>
        </div>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${sessions?.length || 0}</div>
        <div class="metric-label">Total Sessions</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${avgScore.toFixed(0)}%</div>
        <div class="metric-label">Average Score</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${bestScore}%</div>
        <div class="metric-label">Best Score</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: ${improvement >= 0 ? '#10B981' : '#EF4444'}">${improvement >= 0 ? '+' : ''}${improvement.toFixed(0)}%</div>
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
          ${(sessions || []).slice(-10).reverse().map(s => {
            const scoreClass = s.overallScore >= 80 ? 'score-high' : s.overallScore >= 60 ? 'score-medium' : 'score-low';
            return `
              <tr>
                <td>${s.date || 'N/A'}</td>
                <td style="text-transform: capitalize;">${(s.kickType || 'N/A').replace(/_/g, ' ')}</td>
                <td><span class="score-badge ${scoreClass}">${s.overallScore || 0}%</span></td>
                <td>${s.formScore || 0}%</td>
                <td>${s.powerScore || 0}%</td>
                <td>${s.balanceScore || 0}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p><span class="footer-logo">JOC Taekwondo Analyzer Pro</span></p>
      <p style="margin-top: 8px;">Powered by QUALIA SOLUTIONS for Jordan Olympic Committee</p>
      <p style="margin-top: 4px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JOC_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setRecentReports(prev => [{
      id: Date.now(),
      name: `${reportTypes.find(r => r.id === reportType)?.name} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      type: reportType,
    }, ...prev.slice(0, 4)]);

    setGenerating(false);
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f0f18] border border-joc-gold/30 rounded-xl p-4 shadow-2xl">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl">
              <TrendingUp size={26} className="text-white" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Progress & Reports</h2>
            <p className="text-gray-400">Track improvement and generate JOC reports</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5">
          {[
            { id: 'progress', label: 'Progress', icon: BarChart },
            { id: 'reports', label: 'Reports', icon: FileText },
          ].map((view) => (
            <motion.button
              key={view.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-joc-gold to-amber-500 text-[#0a0a12] shadow-lg shadow-joc-gold/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <view.icon size={18} />
              {view.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeView === 'progress' ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {!hasSessions ? (
              /* Premium Empty State */
              <div className="flex flex-col items-center justify-center min-h-[500px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative mx-auto mb-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/20 rounded-3xl blur-2xl" />
                    <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10 flex items-center justify-center">
                      <LineChartIcon size={50} className="text-emerald-400/50" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Session History Yet</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Analyze videos in the Video Analysis tab to build your progress history. Each analysis will be automatically tracked here.
                  </p>

                  {/* Steps */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { step: 1, title: 'Analyze Videos', icon: Target },
                      { step: 2, title: 'Build History', icon: BarChart },
                      { step: 3, title: 'Track Progress', icon: TrendingUp },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-xl bg-joc-gold/10 flex items-center justify-center mx-auto mb-3">
                          <item.icon size={20} className="text-joc-gold" />
                        </div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-8 text-sm text-joc-gold">
                    <Info size={16} />
                    <span>Go to Video Analysis tab to get started</span>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Sessions', value: sessions.length, icon: Award, color: 'joc-gold' },
                    { label: 'Average Score', value: `${avgScore.toFixed(0)}%`, icon: Target, color: 'emerald-400' },
                    { label: 'Best Score', value: `${bestScore}%`, icon: TrendingUp, color: 'blue-400' },
                    { label: 'Improvement', value: `${improvement >= 0 ? '+' : ''}${improvement.toFixed(0)}%`, icon: Clock, color: improvement >= 0 ? 'emerald-400' : 'red-400' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`p-5 rounded-2xl bg-gradient-to-br ${
                        stat.color === 'joc-gold' ? 'from-joc-gold/10 to-amber-500/5 border-joc-gold/20' : 'from-white/5 to-white/[0.02] border-white/10'
                      } border transition-all`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">{stat.label}</span>
                        <div className={`p-2 rounded-lg ${stat.color === 'joc-gold' ? 'bg-joc-gold/10' : `bg-${stat.color}/10`}`}>
                          <stat.icon size={16} className={`text-${stat.color}`} />
                        </div>
                      </div>
                      <div className={`text-4xl font-black text-${stat.color}`}>{stat.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Metric Selector */}
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric, idx) => (
                    <motion.button
                      key={metric.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedMetric === metric.id
                          ? 'bg-gradient-to-r from-joc-gold to-amber-500 text-[#0a0a12] shadow-lg shadow-joc-gold/20'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                      }`}
                    >
                      <metric.icon size={16} />
                      {metric.name}
                    </motion.button>
                  ))}
                </div>

                {/* Progress Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-joc-gold/10 flex items-center justify-center">
                      <LineChartIcon size={20} className="text-joc-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {metrics.find(m => m.id === selectedMetric)?.name} Over Time
                      </h3>
                      <p className="text-sm text-gray-500">Track your improvement across sessions</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={metrics.find(m => m.id === selectedMetric)?.color}
                        fill="url(#progressGradient)"
                        strokeWidth={3}
                        name={metrics.find(m => m.id === selectedMetric)?.name}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Recent Sessions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Calendar size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Recent Sessions</h3>
                      <p className="text-sm text-gray-500">Your latest analysis results</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {progressData.slice(-5).reverse().map((session, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-joc-gold/10 flex items-center justify-center">
                            <Calendar size={22} className="text-joc-gold" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{session.date}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>Form: {session.form}%</span>
                              <span>Power: {session.power}%</span>
                              <span>Balance: {session.balance}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-joc-gold">{session.overall}%</div>
                          <div className="text-xs text-gray-500">Overall</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          /* Reports View */
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Report Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-joc-gold/10 flex items-center justify-center">
                  <FileText size={20} className="text-joc-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generate Report</h3>
                  <p className="text-sm text-gray-500">Choose report type and customize</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportTypes.map((type, idx) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReportType(type.id)}
                    className={`relative p-6 rounded-2xl text-left transition-all overflow-hidden ${
                      reportType === type.id
                        ? `bg-gradient-to-br from-${type.color}-500/20 to-${type.color}-500/5 border-2 border-${type.color}-500/50 shadow-lg shadow-${type.color}-500/20`
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {reportType === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4"
                      >
                        <div className={`w-6 h-6 rounded-full bg-${type.color}-500 flex items-center justify-center`}>
                          <Check size={14} className="text-white" />
                        </div>
                      </motion.div>
                    )}
                    <div className={`w-12 h-12 rounded-xl ${reportType === type.id ? `bg-${type.color}-500/20` : 'bg-white/5'} flex items-center justify-center mb-4`}>
                      <type.icon size={24} className={reportType === type.id ? `text-${type.color}-400` : 'text-gray-400'} />
                    </div>
                    <h4 className={`font-bold mb-1 ${reportType === type.id ? `text-${type.color}-400` : 'text-white'}`}>
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Report Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-6">Report Options</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-joc-gold focus:outline-none transition-all"
                    >
                      <option value="session">Single Session</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Include Sections</label>
                    <div className="space-y-2">
                      {[
                        { id: 'metrics', label: 'Performance Metrics' },
                        { id: 'history', label: 'Session History' },
                        { id: 'charts', label: 'Progress Charts' },
                        { id: 'recommendations', label: 'Recommendations' },
                      ].map((section) => (
                        <label
                          key={section.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={reportSections[section.id]}
                            onChange={(e) => setReportSections(prev => ({ ...prev, [section.id]: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-600 text-joc-gold focus:ring-joc-gold"
                          />
                          <span className="text-sm text-gray-300">{section.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-6">Report Preview</h3>
                <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl p-5 text-gray-900">
                  <div className="flex items-center justify-between border-b-2 border-joc-gold pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">JOC Taekwondo Analyzer</h4>
                      <p className="text-xs text-gray-500">Jordan Olympic Committee</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-joc-gold to-amber-500 flex items-center justify-center text-gray-900 font-bold text-sm shadow-lg">
                      JOC
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Report Type', value: reportTypes.find(r => r.id === reportType)?.name },
                      { label: 'Sessions', value: sessions?.length || 0 },
                      { label: 'Average Score', value: `${avgScore.toFixed(0)}%` },
                      { label: 'Generated', value: new Date().toLocaleDateString() },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-500">{item.label}:</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-400 text-center">
                    Generated by QUALIA SOLUTIONS for JOC
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Generate Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateReport}
              disabled={generating}
              className="relative w-full py-5 rounded-2xl font-bold text-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-joc-gold via-yellow-400 to-amber-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-joc-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-3 text-[#0a0a12]">
                {generating ? (
                  <>
                    <div className="w-6 h-6 border-3 border-[#0a0a12] border-t-transparent rounded-full animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    Generate & Download Report
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>

            {/* Export Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Download size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Export Raw Data</h3>
                  <p className="text-sm text-gray-500">Download your data in different formats</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { format: 'csv', icon: FileSpreadsheet, label: 'CSV Spreadsheet', color: 'emerald' },
                  { format: 'json', icon: FileJson, label: 'JSON Data', color: 'blue' },
                ].map((item) => (
                  <motion.button
                    key={item.format}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportData(item.format)}
                    className={`p-5 rounded-2xl bg-white/5 hover:bg-${item.color}-500/10 border border-white/10 hover:border-${item.color}-500/30 transition-all group`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-3 group-hover:bg-${item.color}-500/20 transition-colors`}>
                      <item.icon size={24} className={`text-${item.color}-400`} />
                    </div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">.{item.format} format</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#0f0f18] to-[#080810] border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-6">Recent Reports</h3>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-joc-gold/10 flex items-center justify-center">
                          <FileText size={22} className="text-joc-gold" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{report.name}</p>
                          <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressReportsTab;
