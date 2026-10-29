import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../api/appointments';
import AppointmentForm from '../components/AppointmentForm';
import StatusBadge from '../components/StatusBadge';

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // Charge la liste selon les filtres
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setAppointments(await getAppointments({ date, status }));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  // Recharge à chaque changement de filtre
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status]);

  const handleCreate = async (payload) => {
    await createAppointment(payload);
    setCreating(false);
    await load();
  };

  // Change le statut ; l'erreur 409 (règle des 30 min) est affichée telle quelle
  const handleStatusChange = async (id, newStatus) => {
    setError('');
    try {
      await updateAppointmentStatus(id, newStatus);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Changement de statut impossible');
    }
  };

  if (creating) {
    return <AppointmentForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />;
  }

  return (
    <>
      <div className="page-header">
        <h1>Rendez-vous</h1>
        <button onClick={() => setCreating(true)}>+ Nouveau rendez-vous</button>
      </div>

      <div className="filters">
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <button className="secondary" onClick={() => { setDate(''); setStatus(''); }}>Réinitialiser</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="card table-card">
        {loading ? (
          <p style={{ padding: 16 }}>Chargement...</p>
        ) : appointments.length === 0 ? (
          <p className="muted" style={{ padding: 16 }}>Aucun rendez-vous trouvé.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Motif</th><th>Statut</th><th>Changer le statut</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.appointmentDate)}</td>
                  <td><Link to={`/patients/${a.patientId}`}>{a.patientName}</Link></td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}>
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}