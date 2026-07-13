import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Globe, Plus, Search, Edit3, Trash2 } from "lucide-react";
import {
  getPtnList,
  getPtnById,
  createPtn,
  updatePtn,
  deletePtn,
} from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";

const PTN_INITIAL_FORM = {
  nama: "",
  singkatan: "",
  kota: "",
  provinsi: "",
  akreditasi: "Unggul",
  tipe: "Universitas",
  website: "",
  logoUrl: "",
  deskripsi: "",
};

export default function PtnManager() {
  const [ptnList, setPtnList] = useState([]);
  const [selectedPtnId, setSelectedPtnId] = useState("");
  const [selectedPtn, setSelectedPtn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ptnModalOpen, setPtnModalOpen] = useState(false);
  const [ptnEditId, setPtnEditId] = useState(null);
  const [ptnForm, setPtnForm] = useState(PTN_INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletePtnId, setDeletePtnId] = useState(null);
  const { toasts, addToast } = useToast();

  const fetchPtnList = useCallback(
    async (query = "") => {
      setLoading(true);
      try {
        const params = {};
        if (query) params.search = query;
        const res = await getPtnList(params);
        const payload = res.data?.data || [];
        setPtnList(payload);
      } catch (err) {
        addToast(
          err.response?.data?.message || "Gagal mengambil daftar PTN",
          "error",
        );
        setPtnList([]);
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const fetchPtnDetail = useCallback(
    async (id) => {
      if (!id) {
        setSelectedPtn(null);
        return;
      }

      setDetailLoading(true);
      try {
        const res = await getPtnById(id);
        setSelectedPtn(res.data?.data || null);
      } catch (err) {
        addToast(
          err.response?.data?.message || "Gagal mengambil detail PTN",
          "error",
        );
        setSelectedPtn(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    fetchPtnList();
  }, [fetchPtnList]);

  useEffect(() => {
    if (!selectedPtnId && ptnList.length > 0) {
      setSelectedPtnId(ptnList[0].id);
    }
  }, [ptnList, selectedPtnId]);

  useEffect(() => {
    if (selectedPtnId) {
      fetchPtnDetail(selectedPtnId);
    } else {
      setSelectedPtn(null);
    }
  }, [selectedPtnId, fetchPtnDetail]);

  const clearPtnForm = () => {
    setPtnForm(PTN_INITIAL_FORM);
    setPtnEditId(null);
  };

  const handleOpenCreatePtn = () => {
    clearPtnForm();
    setPtnModalOpen(true);
  };

  const handleEditPtn = (ptn) => {
    setPtnForm({
      nama: ptn.nama || "",
      singkatan: ptn.singkatan || "",
      kota: ptn.kota || "",
      provinsi: ptn.provinsi || "",
      akreditasi: ptn.akreditasi || "Unggul",
      tipe: ptn.tipe || "Universitas",
      website: ptn.website || "",
      logoUrl: ptn.logoUrl || "",
      deskripsi: ptn.deskripsi || "",
    });
    setPtnEditId(ptn.id);
    setPtnModalOpen(true);
  };

  const handlePtnSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        nama: ptnForm.nama,
        singkatan: ptnForm.singkatan,
        kota: ptnForm.kota,
        provinsi: ptnForm.provinsi,
        akreditasi: ptnForm.akreditasi,
        tipe: ptnForm.tipe,
        website: ptnForm.website,
        logoUrl: ptnForm.logoUrl,
        deskripsi: ptnForm.deskripsi,
      };

      if (ptnEditId) {
        const res = await updatePtn(ptnEditId, payload);
        addToast("Data PTN berhasil diperbarui", "success");
        await fetchPtnList(search);
        setSelectedPtnId(ptnEditId);
        await fetchPtnDetail(ptnEditId);
      } else {
        const res = await createPtn(payload);
        addToast("PTN baru berhasil ditambahkan", "success");
        await fetchPtnList(search);
        const createdId = res.data?.data?.id;
        if (createdId) {
          setSelectedPtnId(createdId);
          await fetchPtnDetail(createdId);
        }
      }
      setPtnModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || "Gagal menyimpan PTN", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePtn = async () => {
    if (!deletePtnId) return;
    setSubmitting(true);
    try {
      await deletePtn(deletePtnId);
      addToast("PTN berhasil dihapus", "success");
      setDeletePtnId(null);
      await fetchPtnList(search);
      setSelectedPtnId("");
      setSelectedPtn(null);
    } catch (err) {
      addToast(err.response?.data?.message || "Gagal menghapus PTN", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const visiblePtnList = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return ptnList.slice(startIndex, startIndex + pageSize);
  }, [ptnList, page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(ptnList.length / pageSize));

  const handleSearch = () => {
    setPage(1);
    fetchPtnList(search);
  };

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount, page]);

  return (
    <div className="page-wrapper admin-wrapper">
      <Toast toasts={toasts} />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kelola PTN</h1>
            <p className="page-sub">
              Tambah, sunting, atau hapus data PTN secara terpusat.
            </p>
          </div>
          <Link to="/admin/dashboard" className="btn btn-ghost">
            ← Kembali
          </Link>
        </div>

        <div
          className="admin-filters"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="admin-select"
                placeholder="Cari PTN berdasarkan nama atau singkatan"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSearch}
            >
              <Search size={16} /> Cari
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreatePtn}
            >
              <Plus size={16} /> PTN Baru
            </button>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: "1rem" }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama PTN</th>
                  <th>Singkatan</th>
                  <th>Provinsi</th>
                  <th>Tipe</th>
                  <th>Akreditasi</th>
                  <th width="160">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <span className="spinner-sm" />
                    </td>
                  </tr>
                ) : ptnList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Belum ada data PTN.
                    </td>
                  </tr>
                ) : (
                  visiblePtnList.map((ptn) => (
                    <tr
                      key={ptn.id}
                      className={selectedPtnId === ptn.id ? "row-selected" : ""}
                    >
                      <td>{ptn.nama}</td>
                      <td>{ptn.singkatan}</td>
                      <td>{ptn.provinsi}</td>
                      <td>{ptn.tipe}</td>
                      <td>{ptn.akreditasi}</td>
                      <td>
                        <div className="flex-actions">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setSelectedPtnId(ptn.id)}
                          >
                            Lihat
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditPtn(ptn)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeletePtnId(ptn.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div
            className="pagination-bar"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              display: "flex",
              marginTop: "1rem",
            }}
          >
            <div className="text-muted">
              Menampilkan {visiblePtnList.length} dari {ptnList.length} PTN
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Sebelumnya
              </button>
              <span className="pagination-status">
                Halaman {page} dari {pageCount}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === pageCount}
                onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>

        {selectedPtn && (
          <div className="admin-card" style={{ marginTop: "1rem" }}>
            <div className="tryout-detail-header">
              <h3>Detail PTN Terpilih</h3>
              <p style={{ margin: 0 }}>
                {selectedPtn.deskripsi || "Tidak ada deskripsi PTN."}
              </p>
            </div>
            <div className="tryout-detail-grid">
              <div>
                <strong>Nama</strong>
                <div>{selectedPtn.nama}</div>
              </div>
              <div>
                <strong>Singkatan</strong>
                <div>{selectedPtn.singkatan}</div>
              </div>
              <div>
                <strong>Lokasi</strong>
                <div>{`${selectedPtn.kota}, ${selectedPtn.provinsi}`}</div>
              </div>
              <div>
                <strong>Akreditasi</strong>
                <div>{selectedPtn.akreditasi}</div>
              </div>
              <div>
                <strong>Tipe</strong>
                <div>{selectedPtn.tipe}</div>
              </div>
              <div>
                <strong>Website</strong>
                <div>
                  {selectedPtn.website ? (
                    <a
                      href={selectedPtn.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedPtn.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>

            <div className="tryout-detail-footer">
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => handleEditPtn(selectedPtn)}
              >
                <Edit3 size={14} /> Edit PTN
              </button>
            </div>
          </div>
        )}
      </div>

      {ptnModalOpen && (
        <div className="modal-overlay modal-scrollable">
          <div className="modal modal-lg">
            <h3>{ptnEditId ? "Edit PTN" : "Tambah PTN Baru"}</h3>
            <form onSubmit={handlePtnSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nama PTN</label>
                  <input
                    required
                    value={ptnForm.nama}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, nama: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Singkatan</label>
                  <input
                    required
                    value={ptnForm.singkatan}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, singkatan: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kota</label>
                  <input
                    required
                    value={ptnForm.kota}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, kota: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Provinsi</label>
                  <input
                    required
                    value={ptnForm.provinsi}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, provinsi: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Akreditasi</label>
                  <select
                    required
                    value={ptnForm.akreditasi}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, akreditasi: e.target.value })
                    }
                  >
                    <option value="Unggul">Unggul</option>
                    <option value="Baik Sekali">Baik Sekali</option>
                    <option value="Baik">Baik</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipe</label>
                  <select
                    required
                    value={ptnForm.tipe}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, tipe: e.target.value })
                    }
                  >
                    <option value="Universitas">Universitas</option>
                    <option value="Institut">Institut</option>
                    <option value="Politeknik">Politeknik</option>
                    <option value="Sekolah Tinggi">Sekolah Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={ptnForm.website}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, website: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    value={ptnForm.logoUrl}
                    onChange={(e) =>
                      setPtnForm({ ...ptnForm, logoUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  rows="3"
                  value={ptnForm.deskripsi}
                  onChange={(e) =>
                    setPtnForm({ ...ptnForm, deskripsi: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPtnModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan PTN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletePtnId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Hapus PTN?</h3>
            <p>Semua jurusan di bawah PTN ini juga akan dihapus.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeletePtnId(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeletePtn}
                disabled={submitting}
              >
                {submitting ? "Menghapus..." : "Ya, Hapus PTN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
