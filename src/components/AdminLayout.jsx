import {
  Sparkles,
  BarChart,
  FileText,
  Users,
  Globe,
  LogOut,
  Search,
  Bell,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/api";

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    signOut();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <BarChart size={20} />,
      label: "Dashboard Admin",
    },
    { path: "/admin/soal", icon: <FileText size={20} />, label: "Kelola Soal" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>
          <span>
            UTBK<span className="brand-accent">Admin</span>
          </span>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-role">Administrator</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu Utama</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname.startsWith(item.path) ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link text-red w-full text-left"
          >
            <span className="sidebar-icon">
              <LogOut size={20} />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-search">
            <span className="search-icon">
              <Search size={20} />
            </span>
            <input type="text" placeholder="Cari sesuatu..." />
          </div>
          <div className="topbar-actions">
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            <div className="avatar-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
