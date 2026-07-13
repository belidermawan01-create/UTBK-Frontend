import { useState, useEffect, useCallback } from "react";
import {
  getSoal,
  createSoal,
  updateSoal,
  deleteSoal,
  addTryoutSubtes,
  getTryoutList,
  getTryoutById,
} from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import { getTryoutStatusLabel } from "../utils/tryout";

const getInitialOpsi = (tipe) => {
  if (tipe === "TRUE_FALSE") return ["", ""];
  if (tipe === "SHORT_ANSWER") return null;
  return { A: "", B: "", C: "", D: "", E: "" }; // SINGLE & MULTIPLE
};

const getInitialJawaban = (tipe) => {
  if (tipe === "MULTIPLE_CHOICE") return [];
  if (tipe === "TRUE_FALSE") return { 0: true, 1: true };
  return ""; // SINGLE & SHORT_ANSWER
};

const INITIAL_FORM = {
  tipe: "SINGLE_CHOICE",
  pertanyaan: "",
  opsi: getInitialOpsi("SINGLE_CHOICE"),
  jawaban: getInitialJawaban("SINGLE_CHOICE"),
  pembahasan: "",
  mapel: "TPS",
  tingkat: "mudah",
};

export default function SoalManager() {
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMapel, setFilterMapel] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [draftTryouts, setDraftTryouts] = useState([]);
  const [selectedTryoutId, setSelectedTryoutId] = useState("");
  const [selectedTryout, setSelectedTryout] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState("TPS");
  const [selectedSoalIds, setSelectedSoalIds] = useState([]);
  const [assignedSoalIds, setAssignedSoalIds] = useState([]);
  const [subtesCounts, setSubtesCounts] = useState({ tps: 0, tka: 0 });
  const [assigning, setAssigning] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const { toasts, addToast } = useToast();

  const fetchSoal = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMapel) params.mapel = filterMapel;
      if (filterTingkat) params.tingkat = filterTingkat;
      const res = await getSoal(params);
      setSoal(res.data.data || []);
    } catch {
      addToast("Gagal mengambil data soal", "error");
    } finally {
      setLoading(false);
    }
  }, [filterMapel, filterTingkat, addToast]);

  const fetchDraftTryouts = useCallback(async () => {
    try {
      const res = await getTryoutList();
      const payload = res.data?.data || res.data || [];
      const draftOnly = (Array.isArray(payload) ? payload : []).filter(
        (item) => item.status === "DRAFT",
      );
      setDraftTryouts(draftOnly);
      if (!selectedTryoutId && draftOnly.length > 0) {
        setSelectedTryoutId(draftOnly[0].id);
      }
    } catch {
      setDraftTryouts([]);
    }
  }, [selectedTryoutId]);

  const getSubtesCount = (subtesItem) => {
    if (!subtesItem) return 0;
    if (Array.isArray(subtesItem.soalIds)) return subtesItem.soalIds.length;
    if (Array.isArray(subtesItem.soal)) return subtesItem.soal.length;
    if (typeof subtesItem.soalCount === "number") return subtesItem.soalCount;
    return 0;
  };

  const getTryoutSubtesCounts = (subtes) => {
    const counts = { tps: 0, tka: 0 };
    if (!Array.isArray(subtes)) return counts;

    subtes.forEach((item) => {
      const mapel = String(item.mapel || "").toUpperCase();
      const count = getSubtesCount(item);
      if (mapel === "TPS" || mapel.includes("TPS")) counts.tps += count;
      if (mapel.startsWith("TKA")) counts.tka += count;
    });

    return counts;
  };

  const getAssignedSoalIdsFromSubtes = (subtes, mapel) => {
    if (!Array.isArray(subtes)) return [];
    const normalizedMapel = String(mapel || "").toUpperCase();
    const targetSubtes = subtes.find((item) => {
      const itemMapel = String(item.mapel || "").toUpperCase();
      if (normalizedMapel === itemMapel) return true;
      if (normalizedMapel.startsWith("TKA") && itemMapel.startsWith("TKA"))
        return true;
      return false;
    });
    return (targetSubtes?.soalIds || targetSubtes?.soal || [])
      .map((item) => (typeof item === "string" ? item : item?.id))
      .filter(Boolean);
  };

  const loadTryoutDetail = useCallback(
    async (tryoutId, mapel = selectedMapel) => {
      if (!tryoutId) {
        setSelectedTryout(null);
        setSubtesCounts({ tps: 0, tka: 0 });
        setAssignedSoalIds([]);
        return null;
      }

      setDetailLoading(true);
      try {
        const res = await getTryoutById(tryoutId);
        const data = res.data?.data || res.data || null;
        const subtes = Array.isArray(data?.subtes) ? data.subtes : [];
        setSelectedTryout(data);
        setSubtesCounts(getTryoutSubtesCounts(subtes));
        setAssignedSoalIds(getAssignedSoalIdsFromSubtes(subtes, mapel));
        return data;
      } catch {
        setSelectedTryout(null);
        setSubtesCounts({ tps: 0, tka: 0 });
        setAssignedSoalIds([]);
        return null;
      } finally {
        setDetailLoading(false);
      }
    },
    [selectedMapel],
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchSoal();
    fetchDraftTryouts();
  }, [fetchSoal, fetchDraftTryouts]);

  useEffect(() => {
    if (!selectedTryoutId) {
      setAssignedSoalIds([]);
      setSelectedTryout(null);
      setSubtesCounts({ tps: 0, tka: 0 });
      return;
    }

    loadTryoutDetail(selectedTryoutId, selectedMapel);
    setSelectedSoalIds([]);
  }, [selectedTryoutId, selectedMapel, loadTryoutDetail]);

  const handleOpenCreate = () => {
    setForm(INITIAL_FORM);
    setIsEdit(false);
    setEditId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    let parsedOpsi = s.opsi;
    if (typeof parsedOpsi === "string") {
      try {
        parsedOpsi = JSON.parse(parsedOpsi);
      } catch {
        parsedOpsi = null;
      }
    }
    const tipe = s.tipe || "SINGLE_CHOICE";

    let initialJawaban = getInitialJawaban(tipe);
    if (tipe === "TRUE_FALSE" && Array.isArray(parsedOpsi)) {
      initialJawaban = {};
      parsedOpsi.forEach((_, i) => (initialJawaban[i] = true));
    }

    setForm({
      tipe: tipe,
      pertanyaan: s.pertanyaan?.replace(/\[SEED\]\s*/g, ""),
      opsi: parsedOpsi || getInitialOpsi(tipe),
      jawaban: initialJawaban, // User must re-enter answer when editing
      pembahasan: s.pembahasan || "",
      mapel: s.mapel,
      tingkat: s.tingkat,
    });
    setIsEdit(true);
    setEditId(s.id);
    setModalOpen(true);
  };

  const handleTipeChange = (newTipe) => {
    setForm({
      ...form,
      tipe: newTipe,
      opsi: getInitialOpsi(newTipe),
      jawaban: getInitialJawaban(newTipe),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };

      // Clean up empty answers for edit
      let isJawabanEmpty = false;
      if (payload.tipe === "SINGLE_CHOICE" || payload.tipe === "SHORT_ANSWER") {
        isJawabanEmpty = !payload.jawaban;
      } else if (payload.tipe === "MULTIPLE_CHOICE") {
        isJawabanEmpty = payload.jawaban.length === 0;
      } else if (payload.tipe === "TRUE_FALSE") {
        isJawabanEmpty = Object.keys(payload.jawaban).length === 0;
      }

      if (isEdit && isJawabanEmpty) {
        delete payload.jawaban; // don't update jawaban if untouched/empty
      } else if (!isEdit && isJawabanEmpty) {
        throw new Error("Kunci Jawaban harus diisi");
      }

      if (isEdit) {
        await updateSoal(editId, payload);
        addToast("Soal berhasil diupdate", "success");
      } else {
        await createSoal(payload);
        addToast("Soal berhasil ditambahkan", "success");
      }
      setModalOpen(false);
      fetchSoal();
    } catch (error) {
      addToast(
        error.response?.data?.message ||
          error.message ||
          "Gagal menyimpan soal",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteSoal(deleteId);
      addToast("Soal berhasil dihapus", "success");
      setDeleteId(null);
      fetchSoal();
    } catch {
      addToast("Gagal menghapus soal", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const truncate = (str, n) =>
    str?.length > n ? str.substr(0, n - 1) + "..." : str;

  const handleMapelSelect = (value) => {
    setSelectedMapel(value);
    setSelectedSoalIds([]);
  };

  const handleToggleSoalSelection = (item) => {
    if (item.mapel !== selectedMapel) {
      addToast(
        "Soal yang dipilih harus memiliki rumpun yang sama dengan mapel subtes.",
        "error",
      );
      return;
    }

    setSelectedSoalIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedTryoutId || !selectedTryout) {
      addToast("Pilih tryout draft terlebih dahulu.", "error");
      return;
    }

    if (selectedTryout.status !== "DRAFT") {
      addToast("Hanya tryout draft yang dapat ditautkan soal.", "error");
      return;
    }

    if (selectedSoalIds.length === 0) {
      addToast("Pilih minimal satu soal untuk ditautkan.", "error");
      return;
    }

    setAssigning(true);
    try {
      const res = await addTryoutSubtes(selectedTryoutId, {
        mapel: selectedMapel,
        soalIds: selectedSoalIds.map(String),
      });
      addToast("Soal berhasil ditautkan ke tryout draft.", "success");

      const updatedSubtesCounts = {
        tps:
          selectedMapel === "TPS" ? selectedSoalIds.length : subtesCounts.tps,
        tka: selectedMapel.startsWith("TKA")
          ? selectedSoalIds.length
          : subtesCounts.tka,
      };
      setSubtesCounts(updatedSubtesCounts);
      setAssignedSoalIds(selectedSoalIds);
      setSelectedSoalIds([]);

      const updatedData = res.data?.data;
      if (updatedData?.subtes) {
        setSelectedTryout(updatedData);
        setSubtesCounts(getTryoutSubtesCounts(updatedData.subtes));
        setAssignedSoalIds(
          getAssignedSoalIdsFromSubtes(updatedData.subtes, selectedMapel),
        );
      } else {
        await loadTryoutDetail(selectedTryoutId, selectedMapel);
      }
      await fetchDraftTryouts();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Gagal menautkan soal ke tryout",
        "error",
      );
    } finally {
      setAssigning(false);
    }
  };

  // Render dynamic opsi based on tipe
  const renderOpsiForm = () => {
    if (form.tipe === "SINGLE_CHOICE" || form.tipe === "MULTIPLE_CHOICE") {
      return (
        <div className="opsi-grid">
          {["A", "B", "C", "D", "E"].map((opt) => (
            <div key={opt} className="form-group">
              <label>Opsi {opt}</label>
              <input
                required
                type="text"
                placeholder={`Jawaban ${opt}`}
                value={form.opsi[opt] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    opsi: { ...form.opsi, [opt]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
      );
    } else if (form.tipe === "TRUE_FALSE") {
      return (
        <div className="tf-opsi-list">
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              fontSize: "0.85rem",
            }}
          >
            Daftar Pernyataan
          </label>
          {form.opsi.map((stmt, idx) => (
            <div
              key={idx}
              className="tf-opsi-item"
              style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                required
                type="text"
                placeholder={`Pernyataan ${idx + 1}`}
                style={{ flex: 1 }}
                value={stmt}
                onChange={(e) => {
                  const newOpsi = [...form.opsi];
                  newOpsi[idx] = e.target.value;
                  setForm({ ...form, opsi: newOpsi });
                }}
              />
              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={() => {
                  const newOpsi = form.opsi.filter((_, i) => i !== idx);
                  const newJawaban = { ...form.jawaban };
                  delete newJawaban[idx];
                  // shift keys down
                  const shiftedJawaban = {};
                  newOpsi.forEach(
                    (_, i) =>
                      (shiftedJawaban[i] =
                        newJawaban[i >= idx ? i + 1 : i] ?? true),
                  );
                  setForm({ ...form, opsi: newOpsi, jawaban: shiftedJawaban });
                }}
                disabled={form.opsi.length <= 1}
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => {
              const newIdx = form.opsi.length;
              setForm({
                ...form,
                opsi: [...form.opsi, ""],
                jawaban: { ...form.jawaban, [newIdx]: true },
              });
            }}
          >
            + Tambah Pernyataan
          </button>
        </div>
      );
    }
    return null;
  };

  const renderJawabanForm = () => {
    const isEditHint = isEdit ? " (Opsional jika tidak diubah)" : "";
    if (form.tipe === "SINGLE_CHOICE") {
      return (
        <div className="form-group">
          <label>Kunci Jawaban{isEditHint}</label>
          <select
            required={!isEdit}
            value={form.jawaban}
            onChange={(e) => setForm({ ...form, jawaban: e.target.value })}
          >
            <option value="" disabled>
              Pilih Jawaban Benar
            </option>
            {["A", "B", "C", "D", "E"].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (form.tipe === "MULTIPLE_CHOICE") {
      return (
        <div className="form-group">
          <label>Kunci Jawaban (Pilih lebih dari satu){isEditHint}</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            {["A", "B", "C", "D", "E"].map((opt) => (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.jawaban.includes(opt)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    let newJwb = [...form.jawaban];
                    if (checked) newJwb.push(opt);
                    else newJwb = newJwb.filter((x) => x !== opt);
                    setForm({ ...form, jawaban: newJwb });
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );
    } else if (form.tipe === "TRUE_FALSE") {
      return (
        <div className="form-group">
          <label>Kunci Jawaban Benar/Salah{isEditHint}</label>
          <table className="admin-table" style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Pernyataan</th>
                <th width="100">Kunci</th>
              </tr>
            </thead>
            <tbody>
              {form.opsi.map((stmt, idx) => (
                <tr key={idx}>
                  <td>{stmt || `Pernyataan ${idx + 1}`}</td>
                  <td>
                    <select
                      value={form.jawaban[idx] ? "true" : "false"}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          jawaban: {
                            ...form.jawaban,
                            [idx]: e.target.value === "true",
                          },
                        });
                      }}
                    >
                      <option value="true">Benar</option>
                      <option value="false">Salah</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (form.tipe === "SHORT_ANSWER") {
      return (
        <div className="form-group">
          <label>Kunci Jawaban Isian Singkat{isEditHint}</label>
          <input
            type="text"
            required={!isEdit}
            placeholder="Contoh: 36 atau Jawaban Pendek"
            value={form.jawaban}
            onChange={(e) => setForm({ ...form, jawaban: e.target.value })}
          />
        </div>
      );
    }
  };

  return (
    <div className="page-wrapper admin-wrapper">
      <Toast toasts={toasts} />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Kelola Soal</h1>
            <p className="page-sub">Manajemen Bank Soal UTBK</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Tambah Soal
          </button>
        </div>

        <div
          className="admin-filters"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              className="admin-select"
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
            >
              <option value="">Semua Mapel</option>
              <option value="TPS">TPS</option>
              <option value="TKA_SAINTEK">TKA Saintek</option>
              <option value="TKA_SOSHUM">TKA Soshum</option>
            </select>
            <select
              className="admin-select"
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
            >
              <option value="">Semua Tingkat</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              className="admin-select"
              value={selectedMapel}
              onChange={(e) => handleMapelSelect(e.target.value)}
            >
              <option value="TPS">Rumpun TPS</option>
              <option value="TKA_SAINTEK">Rumpun TKA Saintek</option>
              <option value="TKA_SOSHUM">Rumpun TKA Soshum</option>
            </select>
            <select
              className="admin-select"
              value={selectedTryoutId}
              onChange={(e) => setSelectedTryoutId(e.target.value)}
            >
              <option value="">Pilih Tryout Draft</option>
              {draftTryouts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.judul}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleBulkAssign}
              disabled={
                assigning || !selectedTryoutId || selectedSoalIds.length === 0
              }
            >
              {assigning ? "Menyimpan..." : "Tautkan Soal"}
            </button>
          </div>
        </div>

        {selectedTryout && (
          <div
            className="admin-card tryout-detail-card"
            style={{ marginTop: "1rem" }}
          >
            <div className="tryout-detail-header">
              <h3>Tryout Draft Terpilih</h3>
              <p style={{ margin: 0 }}>
                {selectedTryout.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>
            <div className="tryout-detail-grid">
              <div>
                <strong>Judul</strong>
                <div>{selectedTryout.judul}</div>
              </div>
              <div>
                <strong>Status</strong>
                <div>{getTryoutStatusLabel(selectedTryout.status)}</div>
              </div>
              <div>
                <strong>TPS</strong>
                <div>{subtesCounts.tps} soal</div>
              </div>
              <div>
                <strong>TKA</strong>
                <div>{subtesCounts.tka} soal</div>
              </div>
            </div>
            <div className="tryout-detail-footer">
              {detailLoading ? (
                <span className="status-badge status-ongoing">
                  Memuat detail...
                </span>
              ) : subtesCounts.tps > 0 && subtesCounts.tka > 0 ? (
                <span className="status-badge status-done">
                  Draft siap ditautkan dan dipublish
                </span>
              ) : (
                <span className="status-badge status-ongoing">
                  Tambahkan soal TPS/TKA untuk melengkapi subtes
                </span>
              )}
            </div>
          </div>
        )}

        {selectedTryout && (
          <div
            className="admin-card tryout-assignment-card"
            style={{ marginTop: "1rem" }}
          >
            <div className="tryout-detail-header">
              <h3>Penautan Soal ke Tryout</h3>
              <p style={{ margin: 0 }}>
                Pilih soal untuk ditautkan ke subtes {selectedMapel} pada tryout
                ini.
              </p>
            </div>
            <div className="tryout-detail-grid">
              <div>
                <strong>Tryout</strong>
                <div>{selectedTryout.judul}</div>
              </div>
              <div>
                <strong>Subtes dipilih</strong>
                <div>{selectedMapel}</div>
              </div>
              <div>
                <strong>Soal terpasang</strong>
                <div>{assignedSoalIds.length} terpilih</div>
              </div>
              <div>
                <strong>Soal untuk ditautkan</strong>
                <div>{selectedSoalIds.length} terpilih</div>
              </div>
            </div>
          </div>
        )}

        {selectedSoalIds.length > 0 && (
          <div className="text-muted" style={{ marginBottom: "0.75rem" }}>
            Terpilih {selectedSoalIds.length} soal untuk ditautkan ke tryout
            draft.
          </div>
        )}

        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th width="40"> </th>
                  <th>Mapel</th>
                  <th>Tingkat</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Pertanyaan</th>
                  <th width="150">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <span className="spinner-sm" />
                    </td>
                  </tr>
                ) : soal.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Belum ada data soal
                    </td>
                  </tr>
                ) : (
                  soal.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedSoalIds.includes(s.id)}
                          onChange={() => handleToggleSoalSelection(s)}
                          disabled={s.mapel !== selectedMapel}
                        />
                      </td>
                      <td>
                        <span className={`mapel-badge-sm`}>{s.mapel}</span>
                      </td>
                      <td>
                        <span className={`tingkat-badge tingkat-${s.tingkat}`}>
                          {s.tingkat}
                        </span>
                      </td>
                      <td>
                        <span className="badge-outline">
                          {s.tipe || "SINGLE_CHOICE"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`assignment-badge ${assignedSoalIds.includes(s.id) ? "assignment-badge-active" : "assignment-badge-idle"}`}
                        >
                          {assignedSoalIds.includes(s.id) ? "Tertaut" : "Belum"}
                        </span>
                      </td>
                      <td title={s.pertanyaan?.replace(/\[SEED\]\s*/g, "")}>
                        {truncate(
                          s.pertanyaan?.replace(/\[SEED\]\s*/g, ""),
                          50,
                        )}
                      </td>
                      <td>
                        <div className="flex-actions">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleOpenEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => setDeleteId(s.id)}
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
        </div>
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="modal-overlay modal-scrollable">
          <div className="modal modal-lg">
            <h3>{isEdit ? "Edit Soal" : "Tambah Soal Baru"}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mata Pelajaran</label>
                  <select
                    required
                    value={form.mapel}
                    onChange={(e) =>
                      setForm({ ...form, mapel: e.target.value })
                    }
                  >
                    <option value="TPS">TPS</option>
                    <option value="TKA_SAINTEK">TKA Saintek</option>
                    <option value="TKA_SOSHUM">TKA Soshum</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tingkat Kesulitan</label>
                  <select
                    required
                    value={form.tingkat}
                    onChange={(e) =>
                      setForm({ ...form, tingkat: e.target.value })
                    }
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tipe Soal</label>
                <select
                  required
                  value={form.tipe}
                  onChange={(e) => handleTipeChange(e.target.value)}
                >
                  <option value="SINGLE_CHOICE">Pilihan Ganda Sederhana</option>
                  <option value="MULTIPLE_CHOICE">Pilihan Ganda Majemuk</option>
                  <option value="TRUE_FALSE">Benar/Salah (True/False)</option>
                  <option value="SHORT_ANSWER">Isian Singkat</option>
                </select>
              </div>

              <div className="form-group">
                <label>Pertanyaan / Stimulus</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Tuliskan pertanyaan di sini..."
                  value={form.pertanyaan}
                  onChange={(e) =>
                    setForm({ ...form, pertanyaan: e.target.value })
                  }
                />
              </div>

              {renderOpsiForm()}
              {renderJawabanForm()}

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Pembahasan</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Tuliskan penjelasan jawaban benar..."
                  value={form.pembahasan}
                  onChange={(e) =>
                    setForm({ ...form, pembahasan: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner-sm" /> : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Hapus Soal?</h3>
            <p>
              Tindakan ini tidak dapat dibatalkan. Soal yang dihapus akan hilang
              dari database.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? <span className="spinner-sm" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
