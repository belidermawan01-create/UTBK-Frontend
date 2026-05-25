import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Bot,
  ClipboardList,
  Landmark,
  BarChart2,
  CheckCircle2,
  Target,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    id: "konten",
    icon: <BookOpen size={32} />,
    title: "Belajar & Konten",
    desc: "Video - Soal adaptif - Materi",
    subFeatures: [
      {
        title: "Video pembelajaran",
        desc: "Pelajari konsep dengan video pembahasan interaktif.",
      },
      {
        title: "Latihan soal",
        desc: "Uji pemahamanmu dengan berbagai tipe soal adaptif.",
      },
      {
        title: "Bank soal UTBK",
        desc: "Kumpulan soal asli UTBK dari tahun-tahun sebelumnya.",
      },
      {
        title: "Rangkuman materi",
        desc: "Catatan ringkas yang bisa diakses untuk review cepat.",
      },
    ],
  },
  {
    id: "ai",
    icon: <Bot size={32} />,
    title: "AI Engine",
    desc: "Tutor - Rekomendasi - Adaptasi",
    subFeatures: [
      {
        title: "AI tutor chat",
        desc: "Tanya jawab dan diskusi soal langsung dengan AI pintar.",
      },
      {
        title: "Rekomendasi jurusan",
        desc: "Temukan program studi yang cocok dengan profil belajarmu.",
      },
      {
        title: "Adaptive learning",
        desc: "Materi belajar yang menyesuaikan dengan tingkat kemampuan.",
      },
      {
        title: "Konsultasi jurusan",
        desc: "Bimbingan pilihan prodi berdasarkan minat dan peluangmu.",
      },
    ],
  },
  {
    id: "tryout",
    icon: <ClipboardList size={32} />,
    title: "Tryout & Assessment",
    desc: "Simulasi - Real-time - Scoring",
    subFeatures: [
      {
        title: "Simulasi UTBK",
        desc: "Pengalaman ujian dengan format terbaru seperti aslinya.",
      },
      {
        title: "Scoring real-time",
        desc: "Hasil penilaian keluar seketika dengan metode akurat.",
      },
      {
        title: "Analisis subtes",
        desc: "Evaluasi detail untuk setiap komponen tes yang dikerjakan.",
      },
      {
        title: "Pembahasan soal",
        desc: "Review jawaban dengan penjelasan dan langkah penyelesaian.",
      },
    ],
  },
  {
    id: "komunitas",
    icon: <Landmark size={32} />,
    title: "Komunitas & Info PTN",
    desc: "Diskusi - SNBT - Mandiri - Prestasi",
    subFeatures: [
      {
        title: "Forum diskusi",
        desc: "Bertukar informasi dan strategi dengan sesama pejuang PTN.",
      },
      {
        title: "Info jalur SNBT",
        desc: "Update jadwal, kuota, dan ketentuan ujian nasional.",
      },
      {
        title: "Jalur Mandiri",
        desc: "Informasi lengkap terkait ujian mandiri di berbagai kampus.",
      },
      {
        title: "Jalur Prestasi",
        desc: "Persyaratan dan panduan seleksi melalui nilai rapor/prestasi.",
      },
    ],
  },
  {
    id: "analytic",
    icon: <BarChart2 size={32} />,
    title: "Analytics & Dashboard",
    desc: "Progress - Prediksi - Insight",
    subFeatures: [
      {
        title: "Dashboard belajar",
        desc: "Pantau aktivitas dan statistik belajarmu dalam satu tampilan.",
      },
      {
        title: "Prediksi kelulusan",
        desc: "Hitung peluang lolos di jurusan tujuan dari skor tryout.",
      },
      {
        title: "Analisis kelemahan",
        desc: "Ketahui topik mana yang paling butuh porsi latihan lebih.",
      },
      {
        title: "Laporan mingguan",
        desc: "Rangkuman perkembangan belajarmu setiap minggunya.",
      },
    ],
  },
];

const stats = [
  { value: "3+", label: "Mata Pelajaran" },
  { value: "40", label: "Soal per Sesi" },
  { value: "100%", label: "Gratis" },
];

export default function Landing() {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container hero-content">
          <div
            className="hero-badge"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Target size={16} /> Platform UTBK #1
          </div>
          <h1 className="hero-title">
            Raih PTN Impianmu
            <br />
            <span className="gradient-text">Bersama PintarUtbk</span>
          </h1>
          <p className="hero-subtitle">
            Latihan soal UTBK terstruktur dengan pembahasan lengkap. Kuasai TPS,
            TKA Saintek, dan TKA Soshum—mulai dari mudah hingga sulit.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Ke Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Mulai Gratis
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sudah Punya Akun
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Fitur Utama UTBKPro</h2>
            <p>
              Jelajahi ekosistem pembelajaran terlengkap untuk menembus PTN
              impianmu
            </p>
          </div>

          <div className="features-grid">
            {features.map((f) => (
              <div
                key={f.id}
                className={`feature-card interactive-card ${activeFeature.id === f.id ? "active" : ""}`}
                onClick={() => setActiveFeature(f)}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="feature-details-panel">
            <div className="panel-header">
              <h3>
                {activeFeature.icon} Detail Fitur: {activeFeature.title}
              </h3>
              <p>
                Pelajari lebih lanjut apa yang akan kamu dapatkan (Data Dummy)
              </p>
            </div>
            <div className="subfeatures-grid">
              {activeFeature.subFeatures.map((sub, idx) => (
                <div key={idx} className="subfeature-card">
                  <div className="subfeature-icon">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="subfeature-content">
                    <h4>{sub.title}</h4>
                    <p>{sub.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-glow" />
            <h2>Siap Mulai Latihan?</h2>
            <p>Bergabung sekarang dan mulai perjalanan menuju PTN impianmu.</p>
            <Link
              to={user ? "/latihan" : "/register"}
              className="btn btn-primary btn-lg"
            >
              {user ? "Mulai Latihan" : "Daftar Sekarang"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>
          © 2026 UTBKPro · Dibuat untuk para pejuang PTN{" "}
          <GraduationCap
            size={16}
            style={{
              display: "inline",
              marginLeft: "4px",
              verticalAlign: "text-bottom",
            }}
          />
        </p>
      </footer>
    </div>
  );
}
