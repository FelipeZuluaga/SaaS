// frontend/src/config/planLimits.js

export const PLAN_TYPES = {
  EMPRENDEDOR: 'Emprendedor',
  PYME: 'PyME',
  PRO: 'Pro'
};

export const PLAN_CONFIGS = {
  [PLAN_TYPES.EMPRENDEDOR]: {
    name: 'Plan Emprendedor',
    maxProducts: 50,
    electronicInvoicing: false, // Solo recibos POS internos
    maxElectronicInvoices: 0,
    lowStockAlerts: false,
    multiWarehouse: false,
    advancedReports: false,
  },
  [PLAN_TYPES.PYME]: {
    name: 'Plan PyME',
    maxProducts: 500,
    electronicInvoicing: true,
    maxElectronicInvoices: 50, // 50 facturas/mes
    lowStockAlerts: true,
    multiWarehouse: false,
    advancedReports: false,
  },
  [PLAN_TYPES.PRO]: {
    name: 'Plan Pro / Ilimitado',
    maxProducts: Infinity,
    electronicInvoicing: true,
    maxElectronicInvoices: Infinity,
    lowStockAlerts: true,
    multiWarehouse: true,
    advancedReports: true,
  }
};

export const getPlanLimits = (planName) => {
  const normalizedKey = Object.keys(PLAN_CONFIGS).find(
    (key) => key.toLowerCase() === (planName || '').toLowerCase()
  );
  return PLAN_CONFIGS[normalizedKey] || PLAN_CONFIGS[PLAN_TYPES.EMPRENDEDOR];
};