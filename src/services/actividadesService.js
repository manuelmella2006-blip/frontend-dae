import api from './api';

export const actividadesService = {
  // Obtener todas las actividades
  async getAll() {
    try {
      const response = await api.get('/actividades');
      return response.data;
    } catch (error) {
      console.error('Error fetching actividades:', error);
      throw error;
    }
  },

  // Obtener una actividad específica
  async getById(id) {
    try {
      const response = await api.get(`/actividades/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actividad:', error);
      throw error;
    }
  },

  // Crear actividad
  async create(actividadData) {
    try {
      const response = await api.post('/actividades', actividadData);
      return response.data;
    } catch (error) {
      console.error('Error creating actividad:', error);
      throw error;
    }
  },

  // Actualizar actividad
  async update(id, actividadData) {
    try {
      const response = await api.put(`/actividades/${id}`, actividadData);
      return response.data;
    } catch (error) {
      console.error('Error updating actividad:', error);
      throw error;
    }
  },

  // Eliminar actividad
  async delete(id) {
    try {
      const response = await api.delete(`/actividades/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting actividad:', error);
      throw error;
    }
  }
};