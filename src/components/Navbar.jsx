import { Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/api";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (_) {}
    signOut();
    navigate("/login");
  };

  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.user_metadata?.role?.toLowerCase() === "admin" ||
    user?.app_metadata?.role?.toLowerCase() === "admin" ||
    user?.email?.toLowerCase().includes("admin") ||
    user?.email?.toLowerCase().includes("abu");

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/latihan", label: "Latihan" },
    { to: "/riwayat", label: "Riwayat" },
    { to: "/info-ptn", label: "Info PTN" },
  ];

  if (isAdmin) {
    navLinks.push({ to: "/admin/dashboard", label: "Kelola Soal" });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>
          <span>
            Pintar<span className="brand-accent">Utbk</span>
          </span>
        </Link>

        {user && (
          <>
            <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`nav-link ${location.pathname.startsWith(l.to) ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <button className="btn btn-ghost nav-link" onClick={() => setShowLogoutModal(true)}>
                Logout
              </button>
            </div>
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </>
        )}

        {!user && (
          <div className="navbar-links">
            <Link to="/login" className="btn btn-ghost">
              Masuk
            </Link>
            <Link to="/register" className="btn btn-primary">
              Daftar
            </Link>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin keluar dari akun ini?</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
