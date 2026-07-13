import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/api";
import { getAuthToken, setAuthToken } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getMe()
        .then((res) => {
          let userData = res.data.data || res.data.user;
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userData = {
              ...userData,
              user_metadata: payload.user_metadata,
              app_metadata: payload.app_metadata,
              role: userData?.role || payload.role,
            };
          } catch (_) {}
          setUser(userData);
        })
        .catch(() => {
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = (token, userData) => {
    setAuthToken(token);
    setUser(userData);
  };

  const signOut = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
