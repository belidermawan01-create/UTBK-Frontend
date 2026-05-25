import { FileText, Users, Book, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="admin-wrapper" style={{ padding: '2rem' }}>
      <h1 className="page-title">Ringkasan Sistem</h1>
      <p className="page-sub" style={{ marginBottom: '2rem' }}>Selamat datang di panel kontrol Admin UTBKPro.</p>

      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon"><Book size={20} /></div>
          <div>
            <div className="stat-card-value">100+</div>
            <div className="stat-card-label">Total Soal</div>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-icon"><Users size={20} /></div>
          <div>
            <div className="stat-card-value">500+</div>
            <div className="stat-card-label">Pengguna Aktif</div>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-icon"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-card-value">1200+</div>
            <div className="stat-card-label">Sesi Selesai</div>
          </div>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: '3rem' }}>Akses Cepat</div>
      <div className="mapel-grid">
        <Link to="/admin/soal" className="mapel-card" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
          <div className="mapel-name"><FileText size={20} /> Tambah / Edit Soal</div>
          <div className="mapel-arrow" style={{ color: 'var(--primary)' }}>→</div>
        </Link>
        <div className="mapel-card" style={{ opacity: 0.5 }}>
          <div className="mapel-name"><Users size={20} /> Kelola Pengguna</div>
          <div className="mapel-arrow">→</div>
        </div>
      </div>
    </div>
  );
}
