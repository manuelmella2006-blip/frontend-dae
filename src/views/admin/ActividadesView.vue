<template>
  <div class="actividades-container">
    <div class="content">
      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-icon green"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-info"><h3>{{ stats.activas }}</h3><p>Activas</p></div>
        </div>
        <div class="stat-box">
          <div class="stat-icon blue"><i class="fas fa-users"></i></div>
          <div class="stat-info"><h3>{{ stats.inscritos }}</h3><p>Inscritos Total</p></div>
        </div>
        <div class="stat-box">
          <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
          <div class="stat-info"><h3>{{ stats.estaSemana }}</h3><p>Esta Semana</p></div>
        </div>
        <div class="stat-box">
          <div class="stat-icon purple"><i class="fas fa-star"></i></div>
          <div class="stat-info"><h3>{{ stats.satisfaccion }}</h3><p>Satisfacción</p></div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-filter">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar actividades..."
              @input="filterActivities"
            />
          </div>
          <select v-model="selectedFilter" class="filter-select" @change="filterActivities">
            <option value="all">Todas las categorías</option>
            <option value="taller">Taller</option>
            <option value="charla">Charla</option>
            <option value="capacitacion">Capacitación</option>
            <option value="deportivo">Deportivo</option>
            <option value="borrador">Borrador</option>
            <option value="publicada">Publicada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <router-link to="/admin/actividades/nueva" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Actividad
        </router-link>
      </div>

      <!-- Activities Grid -->
      <div v-if="loading" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i> Cargando actividades...
      </div>
      
      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h3>No hay actividades</h3>
        <p>¡Crea tu primera actividad!</p>
        <router-link to="/admin/actividades/nueva" class="btn btn-primary">
          <i class="fas fa-plus"></i> Crear Actividad
        </router-link>
      </div>
      
      <div v-else class="activities-grid">
        <div v-for="actividad in filteredActivities" :key="actividad.id" class="activity-card">
          <div class="activity-header" :class="getStatusClass(actividad.estado)">
            <span class="activity-type">{{ formatTipo(actividad.tipo) }}</span>
            <div class="activity-title">{{ actividad.titulo }}</div>
            <div class="activity-date">
              {{ formatDate(actividad.fecha_inicio) }} • {{ formatTime(actividad.fecha_inicio) }}
            </div>
          </div>
          <div class="activity-body">
            <div class="activity-stats">
              <div class="stat-item">
                <div class="number">{{ actividad.cupos_totales - actividad.cupos_disponibles }}</div>
                <div class="label">Inscritos</div>
              </div>
              <div class="stat-item">
                <div class="number">{{ actividad.cupos_disponibles }}</div>
                <div class="label">Disponibles</div>
              </div>
              <div class="stat-item">
                <div class="number">{{ getAttendanceRate(actividad) }}%</div>
                <div class="label">Asistencia</div>
              </div>
            </div>
            <div class="activity-actions">
              <button @click="viewActivity(actividad.id)" class="btn-small btn-view">
                <i class="fas fa-eye"></i> Ver
              </button>
              <button @click="editActivity(actividad.id)" class="btn-small btn-edit">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button @click="deleteActivity(actividad.id)" class="btn-small btn-delete">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredActivities.length > 0" class="pagination">
        <button :disabled="currentPage === 1" @click="prevPage" class="pagination-btn">
          <i class="fas fa-chevron-left"></i> Anterior
        </button>
        <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="nextPage" class="pagination-btn">
          Siguiente <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { actividadesService } from '@/services/actividadesService';

const router = useRouter();
const loading = ref(true);
const actividades = ref([]);
const searchQuery = ref('');
const selectedFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = 6;

// Stats
const stats = reactive({
  activas: 0,
  inscritos: 0,
  estaSemana: 0,
  satisfaccion: '5.8'
});

// Cargar actividades
const loadActivities = async () => {
  try {
    loading.value = true;
    actividades.value = await actividadesService.getAll();
    
    // Calcular estadísticas
    calculateStats();
  } catch (error) {
    console.error('Error loading activities:', error);
  } finally {
    loading.value = false;
  }
};

// Calcular estadísticas
const calculateStats = () => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  stats.activas = actividades.value.filter(a => a.estado === 'publicada').length;
  stats.inscritos = actividades.value.reduce((sum, a) => sum + (a.cupos_totales - a.cupos_disponibles), 0);
  stats.estaSemana = actividades.value.filter(a => {
    const fecha = new Date(a.fecha_inicio);
    return fecha >= oneWeekAgo && fecha <= now && a.estado === 'publicada';
  }).length;
};

// Filtrar actividades
const filteredActivities = computed(() => {
  let filtered = actividades.value;
  
  // Aplicar búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(a => 
      a.titulo.toLowerCase().includes(query) ||
      a.descripcion?.toLowerCase().includes(query) ||
      a.tipo.toLowerCase().includes(query)
    );
  }
  
  // Aplicar filtro
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(a => 
      a.tipo === selectedFilter.value || 
      a.estado === selectedFilter.value
    );
  }
  
  // Paginación
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(actividades.value.length / itemsPerPage);
});

// Formateadores
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CL');
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatTipo = (tipo) => {
  const tipos = {
    'taller': 'Taller',
    'charla': 'Charla',
    'capacitacion': 'Capacitación',
    'deportivo': 'Deportivo',
    'cultural': 'Cultural',
    'voluntariado': 'Voluntariado',
    'otros': 'Otros'
  };
  return tipos[tipo] || tipo;
};

const getStatusClass = (estado) => {
  const classes = {
    'publicada': 'status-published',
    'borrador': 'status-draft',
    'cancelada': 'status-cancelled'
  };
  return classes[estado] || '';
};

const getAttendanceRate = (actividad) => {
  // Esta sería una función que calcularía la asistencia real
  // Por ahora devolvemos un valor dummy
  const inscritos = actividad.cupos_totales - actividad.cupos_disponibles;
  if (inscritos === 0) return 0;
  return Math.round((inscritos * 0.85) / inscritos * 100);
};

// Acciones - FUNCIONES ACTUALIZADAS
const viewActivity = (id) => {
  router.push(`/admin/actividades/${id}`);
};

const editActivity = (id) => {
  router.push(`/admin/actividades/editar/${id}`);
};

const deleteActivity = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.')) return;
  
  try {
    await actividadesService.delete(id);
    await loadActivities(); // Recargar lista
    alert('Actividad eliminada correctamente');
  } catch (error) {
    console.error('Error deleting activity:', error);
    alert(error.response?.data?.message || 'Error al eliminar la actividad');
  }
};

const filterActivities = () => {
  currentPage.value = 1; // Resetear a primera página
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
.actividades-container {
  padding: 0;
}

.content {
  padding: 0 40px 40px;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.green { background: #E8F5E9; color: #0F4C3A; }
.stat-icon.blue { background: #E3F2FD; color: #1976D2; }
.stat-icon.orange { background: #FFF3E0; color: #F57C00; }
.stat-icon.purple { background: #F3E5F5; color: #7B1FA2; }

.stat-info h3 {
  font-size: 1.8rem;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-info p {
  font-size: 0.85rem;
  color: #757575;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 15px;
  flex: 1;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 2px solid #E0E0E0;
  border-radius: 25px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #0F4C3A;
}

.search-box i {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
}

.filter-select {
  padding: 12px 20px;
  border: 2px solid #E0E0E0;
  border-radius: 25px;
  font-size: 0.95rem;
  background: white;
  min-width: 200px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #0F4C3A;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
  box-shadow: 0 4px 15px rgba(15, 76, 58, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 76, 58, 0.4);
}

/* Loading & Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 15px;
  color: #757575;
  gap: 15px;
  font-size: 1.1rem;
}

.loading-container i {
  font-size: 2rem;
  color: #0F4C3A;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: white;
  border-radius: 15px;
  text-align: center;
  gap: 20px;
}

.empty-state i {
  font-size: 3rem;
  color: #E0E0E0;
  margin-bottom: 10px;
}

.empty-state h3 {
  color: #2C3E50;
  font-size: 1.5rem;
}

.empty-state p {
  color: #757575;
  margin-bottom: 10px;
}

/* Activities Grid */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.activity-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.activity-header {
  padding: 25px;
  color: white;
  position: relative;
}

.activity-header.status-published {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
}

.activity-header.status-draft {
  background: linear-gradient(135deg, #757575, #9E9E9E);
}

.activity-header.status-cancelled {
  background: linear-gradient(135deg, #DC3545, #C82333);
}

.activity-type {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255,255,255,0.25);
}

.activity-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.activity-body {
  padding: 25px;
}

.activity-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item .number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F4C3A;
}

.stat-item .label {
  font-size: 0.8rem;
  color: #757575;
}

.activity-actions {
  display: flex;
  gap: 10px;
}

.btn-small {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-view {
  background: #E3F2FD;
  color: #1976D2;
}

.btn-view:hover {
  background: #1976D2;
  color: white;
}

.btn-edit {
  background: #FFF3E0;
  color: #F57C00;
}

.btn-edit:hover {
  background: #F57C00;
  color: white;
}

.btn-delete {
  background: #FFEBEE;
  color: #DC3545;
}

.btn-delete:hover {
  background: #DC3545;
  color: white;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #E0E0E0;
}

.pagination-btn {
  padding: 10px 20px;
  border: 2px solid #E0E0E0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #0F4C3A;
  color: #0F4C3A;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #757575;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 0 20px 20px;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .search-box,
  .filter-select {
    min-width: 100%;
  }
}
</style>