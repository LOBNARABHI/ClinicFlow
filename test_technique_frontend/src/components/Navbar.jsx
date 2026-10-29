import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <strong>ClinicFlow</strong>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/patients">Patients</NavLink>
        <NavLink to="/appointments">Rendez-vous</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.fullName} ({user?.role})</span>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
}