<template>
  <div class="ver-actividad-container">
    <div class="content">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <router-link to="/admin/actividades" class="back-btn">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          Detalles de Actividad
        </h1>
        <div class="header-actions">
          <button @click="editarActividad" class="btn btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button @click="eliminarActividad" class="btn btn-danger">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i> Cargando actividad...
      </div>

      <!-- Contenido -->
      <div v-else-if="actividad" class="actividad-content">
        <!-- Card Principal -->
        <div class="actividad-card">
          <div class="card-header" :class="getStatusClass(actividad.estado)">
            <div class="status-badge">{{ formatEstado(actividad.estado) }}</div>
            <h2>{{ actividad.titulo }}</h2>
            <p class="card-subtitle">
              <i class="fas fa-tag"></i> {{ formatTipo(actividad.tipo) }}
              <span class="separator">•</span>
              <i class="fas fa-user"></i> {{ actividad.responsable_nombre || 'Responsable' }}
            </p>
          </div>
          
          <div class="card-body">
            <!-- Estadísticas -->
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-calendar"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatDate(actividad.fecha_inicio) }}</div>
                  <div class="stat-label">Fecha de Inicio</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-calendar-times"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatDate(actividad.fecha_fin) }}</div>
                  <div class="stat-label">Fecha de Fin</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ actividad.cupos_totales }}</div>
                  <div class="stat-label">Cupos Totales</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ actividad.cupos_disponibles }}</div>
                  <div class="stat-label">Cupos Disponibles</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ actividad.lugar || 'No especificado' }}</div>
                  <div class="stat-label">Lugar</div>
                </div>
              </div>
            </div>

            <!-- Descripción -->
            <div class="description-section">
              <h3><i class="fas fa-file-alt"></i> Descripción</h3>
              <p class="description-text">
                {{ actividad.descripcion || 'No hay descripción disponible.' }}
              </p>
            </div>

            <!-- Información Adicional -->
            <div class="info-grid">
              <div class="info-item">
                <h4><i class="fas fa-clock"></i> Horario</h4>
                <p>{{ formatTime(actividad.fecha_inicio) }} - {{ formatTime(actividad.fecha_fin) }}</p>
              </div>
              
              <div class="info-item">
                <h4><i class="fas fa-calendar-day"></i> Duración</h4>
                <p>{{ calcularDuracion(actividad.fecha_inicio, actividad.fecha_fin) }}</p>
              </div>
              
              <div class="info-item">
                <h4><i class="fas fa-percentage"></i> Ocupación</h4>
                <p>{{ calcularOcupacion(actividad) }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inscritos (si hubiera) -->
        <div class="inscritos-section" v-if="actividad.cupos_totales - actividad.cupos_disponibles > 0">
          <h3><i class="fas fa-user-friends"></i> Inscritos</h3>
          <p>{{ actividad.cupos_totales - actividad.cupos_disponibles }} personas inscritas</p>
          <!-- Aquí iría una tabla/listado de inscritos -->
        </div>
      </div>

      <!-- Error -->
      <div v-else class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Actividad no encontrada</h3>
        <p>La actividad que buscas no existe o no tienes permisos para verla.</p>
        <router-link to="/admin/actividades" class="btn btn-primary">
          Volver a Actividades
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { actividadesService } from '@/services/actividadesService';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const actividad = ref(null);

// Función para cargar actividad
const loadActividad = async () => {
  try {
    loading.value = true;
    const data = await actividadesService.getById(route.params.id);
    actividad.value = data;
  } catch (error) {
    console.error('Error cargando actividad:', error);
    actividad.value = null;
  } finally {
    loading.value = false;
  }
};

// Formateadores (puedes reutilizar los de ActividadesView.vue)
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

const formatEstado = (estado) => {
  const estados = {
    'publicada': 'Publicada',
    'borrador': 'Borrador',
    'cancelada': 'Cancelada'
  };
  return estados[estado] || estado;
};

const getStatusClass = (estado) => {
  const classes = {
    'publicada': 'status-published',
    'borrador': 'status-draft',
    'cancelada': 'status-cancelled'
  };
  return classes[estado] || '';
};

const calcularDuracion = (inicio, fin) => {
  const diff = new Date(fin) - new Date(inicio);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes} minutos`;
  if (minutes === 0) return `${hours} horas`;
  return `${hours}h ${minutes}m`;
};

const calcularOcupacion = (actividad) => {
  const ocupados = actividad.cupos_totales - actividad.cupos_disponibles;
  const porcentaje = (ocupados / actividad.cupos_totales) * 100;
  return Math.round(porcentaje);
};

// Acciones
const editarActividad = () => {
  router.push(`/admin/actividades/editar/${actividad.value.id}`);
};

const eliminarActividad = async () => {
  if (!confirm('¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.')) return;
  
  try {
    await actividadesService.delete(actividad.value.id);
    alert('Actividad eliminada correctamente');
    router.push('/admin/actividades');
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    alert(error.response?.data?.message || 'Error al eliminar la actividad');
  }
};

onMounted(() => {
  loadActividad();
});
</script>

<style scoped>
/* Estilos similares a los de ActividadesView.vue */
.ver-actividad-container {
  padding: 0;
}

.content {
  padding: 0 40px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #E0E0E0;
}

.page-title {
  font-size: 1.8rem;
  color: #2C3E50;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  color: #0F4C3A;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: #E8F5E9;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(15, 76, 58, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #DC3545, #C82333);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

/* Actividad Card */
.actividad-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.card-header {
  padding: 30px;
  color: white;
  position: relative;
}

.card-header.status-published {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
}

.card-header.status-draft {
  background: linear-gradient(135deg, #757575, #9E9E9E);
}

.card-header.status-cancelled {
  background: linear-gradient(135deg, #DC3545, #C82333);
}

.status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 15px;
  border-radius: 20px;
  background: rgba(255,255,255,0.25);
  font-size: 0.8rem;
  font-weight: 600;
}

.card-header h2 {
  font-size: 2rem;
  margin: 10px 0 15px;
  font-weight: 700;
}

.card-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 10px;
}

.separator {
  margin: 0 10px;
}

.card-body {
  padding: 30px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #E8F5E9;
  color: #0F4C3A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #757575;
}

/* Description Section */
.description-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #E0E0E0;
}

.description-section h3 {
  font-size: 1.3rem;
  color: #0F4C3A;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.description-text {
  line-height: 1.6;
  color: #2C3E50;
  font-size: 1.05rem;
  white-space: pre-line;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.info-item {
  padding: 20px;
  background: #F8F9FA;
  border-radius: 10px;
}

.info-item h4 {
  font-size: 1.1rem;
  color: #0F4C3A;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item p {
  color: #2C3E50;
  font-size: 1rem;
}

/* Inscritos */
.inscritos-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}

.inscritos-section h3 {
  font-size: 1.3rem;
  color: #0F4C3A;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Loading y Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  background: white;
  border-radius: 15px;
  text-align: center;
  gap: 20px;
}

.loading-container i {
  font-size: 2rem;
  color: #0F4C3A;
}

.error-container i {
  font-size: 3rem;
  color: #DC3545;
  margin-bottom: 10px;
}

.error-container h3 {
  color: #2C3E50;
  font-size: 1.5rem;
}

.error-container p {
  color: #757575;
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 0 20px 20px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header h2 {
    font-size: 1.5rem;
  }
}
</style>