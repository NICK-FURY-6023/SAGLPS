import { useState, useEffect } from 'react';

const features = [
  { icon: '🖨️', title: 'Perfect Print Alignment', desc: 'A4 sheet mein exactly 12 labels — 105×48mm grid, zero shift guaranteed.' },
  { icon: '☁️', title: 'Cloud Templates', desc: 'Supabase pe save karo, kisi bhi device se load karo — kabhi bhi, kahin bhi.' },
  { icon: '⬇️', title: 'PDF Export', desc: 'Ek click mein A4 PDF download karo — printer-ready, high quality.' },
  { icon: '✍️', title: 'Pen-Fill Support', desc: 'Khaali fields mein auto "______" — baad mein pen se fill karo.' },
  { icon: '⚡', title: 'Bulk Label Fill', desc: 'Ek entry se saare 12 labels fill karo — festive season ho ya daily use.' },
  { icon: '📱', title: 'QR Code Auto-Gen', desc: 'Product code se automatic QR generate — scan-ready har label pe.' },
];

const stats = [
  { value: '12', label: 'Labels / Sheet' },
  { value: '105×48', label: 'mm Per Label' },
  { value: 'A4', label: 'Perfect Fit' },
  { value: '2×6', label: 'Grid Layout' },
];

// Animated floating particles (CSS only)
function Particles() {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {dots.map(d => (
        <div key={d.id} style={{
          position: 'absolute',
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: '#f97316',
          left: `${d.left}%`,
          bottom: '-10px',
          opacity: d.opacity,
          animation: `floatUp ${d.duration}s ${d.delay}s infinite linear`,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-110vh) scale(0.3); opacity: 0; }
        }
        @keyframes divaGlow {
          0%, 100% { filter: drop-shadow(0 0 20px #f97316) drop-shadow(0 0 40px #f97316); }
          50%       { filter: drop-shadow(0 0 40px #fbbf24) drop-shadow(0 0 80px #f97316); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes labelSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
          70%  { transform: scale(1); box-shadow: 0 0 0 16px rgba(249,115,22,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(249,115,22,0); }
        }
      `}</style>
    </div>
  );
}

// Mini label card for hero visual
function MiniLabel({ product, price, size, delay = 0, mfr }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 4,
      padding: '6px 8px', width: 140, fontSize: 9,
      fontFamily: 'Arial, sans-serif', lineHeight: 1.4,
      animation: `labelSlideIn 0.5s ${delay}s both`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0', paddingBottom: 3, marginBottom: 3 }}>
        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 8 }}>{mfr?.split(' ')[0]?.toUpperCase() || 'BRAND'}</span>
        <div style={{ width: 20, height: 20, background: '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>▦</div>
      </div>
      <div style={{ fontWeight: 700, color: '#0f172a', textAlign: 'center', fontSize: 9, borderBottom: '0.5px solid #e2e8f0', paddingBottom: 2, marginBottom: 2 }}>{product}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid #e2e8f0', paddingBottom: 2, marginBottom: 2 }}>
        <span>Size: <b>{size || '______'}</b></span>
        <span>MRP: <b style={{ color: '#ea580c' }}>₹{price || '____'}</b></span>
      </div>
      <div style={{ color: '#64748b', fontSize: 7.5 }}>{mfr || '______'}</div>
    </div>
  );
}

export default function LandingPage({ onEnter }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <Particles />

      {/* Radial glows */}
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(234,88,12,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── Navbar ──────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'opacity 0.5s', opacity: visible ? 1 : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, animation: 'divaGlow 3s ease-in-out infinite' }}>🪔</span>
          <span style={{ fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Shree Ganpati Agency
          </span>
        </div>
        <button
          onClick={onEnter}
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(249,115,22,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            animation: 'pulse-ring 2.5s infinite',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(249,115,22,0.5)'; }}
          onMouseOut={e  => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(249,115,22,0.3)'; }}
        >
          🔐 Admin Login
        </button>
      </nav>

      {/* ─── HERO ────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '80px 40px 40px', maxWidth: 1280, margin: '0 auto',
        position: 'relative', zIndex: 1,
        flexWrap: 'wrap', gap: 60,
      }}>
        {/* Left: Text */}
        <div style={{ flex: '1 1 480px', transition: 'opacity 0.8s, transform 0.8s', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 6px #f97316', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600, letterSpacing: '0.08em' }}>PRECISION LABEL PRINTING SYSTEM</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1,
            margin: '0 0 20px', letterSpacing: '-0.02em',
          }}>
            <span style={{ display: 'block', color: '#f1f5f9' }}>Shree</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradShift 4s ease infinite' }}>
              Ganpati Agency
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
            A4 sheet pe <strong style={{ color: '#f1f5f9' }}>12 perfect labels</strong> print karo — 105×48mm exact alignment, cloud templates, PDF export. Business ke liye banaya gaya.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={onEnter}
              onMouseOver={e => setHovered(true)}
              onMouseOut={e  => setHovered(false)}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white', border: 'none', borderRadius: 12, padding: '16px 36px',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: hovered ? '0 8px 40px rgba(249,115,22,0.6)' : '0 4px 20px rgba(249,115,22,0.4)',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              🪔 Admin Portal Kholo
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '16px 24px', borderRadius: 12,
              border: '1px solid #334155', color: '#64748b', fontSize: 14,
            }}>
              🔒 Sirf Admin Access
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 52, paddingTop: 32, borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4, letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual — floating label sheet */}
        <div style={{
          flex: '1 1 380px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'opacity 1s 0.3s, transform 1s 0.3s', opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateX(40px)',
          position: 'relative',
        }}>
          {/* Glow behind */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)', zIndex: 0 }} />

          {/* Mini A4 preview */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '1px solid #334155', borderRadius: 16,
            padding: 20, position: 'relative', zIndex: 1,
            animation: 'heroFloat 4s ease-in-out infinite',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: '0.1em', marginBottom: 14 }}>
              📋 A4 LABEL SHEET PREVIEW
            </div>
            {/* 2-col label grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: 310 }}>
              <MiniLabel product="Basmati Rice" price="120" size="1kg" mfr="Ganpati Foods Ltd" delay={0.1} />
              <MiniLabel product="Toor Dal" price="85" size="500g" mfr="Ganpati Foods Ltd" delay={0.2} />
              <MiniLabel product="Sugar M30" price="42" size="1kg" mfr="National Sugar" delay={0.3} />
              <MiniLabel product="Sunflower Oil" price="145" size="1L" mfr="Ganpati Agency" delay={0.4} />
              <MiniLabel product="______" price="" size="" mfr="" delay={0.5} />
              <MiniLabel product="______" price="" size="" mfr="" delay={0.6} />
            </div>
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
              fontSize: 11, color: '#f97316', textAlign: 'center',
            }}>
              + 6 more labels on full sheet
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: -14, right: -14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', borderRadius: 20, padding: '6px 14px',
              fontSize: 11, fontWeight: 700, boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
            }}>
              ✓ Print Ready
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────── */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '0.15em', marginBottom: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
              Sab kuch jo chahiye
            </h2>
            <p style={{ color: '#64748b', marginTop: 12, fontSize: 16 }}>Ek tool mein — label design, print, save, PDF.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
                  padding: '28px 24px', transition: 'all 0.25s', cursor: 'default',
                  animation: `fadeIn 0.5s ${i * 0.08}s both`,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#f97316';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                  background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────── */}
      <section style={{ padding: '60px 40px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(124,58,237,0.1))',
            border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 24, padding: '52px 40px',
            boxShadow: '0 0 60px rgba(249,115,22,0.07)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 20, animation: 'divaGlow 3s ease-in-out infinite' }}>🪔</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', margin: '0 0 16px' }}>
              Ready to Print?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
              Admin portal pe login karo aur apne labels abhi design karo.
            </p>
            <button
              onClick={onEnter}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white', border: 'none', borderRadius: 12, padding: '16px 48px',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.6)'; }}
              onMouseOut={e  => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.4)'; }}
            >
              🔐 Admin Portal Kholo
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #1e293b', padding: '28px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🪔</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#475569' }}>Shree Ganpati Agency</span>
        </div>
        <div style={{ fontSize: 12, color: '#334155' }}>
          Label Print System v2 · © {new Date().getFullYear()} · Admin Only
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['12 Labels', 'A4 Size', 'PDF Export', 'Cloud Save'].map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              background: '#1e293b', color: '#475569', border: '1px solid #334155',
            }}>{tag}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
