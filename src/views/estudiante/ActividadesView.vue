<template>
  <div class="container actividades-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-calendar-alt"></i>
        Actividades Disponibles
      </h1>
      <p class="page-subtitle">Inscríbete en las actividades estudiantiles</p>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filter-group">
        <div class="filter-label">
          <i class="fas fa-filter"></i> Filtrar por:
        </div>
        <select v-model="filters.tipo" class="filter-select" @change="loadActividades">
          <option value="">Todos los tipos</option>
          <option value="taller">Taller</option>
          <option value="charla">Charla</option>
          <option value="deporte">Deporte</option>
          <option value="cultural">Cultural</option>
          <option value="voluntariado">Voluntariado</option>
        </select>
        <select v-model="filters.estado" class="filter-select" @change="loadActividades">
          <option value="disponibles">Disponibles</option>
          <option value="proximas">Próximas</option>
          <option value="todas">Todas</option>
        </select>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando actividades...</p>
    </div>

    <!-- Sin actividades -->
    <div v-else-if="actividades.length === 0" class="empty-state">
      <i class="fas fa-calendar-times"></i>
      <h3>No hay actividades disponibles</h3>
      <p>No hay actividades programadas en este momento</p>
    </div>

    <!-- Lista de actividades -->
    <div v-else class="actividades-grid">
      <div 
        v-for="actividad in actividades" 
        :key="actividad.id"
        class="actividad-card"
        :class="{ 'cupos-agotados': actividad.cupos_disponibles === 0 }"
      >
        <div class="actividad-header">
          <div class="actividad-badge" :class="getTipoClass(actividad.tipo)">
            {{ formatTipo(actividad.tipo) }}
          </div>
          <div class="actividad-fecha">
            {{ formatFecha(actividad.fecha_inicio) }}
          </div>
        </div>

        <div class="actividad-content">
          <h3 class="actividad-titulo">{{ actividad.titulo }}</h3>
          <p class="actividad-desc" v-if="actividad.descripcion">
            {{ truncateText(actividad.descripcion, 120) }}
          </p>
          <p class="actividad-desc" v-else>
            Sin descripción
          </p>

          <div class="actividad-info">
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ actividad.lugar || 'Por definir' }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatHora(actividad.fecha_inicio) }} - {{ formatHora(actividad.fecha_fin) }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-user"></i>
              <span>{{ actividad.responsable_nombre }}</span>
            </div>
          </div>

          <div class="actividad-cupos">
            <div class="cupos-info">
              <i class="fas fa-users"></i>
              <span>{{ actividad.cupos_disponibles }} / {{ actividad.cupos_totales }} cupos disponibles</span>
            </div>
            <div class="cupos-bar">
              <div 
                class="cupos-fill" 
                :style="{ width: calcularPorcentajeCupos(actividad) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="actividad-actions">
          <button 
            v-if="actividad.cupos_disponibles > 0 && !isInscrito(actividad.id)"
            @click="inscribirse(actividad.id)"
            class="btn-inscribir"
            :disabled="inscribiendo[actividad.id]"
          >
            <i class="fas fa-plus-circle"></i>
            <span v-if="inscribiendo[actividad.id]">Inscribiendo...</span>
            <span v-else>Inscribirse</span>
          </button>

          <button 
            v-else-if="isInscrito(actividad.id)"
            @click="verDetalle(actividad.id)"
            class="btn-inscrito"
          >
            <i class="fas fa-check-circle"></i>
            Inscrito
          </button>

          <button 
            v-else
            class="btn-agotado"
            disabled
          >
            <i class="fas fa-times-circle"></i>
            Cupos agotados
          </button>

          <button 
            @click="verDetalle(actividad.id)"
            class="btn-detalle"
          >
            <i class="fas fa-eye"></i>
            Ver detalles
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de notificación -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
      <button @click="toast.show = false" class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { actividadesService } from '@/services/actividadesService';
import { inscripcionesService } from '@/services/inscripcionesService';

const router = useRouter();

// Estados
const actividades = ref([]);
const loading = ref(false);
const inscripcionesUsuario = ref([]);
const inscribiendo = ref({});

// Filtros
const filters = ref({
  tipo: '',
  estado: 'disponibles'
});

// Toast
const toast = ref({
  show: false,
  type: 'success',
  icon: 'fas fa-check-circle',
  message: ''
});

// Métodos
const loadActividades = async () => {
  try {
    loading.value = true;
    const data = await actividadesService.getAll();
    
    // Filtrar actividades para estudiantes (solo publicadas)
    let filtered = data.filter(act => act.estado === 'publicada');
    
    // Aplicar filtro de tipo
    if (filters.value.tipo) {
      filtered = filtered.filter(act => act.tipo === filters.value.tipo);
    }
    
    // Aplicar filtro de estado
    if (filters.value.estado === 'disponibles') {
      filtered = filtered.filter(act => act.cupos_disponibles > 0);
    } else if (filters.value.estado === 'proximas') {
      const ahora = new Date();
      filtered = filtered.filter(act => new Date(act.fecha_inicio) > ahora);
    }
    
    actividades.value = filtered;
    
    // Cargar inscripciones del usuario
    await loadMisInscripciones();
    
  } catch (error) {
    console.error('Error cargando actividades:', error);
    showToast('error', 'Error al cargar actividades');
  } finally {
    loading.value = false;
  }
};

const loadMisInscripciones = async () => {
  try {
    const data = await inscripcionesService.getMisInscripciones();
    inscripcionesUsuario.value = data.map(ins => ins.id);
  } catch (error) {
    console.error('Error cargando inscripciones:', error);
  }
};

const isInscrito = (actividadId) => {
  return inscripcionesUsuario.value.includes(actividadId);
};

const inscribirse = async (actividadId) => {
  try {
    inscribiendo.value[actividadId] = true;
    
    const result = await inscripcionesService.inscribir(actividadId);
    
    if (result.estado === 'inscrito') {
      showToast('success', '¡Inscripción exitosa!');
      // Actualizar lista
      await loadActividades();
    } else if (result.estado === 'en_espera') {
      showToast('info', 'Agregado a lista de espera. Posición: ' + result.posicion_espera);
      await loadActividades();
    }
    
  } catch (error) {
    console.error('Error en inscripción:', error);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya estás inscrito')) {
      showToast('warning', 'Ya estás inscrito en esta actividad');
      await loadActividades();
    } else {
      showToast('error', error.response?.data?.message || 'Error al inscribirse');
    }
    
  } finally {
    inscribiendo.value[actividadId] = false;
  }
};

const verDetalle = (actividadId) => {
  router.push(`/estudiante/actividades/${actividadId}`);
};

const formatFecha = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const formatHora = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTipo = (tipo) => {
  const tipos = {
    taller: 'Taller',
    charla: 'Charla',
    deporte: 'Deporte',
    cultural: 'Cultural',
    voluntariado: 'Voluntariado'
  };
  return tipos[tipo] || tipo;
};

const getTipoClass = (tipo) => {
  const clases = {
    taller: 'badge-taller',
    charla: 'badge-charla',
    deporte: 'badge-deporte',
    cultural: 'badge-cultural',
    voluntariado: 'badge-voluntariado'
  };
  return clases[tipo] || 'badge-default';
};

const calcularPorcentajeCupos = (actividad) => {
  if (actividad.cupos_totales === 0) return 0;
  const ocupados = actividad.cupos_totales - actividad.cupos_disponibles;
  return (ocupados / actividad.cupos_totales) * 100;
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const showToast = (type, message) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  toast.value = {
    show: true,
    type,
    icon: icons[type] || 'fas fa-info-circle',
    message
  };
  
  // Auto ocultar después de 5 segundos
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
};

// Cargar datos al montar
onMounted(() => {
  loadActividades();
});
</script>

<style scoped>
.actividades-container {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #2C3E50;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.page-title i {
  color: #0F4C3A;
}

.page-subtitle {
  color: #757575;
  font-size: 1.1rem;
}

/* Filtros */
.filters-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2C3E50;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: white;
  color: #2C3E50;
  font-size: 0.9rem;
  min-width: 180px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #0F4C3A;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #E0E0E0;
  border-top-color: #0F4C3A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #757575;
}

.empty-state i {
  font-size: 4rem;
  color: #E0E0E0;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #757575;
  margin-bottom: 10px;
}

/* Grid de actividades */
.actividades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.actividad-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.actividad-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.actividad-card.cupos-agotados {
  opacity: 0.8;
}

.actividad-header {
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.actividad-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-taller { background: #E8F5E9; color: #0F4C3A; }
.badge-charla { background: #E3F2FD; color: #1976D2; }
.badge-deporte { background: #FFF3E0; color: #F57C00; }
.badge-cultural { background: #F3E5F5; color: #7B1FA2; }
.badge-voluntariado { background: #E8EAF6; color: #303F9F; }
.badge-default { background: #F5F5F5; color: #757575; }

.actividad-fecha {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 600;
}

.actividad-content {
  padding: 0 20px 20px;
  flex-grow: 1;
}

.actividad-titulo {
  font-size: 1.2rem;
  color: #2C3E50;
  margin-bottom: 10px;
  line-height: 1.4;
}

.actividad-desc {
  color: #757575;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.actividad-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #757575;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.info-item i {
  width: 16px;
  color: #0F4C3A;
}

.actividad-cupos {
  margin-bottom: 20px;
}

.cupos-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #757575;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.cupos-info i {
  color: #0F4C3A;
}

.cupos-bar {
  height: 6px;
  background: #F5F5F5;
  border-radius: 3px;
  overflow: hidden;
}

.cupos-fill {
  height: 100%;
  background: #0F4C3A;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.actividad-actions {
  padding: 20px;
  border-top: 1px solid #F5F5F5;
  display: flex;
  gap: 10px;
}

.actividad-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-inscribir {
  background: #0F4C3A;
  color: white;
}

.btn-inscribir:hover:not(:disabled) {
  background: #0d4032;
  transform: translateY(-2px);
}

.btn-inscribir:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-inscrito {
  background: #E8F5E9;
  color: #0F4C3A;
  cursor: default;
}

.btn-agotado {
  background: #F5F5F5;
  color: #757575;
  cursor: not-allowed;
}

.btn-detalle {
  background: white;
  color: #0F4C3A;
  border: 1px solid #0F4C3A !important;
}

.btn-detalle:hover {
  background: #0F4C3A;
  color: white;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 300px;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.toast.success {
  border-left: 4px solid #28A745;
}

.toast.error {
  border-left: 4px solid #DC3545;
}

.toast.warning {
  border-left: 4px solid #FFC107;
}

.toast.info {
  border-left: 4px solid #17A2B8;
}

.toast i {
  font-size: 1.2rem;
}

.toast.success i { color: #28A745; }
.toast.error i { color: #DC3545; }
.toast.warning i { color: #FFC107; }
.toast.info i { color: #17A2B8; }

.toast span {
  flex-grow: 1;
  font-size: 0.9rem;
}

.toast-close {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #2C3E50;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .actividades-container {
    padding: 20px;
  }
  
  .actividades-grid {
    grid-template-columns: 1fr;
  }
  
  .actividad-actions {
    flex-direction: column;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .toast {
    left: 20px;
    right: 20px;
    bottom: 20px;
    min-width: auto;
  }
}
</style>