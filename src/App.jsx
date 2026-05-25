import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Latihan from './pages/Latihan';
import Ujian from './pages/Ujian';
import Hasil from './pages/Hasil';
import Riwayat from './pages/Riwayat';
import InfoPtn from './pages/InfoPtn';
import SoalManager from './pages/SoalManager';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';

function Layout({ children, showNav = true }) {
  return (
    <>
      {showNav && <Navbar />}
      <main style={{ minHeight: '100vh' }}>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Layout showNav={false}><Login /></Layout>} />
          <Route path="/register" element={<Layout showNav={false}><Register /></Layout>} />
          <Route path="/dashboard" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
          <Route path="/latihan" element={<Layout><ProtectedRoute><Latihan /></ProtectedRoute></Layout>} />
          <Route path="/ujian/:sessionId" element={<Layout showNav={false}><ProtectedRoute><Ujian /></ProtectedRoute></Layout>} />
          <Route path="/hasil/:sessionId" element={<Layout><ProtectedRoute><Hasil /></ProtectedRoute></Layout>} />
          <Route path="/riwayat" element={<Layout><ProtectedRoute><Riwayat /></ProtectedRoute></Layout>} />
          <Route path="/info-ptn" element={<Layout><ProtectedRoute><InfoPtn /></ProtectedRoute></Layout>} />
          <Route path="/admin/dashboard" element={<AdminLayout><ProtectedRoute><AdminDashboard /></ProtectedRoute></AdminLayout>} />
          <Route path="/admin/soal" element={<AdminLayout><ProtectedRoute><SoalManager /></ProtectedRoute></AdminLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
