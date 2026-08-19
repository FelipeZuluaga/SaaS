import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ❌ INCORRECTO:
// import CompanyProvider from './context/ompanyContext';

// ✅ CORRECTO:
import { CompanyProvider } from './context/CompanyContext';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';

// Un componente rápido simulado para el Paso 3 (Panel Principal)
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}

export default App;