import api from './client';

// GET /patients?search=&page=&limit= : retourne { data, pagination }
export const getPatients = async ({ search = '', page = 1, limit = 10 }) => {
  const { data } = await api.get('/patients', { params: { search, page, limit } });
  return data;
};

// GET /patients/:id
export const getPatient = async (id) => (await api.get(`/patients/${id}`)).data;

// POST /patients
export const createPatient = async (payload) => (await api.post('/patients', payload)).data;

// PUT /patients/:id
export const updatePatient = async (id, payload) => (await api.put(`/patients/${id}`, payload)).data;

// DELETE /patients/:id (admin)
export const deletePatient = async (id) => api.delete(`/patients/${id}`);

// GET /patients/:id/appointments (utilisé à l'étape 14)
export const getPatientAppointments = async (id) => (await api.get(`/patients/${id}/appointments`)).data;