'use client';

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import useAuthStore from './store/authStore';

// Import pages
import AuthForm from './pages/authForm';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerificationPage';
import VerificationRequired from './pages/VerificationRequired';
import NotFound from './pages/NotFound';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user && !user.isVerified) {
    return (
      <Navigate
        to="/verification-required"
        replace
      />
    );
  }

  return children;
};

function App() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app load
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={<AuthForm />}
          />
          <Route
            path="/register"
            element={<AuthForm />}
          />
          <Route
            path="/verify-email/:token"
            element={<VerifyEmail />}
          />
          <Route
            path="/resend-verification"
            element={<ResendVerification />}
          />
          <Route
            path="/verification-required"
            element={<VerificationRequired />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard or login */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* 404 route */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </>
  );
}

export default App;
