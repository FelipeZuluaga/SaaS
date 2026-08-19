import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setCompanyData } = useCompany();
  
  const [formData, setFormData] = useState({
    name: '',
    sellType: '',
    logoUrl: null
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logoUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCompanyData(formData);
    navigate('/Login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Cabecera con toque de marca */}
        <div style={styles.header}>
          <div style={styles.brandBadge}>NovaForge Platform</div>
          <h2 style={styles.title}>Creación de Sistema</h2>
          <p style={styles.subtitle}>Configura tu empresa para empezar a operar</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de la Compañía</label>
            <input 
              type="text" 
              placeholder="Ej: Tienda Express" 
              required
              style={styles.input}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>¿Qué vas a vender?</label>
            <input 
              type="text" 
              placeholder="Ej: Ropa, Comida, Electrónica..." 
              required
              style={styles.input}
              onChange={(e) => setFormData({...formData, sellType: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Subir Logo</label>
            <label htmlFor="logo-upload" style={styles.fileUploadBtn}>
              {formData.logoUrl ? 'Cambiar imagen' : 'Seleccionar archivo...'}
            </label>
            <input 
              id="logo-upload"
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange} 
              style={{ display: 'none' }}
            />
          </div>

          {formData.logoUrl && (
            <div style={styles.previewContainer}>
              <img src={formData.logoUrl} alt="Logo preview" style={styles.previewImage} />
            </div>
          )}

          <button type="submit" style={styles.btnPrimary}>
            Crear Panel Principal
          </button>
        </form>
      </div>
    </div>
  );
}

// Paleta de colores NovaForge Software:
// Azul Marino Fondo: #0d1322 / #131b2e
// Azul Eléctrico Accento: #2563eb / #1d4ed8
// Texto / Bordes Glow: #e2e8f0 / #1e293b
const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#0a0e1a', // Fondo oscuro tipo NovaForge
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '20px'
  },
  card: { 
    background: 'linear-gradient(145deg, #131b2e 0%, #0d1322 100%)', 
    padding: '2.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 15px rgba(37, 99, 235, 0.15)', 
    border: '1px solid #1e293b',
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#ffffff',
    fontSize: '1.6rem',
    fontWeight: '600'
  },
  subtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.9rem'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '18px' 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: '#cbd5e1',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#090d16',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  fileUploadBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '10px 14px',
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    border: '1px dashed #38bdf8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  previewContainer: { 
    textAlign: 'center', 
    margin: '5px 0' 
  },
  previewImage: { 
    width: '70px', 
    height: '70px', 
    objectFit: 'cover', 
    borderRadius: '50%',
    border: '2px solid #2563eb',
    boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)'
  },
  btnPrimary: { 
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    color: '#ffffff', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    marginTop: '10px',
    fontWeight: '600',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease'
  }
};