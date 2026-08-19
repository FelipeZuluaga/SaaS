import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    companyId: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login simulado con:', credentials);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Cabecera consistente con la marca */}
        <div style={styles.header}>
          <div style={styles.brandBadge}>NovaForge Platform</div>
          <h2 style={styles.title}>Iniciar Sesión</h2>
          <p style={styles.subtitle}>Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Escoger Compañía / ID</label>
            <input 
              type="text" 
              placeholder="Ej. MiEmpresa" 
              required 
              style={styles.input}
              onChange={(e) => setCredentials({...credentials, companyId: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario Único</label>
            <input 
              type="text" 
              placeholder="usuario123" 
              required 
              style={styles.input}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña Única</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              style={styles.input}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button type="submit" style={styles.btnPrimary}>
            Ingresar al Sistema
          </button>
        </form>

        <p style={styles.footerText}>
          ¿Aún no tienes un sistema?{' '}
          <Link to="/onboarding" style={styles.link}>
            Crear mi sistema aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

// Estilos alineados con la identidad NovaForge
const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#0a0e1a', 
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
    maxWidth: '400px',
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
    margin: '0 0 6px 0',
    color: '#ffffff',
    fontSize: '1.6rem',
    fontWeight: '600'
  },
  subtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
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
  },
  footerText: {
    marginTop: '20px',
    fontSize: '0.85rem',
    color: '#94a3b8',
    textAlign: 'center'
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s ease'
  }
};