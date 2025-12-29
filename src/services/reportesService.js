import api from './api';

export const reportesService = {
  // Obtener estadísticas generales
  async getGeneralStats(filters) {
    try {
      const response = await api.get('/reportes/estadisticas-generales', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching general stats:', error);
      throw error;
    }
  },

  // Obtener participación mensual
  async getMonthlyParticipation(filters) {
    try {
      const response = await api.get('/reportes/participacion-mensual', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly participation:', error);
      throw error;
    }
  },

  // Obtener detalle de actividades
  async getActivitiesDetail(filters) {
    try {
      const response = await api.get('/reportes/detalle-actividades', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities detail:', error);
      throw error;
    }
  },

  // Obtener detalle de inscripciones
  async getInscriptionsDetail(filters) {
    try {
      const response = await api.get('/reportes/detalle-inscripciones', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inscriptions detail:', error);
      throw error;
    }
  },

  // Exportar reporte
  async exportReport(data, format = 'json') {
    try {
      const response = await api.post('/reportes/exportar', {
        ...data,
        formato: format
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
};