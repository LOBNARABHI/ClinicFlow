import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPatient, getPatientAppointments } from '../api/patients';
import StatusBadge from '../components/StatusBadge';

// Formate une date ISO en "jj/mm/aaaa hh:mm" (heure locale du navigateur)
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default function PatientDetails() {
  // Récupère l'id présent dans l'URL : /patients/:id
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charge le patient et ses rendez-vous en parallèle
  useEffect(() => {
    setLoading(true);
    Promise.all([getPatient(id), getPatientAppointments(id)])
      .then(([p, a]) => {
        setPatient(p);
        setAppointments(a);
      })
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger le patient'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) {
    return (
      <>
        <div className="alert">{error}</div>
        <Link to="/patients">← Retour aux patients</Link>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>{patient.fullName}</h1>
        <Link to="/patients">← Retour aux patients</Link>
      </div>

      <div className="card info-grid">
        <div><span className="muted">CIN</span><strong>{patient.cin}</strong></div>
        <div><span className="muted">Téléphone</span><strong>{patient.phone}</strong></div>
        <div><span className="muted">Date de naissance</span><strong>{patient.birthDate}</strong></div>
        <div><span className="muted">Adresse</span><strong>{patient.address || '—'}</strong></div>
      </div>

      <h2 className="section-title">Rendez-vous ({appointments.length})</h2>
      <div className="card table-card">
        {appointments.length === 0 ? (
          <p className="muted" style={{ padding: 16 }}>Aucun rendez-vous pour ce patient.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Motif</th><th>Statut</th><th>Créé par</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.appointmentDate)}</td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{a.createdByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}