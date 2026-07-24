import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PostRidePage from './pages/PostRidePage';
import RideDetailPage from './pages/RideDetailPage';
import RequestsPage from './pages/RequestsPage';
import ProfilePage from './pages/ProfilePage';
import LiveMapPage from './pages/LiveMapPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#1E1030',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(139,92,246,0.14)',
                border: '1px solid #E8E0F5',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#D63384', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/"          element={<HomePage />} />
            <Route path="/search"    element={<SearchPage />} />
            <Route path="/community" element={<CommunityPage />} />

            {/* Protected routes */}
            <Route path="/post"       element={<ProtectedRoute><PostRidePage /></ProtectedRoute>} />
            <Route path="/rides/:id"  element={<ProtectedRoute><RideDetailPage /></ProtectedRoute>} />
            <Route path="/requests"   element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/live/:id"   element={<ProtectedRoute><LiveMapPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
