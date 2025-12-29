import { useAuthStore } from '@/stores/authStore';

class SessionManager {
  constructor() {
    this.timeoutDuration = 60 * 60 * 1000; // 1 hora
    this.timeoutId = null;
  }

  startSessionTimer() {
    // Limpiar timer anterior
    this.clearSessionTimer();
    
    // Establecer nuevo timer
    this.timeoutId = setTimeout(() => {
      this.forceLogout();
    }, this.timeoutDuration);
  }

  clearSessionTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resetSessionTimer() {
    this.startSessionTimer();
  }

  async forceLogout() {
    const authStore = useAuthStore();
    await authStore.logout();
    
    // Opcional: mostrar mensaje
    alert('Tu sesión ha expirado por inactividad');
  }

  // Detectar actividad del usuario
  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const resetTimer = () => {
      this.resetSessionTimer();
    };
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }
}

export default new SessionManager();