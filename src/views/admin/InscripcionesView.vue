<template>
  <div class="inscripciones-container">
    <!-- STATS CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-user-check"></i></div>
        <div class="stat-info">
          <h3>{{ stats.totalInscritos }}</h3>
          <p>Total Inscritos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-clock"></i></div>
        <div class="stat-info">
          <h3>{{ stats.pendientes }}</h3>
          <p>Pendientes</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <h3>{{ stats.confirmados }}</h3>
          <p>Confirmados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-calendar"></i></div>
        <div class="stat-info">
          <h3>{{ stats.totalActividades }}</h3>
          <p>Actividades</p>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="search-filter">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre, correo o RUT..."
            @input="filtrarInscripciones"
          >
        </div>
        <select v-model="filtroActividad" class="filter-select" @change="filtrarInscripciones">
          <option value="">Todas las actividades</option>
          <option v-for="actividad in actividades" :key="actividad.id" :value="actividad.id">
            {{ actividad.titulo }}
          </option>
        </select>
        <select v-model="filtroEstado" class="filter-select" @change="filtrarInscripciones">
          <option value="">Todos los estados</option>
          <option value="inscrito">Confirmada</option>
          <option value="en_espera">Pendiente</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
      <button class="btn-export" @click="exportarExcel">
        <i class="fas fa-download"></i> Exportar Excel
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <div v-if="loading" class="loading-overlay">
        <i class="fas fa-spinner fa-spin"></i> Cargando inscripciones...
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ESTUDIANTE</th>
            <th>ACTIVIDAD</th>
            <th>FECHA INSCRIPCIÓN</th>
            <th>ESTADO</th>
            <th>POSICIÓN ESPERA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inscripcion in inscripcionesFiltradas" :key="inscripcion.id">
            <td>#{{ inscripcion.id }}</td>
            <td>
              <div class="student-cell">
                <div class="student-avatar">{{ getIniciales(inscripcion.nombre_completo) }}</div>
                <div class="student-info">
                  <div class="name">{{ inscripcion.nombre_completo }}</div>
                  <div class="email">{{ inscripcion.correo }}</div>
                </div>
              </div>
            </td>
            <td>
              <div v-if="getNombreActividad(inscripcion.actividad_id)">
                {{ getNombreActividad(inscripcion.actividad_id) }}
              </div>
              <div v-else class="text-muted">Cargando...</div>
            </td>
            <td>{{ formatFecha(inscripcion.created_at) }}</td>
            <td>
              <span :class="`badge ${getClaseEstado(inscripcion.estado)}`">
                {{ getTextoEstado(inscripcion.estado) }}
              </span>
            </td>
            <td>
              <span v-if="inscripcion.posicion_espera" class="posicion-espera">
                #{{ inscripcion.posicion_espera }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon view" title="Ver" @click="verDetalle(inscripcion)">
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="btn-icon delete" 
                  title="Eliminar" 
                  @click="confirmarEliminar(inscripcion)"
                  :disabled="inscripcion.estado === 'cancelada'"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="inscripcionesFiltradas.length === 0 && !loading" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No hay inscripciones</h3>
        <p>No se encontraron inscripciones con los filtros aplicados</p>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ pagination.start }}-{{ pagination.end }} de {{ pagination.total }} inscripciones
        </div>
        <div class="pagination">
          <button @click="paginaAnterior" :disabled="pagination.pagina === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            v-for="pag in pagination.paginasMostrar" 
            :key="pag"
            :class="{ active: pag === pagination.pagina }"
            @click="cambiarPagina(pag)"
          >
            {{ pag }}
          </button>
          <button @click="paginaSiguiente" :disabled="pagination.pagina === pagination.totalPaginas">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="modal-close" @click="showConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar la inscripción de <strong>{{ inscripcionSeleccionada.nombre_completo }}</strong>?</p>
          <p class="text-muted">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showConfirmModal = false">Cancelar</button>
          <button class="btn-danger" @click="eliminarInscripcion" :disabled="eliminando">
            <span v-if="eliminando"><i class="fas fa-spinner fa-spin"></i> Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { inscripcionesService } from '@/services/inscripcionesService';
import { actividadesService } from '@/services/actividadesService';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

// Estados reactivos
const loading = ref(true);
const inscripciones = ref([]);
const actividades = ref([]);
const searchQuery = ref('');
const filtroActividad = ref('');
const filtroEstado = ref('');
const showConfirmModal = ref(false);
const inscripcionSeleccionada = ref(null);
const eliminando = ref(false);

// Estadísticas
const stats = reactive({
  totalInscritos: 0,
  pendientes: 0,
  confirmados: 0,
  totalActividades: 0
});

// Paginación
const pagination = reactive({
  pagina: 1,
  porPagina: 10,
  total: 0,
  totalPaginas: 1,
  paginasMostrar: [],
  get start() {
    return ((this.pagina - 1) * this.porPagina) + 1;
  },
  get end() {
    return Math.min(this.pagina * this.porPagina, this.total);
  }
});

// Computed: Inscripciones filtradas
const inscripcionesFiltradas = computed(() => {
  let filtradas = [...inscripciones.value];
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtradas = filtradas.filter(ins => 
      ins.nombre_completo.toLowerCase().includes(query) ||
      ins.correo.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por actividad
  if (filtroActividad.value) {
    filtradas = filtradas.filter(ins => 
      ins.actividad_id.toString() === filtroActividad.value
    );
  }
  
  // Filtrar por estado
  if (filtroEstado.value) {
    filtradas = filtradas.filter(ins => 
      ins.estado === filtroEstado.value
    );
  }
  
  // Actualizar total para paginación
  pagination.total = filtradas.length;
  pagination.totalPaginas = Math.ceil(filtradas.length / pagination.porPagina);
  
  // Calcular páginas a mostrar
  const maxPaginas = 5;
  let inicio = Math.max(1, pagination.pagina - 2);
  let fin = Math.min(pagination.totalPaginas, inicio + maxPaginas - 1);
  
  if (fin - inicio < maxPaginas - 1) {
    inicio = Math.max(1, fin - maxPaginas + 1);
  }
  
  pagination.paginasMostrar = [];
  for (let i = inicio; i <= fin; i++) {
    pagination.paginasMostrar.push(i);
  }
  
  // Aplicar paginación
  const inicioIdx = (pagination.pagina - 1) * pagination.porPagina;
  const finIdx = inicioIdx + pagination.porPagina;
  
  return filtradas.slice(inicioIdx, finIdx);
});

// Métodos
const getIniciales = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
};

const getNombreActividad = (actividadId) => {
  const actividad = actividades.value.find(a => a.id === actividadId);
  return actividad ? actividad.titulo : 'Actividad no encontrada';
};

const formatFecha = (fechaString) => {
  if (!fechaString) return 'N/A';
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getTextoEstado = (estado) => {
  const estados = {
    'inscrito': 'Confirmada',
    'en_espera': 'Pendiente',
    'cancelada': 'Cancelada'
  };
  return estados[estado] || estado;
};

const getClaseEstado = (estado) => {
  const clases = {
    'inscrito': 'confirmada',
    'en_espera': 'pendiente',
    'cancelada': 'cancelada'
  };
  return clases[estado] || 'pendiente';
};

const filtrarInscripciones = () => {
  pagination.pagina = 1; // Resetear a primera página al filtrar
};

const cambiarPagina = (pagina) => {
  pagination.pagina = pagina;
};

const paginaAnterior = () => {
  if (pagination.pagina > 1) {
    pagination.pagina--;
  }
};

const paginaSiguiente = () => {
  if (pagination.pagina < pagination.totalPaginas) {
    pagination.pagina++;
  }
};

const verDetalle = (inscripcion) => {
  // Aquí puedes implementar la navegación a un detalle
  console.log('Ver detalle:', inscripcion);
  showToast('info', 'Funcionalidad en desarrollo');
};

const confirmarEliminar = (inscripcion) => {
  inscripcionSeleccionada.value = inscripcion;
  showConfirmModal.value = true;
};

const eliminarInscripcion = async () => {
  if (!inscripcionSeleccionada.value) return;
  
  eliminando.value = true;
  
  try {
    // Aquí necesitarías un endpoint para eliminar inscripciones como administrador
    // Por ahora, llamaremos al endpoint de cancelación del estudiante (necesitarás adaptarlo)
    await inscripcionesService.cancelarAdmin(inscripcionSeleccionada.value.actividad_id, inscripcionSeleccionada.value.usuario_id);
    
    // Actualizar lista
    await cargarInscripciones();
    
    showToast('success', 'Inscripción eliminada exitosamente');
    showConfirmModal.value = false;
  } catch (error) {
    console.error('Error eliminando inscripción:', error);
    showToast('error', 'Error al eliminar la inscripción');
  } finally {
    eliminando.value = false;
  }
};

const exportarExcel = () => {
  showToast('info', 'Exportando a Excel...');
  // Implementar lógica de exportación
};

const cargarInscripciones = async () => {
  loading.value = true;
  try {
    // Necesitarás crear un endpoint que traiga todas las inscripciones con detalles
    // Por ahora, obtendremos las inscripciones por actividad individualmente
    const actividadesRes = await actividadesService.getAll();
    actividades.value = actividadesRes;
    
    // Para cada actividad, obtener sus inscripciones
    const todasInscripciones = [];
    for (const actividad of actividadesRes) {
      try {
        const inscRes = await inscripcionesService.getByActividad(actividad.id);
        const inscripcionesConActividad = inscRes.map(insc => ({
          ...insc,
          actividad_id: actividad.id
        }));
        todasInscripciones.push(...inscripcionesConActividad);
      } catch (error) {
        console.error(`Error cargando inscripciones para actividad ${actividad.id}:`, error);
      }
    }
    
    inscripciones.value = todasInscripciones;
    
    // Calcular estadísticas
    stats.totalInscritos = todasInscripciones.length;
    stats.pendientes = todasInscripciones.filter(i => i.estado === 'en_espera').length;
    stats.confirmados = todasInscripciones.filter(i => i.estado === 'inscrito').length;
    stats.totalActividades = actividadesRes.length;
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    showToast('error', 'Error al cargar las inscripciones');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  cargarInscripciones();
});
</script>

<style scoped>
.inscripciones-container {
  padding: 0;
}

/* STATS CARDS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  margin-top: 0; /* Ajuste para compensar la eliminación del header */
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
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

.stat-info h3 {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-info p {
  font-size: 0.9rem;
  color: #757575;
}

/* TOOLBAR */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-filter {
  display: flex;
  gap: 15px;
  flex: 1;
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
  cursor: pointer;
}

.btn-export {
  padding: 12px 24px;
  background: #0F4C3A;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.95rem;
}

.btn-export:hover {
  background: #1B5E20;
}

/* TABLE */
.table-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  font-size: 1.1rem;
  color: #0F4C3A;
  z-index: 10;
}

.loading-overlay i {
  font-size: 2rem;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #757575;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #E0E0E0;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2C3E50;
}

.empty-state p {
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #0F4C3A;
  color: white;
}

th {
  padding: 18px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 20px 18px;
  border-bottom: 1px solid #F0F0F0;
  font-size: 0.95rem;
}

tbody tr:hover {
  background: #FAFAFA;
}

tbody tr:last-child td {
  border-bottom: none;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.student-avatar {
  width: 45px;
  height: 45px;
  min-width: 45px;
  border-radius: 50%;
  background: #0F4C3A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.student-info .name {
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 4px;
}

.student-info .email {
  font-size: 0.85rem;
  color: #757575;
}

.badge {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge.confirmada {
  background: #E8F5E9;
  color: #0F4C3A;
}

.badge.pendiente {
  background: #FFF3E0;
  color: #F57C00;
}

.badge.cancelada {
  background: #FFEBEE;
  color: #C62828;
}

.posicion-espera {
  background: #FFF3E0;
  color: #F57C00;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.text-muted {
  color: #9E9E9E;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #F5F5F5;
}

.btn-icon.view {
  color: #1976D2;
}

.btn-icon.delete {
  color: #C62828;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* PAGINATION */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F0F0F0;
}

.pagination-info {
  color: #757575;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  gap: 8px;
}

.pagination button {
  padding: 10px 15px;
  border: none;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 40px;
}

.pagination button:hover {
  background: #F5F5F5;
}

.pagination button.active {
  background: #0F4C3A;
  color: white;
  border-color: #0F4C3A;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2C3E50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #757575;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-bottom: 10px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #F5F5F5;
  color: #2C3E50;
}

.btn-danger {
  background: #DC3545;
  color: white;
}

.btn-danger:hover {
  background: #C82333;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    min-width: 1100px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filter {
    flex-direction: column;
  }
}
</style>