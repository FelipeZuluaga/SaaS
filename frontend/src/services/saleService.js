import api from './api';

/**
 * Obtener el historial completo de ventas con el detalle de productos
 */
export const getSales = async () => {
  try {
    const response = await api.get('/sales');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de ventas:', error);
    throw error;
  }
};

/**
 * Registrar una nueva venta y descontar stock automáticamente
 * @param {Object} saleData - { items: [{ id, quantity, salePrice, name }], total }
 */
export const createSale = async (saleData) => {
  try {
    const response = await api.post('/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Error al procesar la venta:', error);
    throw error;
  }
};