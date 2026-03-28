import { QRCodeSVG } from 'qrcode.react';

/*
 * Jaquar-style product label — 105mm × 48mm
 * Layout (top→bottom):
 *   ┌─────────────────────────────────────────────────┐
 *   │  [QR] BRAND        │ Size │ Qty │ MRP(Per Piece)│
 *   │       Code#         │ ---- │ 1N  │ ₹3800.00     │
 *   ├─────────────────────┴──────┴─────┴──────────────┤
 *   │  PRODUCT DESCRIPTION TEXT IN BOLD UPPERCASE      │
 *   │  MULTI-LINE IF NEEDED                            │
 *   ├──────────────────────────────────────────────────┤
 *   │  Mfg By: CODE           Mth/Yr of Mfg: ----    │
 *   │  MANUFACTURER NAME                    MADE IN X │
 *   └──────────────────────────────────────────────────┘
 */

function LabelCell({ label, fontScale = 1 }) {
  const brand = label.manufacturer?.trim() || '';
  const brandDisplay = brand ? brand.toUpperCase().split(/\s+/).slice(0, 3).join(' ') : '';
  const qrVal = (label.code?.trim() || label.product?.trim() || 'N/A').substring(0, 100);
  const s = (pt) => (pt * fontScale) + 'pt';
  const B = '0.2mm solid #222';

  // Outer label box — all in inline styles to bypass Tailwind resets
  return (
    <div style={{
      width: '105mm', height: '48mm',
      border: B,
      boxSizing: 'border-box',
      padding: '1mm 1.2mm',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      position: 'relative',
    }}>

      {/* ── ROW 1: Brand+QR left | Size/Qty/MRP table right ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderBottom: B,
        paddingBottom: '0.8mm', marginBottom: '0.6mm',
        minHeight: '11.5mm', maxHeight: '13mm',
        flexShrink: 0,
      }}>
        {/* Left side: QR + Brand + Code */}
        <div style={{
          display: 'flex', gap: '1.2mm', alignItems: 'flex-start',
          flex: '1 1 auto', minWidth: 0, overflow: 'hidden',
        }}>
          <div style={{ flexShrink: 0, width: '10mm', height: '10mm' }}>
            <QRCodeSVG
              value={qrVal}
              size={38}
              style={{ width: '10mm', height: '10mm', display: 'block' }}
            />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden', paddingTop: '0.2mm', maxWidth: '100%' }}>
            {brandDisplay ? (
              <div style={{
                fontSize: s(8.5), fontWeight: 900, color: '#000',
                lineHeight: 1.1, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>{brandDisplay}</div>
            ) : (
              <div style={{ fontSize: s(7), color: '#bbb' }}>BRAND</div>
            )}
            {label.code?.trim() && (
              <div style={{
                fontSize: s(6.5), fontWeight: 800, color: '#000',
                marginTop: '0.4mm',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{label.code}</div>
            )}
          </div>
        </div>

        {/* Right side: Size/Qty/MRP table */}
        <table style={{
          borderCollapse: 'collapse', flexShrink: 0,
          marginLeft: '0.8mm', alignSelf: 'flex-start',
        }}>
          <thead>
            <tr>
              {['Size', 'Qty'].map(h => (
                <th key={h} style={{
                  border: B,
                  padding: '0.3mm 1.5mm',
                  fontSize: s(6), fontWeight: 900, color: '#000',
                  textAlign: 'center', whiteSpace: 'nowrap',
                  lineHeight: 1.15,
                }}>{h}</th>
              ))}
              <th style={{
                border: B,
                padding: '0.3mm 1.5mm',
                fontSize: s(5), fontWeight: 900, color: '#000',
                textAlign: 'center', whiteSpace: 'nowrap',
                lineHeight: 1.15,
              }}>MRP (Per Piece)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{
                border: B, padding: '0.2mm 1.5mm',
                fontSize: s(6.5), fontWeight: 800, color: '#000', textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{label.size?.trim() || '----'}</td>
              <td style={{
                border: B, padding: '0.2mm 1.5mm',
                fontSize: s(6.5), fontWeight: 800, color: '#000', textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{label.qty?.trim() || '----'}</td>
              <td style={{
                border: B, padding: '0.2mm 1.5mm',
                textAlign: 'center', verticalAlign: 'middle',
              }}>
                <div style={{ fontSize: s(8.5), fontWeight: 900, color: '#000', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {label.price?.trim() ? `₹${label.price}` : '----'}
                </div>
                {label.price?.trim() && (
                  <div style={{ fontSize: s(4), color: '#333', lineHeight: 1, marginTop: '0.1mm', whiteSpace: 'nowrap' }}>
                    (Incl. Of All Taxes)
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── ROW 2: Product description — fills remaining space ── */}
      <div style={{
        flex: '1 1 auto',
        display: 'flex', alignItems: 'flex-start',
        overflow: 'hidden',
        padding: '0.4mm 0',
        minHeight: 0,
      }}>
        {label.product?.trim() ? (
          <div style={{
            fontSize: s(8), fontWeight: 900, color: '#000',
            lineHeight: 1.25, textTransform: 'uppercase',
            wordBreak: 'break-word',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            width: '100%',
          }}>{label.product}</div>
        ) : (
          <div style={{ fontSize: s(7), color: '#ccc' }}>PRODUCT DESCRIPTION</div>
        )}
      </div>

      {/* ── ROW 3: Manufacturer bottom bar ── */}
      <div style={{
        borderTop: B,
        paddingTop: '0.6mm',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Manufactured By row */}
        {label.code?.trim() && (
          <div style={{
            display: 'flex', gap: '1.5mm', marginBottom: '0.3mm',
            fontSize: s(5), color: '#222', lineHeight: 1.15,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <span><b style={{ fontWeight: 800 }}>Manufactured By:</b> {label.code}</span>
          </div>
        )}
        {/* Company name */}
        {brand ? (
          <div style={{
            fontSize: s(7), fontWeight: 900, color: '#000',
            lineHeight: 1.1, textTransform: 'uppercase',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{brand}</div>
        ) : (
          <div style={{ fontSize: s(6), color: '#ccc' }}>MANUFACTURER</div>
        )}
      </div>
    </div>
  );
}

export default function LabelSheet({ labels, extraTopMargin = 0, fontScale = 1 }) {
  const safeLabels = Array.from({ length: 12 }, (_, i) => labels[i] || {});
  return (
    <div
      className="sheet print-sheet"
      style={extraTopMargin !== 0 ? { paddingTop: `${4.5 + extraTopMargin}mm`, paddingBottom: `${4.5 - extraTopMargin}mm` } : undefined}
    >
      {safeLabels.map((label, i) => (
        <LabelCell key={i} label={label} fontScale={fontScale} />
      ))}
    </div>
  );
}
