
import api from './api';

export const asistenciaService = {
  // Marcar asistencia con QR (estudiante)
  async marcarAsistenciaQR(data) {
    try {
      const response = await api.post('/asistencia/qr', data);
      return response.data;
    } catch (error) {
      console.error('Error marcando asistencia QR:', error);
      throw error;
    }
  },

  // Obtener mi asistencia a una actividad (estudiante)
  async getMiAsistencia(actividadId) {
    try {
      const response = await api.get(`/asistencia/mi-asistencia/${actividadId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mi asistencia:', error);
      throw error;
    }
  },

  // Obtener mis asistencias (estudiante)
  async getMisAsistencias() {
    try {
      const response = await api.get('/asistencia/mis-asistencias');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mis asistencias:', error);
      throw error;
    }
  },

  // Verificar si puedo marcar asistencia (estudiante)
  async verificarDisponibilidadAsistencia(actividadId) {
    try {
      const response = await api.get(`/asistencia/verificar/${actividadId}`);
      return response.data;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw error;
    }
  }
};
