import api from './api';

/**
 * 1. Registrar nueva compañía y su usuario administrador (Onboarding)
 * Usa FormData para enviar el texto junto con el archivo del logo.
 */
export const registerCompany = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 2. Iniciar sesión (Login)
 * Envía companyName, username y password al backend.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 3. Utilidad para cerrar sesión
 * Limpia el token y datos guardados del navegador.
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('company');
  localStorage.removeItem('user');
};