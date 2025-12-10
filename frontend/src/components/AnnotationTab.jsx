import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Trash2, Edit, Check, X, MessageSquare, Clock } from 'lucide-react';

const AnnotationTab = ({ analysisData }) => {
  const [annotations, setAnnotations] = useState([
    {
      id: 1,
      frame: 15,
      time: '0:00.5',
      type: 'technique',
      title: 'Excellent Chamber',
      content: 'Perfect knee lift height and hip positioning during chamber phase.',
      color: '#10B981',
    },
    {
      id: 2,
      frame: 25,
      time: '0:00.8',
      type: 'correction',
      title: 'Support Leg Bend',
      content: 'Support leg showing slight bend - focus on maintaining straight leg for better balance.',
      color: '#F59E0B',
    },
    {
      id: 3,
      frame: 35,
      time: '0:01.2',
      type: 'highlight',
      title: 'Peak Extension',
      content: 'Maximum kick height achieved with good form. Hip rotation engaged.',
      color: '#3B82F6',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAnnotation, setNewAnnotation] = useState({
    frame: '',
    type: 'technique',
    title: '',
    content: '',
  });

  const annotationTypes = [
    { id: 'technique', name: 'Technique Note', color: '#10B981', icon: '✓' },
    { id: 'correction', name: 'Correction Needed', color: '#F59E0B', icon: '!' },
    { id: 'highlight', name: 'Highlight', color: '#3B82F6', icon: '★' },
    { id: 'question', name: 'Question', color: '#8B5CF6', icon: '?' },
  ];

  const handleAddAnnotation = () => {
    if (newAnnotation.title && newAnnotation.frame) {
      const type = annotationTypes.find(t => t.id === newAnnotation.type);
      setAnnotations([
        ...annotations,
        {
          id: Date.now(),
          frame: parseInt(newAnnotation.frame),
          time: `0:${(parseInt(newAnnotation.frame) / 30).toFixed(2)}`,
          type: newAnnotation.type,
          title: newAnnotation.title,
          content: newAnnotation.content,
          color: type?.color || '#D4AF37',
        },
      ]);
      setNewAnnotation({ frame: '', type: 'technique', title: '', content: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleUpdateAnnotation = (id, updates) => {
    setAnnotations(annotations.map(a =>
      a.id === id ? { ...a, ...updates } : a
    ));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="text-joc-gold" size={28} />
          <h2 className="text-2xl font-bold text-white">Video Annotations</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={20} />
          Add Annotation
        </motion.button>
      </div>

      {/* Annotation Types Legend */}
      <div className="flex flex-wrap gap-4">
        {annotationTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${type.color}20` }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: type.color }}
            />
            <span className="text-sm" style={{ color: type.color }}>
              {type.name}
            </span>
          </div>
        ))}
      </div>

      {/* Annotations Timeline */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Annotations Timeline</h3>

        {annotations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No annotations yet</p>
            <p className="text-sm">Add annotations to mark important moments in the video</p>
          </div>
        ) : (
          <div className="space-y-4">
            {annotations.sort((a, b) => a.frame - b.frame).map((annotation, idx) => (
              <motion.div
                key={annotation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8 border-l-2"
                style={{ borderColor: annotation.color }}
              >
                {/* Timeline Dot */}
                <div
                  className="absolute left-[-9px] top-0 w-4 h-4 rounded-full"
                  style={{ backgroundColor: annotation.color }}
                />

                <div className="glass-card p-4 ml-4">
                  {editingId === annotation.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={annotation.title}
                        onChange={(e) => handleUpdateAnnotation(annotation.id, { title: e.target.value })}
                        className="w-full"
                        placeholder="Title"
                      />
                      <textarea
                        value={annotation.content}
                        onChange={(e) => handleUpdateAnnotation(annotation.id, { content: e.target.value })}
                        className="w-full"
                        rows={2}
                        placeholder="Content"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded flex items-center gap-1"
                        >
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded flex items-center gap-1"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `${annotation.color}20`,
                                color: annotation.color,
                              }}
                            >
                              {annotationTypes.find(t => t.id === annotation.type)?.name}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {annotation.time} (Frame {annotation.frame})
                            </span>
                          </div>
                          <h4 className="font-semibold text-white">{annotation.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{annotation.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(annotation.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Edit size={16} className="text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnotation(annotation.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Frame Summary */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Annotation Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {annotationTypes.map((type) => {
            const count = annotations.filter(a => a.type === type.id).length;
            return (
              <div key={type.id} className="metric-card">
                <div className="text-3xl font-bold" style={{ color: type.color }}>
                  {count}
                </div>
                <div className="text-sm text-gray-400">{type.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Annotation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Annotation</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Frame Number</label>
                <input
                  type="number"
                  value={newAnnotation.frame}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, frame: e.target.value })}
                  className="w-full"
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Annotation Type</label>
                <select
                  value={newAnnotation.type}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, type: e.target.value })}
                  className="w-full"
                >
                  {annotationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newAnnotation.title}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, title: e.target.value })}
                  className="w-full"
                  placeholder="Brief title for the annotation"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, content: e.target.value })}
                  className="w-full"
                  rows={3}
                  placeholder="Detailed notes about this moment..."
                />
              </div>
              <button
                onClick={handleAddAnnotation}
                className="w-full btn-gold py-3"
              >
                Add Annotation
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Export Options */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Export Annotations</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Export as JSON
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Export as CSV
          </button>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            Include in Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationTab;