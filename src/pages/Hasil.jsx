import { FileText, CheckCircle, XCircle, Lightbulb, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getDetailLatihan } from '../api/api';

export default function Hasil() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('semua');
  const hasil = location.state?.hasil;

  useEffect(() => {
    getDetailLatihan(sessionId)
       
      .then((r) => setDetail(r.data.data))
      .catch(() => navigate('/riwayat'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) return <div className="full-center"><div className="spinner" /></div>;
  if (!detail) return null;

  const skor = hasil?.skor ?? detail.skor ?? 0;
  const benar = hasil?.jumlahBenar ?? detail.jawabans?.filter((j) => j.benar).length ?? 0;
  const salah = hasil?.jumlahSalah ?? detail.jawabans?.filter((j) => !j.benar).length ?? 0;
  const total = hasil?.totalSoal ?? detail.jawabans?.length ?? 0;

  const filtered = detail.jawabans?.filter((j) =>
    activeTab === 'semua' ? true : activeTab === 'benar' ? j.benar : !j.benar
  ) || [];

  const color = skor >= 75 ? '#22c55e' : skor >= 50 ? '#f59e0b' : '#ef4444';
  const r = 54, circ = 2 * Math.PI * r;

  const formatJawaban = (tipe, jwb) => {
    if (!jwb && jwb !== false && jwb !== 0) return '-';
    if (tipe === 'MULTIPLE_CHOICE') {
      return Array.isArray(jwb) ? jwb.join(', ') : jwb;
    }
    if (tipe === 'TRUE_FALSE') {
      if (typeof jwb === 'object') {
        return Object.entries(jwb).map(([k, v]) => `P${Number(k)+1}:${v?'B':'S'}`).join(' | ');
      }
      return '-';
    }
    return String(jwb);
  };

  const renderOpsiReview = (j) => {
    const tipe = j.soal.tipe || 'SINGLE_CHOICE';
    let parsedOpsi = j.soal.opsi;
    if (typeof parsedOpsi === 'string') {
      try { parsedOpsi = JSON.parse(parsedOpsi); } catch { parsedOpsi = null; }
    }

    if (tipe === 'SINGLE_CHOICE' || tipe === 'MULTIPLE_CHOICE') {
      const keys = Object.keys(parsedOpsi || {});
      if (keys.length === 0) return null;
      return (
        <div className="opsi-list opsi-list-sm" style={{ marginBottom: '1rem' }}>
          {keys.map(key => {
            const isCorrect = tipe === 'SINGLE_CHOICE'
              ? j.kunciJawaban === key
              : Array.isArray(j.kunciJawaban) && j.kunciJawaban.includes(key);
            const isSelected = tipe === 'SINGLE_CHOICE'
              ? j.jawabanUser === key
              : Array.isArray(j.jawabanUser) && j.jawabanUser.includes(key);

            let className = 'opsi-btn ';
            if (isCorrect) className += 'opsi-correct';
            else if (isSelected && !isCorrect) className += 'opsi-wrong';

            return (
              <div key={key} className={className} style={{ pointerEvents: 'none' }}>
                <span className="opsi-key">
                  {tipe === 'MULTIPLE_CHOICE' ? <input type="checkbox" checked={isSelected} readOnly /> : key.toUpperCase()}
                </span>
                <span>{parsedOpsi[key]}</span>
              </div>
            );
          })}
        </div>
      );
    } else if (tipe === 'TRUE_FALSE') {
      if (!Array.isArray(parsedOpsi)) return null;
      return (
        <div style={{ marginBottom: '1rem' }}>
          <table className="admin-table tf-table" style={{ background: 'var(--bg2)' }}>
            <thead><tr><th>Pernyataan</th><th width="80" style={{ textAlign: 'center' }}>Benar</th><th width="80" style={{ textAlign: 'center' }}>Salah</th></tr></thead>
            <tbody>
              {parsedOpsi.map((stmt, idx) => {
                const userAns = j.jawabanUser?.[idx];
                const keyAns = j.kunciJawaban?.[idx];
                const rowCorrect = userAns === keyAns;
                return (
                  <tr key={idx} style={{ background: rowCorrect ? 'transparent' : 'rgba(239, 68, 68, 0.1)' }}>
                    <td>{stmt} {rowCorrect ? <span className="text-green text-sm"><Check size={16} /></span> : <span className="text-red text-sm"><X size={16} /> (Kunci: {keyAns ? 'Benar' : 'Salah'})</span>}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="radio" checked={userAns === true} readOnly />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="radio" checked={userAns === false} readOnly />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // SHORT_ANSWER does not render options
    return null;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="hasil-header">
          <Link to="/riwayat" className="back-btn">← Riwayat</Link>
          <h1 className="page-title">Hasil Latihan</h1>
          <span className="mapel-badge-lg">{detail.mapel}</span>
        </div>

        {/* Score card */}
        <div className="score-card">
          <div className="score-ring-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={r} fill="none" stroke="#1e1e2e" strokeWidth="10" />
              <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${(skor / 100) * circ} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 1s ease' }} />
              <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{skor}</text>
              <text x="70" y="85" textAnchor="middle" fill="#888" fontSize="12">SKOR</text>
            </svg>
          </div>
          <div className="score-stats">
            <div className="score-stat score-benar">
              <span className="score-stat-val">{benar}</span>
              <span><CheckCircle size={20} /> Benar</span>
            </div>
            <div className="score-stat score-salah">
              <span className="score-stat-val">{salah}</span>
              <span><XCircle size={20} /> Salah</span>
            </div>
            <div className="score-stat">
              <span className="score-stat-val">{total}</span>
              <span><FileText size={20} /> Total</span>
            </div>
          </div>
          <div className="score-actions">
            <Link to="/latihan" className="btn btn-primary">Latihan Lagi</Link>
            <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
          </div>
        </div>

        {/* Pembahasan */}
        {detail.jawabans && detail.jawabans.length > 0 && (
          <>
            <div className="tabs">
              {['semua', 'benar', 'salah'].map((t) => (
                <button key={t} className={`tab ${activeTab === t ? 'tab-active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="pembahasan-list">
              {filtered.map((j, i) => (
                <div key={j.id} className={`pembahasan-card ${j.benar ? 'card-benar' : 'card-salah'}`}>
                  <div className="pembahasan-header">
                    <span className="soal-num">Soal {i + 1}</span>
                    <span className={`result-badge ${j.benar ? 'badge-benar' : 'badge-salah'}`}>
                      {j.benar ? '<Check size={16} /> Benar' : '<X size={16} /> Salah'}
                    </span>
                  </div>
                  
                  <p className="pembahasan-pertanyaan">{j.soal?.pertanyaan}</p>
                  
                  {renderOpsiReview(j)}

                  <div className="jawaban-info">
                    <span>Jawabanmu: <strong className={j.benar ? 'text-green' : 'text-red'}>{formatJawaban(j.soal?.tipe, j.jawabanUser)}</strong></span>
                    {!j.benar && <span>Kunci: <strong className="text-green">{formatJawaban(j.soal?.tipe, j.kunciJawaban)}</strong></span>}
                  </div>
                  
                  {j.soal?.pembahasan && (
                    <div className="pembahasan-text">
                      <span className="pembahasan-label"><Lightbulb size={20} /> Pembahasan</span>
                      <p>{j.soal.pembahasan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
