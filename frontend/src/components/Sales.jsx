import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { ShoppingCart, Plus, Minus, Trash, CheckCircle, Package, CreditCard, Printer, FileText, X, Loader2, Search } from 'lucide-react';
import { createSale } from '../services/saleService';
import { getProducts } from '../services/productService';

// Formateador a Pesos Colombianos (COP)
const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function Sales({ products = [], setProducts, sales = [], setSales }) {
  const { company } = useCompany();
  const [cart, setCart] = useState([]);
  const [successMsg, setSuccessMsg] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const companyName = company?.name || 'Mi Negocio';

  // Agregar producto al carrito
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('¡Producto sin stock disponible!');
    
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('No puedes agregar más unidades que el stock disponible.');
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Cambiar cantidad en el carrito
  const updateQuantity = (id, delta) => {
    const productInInventory = products.find((p) => p.id === id);
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (productInInventory && newQty > productInInventory.stock) {
            alert('Stock máximo alcanzado.');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Eliminar item del carrito
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Calcular total de la venta
  const totalSale = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);

  // Procesar venta en el Backend
  const handleCheckout = async (autoOpenInvoice = false) => {
    if (cart.length === 0 || submitting) return;

    try {
      setSubmitting(true);

      const payload = {
        items: cart,
        total: totalSale
      };

      // 1. Guardar la venta en MySQL (saleService incluye company_id dinámicamente)
      const response = await createSale(payload);
      const newSale = response.sale;

      // 2. Actualizar estado local de ventas
      if (setSales) {
        setSales([newSale, ...sales]);
      }

      // 3. Recargar productos desde el backend para reflejar el stock actualizado
      const updatedProducts = await getProducts();
      if (setProducts) {
        setProducts(updatedProducts);
      }

      // 4. Limpiar carrito y dar confirmación
      setLastSale(newSale);
      setCart([]);
      setSuccessMsg(true);

      if (autoOpenInvoice) {
        setShowInvoiceModal(true);
      }

      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocurrió un error al procesar la venta';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Productos filtrados por buscador
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Catálogo de Productos */}
      <div style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} color="#38bdf8" />
            <h3 style={styles.sectionTitle}>Seleccionar Productos</h3>
          </div>

          {/* Buscador de catálogo */}
          <div style={styles.searchWrapper}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.gridProducts}>
          {filteredProducts.length === 0 ? (
            <p style={styles.emptyState}>
              No hay productos coincidentes en el inventario.
            </p>
          ) : (
            filteredProducts.map((p) => {
              const isOut = p.stock <= 0;
              return (
                <div 
                  key={p.id} 
                  style={{
                    ...styles.productCard,
                    opacity: isOut ? 0.4 : 1,
                    cursor: isOut ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={() => !isOut && addToCart(p)}
                >
                  <h4 style={styles.productName}>{p.name}</h4>
                  <p style={styles.price}>{formatCOP(p.salePrice)}</p>
                  <span style={isOut ? styles.stockBadgeOut : styles.stockBadge}>
                    {isOut ? 'Agotado' : `Stock: ${p.stock}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Carrito de Compra */}
      <div style={styles.cartSection}>
        <div style={styles.sectionHeader}>
          <ShoppingCart size={20} color="#38bdf8" />
          <h3 style={styles.sectionTitle}>Carrito de Venta</h3>
        </div>

        {successMsg && (
          <div style={styles.successAlert}>
            <CheckCircle size={16} /> ¡Venta registrada exitosamente!
          </div>
        )}

        <div style={styles.cartList}>
          {cart.length === 0 ? (
            <div style={styles.emptyCart}>
              <ShoppingCart size={32} color="#334155" />
              <p style={{ margin: '8px 0 0 0' }}>Selecciona productos del catálogo para agregar al carrito.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <div>
                  <div style={styles.cartItemTitle}>{item.name}</div>
                  <div style={styles.cartItemSub}>{formatCOP(item.salePrice)} c/u</div>
                </div>
                <div style={styles.cartControls}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={styles.qtyBtn} disabled={submitting}>
                    <Minus size={14} />
                  </button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} style={styles.qtyBtn} disabled={submitting}>
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} style={styles.trashBtn} disabled={submitting}>
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.checkoutBox}>
          <div style={styles.totalRow}>
            <span>Total a pagar:</span>
            <span style={styles.totalAmount}>{formatCOP(totalSale)}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleCheckout(false)} 
              disabled={cart.length === 0 || submitting}
              style={{ 
                ...styles.checkoutBtn, 
                opacity: cart.length === 0 || submitting ? 0.4 : 1, 
                cursor: cart.length === 0 || submitting ? 'not-allowed' : 'pointer' 
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin" /> Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={18} /> Completar Venta
                </>
              )}
            </button>

            <button 
              onClick={() => handleCheckout(true)} 
              disabled={cart.length === 0 || submitting}
              style={{ 
                ...styles.invoiceBtn, 
                opacity: cart.length === 0 || submitting ? 0.4 : 1, 
                cursor: cart.length === 0 || submitting ? 'not-allowed' : 'pointer' 
              }}
              title="Completar e Imprimir Factura"
            >
              <FileText size={18} />
            </button>
          </div>

          {lastSale && cart.length === 0 && (
            <button 
              onClick={() => setShowInvoiceModal(true)}
              style={styles.reprintBtn}
            >
              <Printer size={15} /> Ver última factura (#{lastSale.id.toString().slice(-6)})
            </button>
          )}
        </div>
      </div>

      {/* MODAL DE FACTURA IMPRESA */}
      {showInvoiceModal && lastSale && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} id="printable-invoice">
            <div style={styles.modalHeader} className="no-print">
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Factura de Venta</h3>
              <button style={styles.closeBtn} onClick={() => setShowInvoiceModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* CONTENIDO RECIBO DE FACTURA */}
            <div style={styles.invoiceContent}>
              <div style={styles.invoiceHeader}>
                <h2 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', color: '#0f172a', textTransform: 'uppercase' }}>
                  {companyName}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>
                  RECIBO N° #{lastSale.id.toString().slice(-6)}
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Fecha: {lastSale.date}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '16px 0' }} />

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>
                    <th style={{ paddingBottom: '6px' }}>Cant.</th>
                    <th style={{ paddingBottom: '6px' }}>Producto</th>
                    <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSale.items.map((item, idx) => (
                    <tr key={idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <td style={{ padding: '6px 0' }}>{item.quantity}</td>
                      <td style={{ padding: '6px 0' }}>{item.name}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCOP(item.salePrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                <span>TOTAL:</span>
                <span>{formatCOP(lastSale.total)}</span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '24px' }}>
                ¡Gracias por su compra!
              </p>
            </div>

            <div style={styles.modalActions} className="no-print">
              <button style={styles.printActionBtn} onClick={handlePrint}>
                <Printer size={16} /> Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    display: 'grid', 
    gridTemplateColumns: '1.2fr 0.8fr', 
    gap: '24px' 
  },
  productsSection: { 
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)', 
    padding: '24px', 
    borderRadius: '12px', 
    border: '1px solid #1e293b',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
    fontWeight: '600'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #334155',
    backgroundColor: '#090d16',
    padding: '6px 10px',
    borderRadius: '8px',
    width: '180px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: '#f8fafc'
  },
  gridProducts: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
    gap: '14px' 
  },
  productCard: { 
    background: '#090d16', 
    border: '1px solid #334155', 
    borderRadius: '10px', 
    padding: '16px 12px', 
    textAlign: 'center', 
    transition: 'transform 0.15s ease, border-color 0.2s ease'
  },
  productName: { 
    margin: '0 0 6px 0', 
    color: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  price: { 
    color: '#38bdf8', 
    fontWeight: '700', 
    margin: '4px 0 8px 0', 
    fontSize: '1.05rem' 
  },
  stockBadge: { 
    display: 'inline-block',
    fontSize: '0.75rem', 
    color: '#4ade80', 
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '600' 
  },
  stockBadgeOut: { 
    display: 'inline-block',
    fontSize: '0.75rem', 
    color: '#f87171', 
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '600' 
  },
  cartSection: { 
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)', 
    padding: '24px', 
    borderRadius: '12px', 
    border: '1px solid #1e293b', 
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '480px' 
  },
  cartList: { 
    flex: 1, 
    overflowY: 'auto', 
    margin: '10px 0 20px 0', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  cartItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    background: '#090d16', 
    padding: '12px 14px', 
    borderRadius: '8px', 
    border: '1px solid #1e293b' 
  },
  cartItemTitle: {
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  cartItemSub: { 
    fontSize: '0.8rem', 
    color: '#94a3b8',
    marginTop: '2px'
  },
  cartControls: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  qtyBtn: { 
    background: '#1e293b', 
    color: '#f8fafc',
    border: '1px solid #334155', 
    borderRadius: '6px', 
    width: '26px', 
    height: '26px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  qtyText: { 
    fontWeight: '600', 
    color: '#f8fafc',
    minWidth: '16px',
    textAlign: 'center'
  },
  trashBtn: { 
    background: 'rgba(239, 68, 68, 0.1)', 
    color: '#f87171', 
    border: 'none', 
    borderRadius: '6px', 
    width: '26px', 
    height: '26px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: '4px'
  },
  emptyCart: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '60px'
  },
  emptyState: {
    color: '#64748b',
    gridColumn: '1/-1',
    textAlign: 'center',
    padding: '40px 0'
  },
  successAlert: { 
    background: 'rgba(74, 222, 128, 0.1)', 
    color: '#4ade80', 
    border: '1px solid rgba(74, 222, 128, 0.2)',
    padding: '10px 14px', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '0.85rem', 
    marginBottom: '10px' 
  },
  checkoutBox: { 
    borderTop: '1px solid #1e293b', 
    paddingTop: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  totalRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    fontSize: '1.1rem', 
    fontWeight: '600', 
    color: '#cbd5e1' 
  },
  totalAmount: { 
    color: '#4ade80',
    fontSize: '1.3rem',
    fontWeight: '700'
  },
  checkoutBtn: { 
    flex: 1,
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    color: '#ffffff', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '8px', 
    fontSize: '0.95rem', 
    fontWeight: '600', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  invoiceBtn: {
    background: '#1e293b',
    color: '#38bdf8',
    border: '1px solid #38bdf8',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  reprintBtn: {
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalCard: {
    background: '#0d1322',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '20px',
    width: '360px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  invoiceContent: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    color: '#0f172a'
  },
  invoiceHeader: {
    textAlign: 'center'
  },
  modalActions: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  printActionBtn: {
    width: '100%',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }
};