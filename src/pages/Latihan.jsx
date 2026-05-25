import { Brain, Microscope, BookOpen, Rocket, Book, Hash } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mulaiLatihan } from "../api/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";

const MAPEL_OPTIONS = [
  {
    value: "TPS",
    label: "TPS",
    desc: "Tes Potensi Skolastik",
    emoji: <Brain style={{ color: "white" }} size={20} />,
  },
  {
    value: "TKA_SAINTEK",
    label: "TKA Saintek",
    desc: "Matematika, Fisika, Kimia, Biologi",
    emoji: <Microscope style={{ color: "white" }} size={20} />,
  },
  {
    value: "TKA_SOSHUM",
    label: "TKA Soshum",
    desc: "Sejarah, Geografi, Ekonomi, Sosiologi",
    emoji: <BookOpen style={{ color: "white" }} size={20} />,
  },
];

export default function Latihan() {
  const [params] = useSearchParams();
  const [mapel, setMapel] = useState(params.get("mapel") || "TPS");
  const [jumlah, setJumlah] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const handleMulai = async () => {
    setLoading(true);
    try {
      const res = await mulaiLatihan({ mapel, jumlah });
      navigate(`/ujian/${res.data.data.id}`, {
        state: { session: res.data.data },
      });
    } catch (err) {
      addToast(err.response?.data?.message || "Gagal memulai latihan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Toast toasts={toasts} />
      <div className="container container-sm">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mulai Latihan</h1>
            <p className="page-sub">Pilih mata pelajaran dan jumlah soal</p>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <label className="form-label">Mata Pelajaran</label>
            <div className="mapel-select-grid">
              {MAPEL_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  className={`mapel-select-card ${mapel === m.value ? "selected" : ""}`}
                  onClick={() => setMapel(m.value)}
                >
                  <span className="mapel-emoji">{m.emoji}</span>
                  <span
                    className="mapel-select-label"
                    style={{ color: "white" }}
                  >
                    {m.label}
                  </span>
                  <span className="mapel-select-desc">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Jumlah Soal: <strong>{jumlah}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="range-input"
            />
            <div className="range-labels">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          <div className="latihan-summary">
            <div className="summary-item">
              <span>
                <Book size={20} /> Mapel
              </span>
              <strong>
                {MAPEL_OPTIONS.find((m) => m.value === mapel)?.label}
              </strong>
            </div>
            <div className="summary-item">
              <span>
                <Hash size={20} /> Jumlah Soal
              </span>
              <strong>{jumlah} soal</strong>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleMulai}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              "<Rocket size={20} /> Mulai Latihan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
