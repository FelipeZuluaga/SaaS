import api from './api';

/**
 * Obtiene el resumen de métricas financieras (Ingresos, Costos, Ganancias Netas y Margen)
 * @returns {Promise<Object>} Datos del resumen financiero
 */
export const getNetProfits = async () => {
  try {
    const response = await api.get('/dashboard/net-profits');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las ganancias netas:', error);
    throw error;
  }
};