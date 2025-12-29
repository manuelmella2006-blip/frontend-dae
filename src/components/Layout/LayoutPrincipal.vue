<template>
  <div class="app-container">
    <!-- NAVBAR SUPERIOR -->
    <nav class="top-navbar">
      <div class="navbar-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <div class="navbar-logo">
          <img src="/logo-horizontal-blanco.png" alt="Santo Tomás">
        </div>
      </div>
      <div class="navbar-right">
        <button class="nav-icon-btn">
          <i class="far fa-calendar-check"></i>
        </button>
        <button class="nav-icon-btn">
          <i class="far fa-bell"></i>
          <span class="notification-badge">3</span>
        </button>
        <div class="user-avatar" @click="toggleUserMenu">
          {{ userInitials }}
        </div>
        
        <!-- Menú desplegable del usuario -->
        <div v-if="showUserMenu" class="user-menu" @click="showUserMenu = false">
          <div class="user-menu-content">
            <div class="user-info">
              <div class="user-avatar-medium">{{ userInitials }}</div>
              <div>
                <div class="user-name">{{ userName }}</div>
                <div class="user-role">{{ userRoleLabel }}</div>
              </div>
            </div>
            <div class="menu-divider"></div>
            <router-link to="/perfil" class="menu-item">
              <i class="fas fa-user"></i>
              <span>Mi Perfil</span>
            </router-link>
            <router-link to="/configuracion" class="menu-item">
              <i class="fas fa-cog"></i>
              <span>Configuración</span>
            </router-link>
            <div class="menu-divider"></div>
            <button @click="handleLogout" class="menu-item logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- SIDEBAR OVERLAY -->
    <div 
      class="sidebar-overlay" 
      :class="{ active: sidebarActive }" 
      @click="toggleSidebar"
    ></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ active: sidebarActive }">
      <nav class="sidebar-menu">
        <router-link to="/dashboard" class="menu-item" :class="{ active: $route.name === 'dashboard' }">
          <i class="fas fa-home"></i>
          <span>Inicio</span>
        </router-link>
        <div class="menu-divider"></div>
        
        <!-- Menú según rol -->
        <router-link v-if="userRole === 'estudiante'" to="/estudiante/actividades" class="menu-item">
          <i class="fas fa-calendar-alt"></i>
          <span>Actividades Disponibles</span>
        </router-link>
        
        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/admin/actividades" class="menu-item">
          <i class="fas fa-calendar-alt"></i>
          <span>Gestión de Actividades</span>
        </router-link>
        
        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/admin/inscripciones" class="menu-item">
          <i class="fas fa-user-plus"></i>
          <span>Inscripciones</span>
        </router-link>
        
        <router-link v-if="userRole === 'estudiante'" to="/estudiante/mis-inscripciones" class="menu-item">
          <i class="fas fa-user-plus"></i>
          <span>Mis Inscripciones</span>
        </router-link>
        
        <router-link v-if="['director', 'staff_dae', 'profesor'].includes(userRole)" to="/asistencia" class="menu-item">
          <i class="fas fa-qrcode"></i>
          <span>Asistencias QR</span>
        </router-link>
        
        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/reportes" class="menu-item">
          <i class="fas fa-chart-line"></i>
          <span>Reportes y Analytics</span>
        </router-link>
        
        <div class="menu-divider"></div>
        
        <router-link v-if="userRole === 'estudiante'" to="/perfil-estudiante" class="menu-item">
          <i class="fas fa-user-graduate"></i>
          <span>Ruta Transformadora</span>
        </router-link>
        
        <div class="menu-divider"></div>
        
        <router-link to="/configuracion" class="menu-item">
          <i class="fas fa-cog"></i>
          <span>Configuración</span>
        </router-link>
        
        <router-link to="/acerca-de" class="menu-item">
          <i class="fas fa-info-circle"></i>
          <span>Acerca de</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="sidebar-footer-link">
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
        <div class="sidebar-footer-text">
          <strong>SGASE v1.1</strong> - Desarrollado por <strong>Manuel Mella</strong><br>
          Dirección de Asuntos Estudiantiles | Santo Tomás 2025
        </div>
      </div>
    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="breadcrumb">
          <router-link to="/dashboard">Inicio</router-link>
          <i class="fas fa-chevron-right breadcrumb-arrow"></i>
          <span>{{ pageTitle }}</span>
        </div>
      </div>
      
      <!-- Aquí se inyecta el contenido de las vistas hijas -->
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const sidebarActive = ref(false);
const showUserMenu = ref(false);

// Computed properties
const userName = computed(() => authStore.userName || 'Usuario');
const userRole = computed(() => authStore.userRole || 'estudiante');
const userInitials = computed(() => {
  const name = authStore.userName || 'Usuario';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const userRoleLabel = computed(() => {
  const roles = {
    'estudiante': 'Estudiante',
    'staff_dae': 'Staff DAE',
    'director': 'Director',
    'profesor': 'Profesor'
  };
  return roles[userRole.value] || 'Usuario';
});

const pageTitle = computed(() => {
  const titles = {
    'dashboard': 'Dashboard',
    'estudiante-actividades': 'Actividades Disponibles',
    'estudiante-mis-inscripciones': 'Mis Inscripciones',
    'admin-actividades': 'Gestión de Actividades',
    'admin-inscripciones': 'Inscripciones',
    'asistencia': 'Registro de Asistencia',
    'reportes': 'Reportes y Analytics',
    'perfil-estudiante': 'Ruta Transformadora'
  };
  return titles[route.name] || 'Dashboard';
});

// Métodos
const toggleSidebar = () => {
  sidebarActive.value = !sidebarActive.value;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Cerrar sidebar en móvil al cambiar ruta
const closeSidebarOnMobile = () => {
  if (window.innerWidth < 768) {
    sidebarActive.value = false;
  }
};

// Cerrar menús al hacer clic fuera
const handleClickOutside = (event) => {
  if (!event.target.closest('.navbar-right')) {
    showUserMenu.value = false;
  }
};

// Event listeners
onMounted(() => {
  window.addEventListener('resize', closeSidebarOnMobile);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', closeSidebarOnMobile);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Estilos del layout (similares al HTML) - solo los necesarios para el layout */
.app-container {
  min-height: 100vh;
  background: #F5F5F5;
}

/* NAVBAR SUPERIOR */
.top-navbar {
  background: #0F4C3A;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle:hover {
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
}

.navbar-logo img {
  height: 50px;
  width: auto;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.nav-icon-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.nav-icon-btn:hover {
  background: rgba(255,255,255,0.1);
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #DC3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #C8E6C9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F4C3A;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* Menú desplegable del usuario */
.user-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  width: 300px;
  z-index: 1001;
  overflow: hidden;
}

.user-menu-content {
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.user-avatar-medium {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F4C3A;
  font-weight: 700;
  font-size: 1.5rem;
}

.user-name {
  font-weight: 600;
  color: #2C3E50;
  font-size: 1.1rem;
}

.user-role {
  color: #757575;
  font-size: 0.9rem;
}

.menu-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #2C3E50;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.menu-item:hover {
  background: #F5F5F5;
}

.menu-item i {
  width: 20px;
  color: #0F4C3A;
}

.menu-item.logout-btn {
  color: #DC3545;
}

.menu-item.logout-btn i {
  color: #DC3545;
}

.menu-divider {
  height: 1px;
  background: #E0E0E0;
  margin: 10px 0;
}

/* SIDEBAR */
.sidebar {
  position: fixed;
  left: -350px;
  top: 70px;
  width: 350px;
  height: calc(100vh - 70px);
  background: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.sidebar.active {
  left: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: none;
  z-index: 998;
}

.sidebar-overlay.active {
  display: block;
}

.sidebar-menu {
  padding: 0;
}

.sidebar-menu .menu-item {
  padding: 18px 25px;
  border-left: 4px solid transparent;
  margin: 0;
}

.sidebar-menu .menu-item:hover {
  background: #F5F5F5;
  border-left-color: #0F4C3A;
}

.sidebar-menu .menu-item.active {
  background: #E8F5E9;
  border-left-color: #0F4C3A;
  font-weight: 600;
  color: #0F4C3A;
}

.sidebar-menu .menu-item i {
  font-size: 1.3rem;
  width: 30px;
}

.sidebar-footer {
  padding: 20px 25px;
  border-top: 1px solid #E0E0E0;
  background: #FAFAFA;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.sidebar-footer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #757575;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 15px;
  transition: color 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  padding: 0;
}

.sidebar-footer-link:hover {
  color: #0F4C3A;
}

.sidebar-footer-text {
  font-size: 0.75rem;
  color: #9E9E9E;
  line-height: 1.5;
}

/* MAIN CONTENT */
.main-content {
  margin-top: 70px;
  padding: 0;
}

.page-header {
  background: white;
  padding: 20px 40px;
  border-bottom: 1px solid #E0E0E0;
}

.page-title {
  font-size: 1.8rem;
  color: #2C3E50;
  margin-bottom: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #757575;
}

.breadcrumb a {
  color: #0F4C3A;
  text-decoration: none;
  transition: all 0.3s ease;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb-arrow {
  font-size: 0.7rem;
  color: #BDBDBD;
}

.content {
  padding: 40px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar {
    width: 85%;
    left: -85%;
  }
  
  .content {
    padding: 20px;
  }
  
  .page-header {
    padding: 15px 20px;
  }
  
  .user-menu {
    width: 280px;
    right: -10px;
  }
}
</style>