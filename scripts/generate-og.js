const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Helpers ──────────────────────────────────────────
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Background ────────────────────────────────────────
const bgGrad = ctx.createLinearGradient(0, 0, W, H);
bgGrad.addColorStop(0,   '#0f172a');
bgGrad.addColorStop(0.5, '#1a1035');
bgGrad.addColorStop(1,   '#0f172a');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// Subtle radial glow top-center (saffron)
const radGlow = ctx.createRadialGradient(600, 0, 0, 600, 0, 500);
radGlow.addColorStop(0,   'rgba(249,115,22,0.18)');
radGlow.addColorStop(1,   'rgba(249,115,22,0)');
ctx.fillStyle = radGlow;
ctx.fillRect(0, 0, W, H);

// Purple glow bottom-left
const purpGlow = ctx.createRadialGradient(0, H, 0, 0, H, 350);
purpGlow.addColorStop(0,   'rgba(124,58,237,0.12)');
purpGlow.addColorStop(1,   'rgba(124,58,237,0)');
ctx.fillStyle = purpGlow;
ctx.fillRect(0, 0, W, H);

// ── Top saffron accent bar ─────────────────────────────
const barGrad = ctx.createLinearGradient(0, 0, W, 0);
barGrad.addColorStop(0, '#f97316');
barGrad.addColorStop(1, '#ea580c');
ctx.fillStyle = barGrad;
ctx.fillRect(0, 0, W, 5);

// ── LEFT PANEL: Brand ──────────────────────────────────
// Logo circle
const logoGrad = ctx.createLinearGradient(80, 260, 160, 340);
logoGrad.addColorStop(0, '#f97316');
logoGrad.addColorStop(1, '#ea580c');
ctx.fillStyle = logoGrad;
ctx.beginPath();
ctx.arc(120, 300, 56, 0, Math.PI * 2);
ctx.fill();

// Diya flame (simplified SVG-like path)
ctx.fillStyle = '#fef08a';
ctx.beginPath();
ctx.ellipse(120, 285, 8, 14, 0, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#f97316';
ctx.beginPath();
ctx.ellipse(120, 288, 5, 10, 0, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#fbbf24';
ctx.beginPath();
ctx.ellipse(120, 291, 3, 6, 0, 0, Math.PI * 2);
ctx.fill();
// Diya bowl
ctx.fillStyle = '#92400e';
ctx.beginPath();
ctx.ellipse(120, 306, 14, 5, 0, 0, Math.PI);
ctx.fill();
ctx.fillStyle = '#b45309';
ctx.beginPath();
ctx.ellipse(120, 304, 12, 4, 0, 0, Math.PI);
ctx.fill();

// Brand name
ctx.fillStyle = '#f1f5f9';
ctx.font = 'bold 34px Arial';
ctx.fillText('Shree Ganpati Agency', 200, 288);

// Tagline
ctx.fillStyle = '#f97316';
ctx.font = 'bold 14px Arial';
ctx.letterSpacing = '4px';
ctx.fillText('LABEL PRINT SYSTEM  ·  v2.0', 202, 318);

// Description
ctx.fillStyle = '#64748b';
ctx.font = '15px Arial';
ctx.fillText('Precision A4 label printing · 12 labels · 105×48mm exact alignment', 202, 350);

// Divider
ctx.strokeStyle = '#334155';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(200, 380); ctx.lineTo(580, 380);
ctx.stroke();

// Feature pills
const pills = ['☁️ Supabase Cloud', '🖨️ Print Ready', '⬇️ PDF Export', '⚡ Bulk Fill'];
let pillX = 200;
pills.forEach(p => {
  const pw = ctx.measureText(p).width + 24;
  ctx.fillStyle = '#1e293b';
  roundRect(pillX, 396, pw, 30, 15);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Arial';
  ctx.fillText(p, pillX + 12, 415);
  pillX += pw + 10;
});

// ── Stats ──────────────────────────────────────────────
const statData = [
  { v: '12',    l: 'Labels/Sheet' },
  { v: '105×48', l: 'mm Per Label' },
  { v: 'A4',    l: 'Page Size' },
  { v: '2×6',   l: 'Grid Layout' },
];
statData.forEach((s, i) => {
  const x = 200 + i * 95;
  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(s.v, x, 498);
  ctx.fillStyle = '#475569';
  ctx.font = '11px Arial';
  ctx.fillText(s.l, x, 515);
});

// ── RIGHT PANEL: Label Sheet Preview ──────────────────
const sheetX = 680, sheetY = 50, sheetW = 490, sheetH = 530;

// Sheet shadow
ctx.fillStyle = 'rgba(0,0,0,0.4)';
roundRect(sheetX + 6, sheetY + 8, sheetW, sheetH, 10);
ctx.fill();

// Sheet background
ctx.fillStyle = '#f8fafc';
roundRect(sheetX, sheetY, sheetW, sheetH, 10);
ctx.fill();
ctx.strokeStyle = 'rgba(249,115,22,0.3)';
ctx.lineWidth = 1.5;
ctx.stroke();

// Sheet title strip
const stripGrad = ctx.createLinearGradient(sheetX, sheetY, sheetX + sheetW, sheetY);
stripGrad.addColorStop(0, '#f97316');
stripGrad.addColorStop(1, '#ea580c');
ctx.fillStyle = stripGrad;
roundRect(sheetX, sheetY, sheetW, 36, 10);
ctx.fill();
// Fix bottom corners of strip
ctx.fillRect(sheetX, sheetY + 20, sheetW, 16);

ctx.fillStyle = 'white';
ctx.font = 'bold 13px Arial';
ctx.fillText('🪔  A4 LABEL SHEET  ·  12 LABELS  ·  105×48mm', sheetX + 16, sheetY + 23);

// ── Draw label grid (2 cols × 6 rows) ─────────────────
const labelW = 224, labelH = 76;
const gridStartX = sheetX + 10;
const gridStartY = sheetY + 46;
const gap = 4;

const labelSamples = [
  { product: 'Jaquar Diverter D-450',  price: '3800', size: '3/4"',  qty: '1 pc',  mfr: 'Jaquar & Co. Pvt. Ltd.' },
  { product: 'Cera Wall Mixer',        price: '2200', size: '½"',    qty: '1 set', mfr: 'Cera Sanitaryware Ltd.' },
  { product: 'Hindware Basin Tap',     price: '980',  size: 'N/A',   qty: '1 pc',  mfr: 'Hindware Ltd.' },
  { product: 'Parryware Faucet P-22',  price: '1450', size: '15mm',  qty: '2 pcs', mfr: 'Parryware Industries' },
  { product: 'Kohler Shower Head',     price: '5600', size: '8"',    qty: '1 pc',  mfr: 'Kohler Co.' },
  { product: 'Grohe SpeedClean',       price: '4200', size: 'Univ.', qty: '1 set', mfr: 'Grohe AG Germany' },
  { product: 'Marc Water Heater 15L',  price: '6800', size: '15L',   qty: '1 unit',mfr: 'Marc Industries Ltd.' },
  { product: 'Varmora Wall Tile',      price: '45',   size: '30×60', qty: '1 sqft',mfr: 'Varmora Granito Pvt.' },
  { product: 'Asian Paints Apex',      price: '320',  size: '1L',    qty: '1 can', mfr: 'Asian Paints Ltd.' },
  { product: 'Fevicol SH 1kg',         price: '185',  size: '1kg',   qty: '1 can', mfr: 'Pidilite Industries' },
  { product: 'Basmati Rice Premium',   price: '120',  size: '1kg',   qty: '10 pcs',mfr: 'Ganpati Foods Ltd.' },
  { product: 'Toor Dal (Best)',        price: '85',   size: '500g',  qty: '20 pcs',mfr: 'Ganpati Agency' },
];

for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 2; col++) {
    const idx = row * 2 + col;
    const lx = gridStartX + col * (labelW + gap);
    const ly = gridStartY + row * (labelH + gap);
    const lb = labelSamples[idx] || {};

    // Label background
    ctx.fillStyle = 'white';
    roundRect(lx, ly, labelW, labelH, 3);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Left saffron accent bar
    ctx.fillStyle = '#f97316';
    roundRect(lx, ly, 3, labelH, 2);
    ctx.fill();

    // ── Brand + Code row ──
    const brandName = lb.mfr ? lb.mfr.split(' ')[0].toUpperCase() : 'BRAND';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px Arial';
    ctx.fillText(brandName.substring(0, 10), lx + 8, ly + 14);

    // QR placeholder box (top right)
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    roundRect(lx + labelW - 26, ly + 4, 22, 22, 2);
    ctx.fill(); ctx.stroke();
    // QR dots (simplified)
    ctx.fillStyle = '#334155';
    [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[1,1]].forEach(([dx,dy]) => {
      if (Math.random() > 0.3) {
        ctx.fillRect(lx + labelW - 24 + dx*6, ly + 6 + dy*6, 5, 5);
      }
    });

    // Divider 1
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(lx+6, ly+20); ctx.lineTo(lx+labelW-6, ly+20); ctx.stroke();

    // ── Product name ──
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px Arial';
    const prodText = (lb.product || '______').substring(0, 24);
    ctx.fillText(prodText, lx + 8, ly + 34);

    // Divider 2
    ctx.beginPath(); ctx.moveTo(lx+6, ly+40); ctx.lineTo(lx+labelW-6, ly+40); ctx.stroke();

    // ── Size | Qty | MRP row ──
    ctx.fillStyle = '#64748b';
    ctx.font = '7px Arial';
    ctx.fillText('Size:', lx + 8, ly + 52);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(lb.size || '____', lx + 28, ly + 52);

    ctx.fillStyle = '#64748b';
    ctx.font = '7px Arial';
    ctx.fillText('Qty:', lx + 80, ly + 52);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 7px Arial';
    ctx.fillText(lb.qty || '____', lx + 98, ly + 52);

    ctx.fillStyle = '#64748b';
    ctx.font = '7px Arial';
    ctx.fillText('MRP:', lx + 150, ly + 52);
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('₹' + (lb.price || '____'), lx + 170, ly + 52);

    // Divider 3
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath(); ctx.moveTo(lx+6, ly+58); ctx.lineTo(lx+labelW-6, ly+58); ctx.stroke();

    // ── Manufacturer ──
    ctx.fillStyle = '#94a3b8';
    ctx.font = '6.5px Arial';
    ctx.fillText((lb.mfr || '______').substring(0, 32), lx + 8, ly + 68);
  }
}

// ── Bottom tagline ─────────────────────────────────────
ctx.fillStyle = '#1e293b';
ctx.fillRect(0, H - 44, W, 44);
ctx.fillStyle = '#334155';
ctx.fillRect(0, H - 44, W, 1);

ctx.fillStyle = '#475569';
ctx.font = '13px Arial';
ctx.textAlign = 'center';
ctx.fillText('Admin-only system  ·  Cloud templates  ·  Exact A4 alignment guaranteed  ·  Shree Ganpati Agency', W/2, H - 16);

// ── Save ──────────────────────────────────────────────
const outPath = path.join(__dirname, '../public/og-image.png');
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buf);
console.log(`✅ OG image saved → ${outPath} (${Math.round(buf.length/1024)}KB)`);
