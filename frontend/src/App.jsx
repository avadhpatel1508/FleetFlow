import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Dispatcher from './pages/Dispatcher';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';
import DriverPortal from './pages/DriverPortal';
import Incidents from './pages/Incidents';

import Chat from './pages/Chat';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />



      {/* Protected Routes inside Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          {/* We will handle redirecting Drivers away from the main Dashboard inside the Dashboard component or here. It's cleaner in Dashboard. */}
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/driver-portal" element={
        <ProtectedRoute allowedRoles={['Driver']}>
          <DriverPortal />
        </ProtectedRoute>
      } />

      <Route path="/vehicles" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher']}>
          <Vehicles />
        </ProtectedRoute>
      } />

      <Route path="/dispatch" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher']}>
          <Dispatcher />
        </ProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <ProtectedRoute allowedRoles={['Fleet Manager']}>
          <Maintenance />
        </ProtectedRoute>
      } />

      <Route path="/fuel" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']}>
          <Fuel />
        </ProtectedRoute>
      } />

      <Route path="/drivers" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer']}>
          <Drivers />
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']}>
          <Analytics />
        </ProtectedRoute>
      } />

      <Route path="/incidents" element={
        <ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer']}>
          <Incidents />
        </ProtectedRoute>
      } />

      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />


      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
