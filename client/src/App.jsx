import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import PurchaseHistory from './pages/PurchaseHistory';
import AdminPanel from './pages/AdminPanel';
import ToastContainer from './components/ToastContainer';

// Helper component to protect routes
const RequireAuth = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();

  console.log('[RequireAuth] user:', user, 'token:', !!token);

  // If token exists but user hasn't been set yet, show a brief loading state
  if (token && !user) {
    console.log('[RequireAuth] Token exists but user not decoded yet, showing loading');
    return <div style={{padding:20}}>Loading...</div>;
  }

  if (!user) {
    console.log('[RequireAuth] No user, redirecting to /login');
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  console.log('[RequireAuth] User authenticated, showing children');
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><PurchaseHistory /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;