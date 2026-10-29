import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Déjà connecté : pas besoin de revoir le login
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Affiche le message renvoyé par l'API (ex : "Email ou mot de passe incorrect")
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-form" onSubmit={handleSubmit}>
        <h1>ClinicFlow</h1>
        <p className="muted">Connectez-vous pour continuer</p>

        {error && <div className="alert">{error}</div>}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}