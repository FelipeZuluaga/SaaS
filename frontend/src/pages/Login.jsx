import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { loginUser } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Toma el nombre de la compañía enviado desde Onboarding si existe
  const [credentials, setCredentials] = useState({
    companyId: location.state?.companyName || '',
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({
        companyName: credentials.companyId,
        username: credentials.username,
        password: credentials.password
      });

      // Guardar sesión en el navegador
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company));
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirigir al dashboard principal
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Compañía, usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
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

        {/* Mensaje de error dinámico */}
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Escoger Compañía / ID</label>
            <input 
              type="text" 
              placeholder="Ej. MiEmpresa" 
              required 
              style={styles.input}
              value={credentials.companyId}
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
              value={credentials.username}
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
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btnPrimary}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} className="spin" /> Ingresando...
              </span>
            ) : (
              'Ingresar al Sistema'
            )}
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
    marginBottom: '1.5rem'
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
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    textAlign: 'center'
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