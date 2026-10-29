import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider rend l'utilisateur disponible partout */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Toutes les routes à l'intérieur exigent d'être connecté */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/appointments" element={<Appointments />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}