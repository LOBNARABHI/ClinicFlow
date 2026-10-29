// Carte de statistique : un titre et un grand chiffre
export default function StatCard({ title, value, color }) {
  return (
    <div className="card stat-card" style={{ borderTopColor: color }}>
      <span className="muted">{title}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}