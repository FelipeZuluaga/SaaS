// frontend/src/hooks/usePlanLimits.js
import { useCompany } from '../context/CompanyContext';
import { getPlanLimits } from '../config/planLimits';

export const usePlanLimits = () => {
  const { company } = useCompany();
  // Toma el plan de la empresa actual o 'Emprendedor' por defecto
  const currentPlanName = company?.plan || 'Emprendedor'; 
  const limits = getPlanLimits(currentPlanName);

  const canAddProduct = (currentProductCount) => {
    return currentProductCount < limits.maxProducts;
  };

  const canIssueElectronicInvoice = (monthlyInvoiceCount = 0) => {
    if (!limits.electronicInvoicing) return false;
    return monthlyInvoiceCount < limits.maxElectronicInvoices;
  };

  return {
    planName: limits.name,
    limits,
    canAddProduct,
    canIssueElectronicInvoice,
    hasLowStockAlerts: limits.lowStockAlerts,
    hasMultiWarehouse: limits.multiWarehouse,
    hasAdvancedReports: limits.advancedReports,
  };
};