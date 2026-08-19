import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Lock, MessageCircle, Package, Search, Trash2, Plus, Loader2 } from 'lucide-react';
import { getProducts, createProduct, deleteProduct } from '../services/productService';

// Función para formatear números en Pesos Colombianos (COP)
const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const Inventory = ({ productsList = [], setProducts }) => {
  const { company } = useCompany();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    costPrice: '',
    salePrice: '',
    stock: ''
  });

  const maxProducts = company?.maxProducts ?? Infinity;
  const companyName = company?.name || 'mi empresa';

  // Cargar productos desde la base de datos al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      if (setProducts) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (productsList.length >= maxProducts) {
      setShowUpgradeModal(true);
      return;
    }

    if (!newProduct.name || !newProduct.salePrice) {
      alert('Por favor ingresa al menos el nombre y el precio de venta');
      return;
    }

    const productPayload = {
      name: newProduct.name,
      costPrice: parseFloat(newProduct.costPrice) || 0,
      salePrice: parseFloat(newProduct.salePrice) || 0,
      stock: parseInt(newProduct.stock, 10) || 0
    };

    try {
      setSubmitting(true);
      // Petición a productService (agrega company_id internamente)
      const createdProduct = await createProduct(productPayload);

      if (setProducts) {
        setProducts([createdProduct, ...productsList]);
      }

      setNewProduct({ name: '', costPrice: '', salePrice: '', stock: '' });
    } catch (error) {
      alert('Error al guardar el producto en el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      setDeletingId(id);
      // Petición a productService (agrega company_id internamente)
      await deleteProduct(id);

      if (setProducts) {
        setProducts(productsList.filter(p => p.id !== id));
      }
    } catch (error) {
      alert('Error al eliminar el producto del servidor');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = productsList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const numeroWhatsApp = "573132742361";
  const mensajeWA = encodeURIComponent(
    `Hola, alcancé el límite de ${maxProducts} productos en ${companyName}. Quiero actualizar mi plan de software.`
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* FORMULARIO AGREGAR PRODUCTO */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Plus size={18} color="#38bdf8" />
          <h3 style={styles.cardTitle}>Agregar Nuevo Producto</h3>
        </div>
        
        <form onSubmit={handleSaveProduct}>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Nombre del Producto</label>
            <input
              type="text"
              name="name"
              placeholder="Ej. Cerveza Águila"
              value={newProduct.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.rowThree}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Costo (COP)</label>
              <input
                type="number"
                step="1"
                name="costPrice"
                placeholder="10000"
                value={newProduct.costPrice}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Precio Venta (COP)</label>
              <input
                type="number"
                step="1"
                name="salePrice"
                placeholder="20000"
                value={newProduct.salePrice}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Stock Inicial</label>
              <input
                type="number"
                name="stock"
                placeholder="50"
                value={newProduct.stock}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            style={{
              ...styles.btnPrimary,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="spin" /> Guardando...
              </span>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </form>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', fontWeight: '600' }}>
              Productos en Inventario ({productsList.length})
            </h3>
          </div>

          <div style={styles.searchWrapper}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Costo</th>
                <th style={styles.th}>Precio Venta</th>
                <th style={styles.th}>Ganancia Estimada/U</th>
                <th style={styles.th}>Stock</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={styles.emptyState}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={18} className="spin" color="#38bdf8" /> Cargando productos desde la base de datos...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const ganancia = (p.salePrice || 0) - (p.costPrice || 0);
                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '500', color: '#f8fafc' }}>{p.name}</td>
                      <td style={styles.td}>{formatCOP(p.costPrice)}</td>
                      <td style={styles.td}>{formatCOP(p.salePrice)}</td>
                      <td style={{ ...styles.td, color: '#4ade80', fontWeight: '600' }}>
                        {formatCOP(ganancia)}
                      </td>
                      <td style={styles.td}>{p.stock}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          disabled={deletingId === p.id}
                          style={styles.btnDelete}
                          title="Eliminar producto"
                        >
                          {deletingId === p.id ? (
                            <Loader2 size={16} className="spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={styles.emptyState}>
                    No hay productos registrados en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPSELL DE PLAN */}
      {showUpgradeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.iconLockWrapper}>
              <Lock size={32} color="#38bdf8" />
            </div>
            <h3 style={{ color: '#ffffff', margin: '0 0 8px 0' }}>Has alcanzado el límite de tu plan</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Tu plan actual permite un máximo de <strong style={{ color: '#ffffff' }}>{maxProducts} productos</strong>.
            </p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowUpgradeModal(false)} style={styles.btnCancel}>
                Cancelar
              </button>
              <a
                href={`https://wa.me/${numeroWhatsApp}?text=${mensajeWA}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.btnWhatsapp}
              >
                <MessageCircle size={18} /> Actualizar Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
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
    gap: '8px',
    marginBottom: '20px'
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
    fontWeight: '600'
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    color: '#cbd5e1',
    marginBottom: '6px',
    fontWeight: '500'
  },
  rowThree: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#090d16',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#f8fafc'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #334155',
    backgroundColor: '#090d16',
    padding: '8px 12px',
    borderRadius: '8px',
    width: '220px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: '#f8fafc'
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
    borderBottom: '1px solid #1e293b'
  },
  td: {
    padding: '14px 12px',
    fontSize: '0.9rem',
    color: '#cbd5e1'
  },
  btnDelete: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#0d1322',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  },
  iconLockWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  btnCancel: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: '500'
  },
  btnWhatsapp: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem'
  }
};

export default Inventory;