<template>
  <div class="dashboard-container">
    <!-- STATS CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.actividades_activas?.total || 0 }}</h3>
          <p>Actividades Activas</p>
          <div class="stat-trend" :class="stats.actividades_activas?.tendencia >= 0 ? 'up' : 'down'">
            <i :class="stats.actividades_activas?.tendencia >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i> 
            {{ Math.abs(stats.actividades_activas?.tendencia || 0) }}% vs mes anterior
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.estudiantes_inscritos?.total) || 0 }}</h3>
          <p>Estudiantes Inscritos</p>
          <div class="stat-trend" :class="stats.estudiantes_inscritos?.tendencia >= 0 ? 'up' : 'down'">
            <i :class="stats.estudiantes_inscritos?.tendencia >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i> 
            {{ Math.abs(stats.estudiantes_inscritos?.tendencia || 0) }}% vs mes anterior
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.asistencia_promedio?.porcentaje || 0 }}%</h3>
          <p>Asistencia Promedio</p>
          <div class="stat-trend up" v-if="stats.asistencia_promedio?.sobre_meta && stats.asistencia_promedio?.sobre_meta.includes('↑')">
            <i class="fas fa-arrow-up"></i> {{ stats.asistencia_promedio?.sobre_meta }}
          </div>
          <div class="stat-trend down" v-else-if="stats.asistencia_promedio?.sobre_meta">
            <i class="fas fa-arrow-down"></i> {{ stats.asistencia_promedio?.sobre_meta }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.satisfaccion?.promedio || 0 }}</h3>
          <p>Satisfacción (1-7)</p>
          <div class="stat-trend up" v-if="stats.satisfaccion?.sobre_meta && stats.satisfaccion?.sobre_meta.includes('↑')">
            <i class="fas fa-arrow-up"></i> {{ stats.satisfaccion?.sobre_meta }}
          </div>
          <div class="stat-trend down" v-else-if="stats.satisfaccion?.sobre_meta">
            <i class="fas fa-arrow-down"></i> {{ stats.satisfaccion?.sobre_meta }}
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div class="quick-actions">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Acciones Rápidas
      </h2>
      <div class="actions-grid">
        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/admin/actividades" class="action-card">
          <div class="action-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="action-title">Nueva Actividad</div>
          <div class="action-desc">Crear actividad estudiantil</div>
        </router-link>

        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/admin/inscripciones" class="action-card">
          <div class="action-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="action-title">Ver Inscripciones</div>
          <div class="action-desc">Gestionar participantes</div>
        </router-link>

        <router-link v-if="userRole === 'estudiante'" to="/estudiante/actividades" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-title">Ver Actividades</div>
          <div class="action-desc">Inscríbete en actividades</div>
        </router-link>

        <router-link v-if="['director', 'staff_dae', 'profesor'].includes(userRole)" to="/asistencia" class="action-card">
          <div class="action-icon">
            <i class="fas fa-qrcode"></i>
          </div>
          <div class="action-title">Registro QR</div>
          <div class="action-desc">Asistencia con código QR</div>
        </router-link>

        <router-link v-if="['director', 'staff_dae'].includes(userRole)" to="/reportes" class="action-card">
          <div class="action-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="action-title">Ver Reportes</div>
          <div class="action-desc">Analytics y métricas</div>
        </router-link>

        <router-link v-if="userRole === 'estudiante'" to="/estudiante/mis-inscripciones" class="action-card">
          <div class="action-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="action-title">Mis Inscripciones</div>
          <div class="action-desc">Ver mis actividades</div>
        </router-link>
      </div>
    </div>

    <!-- RECENT ACTIVITIES & EVENTS -->
    <div class="recent-section">
      <div class="activities-card">
        <h2 class="section-title">
          <i class="fas fa-clock"></i>
          Actividades Recientes
        </h2>

        <div v-if="loadingActivities" class="loading-message">
          Cargando actividades...
        </div>
        
        <div v-else-if="recentActivities.length === 0" class="no-data">
          No hay actividades recientes
        </div>

        <div 
          v-else
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
          @click="goToActivity(activity.id)"
        >
          <div class="activity-header">
            <div class="activity-title">{{ activity.titulo }}</div>
            <div class="activity-date">{{ formatDate(activity.fecha) }}</div>
          </div>
          <div class="activity-desc">
            {{ activity.descripcion || 'Sin descripción' }}
          </div>
          <div class="activity-meta">
            <span><i class="fas fa-users"></i> {{ activity.inscritos }} inscritos</span>
            <span><i class="fas fa-check-circle"></i> {{ activity.asistentes }} asistieron</span>
          </div>
        </div>
      </div>

      <div class="events-card">
        <h2 class="section-title">
          <i class="fas fa-calendar-day"></i>
          Próximos Eventos
        </h2>

        <div v-if="loadingEvents" class="loading-message">
          Cargando eventos...
        </div>
        
        <div v-else-if="upcomingEvents.length === 0" class="no-data">
          No hay eventos próximos
        </div>

        <div 
          v-else
          v-for="event in upcomingEvents" 
          :key="event.id"
          class="event-item"
          @click="goToEvent(event.id)"
        >
          <div class="event-date">{{ formatEventDate(event.fecha) }}</div>
          <div class="event-title">{{ event.titulo }}</div>
          <div class="event-time">{{ event.hora }}</div>
          <div class="event-location" v-if="event.lugar">
            <i class="fas fa-map-marker-alt"></i> {{ event.lugar }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService } from '@/services/dashboardService';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const userRole = computed(() => authStore.userRole);

// Estados reactivos
const stats = ref({
  actividades_activas: { total: 0, tendencia: 0 },
  estudiantes_inscritos: { total: 0, tendencia: 0 },
  asistencia_promedio: { porcentaje: 0, sobre_meta: '' },
  satisfaccion: { promedio: 0, sobre_meta: '' }
});

const recentActivities = ref([]);
const upcomingEvents = ref([]);
const loadingStats = ref(false);
const loadingActivities = ref(false);
const loadingEvents = ref(false);

// Métodos
const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('es-ES');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatEventDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
  return `${day} ${month}`;
};

const goToActivity = (id) => {
  if (['director', 'staff_dae'].includes(userRole.value)) {
    router.push(`/admin/actividades/${id}`);
  }
};

const goToEvent = (id) => {
  if (['director', 'staff_dae'].includes(userRole.value)) {
    router.push(`/admin/actividades/${id}`);
  } else if (userRole.value === 'estudiante') {
    router.push(`/estudiante/actividades/${id}`);
  }
};

// Cargar datos
const loadDashboardData = async () => {
  try {
    loadingStats.value = true;
    loadingActivities.value = true;
    loadingEvents.value = true;

    // Cargar estadísticas
    const statsData = await dashboardService.getDashboardStats();
    stats.value = statsData;

    // Cargar actividades recientes
    const activitiesData = await dashboardService.getRecentActivities();
    recentActivities.value = activitiesData;

    // Cargar próximos eventos
    const eventsData = await dashboardService.getUpcomingEvents();
    upcomingEvents.value = eventsData;

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showToast('error', 'Error al cargar datos del dashboard');
  } finally {
    loadingStats.value = false;
    loadingActivities.value = false;
    loadingEvents.value = false;
  }
};

// Cargar datos cuando el componente se monta
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

/* STATS CARDS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-icon.green {
  background: #E8F5E9;
  color: #0F4C3A;
}

.stat-icon.blue {
  background: #E3F2FD;
  color: #1976D2;
}

.stat-icon.orange {
  background: #FFF3E0;
  color: #F57C00;
}

.stat-icon.purple {
  background: #F3E5F5;
  color: #7B1FA2;
}

.stat-content h3 {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-content p {
  color: #757575;
  font-size: 0.9rem;
}

.stat-trend {
  font-size: 0.85rem;
  margin-top: 5px;
}

.stat-trend.up {
  color: #28A745;
}

.stat-trend.down {
  color: #DC3545;
}

/* QUICK ACTIONS */
.quick-actions {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  color: #2C3E50;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.action-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: #E8F5E9;
  color: #0F4C3A;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 10px;
}

.action-desc {
  font-size: 0.9rem;
  color: #757575;
}

/* RECENT ACTIVITIES */
.recent-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.activities-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.activity-item {
  padding: 20px;
  background: #F5F5F5;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-item:hover {
  background: #E8F5E9;
  transform: translateX(5px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.activity-title {
  font-weight: 600;
  color: #2C3E50;
  font-size: 1rem;
}

.activity-date {
  font-size: 0.85rem;
  color: #757575;
}

.activity-desc {
  font-size: 0.9rem;
  color: #757575;
  margin-bottom: 10px;
}

.activity-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #757575;
}

.activity-meta i {
  color: #0F4C3A;
}

/* UPCOMING EVENTS */
.events-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.event-item {
  padding: 15px;
  background: #F5F5F5;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid #0F4C3A;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-item:hover {
  background: #E8F5E9;
  transform: translateX(5px);
}

.event-date {
  font-weight: 600;
  color: #0F4C3A;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.event-title {
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 5px;
}

.event-time {
  font-size: 0.85rem;
  color: #757575;
}

.event-location {
  font-size: 0.8rem;
  color: #757575;
  margin-top: 5px;
}

.event-location i {
  margin-right: 5px;
}

/* Loading and empty states */
.loading-message,
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #757575;
  font-style: italic;
}

.loading-message {
  color: #0F4C3A;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .recent-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>