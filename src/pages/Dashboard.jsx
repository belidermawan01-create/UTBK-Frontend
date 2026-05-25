import { BarChart, FileText, CheckCircle, Rocket, Trophy, Settings, Book } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRiwayat } from '../api/api';

const MAPEL_LABEL = { TPS: 'TPS', TKA_SAINTEK: 'TKA Saintek', TKA_SOSHUM: 'TKA Soshum' };
const MAPEL_COLOR = { TPS: 'indigo', TKA_SAINTEK: 'emerald', TKA_SOSHUM: 'amber' };

function ScoreRing({ skor }) {
  const pct = skor ?? 0;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="#1e1e2e" strokeWidth="6" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 35 35)" style={{ transition: 'stroke-dasharray .8s ease' }} />
      <text x="35" y="40" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{pct}</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiwayat()
      .then((r) => setRiwayat(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selesai = riwayat.filter((r) => r.selesai);
  const avgSkor = selesai.length ? Math.round(selesai.reduce((s, r) => s + (r.skor || 0), 0) / selesai.length) : 0;
  const best = selesai.length ? Math.max(...selesai.map((r) => r.skor || 0)) : 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Halo, <strong>{user?.email?.split('@')[0]}</strong>! Yuk lanjut belajar <Rocket size={20} /></p>
          </div>
          <Link to="/latihan" className="btn btn-primary">+ Mulai Latihan</Link>
        </div>

        {/* Stats cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-card-icon"><FileText size={20} /></div>
            <div>
              <div className="stat-card-value">{riwayat.length}</div>
              <div className="stat-card-label">Total Sesi</div>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-card-icon"><CheckCircle size={20} /></div>
            <div>
              <div className="stat-card-value">{selesai.length}</div>
              <div className="stat-card-label">Sesi Selesai</div>
            </div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-card-icon"><BarChart size={20} /></div>
            <div>
              <div className="stat-card-value">{avgSkor}</div>
              <div className="stat-card-label">Rata-rata Skor</div>
            </div>
          </div>
          <div className="stat-card stat-card-amber">
            <div className="stat-card-icon"><Trophy size={20} /></div>
            <div>
              <div className="stat-card-value">{best}</div>
              <div className="stat-card-label">Skor Tertinggi</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="section-title">Mulai Latihan</div>
        <div className="mapel-grid">
          {(user?.role?.toLowerCase() === 'admin' || user?.user_metadata?.role?.toLowerCase() === 'admin' || user?.app_metadata?.role?.toLowerCase() === 'admin' || user?.email?.toLowerCase().includes('admin') || user?.email?.toLowerCase().includes('abu')) && (
            <Link to="/admin/dashboard" className="mapel-card" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
              <div className="mapel-name"><Settings size={20} /> Dashboard Admin</div>
              <div className="mapel-arrow" style={{ color: 'var(--primary)' }}>→</div>
            </Link>
          )}
          {Object.entries(MAPEL_LABEL).map(([key, label]) => (
            <Link key={key} to={`/latihan?mapel=${key}`} className={`mapel-card mapel-${MAPEL_COLOR[key]}`}>
              <div className="mapel-name">{label}</div>
              <div className="mapel-arrow">→</div>
            </Link>
          ))}
        </div>

        {/* Recent sessions */}
        <div className="section-title" style={{ marginTop: '2.5rem' }}>Sesi Terbaru</div>
        {loading ? <div className="full-center"><div className="spinner" /></div> : (
          riwayat.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Book size={20} /></div>
              <p>Belum ada sesi latihan. <Link to="/latihan">Mulai sekarang!</Link></p>
            </div>
          ) : (
            <div className="session-list">
              {riwayat.slice(0, 5).map((r) => (
                <Link key={r.id} to={r.selesai ? `/hasil/${r.id}` : '#'} className="session-item">
                  <div className="session-info">
                    <span className={`mapel-badge mapel-badge-${MAPEL_COLOR[r.mapel]}`}>{MAPEL_LABEL[r.mapel]}</span>
                    <span className="session-date">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="session-status">
                    {r.selesai ? <ScoreRing skor={r.skor} /> : <span className="badge-ongoing">Berlangsung</span>}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
