import api from './client';

// GET /appointments?date=&status= : les filtres vides sont ignorés
export const getAppointments = async ({ date = '', status = '' } = {}) => {
  const params = {};
  if (date) params.date = date;
  if (status) params.status = status;
  const { data } = await api.get('/appointments', { params });
  return data;
};

// POST /appointments
export const createAppointment = async (payload) => (await api.post('/appointments', payload)).data;

// PATCH /appointments/:id/status
export const updateAppointmentStatus = async (id, status) =>
  (await api.patch(`/appointments/${id}/status`, { status })).data;