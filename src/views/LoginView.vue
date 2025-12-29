<template>
  <div class="login-page">
    <div class="login-container">
      <!-- LEFT SIDE -->
      <div class="login-left">
        <div class="logo-container">
          <img src="@/assets/logo-vertical-blanco.png" alt="Logo Santo Tomás">
        </div>
        <h1>SGASE</h1>
        <p>Sistema de Gestión de Actividades y Seguimiento Estudiantil</p>

        <div class="system-info">
          <h3><i class="fas fa-university"></i> Instituto Profesional Santo Tomás</h3>
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>Sede Puerto Montt</span>
          </div>
          <div class="info-item">
            <i class="fas fa-building"></i>
            <span>Dirección de Asuntos Estudiantiles</span>
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="login-right">
        <div class="login-header">
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales institucionales</p>
        </div>

        <!-- Alerta de sesión activa -->
        <div v-if="hasActiveSession" class="session-alert">
          <div class="alert-content">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="alert-text">
              <p>Hay una sesión activa. ¿Quieres iniciar con otro usuario?</p>
              <button @click="clearSession" class="alert-button">
                Limpiar sesión actual
              </button>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Correo Institucional</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-control"
                placeholder="usuario@santotomas.cl"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-control"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="remember">
              <label for="remember">Recordarme</label>
            </div>
            <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" :disabled="loading" class="btn-login">
            <i class="fas fa-sign-in-alt"></i>
            <span v-if="loading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>

          <!-- Credenciales de prueba (mantenidas pero con diseño mejorado) -->
          <div class="test-credentials">
            <h4><i class="fas fa-key"></i> Usuarios de prueba:</h4>
            <div class="credentials-list">
              <div class="credential-item">
                <span class="role">Estudiante:</span>
                <span class="credential">funcionario1 / 1234</span>
              </div>
              <div class="credential-item">
                <span class="role">Profesor:</span>
                <span class="credential">profesor1 / Password123*</span>
              </div>
              <div class="credential-item">
                <span class="role">Staff:</span>
                <span class="credential">staff1 / Password123*</span>
              </div>
              <div class="credential-item">
                <span class="role">Director:</span>
                <span class="credential">Manuel / 123456</span>
              </div>
            </div>
          </div>
        </form>

        <div class="contact-info">
          <h3>
            <i class="fas fa-info-circle"></i>
            Dirección de Asuntos Estudiantiles
          </h3>
          <div class="contact-item">
            <i class="fas fa-user"></i>
            <span>Director: Enrique Caico Massé</span>
          </div>
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>jcaico@santotomas.cl</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Verificar si hay sesión activa
const hasActiveSession = computed(() => {
  return !!localStorage.getItem('token');
});

// Limpiar sesión
const clearSession = () => {
  authStore.clearSession();
  // Recargar la página para limpiar todo
  window.location.reload();
};

onMounted(() => {
  // Si ya está autenticado, redirigir al dashboard
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  
  const credentials = {
    username: username.value,
    password: password.value
  };
  
  const result = await authStore.login(credentials);
  
  if (result.success) {
    // Redirigir según rol - IMPORTANTE: usar router.replace para evitar problemas
    const routes = {
      'estudiante': '/dashboard',
      'profesor': '/dashboard',
      'staff_dae': '/dashboard',
      'director': '/dashboard',
    };
    
    const route = routes[result.user.rol] || '/dashboard';
    
    // Usar replace para evitar que el botón "atrás" del navegador vuelva al login
    router.replace(route);
  } else {
    error.value = result.error || 'Credenciales incorrectas';
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #0F4C3A 0%, #1B5E20 100%);
  font-family: 'Roboto', sans-serif;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.login-left {
  background: linear-gradient(135deg, #0F4C3A 0%, #1B5E20 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.logo-container img {
  width: 180px;
  margin-bottom: 30px;
}

.login-left h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
}

.login-left p {
  font-size: 1.1rem;
  opacity: 0.95;
  line-height: 1.6;
}

.system-info {
  margin-top: 40px;
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.system-info h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.95rem;
  justify-content: flex-start;
}

.info-item i {
  color: #C8E6C9;
}

.login-right {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 10px;
}

.login-header p {
  color: #757575;
  font-size: 0.95rem;
}

/* Alerta de sesión activa */
.session-alert {
  margin-bottom: 25px;
  background: #FFF8E1;
  border-left: 4px solid #FFB300;
  border-radius: 8px;
  padding: 15px;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.alert-content i {
  color: #FFB300;
  font-size: 1.2rem;
  margin-top: 2px;
}

.alert-text {
  flex: 1;
}

.alert-text p {
  color: #5D4037;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.alert-button {
  background: none;
  border: none;
  color: #0F4C3A;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.alert-button:hover {
  color: #1B5E20;
}

/* Formulario */
.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #2C3E50;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #0F4C3A;
  font-size: 1.1rem;
}

.form-control {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 2px solid #E0E0E0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
}

.form-control:focus {
  outline: none;
  border-color: #0F4C3A;
  box-shadow: 0 0 0 3px rgba(15, 76, 58, 0.1);
}

/* Mensaje de error */
.error-message {
  background: #FFEBEE;
  color: #C62828;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.error-message i {
  font-size: 1rem;
}

/* Opciones del formulario */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.remember-me label {
  font-size: 0.9rem;
  color: #2C3E50;
  cursor: pointer;
}

.forgot-password {
  color: #0F4C3A;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Botón de login */
.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(15, 76, 58, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Credenciales de prueba */
.test-credentials {
  background: #E3F2FD;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
}

.test-credentials h4 {
  color: #1565C0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credential-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.role {
  color: #2C3E50;
  font-weight: 500;
}

.credential {
  color: #0F4C3A;
  font-family: monospace;
  background: rgba(255,255,255,0.5);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Información de contacto */
.contact-info {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #E0E0E0;
}

.contact-info h3 {
  color: #0F4C3A;
  margin-bottom: 15px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #757575;
  font-size: 0.9rem;
}

.contact-item i {
  color: #0F4C3A;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-left {
    padding: 40px 30px;
  }

  .login-right {
    padding: 40px 30px;
  }

  .login-left h1 {
    font-size: 2rem;
  }

  .system-info {
    display: none;
  }
  
  .test-credentials {
    padding: 15px;
  }
  
  .credentials-list {
    font-size: 0.85rem;
  }
}
</style>