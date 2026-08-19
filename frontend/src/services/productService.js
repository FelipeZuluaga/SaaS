import api from './api';

// Función auxiliar para obtener el company_id desde localStorage
const getCompanyId = () => {
  const company = JSON.parse(localStorage.getItem('company'));
  return company?.id;
};

/**
 * Obtener todos los productos del inventario de la empresa actual
 */
export const getProducts = async () => {
  try {
    const companyId = getCompanyId();
    const response = await api.get(`/products?company_id=${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Crear un nuevo producto vinculado a la empresa actual
 * @param {Object} productData - { name, costPrice, salePrice, stock }
 */
export const createProduct = async (productData) => {
  try {
    const companyId = getCompanyId();
    const response = await api.post('/products', {
      ...productData,
      company_id: companyId
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto existente asegurando pertenencia a la empresa
 * @param {number|string} id - ID del producto
 * @param {Object} productData - { name, costPrice, salePrice, stock }
 */
export const updateProduct = async (id, productData) => {
  try {
    const companyId = getCompanyId();
    const response = await api.put(`/products/${id}`, {
      ...productData,
      company_id: companyId
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un producto validando la empresa actual
 * @param {number|string} id - ID del producto
 */
export const deleteProduct = async (id) => {
  try {
    const companyId = getCompanyId();
    const response = await api.delete(`/products/${id}?company_id=${companyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error);
    throw error;
  }
};