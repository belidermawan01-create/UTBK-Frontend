import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTryoutList } from "../api/api";
import {
  formatTryoutDate,
  getTryoutStatusClass,
  getTryoutStatusLabel,
} from "../utils/tryout";

export default function TryoutPage() {
  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTryoutList();
        setTryouts(res.data.data || []);
      } catch {
        setTryouts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tryout</h1>
            <p className="page-sub">Daftar tryout yang tersedia untuk siswa</p>
          </div>
          <Link to="/dashboard" className="btn btn-ghost">
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="full-center">
            <div className="spinner" />
          </div>
        ) : tryouts.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada tryout yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="riwayat-grid">
            {tryouts
              .filter(
                (item) =>
                  item.status === "PUBLISHED" || item.status === "ONGOING",
              )
              .map((item) => (
                <div key={item.id} className="riwayat-card">
                  <div className="riwayat-card-top">
                    <span
                      className={`status-badge ${getTryoutStatusClass(item.status)}`}
                    >
                      {getTryoutStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="riwayat-card-body">
                    <h3 style={{ marginBottom: "0.5rem" }}>{item.judul}</h3>
                    <p className="text-muted">
                      {item.deskripsi || "Tryout UTBK"}
                    </p>
                  </div>
                  <div className="riwayat-card-footer">
                    <span className="riwayat-date">
                      {formatTryoutDate(item.mulaiAt)}
                    </span>
                    <button className="btn btn-primary btn-xs" disabled>
                      Mulai
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
