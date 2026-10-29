import { useEffect, useState } from 'react';
import { getPatients } from '../api/patients';

export default function AppointmentForm({ onSubmit, onCancel }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    appointmentDate: '',
    status: 'pending',
    reason: '',
    notes: '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Charge les patients pour la liste déroulante (limite max de l'API : 100)
  useEffect(() => {
    getPatients({ limit: 100 }).then((res) => setPatients(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        // datetime-local donne une heure locale sans fuseau : on la convertit en ISO (UTC) attendu par l'API
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        notes: form.notes || null,
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors.map((x) => `${x.field} : ${x.message}`));
      else setErrors([data?.message || 'Erreur serveur']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Nouveau rendez-vous</h2>

      {errors.length > 0 && (
        <div className="alert">{errors.map((m, i) => <div key={i}>{m}</div>)}</div>
      )}

      <label>Patient</label>
      <select name="patientId" value={form.patientId} onChange={handleChange} required>
        <option value="">-- Choisir un patient --</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.fullName} ({p.cin})</option>
        ))}
      </select>

      <label>Date et heure</label>
      <input type="datetime-local" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} required />

      <label>Statut</label>
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="pending">En attente</option>
        <option value="confirmed">Confirmé</option>
        <option value="cancelled">Annulé</option>
      </select>

      <label>Motif</label>
      <input name="reason" value={form.reason} onChange={handleChange} required />

      <label>Notes (optionnel)</label>
      <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} />

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>Annuler</button>
        <button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}