import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User, ChevronDown, Printer, Share2 } from 'lucide-react';

const ReportsTab = ({ analysisData }) => {
  const [reportType, setReportType] = useState('individual');
  const [dateRange, setDateRange] = useState('week');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'individual', name: 'Individual Analysis', description: 'Detailed report for a single session' },
    { id: 'progress', name: 'Progress Report', description: 'Track improvement over time' },
    { id: 'team', name: 'Team Summary', description: 'Overview of all team members' },
    { id: 'competition', name: 'Competition Prep', description: 'Pre-competition readiness report' },
  ];

  const recentReports = [
    { id: 1, name: 'Ahmad Al-Hussein - Weekly Progress', date: '2024-12-08', type: 'progress' },
    { id: 2, name: 'Team Performance Summary - December', date: '2024-12-05', type: 'team' },
    { id: 3, name: 'Sara Mohammad - Session Analysis', date: '2024-12-03', type: 'individual' },
    { id: 4, name: 'Competition Readiness - Asian Games', date: '2024-12-01', type: 'competition' },
  ];

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      // In production, this would trigger actual PDF generation
      alert('Report generated successfully! In production, this would download a PDF.');
    }, 2000);
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'progress': return '📈';
      case 'team': return '👥';
      case 'individual': return '🎯';
      case 'competition': return '🏆';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-joc-gold" size={28} />
        <h2 className="text-2xl font-bold text-white">Reports & Export</h2>
      </div>

      {/* Report Type Selection */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Generate New Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReportType(type.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                reportType === type.id
                  ? 'bg-joc-gold/20 border-2 border-joc-gold'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{getReportIcon(type.id)}</div>
              <h4 className={`font-semibold ${reportType === type.id ? 'text-joc-gold' : 'text-white'}`}>
                {type.name}
              </h4>
              <p className="text-sm text-gray-400 mt-1">{type.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Report Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full"
              >
                <option value="session">Single Session</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Athlete (Optional)</label>
              <select className="w-full">
                <option value="">All Athletes</option>
                <option value="1">Ahmad Al-Hussein</option>
                <option value="2">Sara Mohammad</option>
                <option value="3">Omar Khalid</option>
                <option value="4">Layla Nasser</option>
                <option value="5">Yousef Tariq</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Include Sections</label>
              <div className="space-y-2">
                {['Performance Metrics', 'Biomechanical Analysis', 'Injury Risk Assessment', 'Recommendations', 'Progress Charts'].map((section) => (
                  <label key={section} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-600" />
                    <span className="text-sm text-gray-300">{section}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <div className="bg-white rounded-lg p-4 text-gray-900 min-h-[300px]">
            {/* JOC Header */}
            <div className="border-b-2 border-joc-gold pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-joc-dark">JOC Taekwondo Analyzer</h4>
                  <p className="text-sm text-gray-500">Jordan Olympic Committee</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-joc-gold to-yellow-300 flex items-center justify-center">
                  <span className="font-bold text-joc-dark">JOC</span>
                </div>
              </div>
            </div>

            {/* Report Content Preview */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Report Type:</span>
                <span className="font-medium">{reportTypes.find(r => r.id === reportType)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date Range:</span>
                <span className="font-medium">{dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Generated:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>

              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">Sample Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Overall Score: <strong>85%</strong></div>
                  <div>Sessions: <strong>12</strong></div>
                  <div>Improvement: <strong>+12%</strong></div>
                  <div>Risk Level: <strong>Low</strong></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t text-xs text-gray-400 text-center">
              Generated by QUALIA SOLUTIONS for JOC
            </div>
          </div>
        </div>
      </div>

      {/* Generate Buttons */}
      <div className="flex flex-wrap gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateReport}
          disabled={generating}
          className="btn-gold flex items-center gap-2 px-8 py-4"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-joc-dark border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={20} />
              Generate PDF Report
            </>
          )}
        </motion.button>
        <button className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
          <Printer size={20} />
          Print Preview
        </button>
        <button className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors">
          <Share2 size={20} />
          Share Report
        </button>
      </div>

      {/* Recent Reports */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getReportIcon(report.type)}</span>
                <div>
                  <h4 className="font-medium text-white">{report.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    {report.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg" title="Download">
                  <Download size={18} className="text-gray-400 hover:text-joc-gold" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg" title="Share">
                  <Share2 size={18} className="text-gray-400 hover:text-joc-gold" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Excel (.xlsx)</div>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📄</div>
            <div className="font-medium">CSV</div>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">JSON</div>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="font-medium">Images</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
