import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{ fontSize: 40 }}>🪔</div>
          <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>Shree Ganpati Agency</div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid #f97316', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontSize: '13px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/"    element={<Landing />} />
          <Route path="/app" element={<ProtectedApp />} />
          <Route path="*"    element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
