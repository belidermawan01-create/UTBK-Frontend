import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRiwayat } from '../api/api';

const MAPEL_LABEL = { TPS: 'TPS', TKA_SAINTEK: 'TKA Saintek', TKA_SOSHUM: 'TKA Soshum' };
const MAPEL_COLOR = { TPS: 'indigo', TKA_SAINTEK: 'emerald', TKA_SOSHUM: 'amber' };

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  useEffect(() => {
    getRiwayat()
      .then((r) => setRiwayat(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = riwayat.filter((r) => {
    if (filter === 'selesai') return r.selesai;
    if (filter === 'berlangsung') return !r.selesai;
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Riwayat Latihan</h1>
            <p className="page-sub">Semua sesi latihan kamu tercatat di sini</p>
          </div>
          <Link to="/latihan" className="btn btn-primary">+ Latihan Baru</Link>
        </div>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {['semua', 'selesai', 'berlangsung'].map((f) => (
            <button key={f} className={`tab ${filter === f ? 'tab-active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="full-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Tidak ada sesi yang cocok. <Link to="/latihan">Mulai latihan baru!</Link></p>
          </div>
        ) : (
          <div className="riwayat-grid">
            {filtered.map((r) => (
              <div key={r.id} className="riwayat-card">
                <div className="riwayat-card-top">
                  <span className={`mapel-badge mapel-badge-${MAPEL_COLOR[r.mapel]}`}>{MAPEL_LABEL[r.mapel]}</span>
                  <span className={`status-badge ${r.selesai ? 'status-done' : 'status-ongoing'}`}>
                    {r.selesai ? 'Selesai' : 'Berlangsung'}
                  </span>
                </div>
                <div className="riwayat-card-body">
                  {r.selesai ? (
                    <div className="riwayat-skor">
                      <span className="skor-val" style={{ color: r.skor >= 75 ? '#22c55e' : r.skor >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {r.skor}
                      </span>
                      <span className="skor-label">/ 100</span>
                    </div>
                  ) : (
                    <div className="riwayat-skor-na">—</div>
                  )}
                </div>
                <div className="riwayat-card-footer">
                  <span className="riwayat-date">
                    {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {r.selesai && (
                    <Link to={`/hasil/${r.id}`} className="btn btn-ghost btn-xs">Lihat →</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
