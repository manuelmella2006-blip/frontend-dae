import api from './api';

export const inscripcionesService = {
  // Inscribirse a una actividad
  async inscribir(actividadId) {
    try {
      const response = await api.post(`/inscripciones/${actividadId}`);
      return response.data;
    } catch (error) {
      console.error('Error inscribiendo:', error);
      throw error;
    }
  },

  // Cancelar inscripción
  async cancelar(actividadId) {
    try {
      const response = await api.delete(`/inscripciones/${actividadId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelando inscripción:', error);
      throw error;
    }
  },

  // Obtener mis inscripciones (estudiante)
  async getMisInscripciones() {
    try {
      const response = await api.get('/inscripciones/mis-inscripciones');
      return response.data;
    } catch (error) {
      console.error('Error fetching mis inscripciones:', error);
      throw error;
    }
  },

  // Obtener inscripciones de una actividad (admin)
  async getByActividad(actividadId) {
    try {
      const response = await api.get(`/inscripciones/actividad/${actividadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
      throw error;
    }
  },

  // Obtener TODAS las inscripciones (admin)
  async getAllInscripciones() {
    try {
      const response = await api.get('/inscripciones/todas');
      return response.data;
    } catch (error) {
      console.error('Error fetching todas las inscripciones:', error);
      throw error;
    }
  }
};
