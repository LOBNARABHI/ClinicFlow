import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/patients';
import PatientForm from '../components/PatientForm';
import { useAuth } from '../context/AuthContext';

export default function Patients() {
  const { isAdmin } = useAuth();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // null = formulaire fermé ; {} = création ; objet patient = modification
  const [editing, setEditing] = useState(null);

  // Recherche avec délai (debounce) : on attend 400 ms après la dernière frappe avant d'appeler l'API
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Charge la liste à chaque changement de recherche ou de page
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPatients({ search, page, limit: 10 });
      setPatients(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // Création ou modification selon le cas, puis rechargement de la liste
  const handleSave = async (payload) => {
    if (editing?.id) await updatePatient(editing.id, payload);
    else await createPatient(payload);
    setEditing(null);
    await load();
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer ${p.fullName} ?`)) return;
    try {
      await deletePatient(p.id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Suppression impossible');
    }
  };

  // Formulaire affiché à la place de la liste
  if (editing) {
    return (
      <PatientForm
        patient={editing.id ? editing : null}
        onSubmit={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Patients</h1>
        <button onClick={() => setEditing({})}>+ Ajouter un patient</button>
      </div>

      <input
        className="search-input"
        placeholder="Rechercher par nom ou CIN..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {error && <div className="alert">{error}</div>}

      <div className="card table-card">
        {loading ? (
          <p>Chargement...</p>
        ) : patients.length === 0 ? (
          <p className="muted">Aucun patient trouvé.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th><th>CIN</th><th>Téléphone</th><th>Naissance</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/patients/${p.id}`}>{p.fullName}</Link></td>
                  <td>{p.cin}</td>
                  <td>{p.phone}</td>
                  <td>{p.birthDate}</td>
                  <td className="row-actions">
                    <button className="secondary" onClick={() => setEditing(p)}>Modifier</button>
                    {/* Bouton visible seulement pour l'admin (l'API refuse de toute façon le staff : 403) */}
                    {isAdmin && <button className="danger" onClick={() => handleDelete(p)}>Supprimer</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {pagination.page} / {pagination.totalPages || 1} ({pagination.total} patients)</span>
        <button className="secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </>
  );
}