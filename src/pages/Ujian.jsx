import { Check } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { submitLatihan, getDetailLatihan } from '../api/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Ujian() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Use a ref for submitting to avoid stale closure in timer
  const submittingRef = useRef(false);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const currentSession = session;
      if (!currentSession) return;
      const soalList = currentSession.soal || [];

      const jawabans = soalList
        .filter((s) => {
          const ans = answers[s.id];
          return ans !== undefined && ans !== null && (typeof ans !== 'string' || ans.trim() !== '');
        })
        .map((s) => ({ soalId: s.id, jawaban: answers[s.id] }));

      if (!auto && jawabans.length === 0) {
        setShowConfirm(true);
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      const res = await submitLatihan(sessionId, { jawabans });
      navigate(`/hasil/${sessionId}`, { state: { hasil: res.data.data } });
    } catch (error) {
      addToast(error.response?.data?.message || 'Gagal submit', 'error');
      submittingRef.current = false;
      setSubmitting(false);
      setShowConfirm(false);
    }
  }, [session, answers, sessionId, navigate, addToast]);

  // Load session if not passed via state
  useEffect(() => {
    if (!session) {
      getDetailLatihan(sessionId)
        .then((r) => {
          const s = r.data.data;
          if (s.selesai) { navigate(`/hasil/${sessionId}`); return; }
          setSession(s);
          const mins = (s.soal?.length || 10) * 2;
          setTimeLeft(mins * 60);
        })
        .catch(() => navigate('/riwayat'))
        .finally(() => setLoading(false));
    } else {
      const mins = (session.soal?.length || 10) * 2;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(mins * 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, handleSubmit]);

  if (loading) return <div className="full-center"><div className="spinner" /></div>;
  if (!session) return null;

  const soalList = session.soal || [];
  const soal = soalList[current];

  const isAnswered = (s) => {
    const ans = answers[s.id];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    if (typeof ans === 'string') return ans.trim() !== '';
    return false;
  };

  const answered = soalList.filter(isAnswered).length;
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const renderOpsi = () => {
    if (!soal) return null;
    const tipe = soal.tipe || 'SINGLE_CHOICE';
    let parsedOpsi = soal.opsi;
    if (typeof parsedOpsi === 'string') {
      try { parsedOpsi = JSON.parse(parsedOpsi); } catch { parsedOpsi = {}; }
    }

    if (tipe === 'SINGLE_CHOICE') {
      const keys = Object.keys(parsedOpsi || {});
      if (keys.length === 0) return <p className="text-muted">Tidak ada opsi jawaban tersedia.</p>;
      return keys.map((key) => (
        <button key={key} className={`opsi-btn ${answers[soal.id] === key ? 'opsi-selected' : ''}`}
          onClick={() => setAnswers((p) => ({ ...p, [soal.id]: key }))}>
          <span className="opsi-key">{key.toUpperCase()}</span>
          <span>{parsedOpsi[key]}</span>
        </button>
      ));
    }

    if (tipe === 'MULTIPLE_CHOICE') {
      const keys = Object.keys(parsedOpsi || {});
      if (keys.length === 0) return <p className="text-muted">Tidak ada opsi jawaban tersedia.</p>;
      return keys.map((key) => {
        const currentAns = answers[soal.id] || [];
        const isChecked = currentAns.includes(key);
        return (
          <button key={key} className={`opsi-btn ${isChecked ? 'opsi-selected' : ''}`}
            onClick={() => {
              let newAns = [...currentAns];
              if (isChecked) newAns = newAns.filter(x => x !== key);
              else newAns.push(key);
              setAnswers(p => ({ ...p, [soal.id]: newAns }));
            }}>
            <span className="opsi-key">
              <input type="checkbox" checked={isChecked} readOnly style={{ pointerEvents: 'none' }} />
            </span>
            <span>{parsedOpsi[key]}</span>
          </button>
        );
      });
    }

    if (tipe === 'TRUE_FALSE') {
      if (!Array.isArray(parsedOpsi)) return <p className="text-muted">Format opsi tidak valid.</p>;
      return (
        <table className="admin-table tf-table" style={{ background: 'var(--bg2)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead><tr><th>Pernyataan</th><th width="80" style={{ textAlign: 'center' }}>Benar</th><th width="80" style={{ textAlign: 'center' }}>Salah</th></tr></thead>
          <tbody>
            {parsedOpsi.map((stmt, idx) => {
              const currentAns = answers[soal.id] || {};
              return (
                <tr key={idx}>
                  <td>{stmt}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="radio" checked={currentAns[idx] === true}
                      onChange={() => setAnswers(p => ({ ...p, [soal.id]: { ...(p[soal.id] || {}), [idx]: true } }))} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="radio" checked={currentAns[idx] === false}
                      onChange={() => setAnswers(p => ({ ...p, [soal.id]: { ...(p[soal.id] || {}), [idx]: false } }))} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (tipe === 'SHORT_ANSWER') {
      return (
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <input type="text" className="admin-select"
            style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
            placeholder="Ketik jawaban kamu di sini..."
            value={answers[soal.id] || ''}
            onChange={(ev) => setAnswers(p => ({ ...p, [soal.id]: ev.target.value }))}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ujian-page">
      <Toast toasts={toasts} />

      {/* Header bar */}
      <div className="ujian-topbar">
        <div className="ujian-progress-info">
          <span className="mapel-badge-sm">{session.mapel}</span>
          <span>{answered}/{soalList.length} dijawab</span>
        </div>
        {timeLeft !== null && (
          <div className={`timer ${timeLeft < 60 ? 'timer-red' : timeLeft < 300 ? 'timer-amber' : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
        <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)} disabled={submitting}>
          Selesai
        </button>
      </div>

      <div className="ujian-body">
        {/* Navigator */}
        <div className="ujian-nav">
          <div className="nav-title">Navigasi Soal</div>
          <div className="nav-grid">
            {soalList.map((s, i) => (
              <button
                key={s.id}
                className={`nav-btn ${current === i ? 'nav-btn-active' : ''} ${isAnswered(s) ? 'nav-btn-answered' : ''}`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="nav-legend">
            <span className="legend-item"><span className="dot dot-answered" /> Dijawab</span>
            <span className="legend-item"><span className="dot dot-empty" /> Belum</span>
          </div>
        </div>

        {/* Soal */}
        {soal && (
          <div className="ujian-soal">
            <div className="soal-header">
              <span className="soal-num">Soal {current + 1}</span>
              <span className={`tingkat-badge tingkat-${soal.tingkat}`}>{soal.tingkat}</span>
              <span className="badge-outline" style={{ marginLeft: 'auto' }}>{soal.tipe || 'SINGLE_CHOICE'}</span>
            </div>
            <p className="soal-pertanyaan">{soal.pertanyaan?.replace(/\[SEED\]\s*/g, '')}</p>
            <div className="opsi-list">
              {renderOpsi()}
            </div>
            <div className="soal-nav-btns">
              <button className="btn btn-ghost" onClick={() => setCurrent((p) => Math.max(0, p - 1))} disabled={current === 0}>
                ← Sebelumnya
              </button>
              {current < soalList.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrent((p) => p + 1)}>
                  Selanjutnya →
                </button>
              ) : (
                <button className="btn btn-success" onClick={() => setShowConfirm(true)}>
                  <Check size={16} /> Selesai
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Kumpulkan Jawaban?</h3>
            <p>Kamu sudah menjawab <strong>{answered}</strong> dari <strong>{soalList.length}</strong> soal. Soal yang belum dijawab tidak akan dinilai.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Kembali</button>
              <button className="btn btn-primary" onClick={() => handleSubmit(true)} disabled={submitting}>
                {submitting ? <span className="spinner-sm" /> : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
