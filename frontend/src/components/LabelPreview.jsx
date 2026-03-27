import { useRef, useEffect, useState } from 'react';
import LabelSheet from './LabelSheet';
import { generatePDF } from '../services/api';

export default function LabelPreview({ labels, onSave, onLoad }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pdfError, setPdfError] = useState('');

  // A4 in pixels at 96dpi: 210mm ≈ 794px, 297mm ≈ 1123px
  const A4_W = 794;
  const A4_H = 1123;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const availW = el.clientWidth - 32; // 16px padding each side
      const availH = el.clientHeight - 120; // leave space for buttons
      const scaleW = availW / A4_W;
      const scaleH = availH / A4_H;
      setScale(Math.min(scaleW, scaleH, 1));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    setPdfError('');
    try {
      // Try to get a saved template id from the name; fall back to message
      const id = null; // Would need a saved template ID
      if (!id) {
        setPdfError('Please save the template first to download a PDF.');
        return;
      }
      const blob = await generatePDF(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'labels.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError('PDF generation failed. Save the template first.');
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col items-center py-4 px-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          🖨️ Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          ⬇️ Download PDF
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          💾 Save Template
        </button>
        <button
          onClick={onLoad}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          📂 Load Template
        </button>
      </div>

      {pdfError && (
        <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg no-print">
          {pdfError}
        </div>
      )}

      {/* Preview label */}
      <p className="text-xs text-gray-400 mb-3 no-print">A4 Preview — actual print size</p>

      {/* Scaled A4 sheet */}
      <div
        style={{
          width: A4_W * scale,
          height: A4_H * scale,
          flexShrink: 0,
        }}
        className="shadow-2xl rounded overflow-hidden no-print"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: A4_W,
            height: A4_H,
          }}
        >
          <LabelSheet labels={labels} />
        </div>
      </div>
    </div>
  );
}
