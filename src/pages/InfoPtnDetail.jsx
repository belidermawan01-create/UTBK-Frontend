import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Flag,
  Building2,
  BookOpen,
  Layers,
} from "lucide-react";
import { getPtnById, getJurusanList } from "../api/api";
import harvardDefault from "../assets/harvard.jpg";

export default function InfoPtnDetail() {
  const { id } = useParams();
  const [ptn, setPtn] = useState(null);
  const [jurusanList, setJurusanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ptnRes, jurusanRes] = await Promise.all([
          getPtnById(id),
          getJurusanList({ ptnId: id }),
        ]);
        setPtn(ptnRes.data?.data || null);
        setJurusanList(jurusanRes.data?.data || []);
      } catch (err) {
        console.error(err);
        setPtn(null);
        setJurusanList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const relatedJurusanList = jurusanList.filter(
    (jurusan) => String(jurusan.ptnId) === String(id),
  );
  const jurusanCount = relatedJurusanList.length;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Detail PTN</h1>
            <p className="page-sub">
              Informasi lengkap PTN dan jurusan yang tersedia.
            </p>
          </div>
          <Link to="/info-ptn" className="btn btn-ghost">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        {loading ? (
          <div className="full-center" style={{ minHeight: 260 }}>
            <div className="spinner" />
          </div>
        ) : !ptn ? (
          <div className="empty-state">
            <h3>PTN tidak ditemukan</h3>
            <p>Periksa kembali daftar PTN atau pilih PTN lain.</p>
          </div>
        ) : (
          <div className="ptn-detail-page">
            <section className="ptn-detail-hero">
              <div
                className="ptn-detail-cover"
                style={{
                  backgroundImage: `url(${ptn.logoUrl || harvardDefault})`,
                }}
              >
                <div className="ptn-detail-cover-overlay" />
                <div className="ptn-detail-title">
                  <span className="ptn-detail-badge">
                    {ptn.singkatan || "PTN"}
                  </span>
                  <h2>{ptn.nama}</h2>
                </div>
              </div>

              <div className="ptn-detail-card">
                <div className="ptn-detail-summary">
                  <div>
                    <p>{ptn.deskripsi || "Deskripsi PTN tidak tersedia."}</p>
                  </div>
                  <div className="ptn-detail-meta">
                    <span>
                      <MapPin size={16} /> {ptn.kota}, {ptn.provinsi}
                    </span>
                    <span>
                      <Globe size={16} /> {ptn.tipe}
                    </span>
                    <span>
                      <Flag size={16} /> {ptn.akreditasi || "-"}
                    </span>
                  </div>
                </div>

                <div className="ptn-detail-stats">
                  <div className="ptn-detail-stat">
                    <strong>{jurusanCount}</strong>
                    <span>Jumlah Jurusan</span>
                  </div>
                  <div className="ptn-detail-stat">
                    <strong>
                      {ptn.website ? "Tersedia" : "Tidak tersedia"}
                    </strong>
                    <span>Website resmi</span>
                  </div>
                  <div className="ptn-detail-stat">
                    <strong>{ptn.tipe}</strong>
                    <span>Tipe PTN</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="ptn-detail-section">
              <div className="section-heading">
                <div>
                  <h3>Jurusan & Fakultas</h3>
                  <p>Daftar jurusan yang tersedia di PTN ini.</p>
                </div>
                <span className="section-tag">
                  <Building2 size={16} /> Fakultas & Jurusan
                </span>
              </div>

              {relatedJurusanList.length === 0 ? (
                <div className="empty-state">
                  <h3>Belum ada data jurusan</h3>
                  <p>
                    PTN ini belum memiliki jurusan yang terdaftar di sistem.
                  </p>
                </div>
              ) : (
                <div className="jurusan-detail-grid">
                  {relatedJurusanList.map((jurusan) => (
                    <article key={jurusan.id} className="jurusan-detail-card">
                      <div className="jurusan-detail-header">
                        <div>
                          <h4>{jurusan.nama}</h4>
                          <p>{jurusan.fakultas || "Fakultas tidak tersedia"}</p>
                        </div>
                        <span className="jurusan-pill">
                          {jurusan.jenjang || "-"}
                        </span>
                      </div>
                      <div className="jurusan-detail-meta">
                        <span>
                          <Layers size={14} />{" "}
                          {jurusan.kelompok || "Kelompok belum ditentukan"}
                        </span>
                        {jurusan.passingGrade != null && (
                          <span>
                            <Flag size={14} /> PG {jurusan.passingGrade}
                          </span>
                        )}
                      </div>
                      <div className="jurusan-detail-body">
                        <p>
                          {jurusan.deskripsi ||
                            "Deskripsi jurusan belum tersedia."}
                        </p>
                        <div className="jurusan-detail-foot">
                          <span>
                            Daya Tampung: {jurusan.dayaTampung ?? "-"}
                          </span>
                          <span>Kode: {jurusan.kode || "-"}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
