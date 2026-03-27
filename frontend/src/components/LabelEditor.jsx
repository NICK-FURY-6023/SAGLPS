import { useState } from 'react';

const FIELDS = [
  { key: 'product', label: 'Product Name', placeholder: 'e.g. Basmati Rice' },
  { key: 'code', label: 'Code', placeholder: 'e.g. GR-001' },
  { key: 'price', label: 'Price (₹)', placeholder: 'e.g. 120' },
  { key: 'size', label: 'Size', placeholder: 'e.g. 1 kg' },
  { key: 'qty', label: 'Qty', placeholder: 'e.g. 10' },
  { key: 'manufacturer', label: 'Manufacturer', placeholder: 'e.g. Ganpati Foods Pvt. Ltd.' },
];

function LabelCard({ index, label, onChange, onDuplicateToAll }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Card header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
            {label.product || <span className="text-gray-400 font-normal">Empty label</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateToAll(label);
            }}
            className="px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded border border-indigo-200 transition-colors"
            title="Duplicate this label to all 12"
          >
            Dup all
          </button>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Card body */}
      {open && (
        <div className="px-4 py-3 grid grid-cols-2 gap-2 bg-white">
          {FIELDS.map(({ key, label: fieldLabel, placeholder }) => (
            <div key={key} className={key === 'product' || key === 'manufacturer' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">{fieldLabel}</label>
              <input
                type="text"
                value={label[key]}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-800 placeholder-gray-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LabelEditor({ labels, setLabels }) {
  const [applyAll, setApplyAll] = useState({
    product: '',
    code: '',
    price: '',
    size: '',
    qty: '',
    manufacturer: '',
  });

  const updateLabel = (index, key, value) => {
    const updated = labels.map((l, i) => (i === index ? { ...l, [key]: value } : l));
    setLabels(updated);
  };

  const handleApplyAll = () => {
    const updated = labels.map((l) => {
      const merged = { ...l };
      Object.entries(applyAll).forEach(([k, v]) => {
        if (v.trim()) merged[k] = v;
      });
      return merged;
    });
    setLabels(updated);
  };

  const duplicateToAll = (sourceLabel) => {
    setLabels(labels.map(() => ({ ...sourceLabel })));
  };

  const resetAll = () => {
    setLabels(Array.from({ length: 12 }, () => ({
      product: '', code: '', price: '', size: '', qty: '', manufacturer: '',
    })));
    setApplyAll({ product: '', code: '', price: '', size: '', qty: '', manufacturer: '' });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Label Editor</h2>
        <button
          onClick={resetAll}
          className="px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors"
        >
          + New / Reset All
        </button>
      </div>

      {/* Apply to All */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
          Apply to All Labels
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className={key === 'product' || key === 'manufacturer' ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-indigo-600 mb-0.5">{label}</label>
              <input
                type="text"
                value={applyAll[key]}
                onChange={(e) => setApplyAll((a) => ({ ...a, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white text-gray-800 placeholder-gray-300"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleApplyAll}
          className="mt-3 w-full py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Apply Filled Fields to All 12 Labels
        </button>
      </div>

      {/* Individual labels */}
      <div className="space-y-2">
        {labels.map((label, i) => (
          <LabelCard
            key={i}
            index={i}
            label={label}
            onChange={(key, value) => updateLabel(i, key, value)}
            onDuplicateToAll={duplicateToAll}
          />
        ))}
      </div>
    </div>
  );
}
