import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import LabelEditor from './LabelEditor';
import LabelPreview from './LabelPreview';
import TemplateManager from './TemplateManager';

const emptyLabel = () => ({
  product: '',
  code: '',
  price: '',
  size: '',
  qty: '',
  manufacturer: '',
});

const initialLabels = () => Array.from({ length: 12 }, emptyLabel);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [labels, setLabels] = useState(initialLabels());
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateManagerMode, setTemplateManagerMode] = useState('load'); // 'load' | 'save'
  const [currentTemplateName, setCurrentTemplateName] = useState('');
  const [wsIgnoreNext, setWsIgnoreNext] = useState(false);

  const handleWsMessage = useCallback(
    (data) => {
      if (data.type === 'labels_update') {
        setWsIgnoreNext(true);
        setLabels(data.labels);
      }
    },
    []
  );

  const { sendMessage, isConnected } = useWebSocket(handleWsMessage);

  const updateLabels = (newLabels) => {
    setLabels(newLabels);
    if (!wsIgnoreNext) {
      sendMessage({ type: 'labels_update', labels: newLabels });
    }
    setWsIgnoreNext(false);
  };

  const openSave = () => {
    setTemplateManagerMode('save');
    setShowTemplateManager(true);
  };

  const openLoad = () => {
    setTemplateManagerMode('load');
    setShowTemplateManager(true);
  };

  const handleTemplateLoad = (template) => {
    if (template?.labelData) {
      setLabels(template.labelData);
      setCurrentTemplateName(template.name);
    }
    setShowTemplateManager(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white shadow-md no-print">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏷️</span>
            <div>
              <h1 className="text-base font-bold leading-tight">Shree Ganpati Agency</h1>
              <p className="text-indigo-300 text-xs leading-tight">Label Print System</p>
            </div>
            {currentTemplateName && (
              <span className="ml-3 px-2 py-0.5 bg-indigo-500 rounded text-xs text-indigo-100">
                {currentTemplateName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}
              title={isConnected ? 'Live sync connected' : 'Offline'}
            />
            <button
              onClick={openSave}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-medium transition-colors"
            >
              💾 Save Template
            </button>
            <button
              onClick={openLoad}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-medium transition-colors"
            >
              📂 Load Template
            </button>
            <div className="ml-2 pl-2 border-l border-indigo-500 flex items-center gap-2">
              <span className="text-xs text-indigo-300">{user?.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-lg text-xs font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Left panel — Label Editor (40%) */}
        <div className="w-2/5 overflow-y-auto border-r border-gray-200 bg-white no-print">
          <LabelEditor labels={labels} setLabels={updateLabels} />
        </div>

        {/* Right panel — Preview (60%) */}
        <div className="w-3/5 overflow-y-auto bg-gray-50 no-print">
          <LabelPreview
            labels={labels}
            onSave={openSave}
            onLoad={openLoad}
          />
        </div>
      </div>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          mode={templateManagerMode}
          labels={labels}
          onLoad={handleTemplateLoad}
          onClose={() => setShowTemplateManager(false)}
        />
      )}
    </div>
  );
}
