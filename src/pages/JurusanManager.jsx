import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Book, Plus, Search, Edit3, Trash2 } from "lucide-react";
import {
  getPtnList,
  getJurusanList,
  getJurusanById,
  createJurusan,
  updateJurusan,
  deleteJurusan,
} from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";

const JURUSAN_INITIAL_FORM = {
  ptnId: "",
  nama: "",
  kode: "",
  fakultas: "",
  jenjang: "S1",
  kelompok: "SAINTEK",
  dayaTampung: "",
  passingGrade: "",
  deskripsi: "",
  prospekKerja: "",
};

export default function JurusanManager() {
  const [jurusanList, setJurusanList] = useState([]);
  const [ptnOptions, setPtnOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPtnFilter, setSelectedPtnFilter] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jurusanModalOpen, setJurusanModalOpen] = useState(false);
  const [jurusanEditId, setJurusanEditId] = useState(null);
  const [jurusanForm, setJurusanForm] = useState(JURUSAN_INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteJurusanId, setDeleteJurusanId] = useState(null);
  const { toasts, addToast } = useToast();

  const fetchPtnOptions = useCallback(async () => {
    try {
      const res = await getPtnList();
      setPtnOptions(res.data?.data || []);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal mengambil daftar PTN",
        "error",
      );
      setPtnOptions([]);
    }
  }, [addToast]);

  const fetchJurusan = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterKelompok) params.kelompok = filterKelompok;
      if (filterJenjang) params.jenjang = filterJenjang;
      const res = await getJurusanList(params);
      setJurusanList(res.data?.data || []);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal mengambil daftar jurusan",
        "error",
      );
      setJurusanList([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterKelompok, filterJenjang, addToast]);

  useEffect(() => {
    fetchPtnOptions();
    fetchJurusan();
  }, [fetchPtnOptions, fetchJurusan]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedPtnFilter, filterKelompok, filterJenjang]);

  const visibleJurusan = useMemo(() => {
    const filtered = jurusanList.filter((jurusan) => {
      if (selectedPtnFilter && jurusan.ptnId !== selectedPtnFilter)
        return false;
      return true;
    });

    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [jurusanList, page, pageSize, selectedPtnFilter]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      jurusanList.filter(
        (jurusan) => !selectedPtnFilter || jurusan.ptnId === selectedPtnFilter,
      ).length / pageSize,
    ),
  );

  const openCreateJurusan = () => {
    setJurusanForm({
      ...JURUSAN_INITIAL_FORM,
      ptnId: selectedPtnFilter || ptnOptions[0]?.id || "",
    });
    setJurusanEditId(null);
    setJurusanModalOpen(true);
  };

  const openEditJurusan = async (jurusan) => {
    try {
      const res = await getJurusanById(jurusan.id);
      const data = res.data?.data || jurusan;
      setJurusanForm({
        ptnId: data.ptnId || "",
        nama: data.nama || "",
        kode: data.kode || "",
        fakultas: data.fakultas || "",
        jenjang: data.jenjang || "S1",
        kelompok: data.kelompok || "SAINTEK",
        dayaTampung: data.dayaTampung?.toString() || "",
        passingGrade: data.passingGrade?.toString() || "",
        deskripsi: data.deskripsi || "",
        prospekKerja: data.prospekKerja || "",
      });
      setJurusanEditId(data.id);
      setJurusanModalOpen(true);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal mengambil data jurusan",
        "error",
      );
    }
  };

  const handleJurusanSubmit = async (e) => {
    e.preventDefault();
    if (!jurusanForm.ptnId) {
      addToast("Pilih PTN untuk jurusan ini.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ptnId: jurusanForm.ptnId,
        nama: jurusanForm.nama,
        kode: jurusanForm.kode,
        fakultas: jurusanForm.fakultas,
        jenjang: jurusanForm.jenjang,
        kelompok: jurusanForm.kelompok,
        dayaTampung: jurusanForm.dayaTampung
          ? Number(jurusanForm.dayaTampung)
          : undefined,
        passingGrade: jurusanForm.passingGrade
          ? Number(jurusanForm.passingGrade)
          : undefined,
        deskripsi: jurusanForm.deskripsi,
        prospekKerja: jurusanForm.prospekKerja,
      };

      if (jurusanEditId) {
        await updateJurusan(jurusanEditId, payload);
        addToast("Jurusan berhasil diperbarui", "success");
      } else {
        await createJurusan(payload);
        addToast("Jurusan baru berhasil ditambahkan", "success");
      }

      setJurusanModalOpen(false);
      await fetchJurusan();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal menyimpan jurusan",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJurusan = async () => {
    if (!deleteJurusanId) return;
    setSubmitting(true);
    try {
      await deleteJurusan(deleteJurusanId);
      addToast("Jurusan berhasil dihapus", "success");
      setDeleteJurusanId(null);
      await fetchJurusan();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Gagal menghapus jurusan",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCount = jurusanList.filter(
    (jurusan) => !selectedPtnFilter || jurusan.ptnId === selectedPtnFilter,
  ).length;

  return (
    <div className="page-wrapper admin-wrapper">
      <Toast toasts={toasts} />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kelola Jurusan</h1>
            <p className="page-sub">
              Tambahkan dan perbarui jurusan PTN secara terpisah dari daftar
              PTN.
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
            <input
              type="text"
              className="admin-select"
              placeholder="Cari jurusan"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="admin-select"
              value={selectedPtnFilter}
              onChange={(e) => setSelectedPtnFilter(e.target.value)}
            >
              <option value="">Semua PTN</option>
              {ptnOptions.map((ptn) => (
                <option key={ptn.id} value={ptn.id}>
                  {ptn.singkatan} - {ptn.nama}
                </option>
              ))}
            </select>
            <select
              className="admin-select"
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
            >
              <option value="">Semua Kelompok</option>
              <option value="SAINTEK">SAINTEK</option>
              <option value="SOSHUM">SOSHUM</option>
              <option value="CAMPURAN">CAMPURAN</option>
            </select>
            <select
              className="admin-select"
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
            >
              <option value="">Semua Jenjang</option>
              <option value="S1">S1</option>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={fetchJurusan}
            >
              <Search size={16} /> Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={openCreateJurusan}
            >
              <Plus size={16} /> Tambah Jurusan
            </button>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: "1rem" }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kode</th>
                  <th>Fakultas</th>
                  <th>PTN</th>
                  <th>Jenjang</th>
                  <th>Kelompok</th>
                  <th>Passing Grade</th>
                  <th width="150">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <span className="spinner-sm" />
                    </td>
                  </tr>
                ) : visibleJurusan.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Belum ada jurusan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  visibleJurusan.map((jurusan) => (
                    <tr key={jurusan.id}>
                      <td>{jurusan.nama}</td>
                      <td>{jurusan.kode}</td>
                      <td>{jurusan.fakultas}</td>
                      <td>{jurusan.ptn?.singkatan ?? jurusan.ptnId}</td>
                      <td>{jurusan.jenjang}</td>
                      <td>{jurusan.kelompok}</td>
                      <td>{jurusan.passingGrade ?? "-"}</td>
                      <td>
                        <div className="flex-actions">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => openEditJurusan(jurusan)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteJurusanId(jurusan.id)}
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
              Menampilkan {visibleJurusan.length} dari {filteredCount} jurusan
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
      </div>

      {jurusanModalOpen && (
        <div className="modal-overlay modal-scrollable">
          <div className="modal modal-lg">
            <h3>{jurusanEditId ? "Edit Jurusan" : "Tambah Jurusan Baru"}</h3>
            <form onSubmit={handleJurusanSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>PTN</label>
                  <select
                    required
                    value={jurusanForm.ptnId}
                    onChange={(e) =>
                      setJurusanForm({ ...jurusanForm, ptnId: e.target.value })
                    }
                  >
                    <option value="">Pilih PTN</option>
                    {ptnOptions.map((ptn) => (
                      <option key={ptn.id} value={ptn.id}>
                        {ptn.singkatan} - {ptn.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nama Jurusan</label>
                  <input
                    required
                    value={jurusanForm.nama}
                    onChange={(e) =>
                      setJurusanForm({ ...jurusanForm, nama: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kode</label>
                  <input
                    required
                    value={jurusanForm.kode}
                    onChange={(e) =>
                      setJurusanForm({ ...jurusanForm, kode: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Fakultas</label>
                  <input
                    required
                    value={jurusanForm.fakultas}
                    onChange={(e) =>
                      setJurusanForm({
                        ...jurusanForm,
                        fakultas: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Jenjang</label>
                  <select
                    required
                    value={jurusanForm.jenjang}
                    onChange={(e) =>
                      setJurusanForm({
                        ...jurusanForm,
                        jenjang: e.target.value,
                      })
                    }
                  >
                    <option value="S1">S1</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Kelompok</label>
                  <select
                    required
                    value={jurusanForm.kelompok}
                    onChange={(e) =>
                      setJurusanForm({
                        ...jurusanForm,
                        kelompok: e.target.value,
                      })
                    }
                  >
                    <option value="SAINTEK">SAINTEK</option>
                    <option value="SOSHUM">SOSHUM</option>
                    <option value="CAMPURAN">CAMPURAN</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Daya Tampung</label>
                  <input
                    type="number"
                    min="0"
                    value={jurusanForm.dayaTampung}
                    onChange={(e) =>
                      setJurusanForm({
                        ...jurusanForm,
                        dayaTampung: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Passing Grade</label>
                  <input
                    type="number"
                    step="0.1"
                    value={jurusanForm.passingGrade}
                    onChange={(e) =>
                      setJurusanForm({
                        ...jurusanForm,
                        passingGrade: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  rows="3"
                  value={jurusanForm.deskripsi}
                  onChange={(e) =>
                    setJurusanForm({
                      ...jurusanForm,
                      deskripsi: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Prospek Kerja</label>
                <textarea
                  rows="2"
                  value={jurusanForm.prospekKerja}
                  onChange={(e) =>
                    setJurusanForm({
                      ...jurusanForm,
                      prospekKerja: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setJurusanModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan Jurusan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteJurusanId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Hapus Jurusan?</h3>
            <p>Jurusan yang dihapus akan hilang permanen dari PTN ini.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteJurusanId(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteJurusan}
                disabled={submitting}
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Jurusan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
