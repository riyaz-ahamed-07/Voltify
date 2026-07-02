// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDashboardStore } from './store/dashboardStore';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import Onboarding from './pages/onboarding';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ReactNode } from 'react';

// Route Guard: Access only if authenticated
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route Guard: Access dashboard components only if calibrated through onboarding
function OnboardedRoute({ children }: { children: ReactNode }) {
  const { isOnboarded } = useDashboardStore();
  return isOnboarded ? children : <Navigate to="/onboarding" replace />;
}

// Route Guard: Redirect logged in users away from guest pages (Landing, Login, Signup)
function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing (Redirect to dashboard if logged in) */}
        <Route 
          path="/" 
          element={
            <GuestRoute>
              <Landing />
            </GuestRoute>
          } 
        />

        {/* Guest Auth Screens */}
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            <GuestRoute>
              <VerifyOTP />
            </GuestRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          } 
        />

        {/* Authenticated Onboarding Wizard */}
        <Route 
          path="/onboarding" 
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          } 
        />

        {/* Dashboard Shell layout with nested navigation */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* Main Dashboard - Guarded by onboarding */}
          <Route 
            path="dashboard" 
            element={
              <OnboardedRoute>
                <Dashboard />
              </OnboardedRoute>
            } 
          />
          {/* Sub-features - Guarded by onboarding */}
          <Route 
            path="coach" 
            element={
              <OnboardedRoute>
                <Coach />
              </OnboardedRoute>
            } 
          />
          <Route 
            path="leaderboard" 
            element={
              <OnboardedRoute>
                <Leaderboard />
              </OnboardedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <OnboardedRoute>
                <Notifications />
              </OnboardedRoute>
            } 
          />
          {/* Generic details accessible even prior to onboarding */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback wildcard routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Clean SaaS styled toast container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1a1a1a',
          border: '1px solid #333',
          color: '#ededed',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      />
    </BrowserRouter>
  );
}
