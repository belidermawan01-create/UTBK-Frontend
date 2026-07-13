import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdminUser } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="full-center">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = isAdminUser(user);

  if (isAdmin && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isAdmin && location.pathname.startsWith("/admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
