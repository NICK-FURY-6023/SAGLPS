import { useState, useEffect } from 'react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/api';

export default function TemplateManager({ mode, labels, onLoad, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTemplates();
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch {
      setError('Could not load templates. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const existing = templates.find((t) => t.name === newName.trim());
      if (existing) {
        await updateTemplate(existing.id, newName.trim(), labels);
      } else {
        await createTemplate(newName.trim(), labels);
      }
      await loadTemplates();
      setNewName('');
    } catch {
      setError('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteTemplate(id);
      setTemplates((ts) => ts.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete template.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {mode === 'save' ? '💾 Save Template' : '📂 Load Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Save new template */}
          {mode === 'save' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. Festival Sale Labels"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !newName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? '…' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                If a template with this name exists, it will be overwritten.
              </p>
            </div>
          )}

          {/* Template list */}
          <div>
            {mode === 'load' && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Saved Templates
              </h3>
            )}
            {mode === 'save' && templates.length > 0 && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Existing Templates
              </h3>
            )}

            {loading ? (
              <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No templates saved yet.</p>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                      {t.createdAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {mode === 'load' && (
                        <button
                          onClick={() => onLoad(t)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Load
                        </button>
                      )}
                      {mode === 'save' && (
                        <button
                          onClick={() => {
                            setNewName(t.name);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          Use name
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-2 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 text-xs rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
