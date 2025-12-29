import { defineStore } from 'pinia';
import api from '@/services/api';
import sessionManager from '@/utils/sessionManager';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.rol || null,
    userName: (state) => state.user?.nombre_completo || null,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/auth/login', credentials);
        
        const { token, user } = response.data;
        
        // Limpiar localStorage primero
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Guardar nuevos datos
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar store
        this.token = token;
        this.user = user;
        
        // Iniciar timer de sesión Y listeners de actividad
        sessionManager.startSessionTimer();
        sessionManager.setupActivityListeners();
        
        return { success: true, user };
      } catch (error) {
        this.error = error.response?.data?.message || 'Error de conexión';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      try {
        // Detener el timer de sesión
        sessionManager.clearSessionTimer();
        
        // Limpiar localStorage
        localStorage.clear();
        
        // Limpiar store
        this.token = null;
        this.user = null;
        
        // Redirigir a login
        window.location.href = '/login';
      } catch (error) {
        console.error('Error al hacer logout:', error);
      }
    },
    
    clearSession() {
      // Limpiar sin redirigir
      sessionManager.clearSessionTimer();
      localStorage.clear();
      this.token = null;
      this.user = null;
    },
    
    checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        
        // Solo configurar el sessionManager si hay token
        sessionManager.startSessionTimer();
        sessionManager.setupActivityListeners();
        
        return true;
      }
      
      return false;
    }
  },
});