import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import Home from './pages/Home'
import SubmitPetition from './pages/SubmitPetition'
import Dashboard from './pages/Dashboard'
import PetitionDetail from './pages/PetitionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Loader from './components/common/Loader'

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * GuestRoute — redirects to /dashboard if already logged in.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/submit" element={<ProtectedRoute><SubmitPetition /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/petition/:id" element={<PetitionDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
