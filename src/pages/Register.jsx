import { Sparkles, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      addToast(
        "Registrasi berhasil! Cek email untuk verifikasi <Mail size={20} />",
        "success",
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      addToast(getErrorMessage(err, "Registrasi gagal"), "error");
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
          <div className="auth-logo">
            <Sparkles size={16} />
          </div>
          <h1>Buat Akun</h1>
          <p>Mulai perjalanan menuju PTN impianmu</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              placeholder="john doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@gmail.com"
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
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner-sm" /> : "Daftar Sekarang"}
          </button>
        </form>
        <p className="auth-footer-text">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
