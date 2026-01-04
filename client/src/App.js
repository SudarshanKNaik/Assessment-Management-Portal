import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import FacultyRegister from './components/FacultyRegister';
import StudentRegister from './components/StudentRegister';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to={`/${user.role}-dashboard`} replace />} />
      <Route path="/register/faculty" element={!user ? <FacultyRegister /> : <Navigate to={`/${user.role}-dashboard`} replace />} />
      <Route path="/register/student" element={!user ? <StudentRegister /> : <Navigate to={`/${user.role}-dashboard`} replace />} />
      <Route
        path="/faculty-dashboard"
        element={
          <PrivateRoute allowedRole="faculty">
            <FacultyDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute allowedRole="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

