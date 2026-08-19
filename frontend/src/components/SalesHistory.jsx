import { History, Calendar, ShoppingBag } from 'lucide-react';

// Formateador a Pesos Colombianos (COP)
const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function SalesHistory({ sales = [] }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#38bdf8" />
            <h3 style={styles.title}>
              Historial de Transacciones ({sales.length})
            </h3>
          </div>
        </div>

        {sales.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingBag size={48} color="#334155" />
            <p style={styles.emptyText}>
              Aún no has realizado ninguna venta. Las transacciones del módulo Punto de Venta (POS) aparecerán aquí.
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>ID Venta</th>
                  <th style={styles.th}>Fecha y Hora</th>
                  <th style={styles.th}>Productos Vendidos</th>
                  <th style={styles.th}>Total Venta</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.badge}>#{sale.id.toString().slice(-6)}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateWrapper}>
                        <Calendar size={14} color="#94a3b8" />
                        {sale.date}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <ul style={styles.itemList}>
                        {sale.items.map((item, idx) => (
                          <li key={idx} style={styles.itemRow}>
                            <span style={styles.qtyBadge}>{item.quantity}x</span> 
                            <span>{item.name}</span>
                            <small style={styles.itemPrice}>({formatCOP(item.salePrice)} c/u)</small>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#4ade80', fontSize: '1rem' }}>
                      {formatCOP(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px' 
  },
  card: { 
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)', 
    padding: '24px', 
    borderRadius: '12px', 
    border: '1px solid #1e293b', 
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' 
  },
  header: { 
    marginBottom: '20px' 
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
    fontWeight: '600'
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '50px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '12px',
    maxWidth: '380px'
  },
  tableContainer: { 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    textAlign: 'left' 
  },
  trHead: {
    borderBottom: '1px solid #1e293b'
  },
  th: { 
    padding: '12px', 
    color: '#94a3b8', 
    fontSize: '0.8rem', 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: { 
    borderBottom: '1px solid #1e293b',
    transition: 'background 0.2s ease'
  },
  td: { 
    padding: '14px 12px', 
    fontSize: '0.9rem', 
    color: '#cbd5e1', 
    verticalAlign: 'top' 
  },
  badge: { 
    background: '#090d16', 
    color: '#38bdf8', 
    border: '1px solid #1e293b',
    padding: '4px 8px', 
    borderRadius: '6px', 
    fontSize: '0.8rem', 
    fontWeight: '600', 
    fontFamily: 'monospace' 
  },
  dateWrapper: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  itemList: { 
    margin: 0, 
    padding: 0, 
    listStyle: 'none',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#f8fafc',
    fontSize: '0.88rem'
  },
  qtyBadge: {
    color: '#38bdf8',
    fontWeight: '700'
  },
  itemPrice: {
    color: '#64748b',
    fontSize: '0.8rem'
  }
};