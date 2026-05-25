import { Lightbulb, Target, Landmark, Medal, ClipboardList, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getJalur, getJalurBySlug } from '../api/api';

const SLUG_ICON = { snbt: <Target size={20} />, mandiri: <Landmark size={20} />, prestasi: <Medal size={20} /> };

export default function InfoPtn() {
  const [jalurList, setJalurList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getJalur()
      .then((r) => setJalurList(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (slug) => {
    if (selected === slug) { setSelected(null); setDetail(null); return; }
    setSelected(slug);
    setLoadingDetail(true);
    try {
      const r = await getJalurBySlug(slug);
      setDetail(r.data.data);
    } catch (_) {}
    finally { setLoadingDetail(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Info Jalur PTN</h1>
            <p className="page-sub">Panduan lengkap jalur masuk Perguruan Tinggi Negeri</p>
          </div>
        </div>

        {loading ? (
          <div className="full-center"><div className="spinner" /></div>
        ) : (
          <div className="jalur-list">
            {jalurList.map((j) => (
              <div key={j.slug} className={`jalur-card ${selected === j.slug ? 'jalur-card-open' : ''}`}>
                <button className="jalur-card-header" onClick={() => handleSelect(j.slug)}>
                  <div className="jalur-card-title">
                    <span className="jalur-icon">{SLUG_ICON[j.slug] || <ClipboardList size={20} />}</span>
                    <div>
                      <div className="jalur-nama">{j.nama}</div>
                      <div className="jalur-desc">{j.deskripsi}</div>
                    </div>
                  </div>
                  <span className="jalur-chevron">{selected === j.slug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </button>

                {selected === j.slug && (
                  <div className="jalur-body">
                    {loadingDetail ? (
                      <div className="full-center" style={{ padding: '2rem' }}><div className="spinner" /></div>
                    ) : detail && (
                      <div className="jalur-detail-grid">
                        <div className="jalur-section">
                          <h4><ClipboardList size={20} /> Syarat</h4>
                          <ul>{detail.syarat?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div className="jalur-section">
                          <h4><Calendar size={20} /> Tahapan</h4>
                          <ol>{detail.tahapan?.map((t, i) => <li key={i}>{t}</li>)}</ol>
                        </div>
                        <div className="jalur-section jalur-tips">
                          <h4><Lightbulb size={20} /> Tips</h4>
                          <ul>{detail.tips?.map((t, i) => <li key={i}>{t}</li>)}</ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
