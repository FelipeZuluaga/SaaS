import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, PieChart, Loader2 } from 'lucide-react';
import { getSales } from '../services/saleService';

// Formateador a Pesos Colombianos (COP)
const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function NetProfits({ sales: propSales }) {
  const [sales, setSales] = useState(propSales || []);
  const [loading, setLoading] = useState(!propSales || propSales.length === 0);

  // Sincronizar si se reciben ventas desde las props
  useEffect(() => {
    if (propSales && propSales.length > 0) {
      setSales(propSales);
      setLoading(false);
    }
  }, [propSales]);

  // Cargar ventas desde la API de MySQL si no hay props
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const data = await getSales();
        setSales(data || []);
      } catch (error) {
        console.error('Error al obtener ventas para ganancias:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!propSales || propSales.length === 0) {
      fetchSalesData();
    }
  }, []);

  // Normalizar array de ventas garantizando que items sea una lista válida
  const normalizedSales = sales.map((sale) => {
    let items = sale.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    return {
      ...sale,
      items: Array.isArray(items) ? items : []
    };
  });

  // 1. Calcular Métricas Globales
  const totalVentas = normalizedSales.reduce((acc, sale) => acc + (parseFloat(sale.total) || 0), 0);

  const costoTotal = normalizedSales.reduce((acc, sale) => {
    const costoVenta = sale.items.reduce((itemAcc, item) => {
      const costPrice = parseFloat(item.costPrice) || 0;
      const qty = parseInt(item.quantity, 10) || 0;
      return itemAcc + (costPrice * qty);
    }, 0);
    return acc + costoVenta;
  }, 0);

  const gananciaNeta = totalVentas - costoTotal;

  const totalArticulos = normalizedSales.reduce((acc, sale) => {
    return acc + sale.items.reduce((itemAcc, item) => itemAcc + (parseInt(item.quantity, 10) || 0), 0);
  }, 0);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={36} color="#38bdf8" className="spin" />
        <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '0.9rem' }}>
          Calculando balance financiero...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* TARJETAS RESUMEN (KPIs) */}
      <div style={styles.kpiGrid}>
        
        {/* Total Ingresos */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Ingresos Totales</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
              <DollarSign size={20} color="#38bdf8" />
            </div>
          </div>
          <div style={styles.kpiValue}>{formatCOP(totalVentas)}</div>
          <p style={styles.kpiSub}>Ventas brutas acumuladas</p>
        </div>

        {/* Costo Inversión */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Costo de Inventario</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(248, 113, 113, 0.1)' }}>
              <PieChart size={20} color="#f87171" />
            </div>
          </div>
          <div style={styles.kpiValue}>{formatCOP(costoTotal)}</div>
          <p style={styles.kpiSub}>Costo de productos vendidos</p>
        </div>

        {/* Ganancia Neta */}
        <div style={{ ...styles.kpiCard, border: '1px solid rgba(74, 222, 128, 0.3)' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Ganancia Neta</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
              <TrendingUp size={20} color="#4ade80" />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#4ade80' }}>{formatCOP(gananciaNeta)}</div>
          <p style={styles.kpiSub}>Utilidad limpia proyectada</p>
        </div>

        {/* Artículos Vendidos */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Unidades Vendidas</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <ShoppingBag size={20} color="#a855f7" />
            </div>
          </div>
          <div style={styles.kpiValue}>{totalArticulos} u.</div>
          <p style={styles.kpiSub}>Total productos despachados</p>
        </div>

      </div>

      {/* DETALLE Y ESTADÍSTICAS */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <TrendingUp size={20} color="#38bdf8" />
          <h3 style={styles.cardTitle}>Balance Financiero General</h3>
        </div>

        {normalizedSales.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: '#64748b', margin: 0 }}>
              No hay datos suficientes para generar un balance. Realiza ventas en el módulo POS para visualizar rentabilidad.
            </p>
          </div>
        ) : (
          <div style={styles.balanceList}>
            <div style={styles.balanceRow}>
              <span style={styles.balanceText}>Ventas Brutas (+):</span>
              <strong style={{ color: '#f8fafc' }}>{formatCOP(totalVentas)}</strong>
            </div>

            <div style={styles.balanceRow}>
              <span style={styles.balanceText}>Costo de Mercancía (-):</span>
              <strong style={{ color: '#f87171' }}>- {formatCOP(costoTotal)}</strong>
            </div>

            <div style={{ ...styles.balanceRow, borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: '8px' }}>
              <span style={{ ...styles.balanceText, fontWeight: '700', color: '#f8fafc', fontSize: '1.05rem' }}>
                Margen de Ganancia Real:
              </span>
              <strong style={{ color: '#4ade80', fontSize: '1.2rem' }}>
                {formatCOP(gananciaNeta)}
              </strong>
            </div>
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  kpiCard: {
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  kpiLabel: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: '500'
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '4px'
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0
  },
  card: {
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 0'
  },
  balanceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem'
  },
  balanceText: {
    color: '#cbd5e1'
  }
};