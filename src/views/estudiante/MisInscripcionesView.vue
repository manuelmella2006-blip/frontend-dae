<template>
  <div class="container inscripciones-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-clipboard-list"></i>
        Mis Inscripciones
      </h1>
      <p class="page-subtitle">Gestiona tus actividades inscritas</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          @click="activeTab = 'inscritas'"
          :class="{ active: activeTab === 'inscritas' }"
          class="tab-btn"
        >
          <i class="fas fa-check-circle"></i>
          Inscritas ({{ estadisticas.inscritas }})
        </button>
        <button 
          @click="activeTab = 'espera'"
          :class="{ active: activeTab === 'espera' }"
          class="tab-btn"
        >
          <i class="fas fa-clock"></i>
          En espera ({{ estadisticas.en_espera }})
        </button>
        <button 
          @click="activeTab = 'pasadas'"
          :class="{ active: activeTab === 'pasadas' }"
          class="tab-btn"
        >
          <i class="fas fa-history"></i>
          Pasadas ({{ estadisticas.pasadas }})
        </button>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando inscripciones...</p>
    </div>

    <!-- Sin inscripciones -->
    <div v-else-if="inscripcionesFiltradas.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-calendar-plus"></i>
      </div>
      <h3 v-if="activeTab === 'inscritas'">No tienes inscripciones activas</h3>
      <h3 v-else-if="activeTab === 'espera'">No estás en lista de espera</h3>
      <h3 v-else>No tienes actividades pasadas</h3>
      <p v-if="activeTab === 'inscritas'" class="empty-text">
        ¡Inscríbete en alguna actividad para verla aquí!
      </p>
      <router-link v-if="activeTab === 'inscritas'" to="/estudiante/actividades" class="btn-explorar">
        <i class="fas fa-calendar-plus"></i>
        Explorar actividades
      </router-link>
    </div>

    <!-- Lista de inscripciones -->
    <div v-else class="inscripciones-list">
      <div 
        v-for="inscripcion in inscripcionesFiltradas" 
        :key="inscripcion.id"
        class="inscripcion-card"
        :class="{
          'en-espera': inscripcion.estado === 'en_espera',
          'pasada': esPasada(inscripcion)
        }"
      >
        <div class="inscripcion-header">
          <div class="inscripcion-estado">
            <div class="estado-badge" :class="inscripcion.estado">
              <i :class="getEstadoIcon(inscripcion.estado)"></i>
              {{ formatEstado(inscripcion.estado) }}
              <span v-if="inscripcion.estado === 'en_espera' && inscripcion.posicion_espera">
                #{{ inscripcion.posicion_espera }}
              </span>
            </div>
          </div>
          <div class="inscripcion-fecha">
            {{ formatFecha(inscripcion.fecha_inicio) }}
          </div>
        </div>

        <div class="inscripcion-content">
          <h3 class="inscripcion-titulo">{{ inscripcion.titulo }}</h3>
          
          <!-- Indicador de asistencia -->
          <div v-if="inscripcion.asistencia" class="asistencia-indicator">
            <i class="fas fa-check-circle"></i>
            Asistencia confirmada
            <span class="asistencia-time">
              {{ formatHora(inscripcion.asistencia.fecha_hora) }}
            </span>
          </div>
          
          <div class="inscripcion-info">
            <div class="info-row">
              <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ inscripcion.lugar || 'Por definir' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>{{ formatHora(inscripcion.fecha_inicio) }} - {{ formatHora(inscripcion.fecha_fin) }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatFechaCompleta(inscripcion.fecha_inicio) }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-user"></i>
                <span>{{ inscripcion.responsable_nombre }}</span>
              </div>
            </div>
          </div>

          <div v-if="inscripcion.descripcion" class="inscripcion-desc">
            {{ truncateText(inscripcion.descripcion, 150) }}
          </div>

          <div class="inscripcion-stats">
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <div class="stat-content">
                <div class="stat-value">{{ inscripcion.cupos_totales - inscripcion.cupos_disponibles }}/{{ inscripcion.cupos_totales }}</div>
                <div class="stat-label">Inscritos</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-percentage"></i>
              <div class="stat-content">
                <div class="stat-value">{{ calcularPorcentaje(inscripcion) }}%</div>
                <div class="stat-label">Ocupación</div>
              </div>
            </div>
            <div v-if="inscripcion.estado === 'en_espera' && inscripcion.posicion_espera" class="stat-item espera">
              <i class="fas fa-hourglass-half"></i>
              <div class="stat-content">
                <div class="stat-value">#{{ inscripcion.posicion_espera }}</div>
                <div class="stat-label">En lista</div>
              </div>
            </div>
          </div>
        </div>

        <div class="inscripcion-actions">
          <button 
            @click="verDetalle(inscripcion.id)"
            class="btn-detalle"
          >
            <i class="fas fa-eye"></i>
            Ver detalles
          </button>
          
          <button 
            v-if="puedeCancelar(inscripcion)"
            @click="cancelarInscripcion(inscripcion.id, inscripcion.titulo)"
            class="btn-cancelar"
            :disabled="cancelando[inscripcion.id]"
          >
            <i class="fas fa-times-circle"></i>
            <span v-if="cancelando[inscripcion.id]">Cancelando...</span>
            <span v-else>Cancelar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmar cancelación</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que quieres cancelar tu inscripción en <strong>{{ actividadCancelar?.titulo }}</strong>?</p>
          <div class="modal-warning" v-if="actividadCancelar?.cupos_disponibles === 0">
            <i class="fas fa-exclamation-triangle"></i>
            <span>¡Esta actividad tiene lista de espera! Tu cupo será asignado a otra persona.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">
            <i class="fas fa-times"></i>
            No cancelar
          </button>
          <button @click="confirmarCancelacion" class="btn-confirm" :disabled="cancelandoConfirm">
            <i class="fas fa-check"></i>
            <span v-if="cancelandoConfirm">Cancelando...</span>
            <span v-else>Sí, cancelar</span>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { inscripcionesService } from '@/services/inscripcionesService';

const router = useRouter();

// Estados
const inscripciones = ref([]);
const loading = ref(false);
const activeTab = ref('inscritas');
const showModal = ref(false);
const actividadCancelar = ref(null);
const cancelando = ref({});
const cancelandoConfirm = ref(false);

// Estadísticas
const estadisticas = ref({
  inscritas: 0,
  en_espera: 0,
  pasadas: 0
});

// Toast
const toast = ref({
  show: false,
  type: 'success',
  icon: 'fas fa-check-circle',
  message: ''
});

// Computed
const inscripcionesFiltradas = computed(() => {
  const ahora = new Date();
  
  return inscripciones.value.filter(ins => {
    const fechaInicio = new Date(ins.fecha_inicio);
    const esPasada = fechaInicio < ahora;
    
    if (activeTab.value === 'inscritas') {
      return ins.estado === 'inscrito' && !esPasada;
    } else if (activeTab.value === 'espera') {
      return ins.estado === 'en_espera' && !esPasada;
    } else if (activeTab.value === 'pasadas') {
      return esPasada;
    }
    return false;
  });
});

// Métodos
const loadMisInscripciones = async () => {
  try {
    loading.value = true;
    const data = await inscripcionesService.getMisInscripciones();
    inscripciones.value = data;
    
    // Calcular estadísticas
    calcularEstadisticas(data);
    
  } catch (error) {
    console.error('Error cargando inscripciones:', error);
    showToast('error', 'Error al cargar inscripciones');
  } finally {
    loading.value = false;
  }
};

const calcularEstadisticas = (data) => {
  const ahora = new Date();
  const stats = { inscritas: 0, en_espera: 0, pasadas: 0 };
  
  data.forEach(ins => {
    const fechaInicio = new Date(ins.fecha_inicio);
    const esPasada = fechaInicio < ahora;
    
    if (esPasada) {
      stats.pasadas++;
    } else if (ins.estado === 'inscrito') {
      stats.inscritas++;
    } else if (ins.estado === 'en_espera') {
      stats.en_espera++;
    }
  });
  
  estadisticas.value = stats;
};

const esPasada = (inscripcion) => {
  const fechaInicio = new Date(inscripcion.fecha_inicio);
  const ahora = new Date();
  return fechaInicio < ahora;
};

const puedeCancelar = (inscripcion) => {
  if (inscripcion.estado !== 'inscrito') return false;
  
  const fechaInicio = new Date(inscripcion.fecha_inicio);
  const ahora = new Date();
  const horasAntes = 24; // Puedes cancelar hasta 24 horas antes
  
  // Calcular diferencia en horas
  const diferenciaHoras = (fechaInicio - ahora) / (1000 * 60 * 60);
  
  return diferenciaHoras > horasAntes;
};

const cancelarInscripcion = (actividadId, actividadTitulo) => {
  actividadCancelar.value = {
    id: actividadId,
    titulo: actividadTitulo
  };
  showModal.value = true;
};

const confirmarCancelacion = async () => {
  try {
    cancelandoConfirm.value = true;
    cancelando.value[actividadCancelar.value.id] = true;
    
    await inscripcionesService.cancelar(actividadCancelar.value.id);
    
    showToast('success', 'Inscripción cancelada exitosamente');
    
    // Recargar datos
    await loadMisInscripciones();
    
    closeModal();
    
  } catch (error) {
    console.error('Error cancelando inscripción:', error);
    showToast('error', error.response?.data?.message || 'Error al cancelar inscripción');
  } finally {
    cancelandoConfirm.value = false;
    cancelando.value[actividadCancelar.value.id] = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  actividadCancelar.value = null;
};

const verDetalle = (actividadId) => {
  router.push(`/estudiante/actividades/${actividadId}`);
};

const formatEstado = (estado) => {
  const estados = {
    inscrito: 'Inscrito',
    en_espera: 'En espera',
    cancelado: 'Cancelado'
  };
  return estados[estado] || estado;
};

const getEstadoIcon = (estado) => {
  const icons = {
    inscrito: 'fas fa-check-circle',
    en_espera: 'fas fa-clock',
    cancelado: 'fas fa-times-circle'
  };
  return icons[estado] || 'fas fa-info-circle';
};

const formatFecha = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const formatFechaCompleta = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatHora = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calcularPorcentaje = (inscripcion) => {
  if (inscripcion.cupos_totales === 0) return 0;
  const ocupados = inscripcion.cupos_totales - inscripcion.cupos_disponibles;
  return Math.round((ocupados / inscripcion.cupos_totales) * 100);
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
  
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
};

// Cargar datos al montar
onMounted(() => {
  loadMisInscripciones();
});
</script>

<style scoped>
.inscripciones-container {
  padding: 30px;
  max-width: 1200px;
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

/* Tabs */
.tabs-container {
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 15px;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: none;
  color: #757575;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
}

.tab-btn:hover {
  background: #F5F5F5;
  color: #2C3E50;
}

.tab-btn.active {
  background: #0F4C3A;
  color: white;
}

.tab-btn.active:hover {
  background: #0d4032;
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
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #E0E0E0;
  margin-bottom: 20px;
}

.empty-icon i {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.empty-state h3 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.empty-text {
  color: #757575;
  margin-bottom: 20px;
}

.btn-explorar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #0F4C3A;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-explorar:hover {
  background: #0d4032;
  transform: translateY(-2px);
}

/* Lista de inscripciones */
.inscripciones-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inscripcion-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.inscripcion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.inscripcion-card.en-espera {
  border-left: 4px solid #FFC107;
}

.inscripcion-card.pasada {
  opacity: 0.8;
}

.inscripcion-header {
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.inscripcion-estado {
  display: flex;
  gap: 10px;
}

.estado-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.estado-badge.inscrito {
  background: #E8F5E9;
  color: #0F4C3A;
}

.estado-badge.en_espera {
  background: #FFF3E0;
  color: #F57C00;
}

.inscripcion-fecha {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 600;
}

.inscripcion-content {
  padding: 10px 20px 20px;
}

.inscripcion-titulo {
  font-size: 1.2rem;
  color: #2C3E50;
  margin-bottom: 15px;
  line-height: 1.4;
}

/* Indicador de asistencia */
.asistencia-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #E8F5E9;
  border-radius: 8px;
  color: #0F4C3A;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.asistencia-indicator i {
  color: #28A745;
}

.asistencia-time {
  margin-left: auto;
  font-size: 0.8rem;
  color: #666;
  font-weight: normal;
}

.inscripcion-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #757575;
  font-size: 0.85rem;
}

.info-item i {
  width: 16px;
  color: #0F4C3A;
}

.inscripcion-desc {
  color: #757575;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 20px;
  padding: 15px;
  background: #F5F5F5;
  border-radius: 8px;
}

.inscripcion-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #F5F5F5;
  border-radius: 8px;
}

.stat-item i {
  font-size: 1.2rem;
  color: #0F4C3A;
}

.stat-item.espera i {
  color: #F57C00;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2C3E50;
}

.stat-label {
  font-size: 0.8rem;
  color: #757575;
}

.inscripcion-actions {
  padding: 20px;
  border-top: 1px solid #F5F5F5;
  display: flex;
  gap: 10px;
}

.inscripcion-actions button {
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

.btn-detalle {
  background: white;
  color: #0F4C3A;
  border: 1px solid #0F4C3A !important;
}

.btn-detalle:hover {
  background: #0F4C3A;
  color: white;
}

.btn-cancelar {
  background: #DC3545;
  color: white;
}

.btn-cancelar:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-cancelar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #F5F5F5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #2C3E50;
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #2C3E50;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  color: #2C3E50;
  line-height: 1.5;
  margin-bottom: 15px;
}

.modal-warning {
  background: #FFF3E0;
  border: 1px solid #FFC107;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 10px;
  color: #F57C00;
}

.modal-warning i {
  font-size: 1.2rem;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #F5F5F5;
  display: flex;
  gap: 10px;
}

.modal-footer button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: #F5F5F5;
  color: #757575;
}

.btn-cancel:hover {
  background: #E0E0E0;
}

.btn-confirm {
  background: #DC3545;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #c82333;
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  .inscripciones-container {
    padding: 20px;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .asistencia-indicator {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .asistencia-time {
    margin-left: 0;
  }
  
  .info-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .inscripcion-stats {
    flex-direction: column;
  }
  
  .inscripcion-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .toast {
    left: 20px;
    right: 20px;
    bottom: 20px;
    min-width: auto;
  }
}
</style>