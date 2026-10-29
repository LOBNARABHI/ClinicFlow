import api from './client';

// POST /auth/login : retourne { token, user }
export const loginRequest = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};