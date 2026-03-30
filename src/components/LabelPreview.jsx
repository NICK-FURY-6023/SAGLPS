import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import LabelSheet from './LabelSheet';

const A4_W = 794;
const A4_H = 1123;

function Icon({ d, size = 14, sw = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

function ToolBtn({ onClick, disabled, title, children, variant = 'ghost', style: extra = {} }) {
  const variants = {
    ghost:   { background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid #334155' },
    saffron: { background: 'linear-gradient(135deg,#ea580c,#c2410c)', color: 'white', border: 'none' },
    blue:    { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none' },
    green:   { background: 'rgba(34,197,94,0.1)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)' },
  };
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      title={title}
      style={{
        borderRadius: 8, fontWeight: 600, fontSize: 12, padding: '7px 13px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
        ...variants[variant], ...extra,
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseOut={e  => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export default function LabelPreview({
  labels,
  onSave, onLoad, onPrint,
  copies = 1, onCopiesChange,
  fontScale = 1, onFontScaleChange,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.6);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printMargin, setPrintMargin] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth - 48;
      const h = el.clientHeight - 200;
      setScale(Math.min(w / A4_W, h / A4_H, 1));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    const tid = toast.loading('Generating PDF…');
    try {
      const { default: jsPDF } = await import('jspdf');
      const QRLib = (await import('qrcode')).default;

      const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait', compress: true });
      const safeLabels = Array.from({ length: 12 }, (_, i) => labels[i] || {});

      // ── Layout constants (must match CSS .sheet grid) ──
      const PX = 3.5, GAP = 1;
      const PY_TOP = 7 + printMargin, PY_BOT = 7 - printMargin;
      const CW = (210 - PX * 2 - GAP) / 2;
      const CH = (297 - PY_TOP - PY_BOT - GAP * 5) / 6;
      const LOGO_W = 18, QR_W = 13;
      const s = (pt) => pt * fontScale;
      const PT2MM = 0.3528;

      // ── Pre-load images ──
      async function loadImg(url) {
        if (!url) return null;
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = url;
          await new Promise((r, e) => { img.onload = r; img.onerror = e; });
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          return { data: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight };
        } catch { return null; }
      }

      // Load unique logos
      const logoCache = {};
      for (const l of safeLabels) {
        const url = l.logoUrl?.trim() || '/jaquar-logo.png';
        if (!logoCache[url]) logoCache[url] = await loadImg(url);
      }

      // Generate QR codes
      const qrCache = {};
      for (const l of safeLabels) {
        const url = l.productUrl?.trim();
        if (url && !qrCache[url]) {
          try { qrCache[url] = await QRLib.toDataURL(url, { width: 200, margin: 0, errorCorrectionLevel: 'M' }); }
          catch { /* skip */ }
        }
      }

      // ── Helper: fit image maintaining aspect ratio ──
      function fitImg(img, maxW, maxH) {
        const scale = Math.min(maxW / img.w, maxH / img.h);
        return { w: img.w * scale, h: img.h * scale };
      }

      // ── Render pages ──
      for (let copy = 0; copy < copies; copy++) {
        if (copy > 0) pdf.addPage();

        for (let idx = 0; idx < 12; idx++) {
          const label = safeLabels[idx];
          const col = idx % 2, row = Math.floor(idx / 2);
          const cx = PX + col * (CW + GAP);
          const cy = PY_TOP + row * (CH + GAP);

          // Cell border
          pdf.setDrawColor(34, 34, 34);
          pdf.setLineWidth(0.2);
          pdf.rect(cx, cy, CW, CH);

          // ── Logo section ──
          pdf.line(cx + LOGO_W, cy, cx + LOGO_W, cy + CH);
          const logoUrl = label.logoUrl?.trim() || '/jaquar-logo.png';
          const logo = logoCache[logoUrl];
          if (logo) {
            const pad = 2;
            const fit = fitImg(logo, LOGO_W - pad * 2, CH - pad * 2);
            try {
              pdf.addImage(logo.data, 'PNG',
                cx + (LOGO_W - fit.w) / 2, cy + (CH - fit.h) / 2, fit.w, fit.h);
            } catch { /* skip */ }
          } else {
            // Fallback: brand name text
            const brand = label.manufacturer?.trim();
            if (brand) {
              pdf.setFontSize(s(8));
              pdf.setFont('helvetica', 'bolditalic');
              pdf.text(brand, cx + LOGO_W / 2, cy + CH / 2, { align: 'center', maxWidth: LOGO_W - 2 });
            }
          }

          // ── QR code section ──
          const pUrl = label.productUrl?.trim();
          const qrData = pUrl ? qrCache[pUrl] : null;
          if (qrData) {
            pdf.line(cx + CW - QR_W, cy, cx + CW - QR_W, cy + CH);
            const qrPad = 2;
            const qrSize = Math.min(QR_W - qrPad * 2, CH - qrPad * 2);
            try {
              pdf.addImage(qrData, 'PNG',
                cx + CW - QR_W + (QR_W - qrSize) / 2, cy + (CH - qrSize) / 2, qrSize, qrSize);
            } catch { /* skip */ }
          }

          // ── Text section ──
          const txtPad = 2;
          const txtX = cx + LOGO_W + txtPad;
          const txtEndX = cx + CW - (qrData ? QR_W : 0) - 1;
          const txtW = txtEndX - txtX;
          const LBL_W = 16;
          const valX = txtX + LBL_W + 1;
          const valW = txtW - LBL_W - 1;

          const code = label.code?.trim() || '';
          const product = label.product?.trim() || '';
          const desc = label.description?.trim() || '';
          const price = label.price?.trim() || '';

          const textRows = [];
          if (code)    textRows.push({ lbl: 'Product Code',  val: code,                 lblS: s(6), valS: s(6),   vBold: true,  max: 1 });
          if (product) textRows.push({ lbl: 'Product Name',  val: product.toUpperCase(), lblS: s(6), valS: s(5.5), vBold: false, max: 2 });
          if (desc)    textRows.push({ lbl: 'Product Desc',  val: desc,                  lblS: s(6), valS: s(5),   vBold: false, max: 2 });
          if (price)   textRows.push({ lbl: 'Product Price', val: `Rs. ${price}`,        lblS: s(6), valS: s(7),   vBold: true,  max: 1 });

          if (textRows.length === 0) continue;

          // Compute line heights and wrapped text
          const rowGap = 0.8;
          let totalH = 0;
          const comp = textRows.map(r => {
            pdf.setFontSize(r.valS);
            pdf.setFont('helvetica', r.vBold ? 'bold' : 'normal');
            const lines = pdf.splitTextToSize(r.val, valW).slice(0, r.max);
            const lineH = r.valS * PT2MM * 1.3;
            const rowH = lineH * lines.length;
            totalH += rowH;
            return { ...r, lines, rowH, lineH };
          });
          totalH += rowGap * (comp.length - 1);

          // Vertically center text block in cell
          let ty = cy + (CH - totalH) / 2 + comp[0].lineH * 0.75;

          for (const r of comp) {
            // Label (bold)
            pdf.setFontSize(r.lblS);
            pdf.setFont('helvetica', 'bold');
            pdf.text(r.lbl, txtX, ty);
            pdf.text(':', txtX + LBL_W - 0.5, ty);
            // Value
            pdf.setFontSize(r.valS);
            pdf.setFont('helvetica', r.vBold ? 'bold' : 'normal');
            pdf.text(r.lines, valX, ty);
            ty += r.rowH + rowGap;
          }
        }
      }

      pdf.save('ganpati-labels.pdf');
      toast.success('PDF downloaded!', { id: tid });
    } catch (err) {
      toast.error(`PDF generation failed: ${err?.message || 'Unknown error'}. Try Ctrl+P → Save as PDF.`, { id: tid });
    } finally {
      setPdfLoading(false);
    }
  };

  const filledCount = labels.filter(l => l.product?.trim()).length;

  return (
    <div ref={containerRef} style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: '10px 14px',
        border: '1px solid #334155', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        flexShrink: 0,
      }}>
        {/* Print copies input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ToolBtn onClick={handlePrint} variant="saffron" title="Ctrl+P">
            <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <Icon d="M6 14h12v8H6z" />
            Print
            <span style={{ fontSize: 10, opacity: 0.6 }}>Ctrl+P</span>
          </ToolBtn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0f172a', borderRadius: 8, padding: '4px 8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>Copies</span>
            <button
              onClick={() => onCopiesChange && onCopiesChange(Math.max(1, copies - 1))}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>−</button>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316', minWidth: 16, textAlign: 'center' }}>{copies}</span>
            <button
              onClick={() => onCopiesChange && onCopiesChange(Math.min(10, copies + 1))}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>+</button>
          </div>
        </div>

        {/* PDF */}
        <ToolBtn onClick={handleDownloadPDF} disabled={pdfLoading} variant="blue">
          {pdfLoading
            ? <span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
          }
          PDF
        </ToolBtn>

        {/* Save / Load */}
        <ToolBtn onClick={onSave} variant="ghost">
          <Icon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          Save
        </ToolBtn>
        <ToolBtn onClick={onLoad} variant="ghost">
          <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          Load
        </ToolBtn>

        {/* Calibrate toggle */}
        <ToolBtn
          onClick={() => setShowCalibration(o => !o)}
          variant={showCalibration ? 'green' : 'ghost'}
          style={{ marginLeft: 'auto' }}
        >
          <Icon d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          Calibrate
        </ToolBtn>

        {/* Stats */}
        <div style={{ padding: '4px 10px', borderRadius: 20, background: '#0f172a', border: '1px solid #334155', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
          {filledCount}/12 &middot; <span style={{ color: '#f97316' }}>{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* ── Calibration Panel ──────────────────────────────────────────── */}
      {showCalibration && (
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 12, padding: '14px 16px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>
            PRINT CALIBRATION
          </div>

          {/* Top margin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 12, color: '#64748b', minWidth: 130 }}>Top margin offset <span style={{ fontSize: 9, color: '#475569' }}>(− up, + down)</span></label>
            <input type="range" min="-5" max="5" step="0.5"
              value={printMargin} onChange={e => setPrintMargin(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#f97316' }} />
            <span style={{ fontSize: 12, color: '#f97316', minWidth: 44, textAlign: 'right' }}>
              {printMargin > 0 ? '+' : ''}{printMargin}mm
            </span>
            <ToolBtn onClick={() => setPrintMargin(0)} variant="ghost" style={{ fontSize: 10, padding: '4px 8px' }}>Reset</ToolBtn>
          </div>

          {/* Font scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 12, color: '#64748b', minWidth: 130 }}>Font size scale</label>
            <input type="range" min="0.6" max="1.5" step="0.05"
              value={fontScale} onChange={e => onFontScaleChange && onFontScaleChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#7c3aed' }} />
            <span style={{ fontSize: 12, color: '#7c3aed', minWidth: 44, textAlign: 'right' }}>
              {Math.round(fontScale * 100)}%
            </span>
            <ToolBtn onClick={() => onFontScaleChange && onFontScaleChange(1)} variant="ghost" style={{ fontSize: 10, padding: '4px 8px' }}>Reset</ToolBtn>
          </div>

          <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>
            Adjust margin if labels print shifted up/down. Font scale resizes all label text.
          </p>
        </div>
      )}

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
          <span style={{ fontSize: 11, color: '#475569' }}>Live A4 Preview &middot; 210×297mm &middot; 12 labels</span>
        </div>
        {copies > 1 && (
          <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>{copies} copies on print</span>
        )}
      </div>

      {/* ── Scaled preview (screen only) ──────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingBottom: 16, overflow: 'hidden' }}>
        <div className="print-preview-frame" style={{
          width: A4_W * scale, height: A4_H * scale, flexShrink: 0, borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          <div className="print-scale-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_W, height: A4_H }}>
            <LabelSheet labels={labels} extraTopMargin={printMargin} fontScale={fontScale} />
          </div>
        </div>
      </div>

      {/* ── Print Portal: renders directly under <body> for reliable Ctrl+P ── */}
      {createPortal(
        <div className="print-root" style={{ display: 'none' }}>
          <LabelSheet labels={labels} extraTopMargin={printMargin} fontScale={fontScale} />
          {Array.from({ length: Math.max(0, copies - 1) }, (_, i) => (
            <LabelSheet key={i} labels={labels} extraTopMargin={printMargin} fontScale={fontScale} />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
