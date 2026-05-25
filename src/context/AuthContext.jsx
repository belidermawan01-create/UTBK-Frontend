import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe()
        .then((res) => {
          let userData = res.data.user;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userData = { ...userData, user_metadata: payload.user_metadata, app_metadata: payload.app_metadata, role: payload.role };
          } catch(e) {}
          setUser(userData);
        })
        .catch(() => { localStorage.removeItem('access_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = (token, userData) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
