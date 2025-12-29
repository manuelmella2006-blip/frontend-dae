<template>
  <div class="nueva-actividad-container">
    <div class="content">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <router-link to="/admin/actividades" class="back-btn">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          {{ isEdit ? 'Editar Actividad' : 'Nueva Actividad' }}
        </h1>
      </div>

      <!-- Formulario -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="actividad-form">
          
          <!-- Sección 1: Información Básica -->
          <div class="form-section">
            <h3><i class="fas fa-info-circle"></i> Información Básica</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="titulo">Título *</label>
                <input 
                  v-model="formData.titulo" 
                  type="text" 
                  id="titulo"
                  placeholder="Ej: Taller de Programación Básica"
                  required
                />
              </div>

              <div class="form-group">
                <label for="tipo">Tipo de Actividad *</label>
                <select v-model="formData.tipo" id="tipo" required>
                  <option value="">Selecciona un tipo</option>
                  <option value="taller">Taller</option>
                  <option value="charla">Charla</option>
                  <option value="capacitacion">Capacitación</option>
                  <option value="deportivo">Deportivo</option>
                  <option value="cultural">Cultural</option>
                  <option value="voluntariado">Voluntariado</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea 
                v-model="formData.descripcion" 
                id="descripcion" 
                rows="4"
                placeholder="Describe la actividad, objetivos, contenido, etc."
              ></textarea>
            </div>
          </div>

          <!-- Sección 2: Fechas y Lugar -->
          <div class="form-section">
            <h3><i class="fas fa-calendar-alt"></i> Fechas y Lugar</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="fecha_inicio">Fecha de Inicio *</label>
                <input 
                  v-model="formData.fecha_inicio" 
                  type="datetime-local" 
                  id="fecha_inicio"
                  required
                />
              </div>

              <div class="form-group">
                <label for="fecha_fin">Fecha de Fin *</label>
                <input 
                  v-model="formData.fecha_fin" 
                  type="datetime-local" 
                  id="fecha_fin"
                  required
                />
              </div>

              <div class="form-group">
                <label for="lugar">Lugar</label>
                <input 
                  v-model="formData.lugar" 
                  type="text" 
                  id="lugar"
                  placeholder="Ej: Sala de Conferencias, Cancha Principal"
                />
              </div>
            </div>
          </div>

          <!-- Sección 3: Cupos -->
          <div class="form-section">
            <h3><i class="fas fa-users"></i> Cupos</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="cupos_totales">Cupos Totales *</label>
                <input 
                  v-model="formData.cupos_totales" 
                  type="number" 
                  id="cupos_totales"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Sección 4: Estado -->
          <div class="form-section">
            <h3><i class="fas fa-toggle-on"></i> Estado</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="estado">Estado de la Actividad</label>
                <select v-model="formData.estado" id="estado">
                  <option value="borrador">Borrador</option>
                  <option value="publicada">Publicada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <router-link to="/admin/actividades" class="btn btn-secondary">
              Cancelar
            </router-link>
            
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="saveAsDraft"
              v-if="!isEdit"
            >
              Guardar como Borrador
            </button>
            
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              {{ isEdit ? 'Actualizar Actividad' : 'Crear Actividad' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { actividadesService } from '@/services/actividadesService';

const route = useRoute();
const router = useRouter();
const loading = ref(false);

// Determinar si estamos editando
const isEdit = computed(() => route.name === 'editar-actividad');

// Datos del formulario
const formData = ref({
  titulo: '',
  descripcion: '',
  tipo: '',
  lugar: '',
  fecha_inicio: '',
  fecha_fin: '',
  cupos_totales: 10,
  estado: 'borrador'
});

// Cargar datos si estamos editando
const loadActividad = async () => {
  if (!isEdit.value) return;
  
  try {
    loading.value = true;
    const actividad = await actividadesService.getById(route.params.id);
    
    // Formatear fechas para datetime-local
    formData.value = {
      ...actividad,
      fecha_inicio: formatDateTimeLocal(actividad.fecha_inicio),
      fecha_fin: formatDateTimeLocal(actividad.fecha_fin)
    };
  } catch (error) {
    console.error('Error cargando actividad:', error);
    alert('No se pudo cargar la actividad');
    router.push('/admin/actividades');
  } finally {
    loading.value = false;
  }
};

// Formatear fecha para input datetime-local
const formatDateTimeLocal = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

// Guardar como borrador
const saveAsDraft = () => {
  formData.value.estado = 'borrador';
  handleSubmit();
};

// Manejar envío del formulario
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // Validaciones básicas
    if (!formData.value.titulo.trim()) {
      throw new Error('El título es obligatorio');
    }
    
    if (new Date(formData.value.fecha_inicio) >= new Date(formData.value.fecha_fin)) {
      throw new Error('La fecha de fin debe ser posterior a la de inicio');
    }
    
    // Preparar datos para enviar
    const actividadData = {
      ...formData.value,
      cupos_totales: parseInt(formData.value.cupos_totales)
    };
    
    let result;
    if (isEdit.value) {
      // Actualizar actividad existente
      result = await actividadesService.update(route.params.id, actividadData);
      alert('Actividad actualizada correctamente');
    } else {
      // Crear nueva actividad
      result = await actividadesService.create(actividadData);
      alert('Actividad creada correctamente');
    }
    
    // Redirigir a la lista
    router.push('/admin/actividades');
    
  } catch (error) {
    console.error('Error guardando actividad:', error);
    alert(error.response?.data?.message || error.message || 'Error al guardar la actividad');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadActividad();
});
</script>

<style scoped>
.nueva-actividad-container {
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

/* Contenedor del formulario */
.form-container {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #E0E0E0;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  font-size: 1.3rem;
  color: #0F4C3A;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #2C3E50;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 15px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0F4C3A;
  box-shadow: 0 0 0 3px rgba(15, 76, 58, 0.1);
}

.form-group input[type="datetime-local"] {
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Botones de acción */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 1px solid #E0E0E0;
  margin-top: 30px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(15, 76, 58, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #757575;
  border: 2px solid #E0E0E0;
}

.btn-secondary:hover {
  border-color: #0F4C3A;
  color: #0F4C3A;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 0 20px 20px;
  }
  
  .form-container {
    padding: 25px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>