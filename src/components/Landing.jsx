import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: '🖨️',
    title: 'Pixel-Perfect Print',
    desc: 'A4 sheet with 2×6 grid. Each label exactly 105×48mm. No shifting, no guessing — guaranteed alignment.',
    color: '#f97316',
  },
  {
    icon: '☁️',
    title: 'Cloud Templates',
    desc: 'Save your label templates to Supabase. Load and reprint anytime — from any device, instantly.',
    color: '#7c3aed',
  },
  {
    icon: '⬇️',
    title: 'PDF Export',
    desc: 'One-click PDF download for WhatsApp sharing, archiving, or sending to a print shop.',
    color: '#2563eb',
  },
  {
    icon: '✏️',
    title: 'Smart Empty Fields',
    desc: 'Leave a field blank — it auto-renders as a line (______) for manual pen fill later.',
    color: '#22c55e',
  },
  {
    icon: '⚡',
    title: 'Bulk Fill',
    desc: 'Set common fields once and apply to all 12 labels instantly. Duplicate any label across the sheet.',
    color: '#eab308',
  },
  {
    icon: '📐',
    title: 'Print Calibration',
    desc: 'Fine-tune top margin ±5mm with a live slider. No CSS editing needed — just slide and reprint.',
    color: '#ec4899',
  },
];

const steps = [
  { n: '01', title: 'Login as Admin', desc: 'Single secure admin account. JWT-protected, bcrypt password.' },
  { n: '02', title: 'Fill Label Data', desc: 'Enter product, price, size, qty, manufacturer for each of the 12 labels.' },
  { n: '03', title: 'Print or Save', desc: 'One-click print to any A4 printer. Save as PDF. Store as cloud template.' },
];

// Mini A4 sheet animation component
function MiniSheet() {
  const labels = [
    { p: 'Basmati Rice', price: '₹120', size: '1kg' },
    { p: 'Jaquar Diverter', price: '₹3800', size: '' },
    { p: 'Tata Salt', price: '₹25', size: '1kg' },
    { p: 'Fortune Oil', price: '₹180', size: '1L' },
    { p: 'Ariel Powder', price: '₹90', size: '500g' },
    { p: 'Surf Excel', price: '₹110', size: '1kg' },
    { p: '______', price: '______', size: '' },
    { p: 'Maggi Noodles', price: '₹14', size: '70g' },
    { p: '______', price: '______', size: '' },
    { p: 'Dettol Soap', price: '₹45', size: '75g' },
    { p: 'Horlicks', price: '₹220', size: '500g' },
    { p: 'Bournvita', price: '₹195', size: '500g' },
  ];

  return (
    <div style={{
      width: 260, background: 'white', borderRadius: 6,
      boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        padding: '4px',
      }}>
        {labels.map((l, i) => (
          <div key={i} style={{
            border: '0.5px solid #e2e8f0',
            padding: '4px 5px',
            fontSize: 7,
            fontFamily: 'Arial,sans-serif',
            minHeight: 38,
            background: i === 0 ? '#fffbf5' : 'white',
            borderLeft: i === 0 ? '2px solid #f97316' : undefined,
          }}>
            <div style={{ fontWeight: 700, fontSize: 7.5, color: '#0f172a', marginBottom: 1 }}>
              {l.p}
            </div>
            <div style={{ color: '#475569', fontSize: 6.5 }}>
              {l.price}{l.size ? ` · ${l.size}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated counter
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 40;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 30);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#0f172a', color: '#f1f5f9', fontFamily: 'Arial, sans-serif', overflowX: 'hidden' }}>

      {/* ─── Navbar ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(15,23,42,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e293b' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🪔</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Shree Ganpati Agency</div>
            <div style={{ fontSize: 10, color: '#f97316', letterSpacing: '0.1em' }}>LABEL PRINT SYSTEM</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/app')}
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white', border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(249,115,22,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.5)'; }}
          onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(249,115,22,0.4)'; }}
        >
          🔐 Admin Login
        </button>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 24px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(234,88,12,0.2) 0%, transparent 70%), #0f172a',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          {/* Left text */}
          <div style={{ flex: 1, minWidth: 300, maxWidth: 580 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#fb923c',
              marginBottom: 28, fontWeight: 600, letterSpacing: '0.05em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              PRECISION LABEL PRINTING SYSTEM
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1,
              margin: '0 0 20px',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #f97316 60%, #eab308 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Print Perfect Labels.<br />Every Single Time.
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 480 }}>
              A4 sheet · 12 labels · 105×48mm exact fit.<br />
              Cloud templates, PDF export, zero manual adjustment.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/app')}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(249,115,22,0.5)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.4)'; }}
              >
                🚀 Launch App
              </button>
              <a href="#features" style={{
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: 10,
                padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
                onMouseOut={e  => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                See Features ↓
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
              {[
                { val: 12, suffix: '', label: 'Labels per sheet' },
                { val: 105, suffix: 'mm', label: 'Label width' },
                { val: 48, suffix: 'mm', label: 'Label height' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>
                    <Counter target={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mini sheet mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', flex: 1, minWidth: 260 }}>
            <div style={{
              position: 'absolute', inset: -40,
              background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />
            {/* Sheet */}
            <div style={{
              animation: 'float 4s ease-in-out infinite',
              filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))',
            }}>
              <MiniSheet />
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: -10, right: '5%',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              borderRadius: 10, padding: '8px 14px',
              fontSize: 11, fontWeight: 700, color: 'white',
              boxShadow: '0 8px 20px rgba(249,115,22,0.5)',
              animation: 'float 4s ease-in-out 1s infinite',
            }}>
              ✓ Exact 105×48mm
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{ padding: '80px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', letterSpacing: '0.15em', marginBottom: 12 }}>
              FEATURES
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Everything You Need to Print<br />
              <span style={{ background: 'linear-gradient(90deg, #f97316, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Professional Labels
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: 16, padding: '28px 24px',
                  transition: 'all 0.25s', cursor: 'default',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = f.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}30`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow dot */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 100% 0%, ${f.color}15, transparent 70%)` }} />
                <div style={{
                  width: 48, height: 48, borderRadius: 12, fontSize: 24,
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.15em', marginBottom: 12 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0 }}>
              3 Steps to Perfect Labels
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 0, position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 40, left: '15%', right: '15%', height: 1,
              background: 'linear-gradient(90deg, transparent, #334155 30%, #334155 70%, transparent)',
              display: window.innerWidth < 600 ? 'none' : 'block',
            }} />

            {steps.map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 200, textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(124,58,237,0.15))',
                  border: '1px solid rgba(249,115,22,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(249,115,22,0.1)',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {s.n}
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: '#f1f5f9' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(124,58,237,0.1))',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 24, padding: '60px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)' }} />
            <div style={{ fontSize: 48, marginBottom: 16 }}>🪔</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
              Ready to Print<br />Perfect Labels?
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
              Admin access only. Secure. Fast. Built specifically for<br />
              <strong style={{ color: '#f97316' }}>Shree Ganpati Agency.</strong>
            </p>
            <button
              onClick={() => navigate('/app')}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(249,115,22,0.5)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.6)'; }}
              onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.5)'; }}
            >
              🚀 Launch App →
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🪔</div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Shree Ganpati Agency</span>
        </div>
        <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
          © {new Date().getFullYear()} Shree Ganpati Agency · Label Print System v2 · Admin-only access
        </p>
      </footer>

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
