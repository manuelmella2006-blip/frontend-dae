import api from './api';

export const dashboardService = {
  // Obtener estadísticas del dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Obtener actividades recientes
  async getRecentActivities() {
    try {
      const response = await api.get('/dashboard/actividades-recientes');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Obtener próximos eventos
  async getUpcomingEvents() {
    try {
      const response = await api.get('/dashboard/proximos-eventos');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }
};