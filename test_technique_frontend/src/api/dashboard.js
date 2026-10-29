import api from './client';

// GET /dashboard/stats : retourne { totalPatients, todayAppointments, pendingCount, confirmedCount }
export const getStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};