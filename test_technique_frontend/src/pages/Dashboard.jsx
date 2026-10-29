import { useEffect, useState } from 'react';
import { getStats } from '../api/dashboard';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Au chargement de la page : appelle l'API une seule fois
  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger les statistiques'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatCard title="Total patients" value={stats.totalPatients} color="#2563eb" />
        <StatCard title="Rendez-vous du jour" value={stats.todayAppointments} color="#7c3aed" />
        <StatCard title="En attente (pending)" value={stats.pendingCount} color="#f59e0b" />
        <StatCard title="Confirmés (confirmed)" value={stats.confirmedCount} color="#16a34a" />
      </div>
    </>
  );
}