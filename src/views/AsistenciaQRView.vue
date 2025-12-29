[file name]: AsistenciaQRView.vue
<template>
  <div class="asistencia-container">
    <!-- STATS -->
    <div class="attendance-stats">
      <div class="stat-card">
        <div class="stat-number">{{ stats.inscritos || 0 }}</div>
        <div class="stat-label">Inscritos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.presentes || 0 }}</div>
        <div class="stat-label">Presentes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.asistenciaPorcentaje || '0%' }}</div>
        <div class="stat-label">Asistencia</div>
      </div>
    </div>

    <!-- QR SECTION -->
    <div class="qr-section">
      <!-- GENERAR QR -->
      <div class="card">
        <h2>
          <i class="fas fa-qrcode"></i>
          Generar Código QR
        </h2>

        <div class="activity-selector">
          <label>Seleccionar Actividad</label>
          <select v-model="selectedActivity" @change="onActivityChange">
            <option value="">Seleccionar actividad...</option>
            <option v-for="actividad in actividades" :key="actividad.id" :value="actividad.id">
              {{ actividad.titulo }} - {{ formatDate(actividad.fecha) }}
            </option>
          </select>
        </div>

        <div class="qr-display">
          <div class="qr-code" v-if="qrCode">
            <img :src="qrCode" alt="Código QR" style="width: 100%; height: 100%;">
          </div>
          <div class="qr-code" v-else>
            <i class="fas fa-qrcode"></i>
          </div>
          
          <div class="qr-info" v-if="selectedActivityDetails">
            <p><strong>ID:</strong> QR-{{ selectedActivityDetails.id }}-{{ formatDateForQR(selectedActivityDetails.fecha) }}</p>
            <p>Válido solo para la actividad seleccionada</p>
          </div>
          
          <button 
            class="btn btn-primary" 
            @click="generateQR" 
            :disabled="!selectedActivity || generatingQR"
          >
            <i class="fas fa-qrcode"></i>
            {{ generatingQR ? 'Generando...' : 'Generar QR' }}
          </button>
          
          <button 
            v-if="qrCode" 
            class="btn btn-secondary" 
            @click="downloadQR"
            style="margin-top: 10px;"
          >
            <i class="fas fa-download"></i>
            Descargar QR
          </button>
        </div>

        <p style="color: #757575; font-size: 0.85rem; text-align: center;">
          <i class="fas fa-info-circle"></i>
          Los estudiantes escanearán este código al ingresar a la actividad
        </p>
      </div>

      <!-- ESCANEAR QR -->
      <div class="card">
        <h2>
          <i class="fas fa-camera"></i>
          Escanear Asistencia
        </h2>

        <div class="scanner-box">
          <div class="scanner-area" @click="openScanner">
            <i class="fas fa-camera"></i>
            <p>Haz clic para escanear código QR</p>
          </div>

          <div v-if="scannerOpen" class="qr-scanner-modal">
            <div class="qr-scanner-content">
              <div class="qr-scanner-header">
                <h3>Escáner QR</h3>
                <button @click="closeScanner" class="close-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="qr-scanner-body">
                <video ref="scannerVideo" style="width: 100%; height: 300px;"></video>
                <canvas ref="scannerCanvas" style="display: none;"></canvas>
              </div>
              <div class="qr-scanner-footer">
                <button @click="stopScanner" class="btn btn-secondary">
                  <i class="fas fa-stop"></i>
                  Detener Escáner
                </button>
              </div>
            </div>
          </div>

          <div class="scanner-status" :class="scannerStatus.type" v-if="scannerStatus.message">
            <i :class="scannerStatus.icon"></i>
            {{ scannerStatus.message }}
          </div>

          <div class="manual-registration" v-if="['director', 'staff_dae', 'profesor'].includes(userRole)">
            <h4 style="margin: 20px 0 10px; color: #2C3E50;">Registro Manual</h4>
            <div class="manual-input">
              <input 
                v-model="manualStudentId" 
                type="text" 
                placeholder="ID o RUT del estudiante"
                @keyup.enter="registerManualAttendance"
              >
              <button 
                @click="registerManualAttendance" 
                class="btn btn-secondary"
                :disabled="!manualStudentId || !selectedActivity"
              >
                <i class="fas fa-check"></i>
                Registrar
              </button>
            </div>
          </div>
        </div>

        <div class="attendance-list">
          <h3 style="color: #2C3E50; margin-bottom: 15px; font-size: 1.1rem;">
            <i class="fas fa-clock"></i> Últimos Registros
          </h3>

          <div v-if="loadingAttendances" class="loading-text">
            <i class="fas fa-spinner fa-spin"></i> Cargando...
          </div>

          <div v-else-if="recentAttendances.length === 0" class="empty-state">
            No hay registros de asistencia recientes
          </div>

          <div v-else>
            <div 
              v-for="attendance in recentAttendances" 
              :key="attendance.id" 
              class="attendance-item"
            >
              <div class="student-info-inline">
                <div class="student-avatar-small">
                  {{ getInitials(attendance.nombre_completo) }}
                </div>
                <div class="student-details">
                  <span class="student-name-small">{{ attendance.nombre_completo }}</span>
                  <span class="attendance-time">
                    {{ formatTimeAgo(attendance.created_at) }} • vía {{ attendance.metodo }}
                  </span>
                </div>
              </div>
              <i class="fas fa-check-circle check-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EXPORT BUTTON -->
    <div v-if="selectedActivity" style="text-align: center; margin-top: 30px;">
      <button class="btn btn-primary" @click="exportAttendance">
        <i class="fas fa-file-excel"></i>
        Exportar Lista de Asistencia
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import jsQR from 'jsqr';

const authStore = useAuthStore();
const { showToast } = useToast();

// Estados
const actividades = ref([]);
const selectedActivity = ref('');
const selectedActivityDetails = ref(null);
const qrCode = ref(null);
const generatingQR = ref(false);
const recentAttendances = ref([]);
const loadingAttendances = ref(false);
const manualStudentId = ref('');
const scannerOpen = ref(false);
const scannerVideo = ref(null);
const scannerCanvas = ref(null);
const scannerStream = ref(null);
const scannerStatus = ref({ message: '', type: '', icon: '' });

// Stats
const stats = ref({
  inscritos: 0,
  presentes: 0,
  asistenciaPorcentaje: '0%'
});

// Computed
const userRole = computed(() => authStore.userRole);

// Métodos
const loadActivities = async () => {
  try {
    const response = await api.get('/actividades');
    actividades.value = response.data;
  } catch (error) {
    console.error('Error loading activities:', error);
    showToast('error', 'Error al cargar actividades');
  }
};

const loadAttendanceStats = async () => {
  if (!selectedActivity.value) return;
  
  try {
    const response = await api.get(`/asistencia/actividad/${selectedActivity.value}/estadisticas`);
    stats.value = {
      inscritos: response.data.inscritos,
      presentes: response.data.presentes,
      asistenciaPorcentaje: response.data.inscritos > 0 
        ? `${Math.round((response.data.presentes / response.data.inscritos) * 100)}%`
        : '0%'
    };
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const loadRecentAttendances = async () => {
  if (!selectedActivity.value) {
    recentAttendances.value = [];
    return;
  }
  
  loadingAttendances.value = true;
  try {
    const response = await api.get(`/asistencia/actividad/${selectedActivity.value}/recientes`);
    recentAttendances.value = response.data;
  } catch (error) {
    console.error('Error loading attendances:', error);
  } finally {
    loadingAttendances.value = false;
  }
};

const onActivityChange = async () => {
  qrCode.value = null;
  selectedActivityDetails.value = actividades.value.find(a => a.id == selectedActivity.value);
  await loadAttendanceStats();
  await loadRecentAttendances();
};

const generateQR = async () => {
  if (!selectedActivity.value) {
    showToast('error', 'Selecciona una actividad primero');
    return;
  }

  generatingQR.value = true;
  try {
    const response = await api.post('/qr/generate', {
      actividad_id: selectedActivity.value
    });
    
    qrCode.value = response.data.qr_url;
    showToast('success', 'QR generado exitosamente');
  } catch (error) {
    console.error('Error generating QR:', error);
    showToast('error', error.response?.data?.message || 'Error al generar QR');
  } finally {
    generatingQR.value = false;
  }
};

const downloadQR = () => {
  if (!qrCode.value) return;
  
  const link = document.createElement('a');
  link.href = qrCode.value;
  link.download = `qr-actividad-${selectedActivity.value}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Scanner functions
const openScanner = () => {
  scannerOpen.value = true;
  setTimeout(() => {
    startScanner();
  }, 100);
};

const closeScanner = () => {
  stopScanner();
  scannerOpen.value = false;
};

const startScanner = async () => {
  try {
    scannerStream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    
    if (scannerVideo.value) {
      scannerVideo.value.srcObject = scannerStream.value;
      scannerVideo.value.play();
      scanQR();
    }
  } catch (error) {
    console.error('Error accessing camera:', error);
    showToast('error', 'No se pudo acceder a la cámara');
    scannerOpen.value = false;
  }
};

const stopScanner = () => {
  if (scannerStream.value) {
    scannerStream.value.getTracks().forEach(track => track.stop());
    scannerStream.value = null;
  }
};

const scanQR = () => {
  if (!scannerVideo.value || !scannerCanvas.value) return;

  const canvas = scannerCanvas.value;
  const context = canvas.getContext('2d');
  
  const scan = () => {
    if (!scannerOpen.value || !scannerStream.value) return;

    try {
      canvas.width = scannerVideo.value.videoWidth;
      canvas.height = scannerVideo.value.videoHeight;
      context.drawImage(scannerVideo.value, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
      
      if (qrCode) {
        registerQRAttendance(qrCode.data);
        return;
      }
      
      requestAnimationFrame(scan);
    } catch (error) {
      console.error('Error scanning QR:', error);
    }
  };
  
  requestAnimationFrame(scan);
};

const registerQRAttendance = async (token_qr) => {
  try {
    const response = await api.post('/asistencia/qr', { token_qr });
    
    scannerStatus.value = {
      message: 'Asistencia registrada correctamente',
      type: 'success',
      icon: 'fas fa-check-circle'
    };
    
    showToast('success', 'Asistencia registrada');
    await loadAttendanceStats();
    await loadRecentAttendances();
    
    setTimeout(() => {
      scannerStatus.value = { message: '', type: '', icon: '' };
      closeScanner();
    }, 2000);
  } catch (error) {
    console.error('Error registering attendance:', error);
    scannerStatus.value = {
      message: error.response?.data?.message || 'Error al registrar asistencia',
      type: 'error',
      icon: 'fas fa-exclamation-circle'
    };
    
    showToast('error', error.response?.data?.message || 'Error al registrar asistencia');
  }
};

const registerManualAttendance = async () => {
  if (!manualStudentId.value || !selectedActivity.value) {
    showToast('error', 'Completa todos los campos');
    return;
  }

  try {
    await api.post('/asistencia/manual', {
      actividad_id: selectedActivity.value,
      usuario_id: manualStudentId.value
    });
    
    showToast('success', 'Asistencia registrada manualmente');
    manualStudentId.value = '';
    await loadAttendanceStats();
    await loadRecentAttendances();
  } catch (error) {
    console.error('Error registering manual attendance:', error);
    showToast('error', error.response?.data?.message || 'Error al registrar asistencia');
  }
};

const exportAttendance = async () => {
  if (!selectedActivity.value) {
    showToast('error', 'Selecciona una actividad primero');
    return;
  }

  try {
    const response = await api.get(`/asistencia/actividad/${selectedActivity.value}/export`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asistencia-${selectedActivity.value}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('success', 'Archivo descargado exitosamente');
  } catch (error) {
    console.error('Error exporting attendance:', error);
    showToast('error', 'Error al exportar la lista');
  }
};

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateForQR = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Hace momentos';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
};

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Ciclo de vida
onMounted(async () => {
  await loadActivities();
});

onUnmounted(() => {
  stopScanner();
});
</script>

<style scoped>
.asistencia-container {
  padding: 0;
}

/* QR Scanner Modal */
.qr-scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.qr-scanner-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.qr-scanner-header {
  background: #0F4C3A;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qr-scanner-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
}

.qr-scanner-body {
  padding: 20px;
}

.qr-scanner-footer {
  padding: 15px 20px;
  border-top: 1px solid #E0E0E0;
  text-align: center;
}

/* Manual Registration */
.manual-registration {
  margin-top: 20px;
}

.manual-input {
  display: flex;
  gap: 10px;
}

.manual-input input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #E0E0E0;
  border-radius: 10px;
  font-size: 0.95rem;
}

.manual-input input:focus {
  outline: none;
  border-color: #0F4C3A;
}

/* Loading and Empty States */
.loading-text {
  text-align: center;
  padding: 40px;
  color: #757575;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #757575;
  font-size: 0.9rem;
  background: #F5F5F5;
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .qr-section {
    grid-template-columns: 1fr;
  }
  
  .manual-input {
    flex-direction: column;
  }
}


        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', Arial, sans-serif;
            background: #F5F5F5;
            color: #2C3E50;
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
        }

        .menu-toggle:hover {
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
        }

        .navbar-logo img {
            height: 50px;
        }

        .navbar-right {
            display: flex;
            align-items: center;
            gap: 15px;
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

        .menu-item {
            padding: 18px 25px;
            display: flex;
            align-items: center;
            gap: 15px;
            color: #2C3E50;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            font-size: 0.95rem;
        }

        .menu-item:hover {
            background: #F5F5F5;
            border-left-color: #0F4C3A;
        }

        .menu-item.active {
            background: #E8F5E9;
            border-left-color: #0F4C3A;
            font-weight: 600;
            color: #0F4C3A;
        }

        .menu-item i {
            font-size: 1.3rem;
            width: 30px;
            color: #0F4C3A;
        }

        .menu-divider {
            height: 1px;
            background: #E0E0E0;
            margin: 10px 0;
        }

        .sidebar-footer {
            padding: 20px 25px;
            border-top: 1px solid #E0E0E0;
            background: #FAFAFA;
        }

        .sidebar-footer-link {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #757575;
            text-decoration: none;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }

        .sidebar-footer-text {
            font-size: 0.75rem;
            color: #9E9E9E;
            line-height: 1.5;
        }

        /* MAIN CONTENT */
        .main-content {
            margin-top: 70px;
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
        }

        .breadcrumb-arrow {
            font-size: 0.7rem;
            color: #BDBDBD;
        }

        /* CONTENT */
        .content {
            padding: 40px;
        }

        .qr-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            padding: 30px;
        }

        .card h2 {
            color: #2C3E50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .activity-selector {
            margin-bottom: 25px;
        }

        .activity-selector label {
            display: block;
            color: #2C3E50;
            font-weight: 500;
            margin-bottom: 10px;
            font-size: 0.95rem;
        }

        .activity-selector select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #E0E0E0;
            border-radius: 10px;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .activity-selector select:focus {
            outline: none;
            border-color: #0F4C3A;
            box-shadow: 0 0 0 3px rgba(15, 76, 58, 0.1);
        }

        .qr-display {
            background: #F5F5F5;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }

        .qr-code {
            width: 250px;
            height: 250px;
            margin: 0 auto 20px;
            background: white;
            border: 3px solid #0F4C3A;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            color: #0F4C3A;
        }

        .qr-info {
            color: #757575;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
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
            box-shadow: 0 4px 15px rgba(15, 76, 58, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(15, 76, 58, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #2C3E50;
            border: 2px solid #E0E0E0;
        }

        .btn-secondary:hover {
            border-color: #0F4C3A;
            color: #0F4C3A;
        }

        /* SCANNER SECTION */
        .scanner-box {
            background: #F5F5F5;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }

        .scanner-area {
            width: 100%;
            height: 250px;
            background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
            border: 3px dashed #0F4C3A;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .scanner-area:hover {
            background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
            transform: scale(1.02);
        }

        .scanner-area i {
            font-size: 4rem;
            color: #0F4C3A;
        }

        .scanner-area p {
            color: #2C3E50;
            font-weight: 500;
            font-size: 1.1rem;
        }

        .scanner-status {
            padding: 15px;
            border-radius: 10px;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .scanner-status.success {
            background: #E8F5E9;
            color: #0F4C3A;
        }

        .scanner-status.error {
            background: #FFEBEE;
            color: #DC3545;
        }

        /* ATTENDANCE LIST */
        .attendance-list {
            margin-top: 30px;
        }

        .attendance-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            background: #F5F5F5;
            border-radius: 10px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
        }

        .attendance-item:hover {
            background: #E8F5E9;
            transform: translateX(5px);
        }

        .student-info-inline {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .student-avatar-small {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0F4C3A, #1B5E20);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
        }

        .student-details {
            display: flex;
            flex-direction: column;
        }

        .student-name-small {
            font-weight: 600;
            color: #2C3E50;
            font-size: 0.95rem;
        }

        .attendance-time {
            font-size: 0.8rem;
            color: #757575;
        }

        .check-icon {
            color: #0F4C3A;
            font-size: 1.2rem;
        }

        /* STATS */
        .attendance-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            text-align: center;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #0F4C3A;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #757575;
            font-size: 0.9rem;
        }

        /* FOOTER */
        .footer {
            background: white;
            padding: 25px;
            text-align: center;
            color: #757575;
            font-size: 0.9rem;
            border-top: 1px solid #E0E0E0;
            margin-top: 40px;
        }

        @media (max-width: 1024px) {
            .qr-section {
                grid-template-columns: 1fr;
            }
        }

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

            .attendance-stats {
                grid-template-columns: 1fr;
            }

            .qr-code {
                width: 200px;
                height: 200px;
            }
        }
    
</style>