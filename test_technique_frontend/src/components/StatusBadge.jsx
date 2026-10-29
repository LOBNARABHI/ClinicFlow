// Libellés affichés pour chaque statut
const LABELS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}