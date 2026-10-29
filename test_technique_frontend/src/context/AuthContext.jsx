import { createContext, useContext, useState } from 'react';
import { loginRequest } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Au chargement, on relit l'utilisateur sauvegardé (reste connecté après un rafraîchissement)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Appelle l'API, puis sauvegarde le token et l'utilisateur
  const login = async (email, password) => {
    const { token, user } = await loginRequest(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  // Efface tout : l'utilisateur est déconnecté
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

// Raccourci pour utiliser le contexte : const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);