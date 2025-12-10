import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Lock, Palette, Globe, Save, RefreshCw } from 'lucide-react';

const SettingsTab = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Coach Ahmad',
      email: 'coach@joc.jo',
      organization: 'Jordan Olympic Committee',
      role: 'Head Coach',
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      units: 'metric',
      autoAnalyze: true,
      showSkeleton: true,
      slowMotionDefault: 0.5,
    },
    notifications: {
      emailReports: true,
      sessionReminders: true,
      progressAlerts: true,
      injuryWarnings: true,
    },
    analysis: {
      defaultKickType: 'dollyo_chagi',
      confidenceThreshold: 0.7,
      frameSkip: 2,
      poseModel: 'full',
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (category, key, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Settings</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`btn-gold flex items-center gap-2 ${saved ? 'bg-green-500' : ''}`}
        >
          {saved ? (
            <>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.span>
              Saved!
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-joc-gold" />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Organization</label>
              <input
                type="text"
                value={settings.profile.organization}
                onChange={(e) => updateSetting('profile', 'organization', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                value={settings.profile.role}
                onChange={(e) => updateSetting('profile', 'role', e.target.value)}
                className="w-full"
              >
                <option value="Head Coach">Head Coach</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Athlete">Athlete</option>
                <option value="Analyst">Sports Analyst</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Palette size={20} className="text-joc-gold" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                className="w-full"
              >
                <option value="dark">Dark (JOC Gold)</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Language</label>
              <select
                value={settings.preferences.language}
                onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                className="w-full"
              >
                <option value="en">English</option>
                <option value="ar">Arabic (العربية)</option>
                <option value="ko">Korean (한국어)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Units</label>
              <select
                value={settings.preferences.units}
                onChange={(e) => updateSetting('preferences', 'units', e.target.value)}
                className="w-full"
              >
                <option value="metric">Metric (kg, m)</option>
                <option value="imperial">Imperial (lb, ft)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Slow Motion Speed</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.preferences.slowMotionDefault}
                onChange={(e) => updateSetting('preferences', 'slowMotionDefault', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{settings.preferences.slowMotionDefault}x</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={20} className="text-joc-gold" />
            Notifications
          </h3>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">
                  {key === 'emailReports' && 'Email Reports'}
                  {key === 'sessionReminders' && 'Session Reminders'}
                  {key === 'progressAlerts' && 'Progress Alerts'}
                  {key === 'injuryWarnings' && 'Injury Warnings'}
                </span>
                <div
                  onClick={() => updateSetting('notifications', key, !value)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                    value ? 'bg-joc-gold' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all transform mt-0.5 ${
                      value ? 'ml-6' : 'ml-0.5'
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Analysis Settings */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw size={20} className="text-joc-gold" />
            Analysis Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Kick Type</label>
              <select
                value={settings.analysis.defaultKickType}
                onChange={(e) => updateSetting('analysis', 'defaultKickType', e.target.value)}
                className="w-full"
              >
                <option value="dollyo_chagi">Dollyo Chagi (Roundhouse)</option>
                <option value="yeop_chagi">Yeop Chagi (Side Kick)</option>
                <option value="ap_chagi">Ap Chagi (Front Kick)</option>
                <option value="dwi_chagi">Dwi Chagi (Back Kick)</option>
                <option value="naeryo_chagi">Naeryo Chagi (Axe Kick)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Pose Confidence Threshold: {settings.analysis.confidenceThreshold}
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={settings.analysis.confidenceThreshold}
                onChange={(e) => updateSetting('analysis', 'confidenceThreshold', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Pose Model</label>
              <select
                value={settings.analysis.poseModel}
                onChange={(e) => updateSetting('analysis', 'poseModel', e.target.value)}
                className="w-full"
              >
                <option value="lite">Lite (Faster, less accurate)</option>
                <option value="full">Full (Balanced)</option>
                <option value="heavy">Heavy (Most accurate)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Show Skeleton Overlay</span>
              <div
                onClick={() => updateSetting('preferences', 'showSkeleton', !settings.preferences.showSkeleton)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.preferences.showSkeleton ? 'bg-joc-gold' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all transform mt-0.5 ${
                    settings.preferences.showSkeleton ? 'ml-6' : 'ml-0.5'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Auto-Analyze on Upload</span>
              <div
                onClick={() => updateSetting('preferences', 'autoAnalyze', !settings.preferences.autoAnalyze)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                  settings.preferences.autoAnalyze ? 'bg-joc-gold' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all transform mt-0.5 ${
                    settings.preferences.autoAnalyze ? 'ml-6' : 'ml-0.5'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">About JOC Taekwondo Analyzer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Version:</strong> 2.0.0 (React)</p>
            <p><strong className="text-white">Built by:</strong> QUALIA SOLUTIONS</p>
            <p><strong className="text-white">For:</strong> Jordan Olympic Committee</p>
            <p><strong className="text-white">Powered by:</strong> MediaPipe Pose Detection</p>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI-Powered Pose Detection</li>
              <li>Biomechanical Analysis</li>
              <li>Injury Prevention System</li>
              <li>WT Scoring Simulation</li>
              <li>Team Management</li>
              <li>Progress Tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-4 border-2 border-red-500/30">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Danger Zone
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
            Clear All Data
          </button>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
            Reset to Defaults
          </button>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
            Export All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
