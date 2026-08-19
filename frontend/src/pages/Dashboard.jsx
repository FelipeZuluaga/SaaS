import { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Package, ShoppingCart, History, DollarSign, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// IMPORTACIÓN DE COMPONENTES
import Inventory from '../components/Inventory';
import Sales from '../components/Sales';
import SalesHistory from '../components/SalesHistory';
import NetProfits from '../components/NetProfits';

export default function Dashboard() {
  const { companyData } = useCompany();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventario');

  // Estado global de productos (Demo COP)
  const [products, setProducts] = useState([
    { id: 1, name: 'Producto Demo', costPrice: 10000, salePrice: 25000, stock: 15 }
  ]);

  // Estado global de ventas
  const [sales, setSales] = useState([]);

  return (
    <div style={styles.layout}>
      {/* Sidebar Lateral */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          {companyData?.logoUrl ? (
            <img src={companyData.logoUrl} alt="Logo" style={styles.logo} />
          ) : (
            <div style={styles.logoPlaceholder}>
              {companyData?.name ? companyData.name.charAt(0).toUpperCase() : 'N'}
            </div>
          )}
          <h3 style={styles.companyName}>{companyData?.name || 'Mi Compañía'}</h3>
          <span style={styles.companyType}>{companyData?.sellType || 'Software Tier'}</span>
        </div>

        <nav style={styles.nav}>
          <button 
            style={activeTab === 'inventario' ? styles.activeBtn : styles.navBtn} 
            onClick={() => setActiveTab('inventario')}
          >
            <Package size={18} /> Inventario
          </button>

          <button 
            style={activeTab === 'venta' ? styles.activeBtn : styles.navBtn} 
            onClick={() => setActiveTab('venta')}
          >
            <ShoppingCart size={18} /> Venta (POS)
          </button>

          <button 
            style={activeTab === 'historial' ? styles.activeBtn : styles.navBtn} 
            onClick={() => setActiveTab('historial')}
          >
            <History size={18} /> Historial Venta
          </button>

          <button 
            style={activeTab === 'ganancias' ? styles.activeBtn : styles.navBtn} 
            onClick={() => setActiveTab('ganancias')}
          >
            <DollarSign size={18} /> Ganancias Netas
          </button>
        </nav>

        <button style={styles.logoutBtn} onClick={() => navigate('/login')}>
          <LogOut size={18} /> Salir
        </button>
      </aside>

      {/* Contenido Principal */}
      <main style={styles.content}>
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>
            {activeTab === 'inventario' && 'Gestión de Inventario'}
            {activeTab === 'venta' && 'Punto de Venta (POS)'}
            {activeTab === 'historial' && 'Historial de Transacciones'}
            {activeTab === 'ganancias' && 'Reporte de Ganancias Netas'}
          </h2>
        </header>

        {/* RENDERS SEGÚN LA PESTAÑA ACTIVA */}
        {activeTab === 'inventario' && (
          <Inventory productsList={products} setProducts={setProducts} />
        )}

        {activeTab === 'venta' && (
          <Sales 
            products={products} 
            setProducts={setProducts} 
            sales={sales} 
            setSales={setSales} 
          />
        )}

        {activeTab === 'historial' && (
          <SalesHistory sales={sales} />
        )}

        {activeTab === 'ganancias' && (
          <NetProfits sales={sales} />
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { 
    display: 'flex', 
    minHeight: '100vh', 
    backgroundColor: '#0a0e1a', 
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
  },
  sidebar: { 
    width: '260px', 
    backgroundColor: '#0d1322', 
    borderRight: '1px solid #1e293b', 
    padding: '24px 16px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    boxSizing: 'border-box'
  },
  logoSection: { textAlign: 'center', marginBottom: '30px' },
  logo: { 
    width: '64px', 
    height: '64px', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '2px solid #2563eb',
    boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)'
  },
  logoPlaceholder: { 
    width: '64px', 
    height: '64px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    color: '#ffffff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '26px', 
    margin: '0 auto 12px', 
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(37, 99, 235, 0.3)'
  },
  companyName: { color: '#f8fafc', fontSize: '1.1rem', margin: '8px 0 2px 0', fontWeight: '600' },
  companyType: { color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 16px', 
    background: 'transparent', 
    color: '#94a3b8', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  activeBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 16px', 
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '0.9rem', 
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  logoutBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '8px', 
    padding: '10px', 
    background: 'rgba(239, 68, 68, 0.1)', 
    color: '#f87171', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    marginTop: 'auto',
    fontWeight: '500',
    transition: 'background 0.2s ease'
  },
  content: { flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' },
  header: { marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' },
  headerTitle: { color: '#f8fafc', margin: 0, fontSize: '1.5rem', fontWeight: '600' }
};