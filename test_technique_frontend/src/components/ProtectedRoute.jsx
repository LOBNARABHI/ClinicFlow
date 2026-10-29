import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si pas d'utilisateur connecté : redirection vers /login, sinon on affiche la page demandée
export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}