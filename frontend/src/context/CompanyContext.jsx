import { createContext, useState, useContext } from 'react';

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  // Guardamos temporalmente la info de la empresa en el estado
  const [companyData, setCompanyData] = useState({
    name: 'Mi Empresa',
    sellType: 'Servicios / Productos',
    logoUrl: null, // Guardará la vista previa de la imagen
  });

  return (
    <CompanyContext.Provider value={{ companyData, setCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);