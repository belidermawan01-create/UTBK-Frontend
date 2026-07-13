import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createTryout,
  getTryoutList,
  getTryoutById,
  updateTryoutStatus,
  deleteTryout,
} from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { isAdminUser } from "../utils/auth";
import {
  formatTryoutDate,
  getTryoutStatusClass,
  getTryoutStatusLabel,
  getTryoutSubtesSummary,
  canDeleteTryout,
  canPublishTryout,
} from "../utils/tryout";

export default function TryoutManager() {
  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    mulaiAt: "",
    selesaiAt: "",
    durasiTps: 90,
    durasiTka: 90,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedTryoutId, setSelectedTryoutId] = useState(null);
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { user } = useAuth();
  const { toasts, addToast } = useToast();
  const isAdmin = isAdminUser(user);

  const fetchTryoutDetail = async (id) => {
    if (!id) {
      setSelectedTryout(null);
      return;
    }

    setDetailLoading(true);
    try {
      const res = await getTryoutById(id);
      setSelectedTryout(res.data?.data || null);
    } catch (err) {
      setSelectedTryout(null);
      addToast(
        err.response?.data?.message || "Gagal mengambil detail tryout",
        "error",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchTryouts = async () => {
    setLoading(true);

    try {
      const res = await getTryoutList();
      setTryouts(res.data.data || []);
    } catch (err) {
      setTryouts([]);
      addToast(
        err.response?.data?.message || "Gagal mengambil daftar tryout",
        "error",
      );
    } finally {
      setLoading(false);
      if (selectedTryoutId) {
        await fetchTryoutDetail(selectedTryoutId);
      }
    }
  };

  useEffect(() => {
    fetchTryouts();
  }, [isAdmin]);

  const handleSelectTryout = async (id) => {
    setSelectedTryoutId(id);
    await fetchTryoutDetail(id);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createTryout({
        judul: form.judul,
        deskripsi: form.deskripsi,
        mulaiAt: form.mulaiAt,
        selesaiAt: form.selesaiAt,
        durasiTps: Number(form.durasiTps),
        durasiTka: Number(form.durasiTka),
      });
      addToast("Tryout berhasil dibuat", "success");
      await fetchTryouts();
      setForm({
        judul: "",
        deskripsi: "",
        mulaiAt: "",
        selesaiAt: "",
        durasiTps: 90,
        durasiTka: 90,
      });
    } catch (err) {
      addToast(err.response?.data?.message || "Gagal membuat tryout", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const detailRes = await getTryoutById(id);
      const tryout = detailRes.data?.data;

      if (!tryout || tryout.status !== "DRAFT") {
        addToast("Tryout hanya dapat dipublish dari status DRAFT.", "error");
        return;
      }

      if (!canPublishTryout(tryout)) {
        addToast(
          "Harap tautkan minimal 1 soal TPS dan 1 soal TKA sebelum mempublish tryout.",
          "error",
        );
        return;
      }

      await updateTryoutStatus(id, { status: "PUBLISHED" });
      addToast("Status tryout diperbarui", "success");
      await fetchTryouts();
      if (selectedTryoutId === id) {
        await fetchTryoutDetail(id);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Gagal mengubah status", "error");
    }
  };

  const handleDelete = async () => {
    const targetTryout = tryouts.find((item) => item.id === deleteId);
    if (!targetTryout) {
      addToast("Tryout tidak ditemukan", "error");
      setDeleteId(null);
      return;
    }

    if (!canDeleteTryout(targetTryout)) {
      addToast(
        "Hapus hanya diperbolehkan untuk tryout dengan status DRAFT.",
        "error",
      );
      setDeleteId(null);
      return;
    }

    try {
      await deleteTryout(deleteId);
      addToast("Tryout berhasil dihapus", "success");
      setDeleteId(null);
      if (selectedTryoutId === deleteId) {
        setSelectedTryoutId(null);
        setSelectedTryout(null);
      }
      await fetchTryouts();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal menghapus tryout",
        "error",
      );
    }
  };

  const stats = useMemo(
    () => ({
      draft: tryouts.filter((t) => t.status === "DRAFT").length,
      published: tryouts.filter((t) => t.status === "PUBLISHED").length,
      ongoing: tryouts.filter((t) => t.status === "ONGOING").length,
    }),
    [tryouts],
  );

  return (
    <div className="page-wrapper admin-wrapper">
      <Toast toasts={toasts} />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kelola Tryout</h1>
            <p className="page-sub">
              Atur tryout dari draft sampai publikasi dengan pengalaman admin
              yang lebih rapi.
            </p>
          </div>
          <Link to="/admin/dashboard" className="btn btn-ghost">
            ← Kembali
          </Link>
        </div>

        <div className="tryout-manager-shell">
          <div className="admin-card tryout-hero-card">
            <div className="tryout-hero-content">
              <span className="tryout-hero-badge">Panel Admin</span>
              <h3>Kelola Tryout secara terpusat</h3>
              <p>
                Buat tryout baru, ubah status publikasi, dan pantau draft serta
                ongoing tryout dari satu tempat.
              </p>
              <div className="tryout-hero-meta">
                <span className="tryout-pill">Draft: {stats.draft}</span>
                <span className="tryout-pill">
                  Published: {stats.published}
                </span>
                <span className="tryout-pill">Ongoing: {stats.ongoing}</span>
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: "0" }}>
            <div className="stat-card stat-card-blue">
              <div className="stat-card-value">{stats.draft}</div>
              <div className="stat-card-label">Draft</div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-card-value">{stats.published}</div>
              <div className="stat-card-label">Published</div>
            </div>
            <div className="stat-card stat-card-purple">
              <div className="stat-card-value">{stats.ongoing}</div>
              <div className="stat-card-label">Ongoing</div>
            </div>
          </div>

          <div className="admin-card tryout-form-card">
            <h3 style={{ marginBottom: "0.5rem" }}>Buat Tryout Baru</h3>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>
              {isAdmin
                ? "Admin dapat melihat tryout publik serta tryout milik sendiri, termasuk draft yang belum dipublikasikan."
                : "Isi form untuk membuat tryout baru."}
            </p>
            <form onSubmit={handleCreate} className="admin-form">
              <div className="form-group">
                <label>Judul</label>
                <input
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  rows="3"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.mulaiAt}
                    onChange={(e) =>
                      setForm({ ...form, mulaiAt: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.selesaiAt}
                    onChange={(e) =>
                      setForm({ ...form, selesaiAt: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Durasi TPS (menit)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durasiTps}
                    onChange={(e) =>
                      setForm({ ...form, durasiTps: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Durasi TKA (menit)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.durasiTka}
                    onChange={(e) =>
                      setForm({ ...form, durasiTka: e.target.value })
                    }
                  />
                </div>
              </div>
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Buat Tryout"}
              </button>
            </form>
          </div>

          {selectedTryout && (
            <div className="admin-card tryout-detail-card">
              <div className="tryout-detail-header">
                <h3>Detail Tryout</h3>
                <p>{selectedTryout.deskripsi || "Tidak ada deskripsi."}</p>
              </div>
              {detailLoading ? (
                <div className="tryout-detail-loading">
                  Memuat detail tryout...
                </div>
              ) : (
                <>
                  <div className="tryout-detail-grid">
                    <div>
                      <strong>Status</strong>
                      <div>{getTryoutStatusLabel(selectedTryout.status)}</div>
                    </div>
                    <div>
                      <strong>Mulai</strong>
                      <div>{formatTryoutDate(selectedTryout.mulaiAt)}</div>
                    </div>
                    <div>
                      <strong>Selesai</strong>
                      <div>{formatTryoutDate(selectedTryout.selesaiAt)}</div>
                    </div>
                    <div>
                      <strong>TPS</strong>
                      <div>
                        {getTryoutSubtesSummary(selectedTryout).tps} soal
                      </div>
                    </div>
                    <div>
                      <strong>TKA</strong>
                      <div>
                        {getTryoutSubtesSummary(selectedTryout).tka} soal
                      </div>
                    </div>
                  </div>
                  <div className="tryout-detail-footer">
                    {selectedTryout.status === "DRAFT" ? (
                      canPublishTryout(selectedTryout) ? (
                        <span className="status-badge status-done">
                          Siap dipublish
                        </span>
                      ) : (
                        <span className="status-badge status-ongoing">
                          Butuh minimal 1 soal TPS dan 1 soal TKA
                        </span>
                      )
                    ) : (
                      <span className="status-badge status-done">
                        Tidak bisa diubah dari halaman ini
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="admin-card tryout-table-card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Status</th>
                    <th>Waktu</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <span className="spinner-sm" />
                      </td>
                    </tr>
                  ) : tryouts.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="tryout-empty-state">
                          Belum ada tryout yang tersedia.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tryouts.map((item) => (
                      <tr key={item.id}>
                        <td>{item.judul}</td>
                        <td>
                          <span
                            className={`status-badge ${getTryoutStatusClass(item.status)}`}
                          >
                            {getTryoutStatusLabel(item.status)}
                          </span>
                        </td>
                        <td>
                          {formatTryoutDate(item.mulaiAt)} <br />{" "}
                          {formatTryoutDate(item.selesaiAt)}
                        </td>
                        <td>
                          <div className="flex-actions">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleSelectTryout(item.id)}
                            >
                              Detail
                            </button>
                            {item.status === "DRAFT" && (
                              <>
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => handlePublish(item.id)}
                                >
                                  Publish
                                </button>
                                <button
                                  className="btn btn-danger btn-xs"
                                  onClick={() => setDeleteId(item.id)}
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Hapus Tryout?</h3>
            <p>Tindakan ini tidak dapat dibatalkan.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
