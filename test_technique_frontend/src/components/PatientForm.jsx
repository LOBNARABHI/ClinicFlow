import { useState } from 'react';

// patient = null : création ; patient = objet : modification
export default function PatientForm({ patient, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    fullName: patient?.fullName || '',
    cin: patient?.cin || '',
    phone: patient?.phone || '',
    birthDate: patient?.birthDate || '',
    address: patient?.address || '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Met à jour le champ modifié
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      await onSubmit({ ...form, address: form.address || null });
    } catch (err) {
      // Erreurs de validation Zod (400) : liste champ par champ ; sinon message simple (ex : CIN en doublon 409)
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors.map((x) => `${x.field} : ${x.message}`));
      else setErrors([data?.message || 'Erreur serveur']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{patient ? 'Modifier le patient' : 'Nouveau patient'}</h2>

      {errors.length > 0 && (
        <div className="alert">
          {errors.map((m, i) => <div key={i}>{m}</div>)}
        </div>
      )}

      <label>Nom complet</label>
      <input name="fullName" value={form.fullName} onChange={handleChange} required />

      <label>CIN</label>
      <input name="cin" value={form.cin} onChange={handleChange} required />

      <label>Téléphone</label>
      <input name="phone" value={form.phone} onChange={handleChange} required />

      <label>Date de naissance</label>
      <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />

      <label>Adresse (optionnel)</label>
      <input name="address" value={form.address} onChange={handleChange} />

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>Annuler</button>
        <button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}