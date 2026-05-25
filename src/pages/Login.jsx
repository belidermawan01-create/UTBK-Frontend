import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      signIn(res.data.access_token, res.data.user);
      addToast('Login berhasil! Selamat datang kembali 👋', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      addToast(err.response?.data?.message || 'Login gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toast toasts={toasts} />
      <div className="auth-bg-glow" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><Sparkles size={16} /></div>
          <h1>Selamat Datang</h1>
          <p>Masuk untuk lanjut latihan UTBK</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Masuk'}
          </button>
        </form>
        <p className="auth-footer-text">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
