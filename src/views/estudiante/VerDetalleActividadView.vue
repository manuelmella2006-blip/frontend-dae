[file name]: VerDetalleActividadView.vue
[file content begin]
<template>
  <div class="container detalle-container">
    <!-- Botón volver -->
    <div class="back-button">
      <button @click="goBack" class="btn-back">
        <i class="fas fa-arrow-left"></i>
        Volver
      </button>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando actividad...</p>
    </div>

    <!-- Actividad no encontrada -->
    <div v-else-if="!actividad" class="not-found">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Actividad no encontrada</h3>
      <p>La actividad que buscas no existe o no está disponible</p>
      <router-link to="/estudiante/actividades" class="btn-primary">
        <i class="fas fa-calendar-alt"></i>
        Ver actividades disponibles
      </router-link>
    </div>

    <!-- Detalle de actividad -->
    <div v-else class="detalle-actividad">
      <!-- Header -->
      <div class="detalle-header">
        <div class="header-content">
          <div class="actividad-badge" :class="getTipoClass(actividad.tipo)">
            {{ formatTipo(actividad.tipo) }}
          </div>
          <h1 class="actividad-titulo">{{ actividad.titulo }}</h1>
          <div class="actividad-fecha">
            <i class="fas fa-calendar"></i>
            {{ formatFecha(actividad.fecha_inicio) }}
          </div>
        </div>
        
        <div class="header-actions">
          <div class="estado-actividad">
            <div class="estado-badge" :class="estadoUsuario">
              <i :class="getEstadoIcon(estadoUsuario)"></i>
              {{ formatEstadoUsuario(estadoUsuario) }}
              <span v-if="posicionEspera">#{{ posicionEspera }}</span>
            </div>
          </div>
          
          <!-- Reemplaza el bloque actual del botón de asistencia (líneas 45-60 aproximadamente) -->
<div v-if="estadoUsuario === 'inscrito'" class="asistencia-section">
  <button 
    v-if="!asistenciaMarcada && puedeMarcarAsistencia()"
    @click="abrirScannerAsistencia"
    class="btn-asistencia"
  >
    <i class="fas fa-qrcode"></i>
    Marcar Asistencia
  </button>
  <button 
    v-else-if="asistenciaMarcada"
    class="btn-asistencia-marcada"
    disabled
  >
    <i class="fas fa-check-circle"></i>
    Asistencia Marcada
  </button>
  <button 
    v-else
    class="btn-asistencia-inactiva"
    disabled
  >
    <i class="fas fa-calendar-times"></i>
    Asistencia no disponible
  </button>
</div>
          
          <div class="action-buttons">
            <button 
              v-if="estadoUsuario === 'disponible' && actividad.cupos_disponibles > 0"
              @click="inscribirse"
              class="btn-inscribir-lg"
              :disabled="inscribiendo"
            >
              <i class="fas fa-plus-circle"></i>
              <span v-if="inscribiendo">Inscribiendo...</span>
              <span v-else>Inscribirse</span>
            </button>
            
            <button 
              v-else-if="estadoUsuario === 'inscrito'"
              @click="cancelarInscripcion"
              class="btn-cancelar-lg"
              :disabled="!puedeCancelar"
            >
              <i class="fas fa-times-circle"></i>
              Cancelar inscripción
            </button>
            
            <button 
              v-else-if="estadoUsuario === 'en_espera'"
              @click="cancelarInscripcion"
              class="btn-cancelar-lg"
            >
              <i class="fas fa-sign-out-alt"></i>
              Salir de lista de espera
            </button>
            
            <button 
              v-else
              class="btn-agotado-lg"
              disabled
            >
              <i class="fas fa-times-circle"></i>
              Cupos agotados
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="detalle-content">
        <!-- Columna izquierda: Información -->
        <div class="info-column">
          <!-- NUEVA SECCIÓN: Asistencia QR -->
          <div v-if="estadoUsuario === 'inscrito'" class="info-section asistencia-section">
            <h3 class="section-title">
              <i class="fas fa-qrcode"></i>
              Marcar Asistencia
            </h3>
            <div class="section-content">
              <div v-if="esActividadHoy()">
                <div v-if="!asistenciaMarcada" class="asistencia-instructions">
                  <div class="instruction-card">
                    <i class="fas fa-camera"></i>
                    <div class="instruction-content">
                      <h4>Instrucciones:</h4>
                      <ol>
                        <li>Presiona el botón "Marcar Asistencia"</li>
                        <li>Abre la cámara de tu dispositivo</li>
                        <li>Escanea el código QR que verás en la entrada de la actividad</li>
                        <li>Confirma tu asistencia automáticamente</li>
                      </ol>
                    </div>
                  </div>
                  
                  <button 
                    @click="abrirScannerAsistencia"
                    class="btn-escanear-qr"
                  >
                    <i class="fas fa-qrcode"></i>
                    Escanear QR para Asistencia
                  </button>
                  
                  <div class="asistencia-notes">
                    <p><i class="fas fa-info-circle"></i> La asistencia solo puede marcarse el día de la actividad</p>
                    <p><i class="fas fa-clock"></i> Horario válido: 30 minutos antes del inicio hasta el final</p>
                  </div>
                </div>
                <div v-else class="asistencia-marcada">
                  <div class="success-card">
                    <i class="fas fa-check-circle"></i>
                    <div>
                      <h4>¡Asistencia Registrada!</h4>
                      <p>Tu asistencia ha sido confirmada para esta actividad.</p>
                      <p class="timestamp">Marcada: {{ formatAsistenciaTime(asistenciaMarcada.fecha_hora) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="asistencia-no-disponible">
                <div class="info-card">
                  <i class="fas fa-calendar-day"></i>
                  <div>
                    <h4>Asistencia aún no disponible</h4>
                    <p>Podrás marcar tu asistencia el día de la actividad.</p>
                    <p>Fecha: {{ formatFechaCompleta(actividad.fecha_inicio) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="fas fa-align-left"></i>
              Descripción
            </h3>
            <div class="section-content">
              <p v-if="actividad.descripcion">{{ actividad.descripcion }}</p>
              <p v-else class="text-muted">No hay descripción disponible</p>
            </div>
          </div>

          <!-- Detalles -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Detalles
            </h3>
            <div class="section-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Lugar</div>
                    <div class="detail-value">{{ actividad.lugar || 'Por definir' }}</div>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="fas fa-calendar-day"></i>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Fecha</div>
                    <div class="detail-value">{{ formatFechaCompleta(actividad.fecha_inicio) }}</div>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Horario</div>
                    <div class="detail-value">{{ formatHora(actividad.fecha_inicio) }} - {{ formatHora(actividad.fecha_fin) }}</div>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Responsable</div>
                    <div class="detail-value">{{ actividad.responsable_nombre }}</div>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Cupos</div>
                    <div class="detail-value">
                      <div class="cupos-info">
                        <span>{{ actividad.cupos_disponibles }} / {{ actividad.cupos_totales }} disponibles</span>
                        <div class="cupos-bar">
                          <div 
                            class="cupos-fill" 
                            :style="{ width: calcularPorcentajeCupos() + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información para inscritos -->
          <div v-if="estadoUsuario === 'inscrito'" class="info-section">
            <h3 class="section-title">
              <i class="fas fa-check-circle"></i>
              Tu inscripción
            </h3>
            <div class="section-content inscrito-info">
              <div class="success-message">
                <i class="fas fa-check"></i>
                <div>
                  <strong>¡Estás inscrito!</strong>
                  <p>Tu participación está confirmada para esta actividad.</p>
                </div>
              </div>
              
              <div class="instrucciones">
                <h4>Instrucciones importantes:</h4>
                <ul>
                  <li>Llega 10 minutos antes del inicio</li>
                  <li>Trae tu identificación estudiantil</li>
                  <li>Confirma tu asistencia con el código QR</li>
                  <li>Tu puntualidad es importante para mantener tu inscripción activa</li>
                </ul>
              </div>
              
              <div v-if="!puedeCancelar" class="warning-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                  <strong>No puedes cancelar</strong>
                  <p>Solo puedes cancelar hasta 24 horas antes del inicio de la actividad.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Información para lista de espera -->
          <div v-else-if="estadoUsuario === 'en_espera'" class="info-section">
            <h3 class="section-title">
              <i class="fas fa-clock"></i>
              Lista de espera
            </h3>
            <div class="section-content espera-info">
              <div class="info-message">
                <i class="fas fa-hourglass-half"></i>
                <div>
                  <strong>Estás en lista de espera</strong>
                  <p v-if="posicionEspera">
                    Tu posición actual es: <strong>#{{ posicionEspera }}</strong>
                  </p>
                  <p>Serás notificado si se libera un cupo.</p>
                </div>
              </div>
              
              <div class="espera-tips">
                <h4>¿Cómo funciona?</h4>
                <ul>
                  <li>Cuando alguien cancele su inscripción, avanzarás en la lista</li>
                  <li>Si llegas al primer lugar, serás inscrito automáticamente</li>
                  <li>Recibirás una notificación por correo</li>
                  <li>Puedes salir de la lista en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha: Estado y acciones -->
        <div class="status-column">
          <!-- Card de estado -->
          <div class="status-card">
            <h3 class="card-title">
              <i class="fas fa-chart-pie"></i>
              Estado de la actividad
            </h3>
            
            <div class="status-stats">
              <div class="stat-item">
                <div class="stat-value">{{ actividad.cupos_totales }}</div>
                <div class="stat-label">Cupos totales</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-value">{{ actividad.cupos_disponibles }}</div>
                <div class="stat-label">Disponibles</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-value">{{ actividad.cupos_totales - actividad.cupos_disponibles }}</div>
                <div class="stat-label">Inscritos</div>
              </div>
            </div>
            
            <div class="ocupacion-chart">
              <div class="chart-label">
                <span>Ocupación: {{ calcularPorcentajeCupos() }}%</span>
              </div>
              <div class="chart-bar">
                <div 
                  class="chart-fill" 
                  :style="{ width: calcularPorcentajeCupos() + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Card de acciones -->
          <div class="actions-card">
            <h3 class="card-title">
              <i class="fas fa-bolt"></i>
              Acciones
            </h3>
            
            <div class="actions-list">
              <button 
                v-if="estadoUsuario === 'disponible' && actividad.cupos_disponibles > 0"
                @click="inscribirse"
                class="action-btn primary"
                :disabled="inscribiendo"
              >
                <i class="fas fa-plus-circle"></i>
                <span v-if="inscribiendo">Inscribiendo...</span>
                <span v-else>Inscribirse</span>
              </button>
              
              <button 
                v-else-if="estadoUsuario === 'inscrito'"
                @click="cancelarInscripcion"
                class="action-btn warning"
                :disabled="!puedeCancelar"
              >
                <i class="fas fa-times-circle"></i>
                Cancelar inscripción
              </button>
              
              <button 
                v-else-if="estadoUsuario === 'en_espera'"
                @click="cancelarInscripcion"
                class="action-btn warning"
              >
                <i class="fas fa-sign-out-alt"></i>
                Salir de lista
              </button>
              
              <button 
                v-else
                class="action-btn disabled"
                disabled
              >
                <i class="fas fa-times-circle"></i>
                Cupos agotados
              </button>
              
              <!-- NUEVO: Botón para marcar asistencia en mobile -->
              <button 
                v-if="estadoUsuario === 'inscrito' && esActividadHoy() && !asistenciaMarcada"
                @click="abrirScannerAsistencia"
                class="action-btn qr"
              >
                <i class="fas fa-qrcode"></i>
                Marcar Asistencia
              </button>
              
              <router-link 
                to="/estudiante/mis-inscripciones" 
                class="action-btn secondary"
              >
                <i class="fas fa-clipboard-list"></i>
                Ver mis inscripciones
              </router-link>
              
              <button 
                @click="goBack"
                class="action-btn outline"
              >
                <i class="fas fa-arrow-left"></i>
                Volver a actividades
              </button>
            </div>
          </div>

          <!-- Card de contacto -->
          <div v-if="actividad.responsable_nombre" class="contact-card">
            <h3 class="card-title">
              <i class="fas fa-user-circle"></i>
              Contacto
            </h3>
            
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-user"></i>
                <div class="contact-content">
                  <div class="contact-label">Responsable</div>
                  <div class="contact-value">{{ actividad.responsable_nombre }}</div>
                </div>
              </div>
              
              <div class="contact-note">
                <i class="fas fa-info-circle"></i>
                <p>Para dudas sobre esta actividad, contacta al responsable.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Scanner QR -->
    <div v-if="showQRScanner" class="modal-overlay qr-scanner-modal">
      <div class="modal qr-scanner">
        <div class="modal-header">
          <h3>Escanear Código QR</h3>
          <button @click="cerrarScanner" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="scanner-container">
            <video ref="scannerVideo" autoplay playsinline></video>
            <canvas ref="scannerCanvas" style="display: none;"></canvas>
            <div class="scanner-guide">
              <div class="scanner-frame"></div>
              <p>Coloca el código QR dentro del marco</p>
            </div>
          </div>
          
          <div v-if="scanningError" class="scanning-error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ scanningError }}</span>
          </div>
          
          <div class="scanner-instructions">
            <p><i class="fas fa-lightbulb"></i> Asegúrate de tener buena iluminación</p>
            <p><i class="fas fa-hand-point-up"></i> Acerca la cámara al código QR</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarScanner" class="btn-cancel">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="alternarCamara" class="btn-secondary">
            <i class="fas fa-sync-alt"></i>
            Cambiar cámara
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { actividadesService } from '@/services/actividadesService';
import { inscripcionesService } from '@/services/inscripcionesService';
import { asistenciaService } from '@/services/asistenciaService'; // NUEVO: Servicio de asistencia
import jsQR from 'jsqr'; // Asegúrate de instalar: npm install jsqr

const route = useRoute();
const router = useRouter();

// Estados
const actividad = ref(null);
const loading = ref(true);
const inscribiendo = ref(false);
const estadoUsuario = ref('disponible'); // 'disponible', 'inscrito', 'en_espera'
const posicionEspera = ref(null);
const asistenciaMarcada = ref(null); // NUEVO: Estado de asistencia

// Estados para QR Scanner
const showQRScanner = ref(false);
const scannerVideo = ref(null);
const scannerCanvas = ref(null);
const scanningError = ref('');
const stream = ref(null);
const facingMode = ref('environment'); // 'environment' para cámara trasera

// Toast
const toast = ref({
  show: false,
  type: 'success',
  icon: 'fas fa-check-circle',
  message: ''
});

// Computed
const puedeCancelar = computed(() => {
  if (!actividad.value || estadoUsuario.value !== 'inscrito') return false;
  
  const fechaInicio = new Date(actividad.value.fecha_inicio);
  const ahora = new Date();
  const horasAntes = 24;
  
  const diferenciaHoras = (fechaInicio - ahora) / (1000 * 60 * 60);
  return diferenciaHoras > horasAntes;
});

// Métodos
const loadActividad = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    
    // Cargar actividad
    const data = await actividadesService.getById(id);
    actividad.value = data;
    
    // Verificar estado del usuario
    await verificarEstadoUsuario();
    
    // NUEVO: Verificar asistencia si está inscrito
    if (estadoUsuario.value === 'inscrito') {
      await verificarAsistencia();
    }
  } catch (error) {
    console.error('Error cargando actividad:', error);
    if (error.response?.status === 404) {
      actividad.value = null;
    } else {
      showToast('error', 'Error al cargar la actividad');
    }
  } finally {
    loading.value = false;
  }
};

const verificarEstadoUsuario = async () => {
  try {
    const misInscripciones = await inscripcionesService.getMisInscripciones();
    const miInscripcion = misInscripciones.find(ins => ins.id === actividad.value.id);
    
    if (miInscripcion) {
      estadoUsuario.value = miInscripcion.estado;
      posicionEspera.value = miInscripcion.posicion_espera;
    } else {
      estadoUsuario.value = 'disponible';
      posicionEspera.value = null;
    }
  } catch (error) {
    console.error('Error verificando estado:', error);
    estadoUsuario.value = 'disponible';
  }
};

// NUEVO: Verificar asistencia del usuario
const verificarAsistencia = async () => {
  try {
    const asistencia = await asistenciaService.getMiAsistencia(actividad.value.id);
    asistenciaMarcada.value = asistencia;
  } catch (error) {
    console.error('Error verificando asistencia:', error);
    asistenciaMarcada.value = null;
  }
};

// NUEVO: Comprobar si es el día de la actividad
// En el método esActividadHoy()
// REEMPLAZA la función esActividadHoy() con esta versión mejorada:
const esActividadHoy = () => {
  if (!actividad.value) return false;
  
  const hoy = new Date();
  const fechaActividad = new Date(actividad.value.fecha_inicio);
  
  // Comparar solo año, mes y día (ignorar hora)
  const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const actividadDate = new Date(fechaActividad.getFullYear(), fechaActividad.getMonth(), fechaActividad.getDate());
  
  return hoyDate.getTime() === actividadDate.getTime();
};
// Agrega esta función después de la función esActividadHoy() (~línea 140-160)
const puedeMarcarAsistencia = () => {
  if (!actividad.value) return false;
  
  const fechaInicio = new Date(actividad.value.fecha_inicio);
  const ahora = new Date();
  
  // Permitir marcar asistencia desde 30 minutos antes hasta el final
  const inicioPermitido = new Date(fechaInicio.getTime() - 30 * 60 * 1000);
  const finPermitido = new Date(actividad.value.fecha_fin);
  
  return ahora >= inicioPermitido && ahora <= finPermitido;
};
// NUEVO: Métodos para QR Scanner
const abrirScannerAsistencia = () => {
  showQRScanner.value = true;
  setTimeout(() => {
    iniciarScanner();
  }, 100);
};

const cerrarScanner = () => {
  detenerScanner();
  showQRScanner.value = false;
  scanningError.value = '';
};

const iniciarScanner = async () => {
  try {
    const constraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (scannerVideo.value) {
      scannerVideo.value.srcObject = stream.value;
      scannerVideo.value.play();
      escanearQR();
    }
  } catch (error) {
    console.error('Error accediendo a la cámara:', error);
    scanningError.value = 'No se pudo acceder a la cámara. Por favor, verifica los permisos.';
  }
};

const detenerScanner = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
};

const alternarCamara = () => {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
  detenerScanner();
  iniciarScanner();
};

const escanearQR = () => {
  if (!scannerVideo.value || !scannerCanvas.value) return;
  
  const canvas = scannerCanvas.value;
  const context = canvas.getContext('2d');
  
  const scan = () => {
    if (!showQRScanner.value || !stream.value) return;
    
    try {
      if (scannerVideo.value.readyState === scannerVideo.value.HAVE_ENOUGH_DATA) {
        canvas.width = scannerVideo.value.videoWidth;
        canvas.height = scannerVideo.value.videoHeight;
        context.drawImage(scannerVideo.value, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (qrCode) {
          procesarQRCode(qrCode.data);
          return;
        }
      }
      
      requestAnimationFrame(scan);
    } catch (error) {
      console.error('Error escaneando QR:', error);
    }
  };
  
  requestAnimationFrame(scan);
};

// NUEVO: Procesar el QR escaneado
const procesarQRCode = async (qrData) => {
  try {
    detenerScanner();
    
    // Parsear datos del QR
    let qrInfo;
    try {
      qrInfo = JSON.parse(qrData);
    } catch (e) {
      // Si no es JSON, asumimos que es solo el token
      qrInfo = { token_qr: qrData };
    }
    
    const token_qr = qrInfo.token_qr || qrData;
    
    // Registrar asistencia
    const resultado = await asistenciaService.marcarAsistenciaQR({
      actividad_id: actividad.value.id,
      token_qr: token_qr
    });
    
    // Actualizar estado de asistencia
    asistenciaMarcada.value = {
      fecha_hora: new Date().toISOString(),
      metodo: 'qr'
    };
    
    showToast('success', '¡Asistencia registrada exitosamente!');
    cerrarScanner();
    
  } catch (error) {
    console.error('Error procesando QR:', error);
    scanningError.value = error.response?.data?.message || 'Error al registrar asistencia';
    
    // Reintentar escaneo después de 2 segundos
    setTimeout(() => {
      scanningError.value = '';
      iniciarScanner();
    }, 2000);
  }
};

// Métodos existentes (sin cambios)
const inscribirse = async () => {
  try {
    inscribiendo.value = true;
    
    const result = await inscripcionesService.inscribir(actividad.value.id);
    
    if (result.estado === 'inscrito') {
      showToast('success', '¡Inscripción exitosa!');
      estadoUsuario.value = 'inscrito';
    } else if (result.estado === 'en_espera') {
      showToast('info', `Agregado a lista de espera. Posición: ${result.posicion_espera}`);
      estadoUsuario.value = 'en_espera';
      posicionEspera.value = result.posicion_espera;
    }
    
  } catch (error) {
    console.error('Error inscribiendo:', error);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya estás inscrito')) {
      showToast('warning', 'Ya estás inscrito en esta actividad');
      estadoUsuario.value = 'inscrito';
    } else {
      showToast('error', error.response?.data?.message || 'Error al inscribirse');
    }
  } finally {
    inscribiendo.value = false;
  }
};

const cancelarInscripcion = async () => {
  if (!confirm('¿Estás seguro de que quieres cancelar tu participación?')) {
    return;
  }
  
  try {
    await inscripcionesService.cancelar(actividad.value.id);
    
    showToast('success', 'Inscripción cancelada exitosamente');
    estadoUsuario.value = 'disponible';
    posicionEspera.value = null;
    
    // Actualizar cupos
    actividad.value.cupos_disponibles += 1;
    
  } catch (error) {
    console.error('Error cancelando inscripción:', error);
    showToast('error', error.response?.data?.message || 'Error al cancelar');
  }
};

const goBack = () => {
  router.push('/estudiante/actividades');
};

// NUEVO: Formatear tiempo de asistencia
const formatAsistenciaTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Métodos de formateo existentes
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

const formatEstadoUsuario = (estado) => {
  const estados = {
    disponible: 'Disponible',
    inscrito: 'Inscrito',
    en_espera: 'En espera'
  };
  return estados[estado] || estado;
};

const getEstadoIcon = (estado) => {
  const icons = {
    disponible: 'fas fa-check-circle',
    inscrito: 'fas fa-check-circle',
    en_espera: 'fas fa-clock'
  };
  return icons[estado] || 'fas fa-info-circle';
};

const formatFecha = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
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

const calcularPorcentajeCupos = () => {
  if (!actividad.value || actividad.value.cupos_totales === 0) return 0;
  const ocupados = actividad.value.cupos_totales - actividad.value.cupos_disponibles;
  return Math.round((ocupados / actividad.value.cupos_totales) * 100);
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

// Ciclo de vida
onMounted(() => {
  loadActividad();
});

onUnmounted(() => {
  detenerScanner();
});
</script>

<style scoped>
/* ESTILOS EXISTENTES (sin cambios) */

/* NUEVOS ESTILOS PARA ASISTENCIA QR */

/* Botón de asistencia en header */
.asistencia-section {
  margin-bottom: 15px;
}

.btn-asistencia {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.btn-asistencia:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(15, 76, 58, 0.3);
}

.btn-asistencia-marcada {
  background: #E8F5E9;
  color: #0F4C3A;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

/* Sección de asistencia */
.asistencia-instructions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instruction-card {
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 15px;
}

.instruction-card i {
  color: #0F4C3A;
  font-size: 1.5rem;
  margin-top: 5px;
}

.instruction-content h4 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.instruction-content ol {
  padding-left: 20px;
  color: #757575;
}

.instruction-content li {
  margin-bottom: 8px;
}

.btn-escanear-qr {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-escanear-qr:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(15, 76, 58, 0.4);
}

.asistencia-notes {
  background: #F5F5F5;
  border-radius: 10px;
  padding: 15px;
  font-size: 0.9rem;
  color: #757575;
}

.asistencia-notes p {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.asistencia-notes i {
  color: #0F4C3A;
}

/* Asistencia marcada */
.asistencia-marcada {
  animation: fadeIn 0.5s ease;
}

.success-card {
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 10px;
  padding: 25px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.success-card i {
  color: #0F4C3A;
  font-size: 2.5rem;
}

.success-card h4 {
  color: #0F4C3A;
  margin-bottom: 8px;
}

.success-card p {
  color: #757575;
  margin-bottom: 5px;
}

.timestamp {
  font-size: 0.85rem;
  color: #2C3E50;
  font-weight: 600;
}

/* Asistencia no disponible */
.asistencia-no-disponible {
  animation: fadeIn 0.5s ease;
}

.info-card {
  background: #F5F5F5;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  padding: 25px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.info-card i {
  color: #757575;
  font-size: 2.5rem;
}

.info-card h4 {
  color: #2C3E50;
  margin-bottom: 8px;
}

.info-card p {
  color: #757575;
  margin-bottom: 5px;
}

/* Botón QR en actions card */
.action-btn.qr {
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
}

.action-btn.qr:hover {
  background: linear-gradient(135deg, #0d4032, #164d1a);
}

/* Modal de QR Scanner */
.qr-scanner-modal {
  z-index: 2000;
}

.qr-scanner {
  max-width: 500px;
}

.scanner-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  background: #000;
}

.scanner-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-guide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  border: 3px solid #0F4C3A;
  border-radius: 15px;
  position: relative;
}

.scanner-frame::before,
.scanner-frame::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #0F4C3A;
}

.scanner-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scanner-frame::after {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
}

.scanner-guide p {
  color: white;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.scanning-error {
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #DC3545;
}

.scanner-instructions {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 15px;
  font-size: 0.9rem;
  color: #757575;
}

.scanner-instructions p {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .scanner-container {
    height: 250px;
  }
  
  .scanner-frame {
    width: 180px;
    height: 180px;
  }
  
  .instruction-card {
    flex-direction: column;
    text-align: center;
  }
  
  .success-card,
  .info-card {
    flex-direction: column;
    text-align: center;
  }
}
.detalle-container {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 30px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #F5F5F5;
  color: #2C3E50;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #E0E0E0;
  transform: translateX(-5px);
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 100px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #E0E0E0;
  border-top-color: #0F4C3A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Not found */
.not-found {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.not-found i {
  font-size: 4rem;
  color: #FFC107;
  margin-bottom: 20px;
}

.not-found h3 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.not-found p {
  color: #757575;
  margin-bottom: 30px;
}

.btn-primary {
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

.btn-primary:hover {
  background: #0d4032;
  transform: translateY(-2px);
}

/* Header de detalle */
.detalle-header {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: start;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header-content {
  flex: 1;
}

.actividad-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
}

.badge-taller { background: #E8F5E9; color: #0F4C3A; }
.badge-charla { background: #E3F2FD; color: #1976D2; }
.badge-deporte { background: #FFF3E0; color: #F57C00; }
.badge-cultural { background: #F3E5F5; color: #7B1FA2; }
.badge-voluntariado { background: #E8EAF6; color: #303F9F; }
.badge-default { background: #F5F5F5; color: #757575; }

.actividad-titulo {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 10px;
  line-height: 1.3;
}

.actividad-fecha {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #757575;
  font-size: 1.1rem;
}

.actividad-fecha i {
  color: #0F4C3A;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-end;
}

.estado-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.estado-badge.inscrito {
  background: #E8F5E9;
  color: #0F4C3A;
}

.estado-badge.en_espera {
  background: #FFF3E0;
  color: #F57C00;
}

.estado-badge.disponible {
  background: #E3F2FD;
  color: #1976D2;
}

.action-buttons button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-inscribir-lg {
  background: #0F4C3A;
  color: white;
}

.btn-inscribir-lg:hover:not(:disabled) {
  background: #0d4032;
  transform: translateY(-2px);
}

.btn-inscribir-lg:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancelar-lg {
  background: #DC3545;
  color: white;
}

.btn-cancelar-lg:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-cancelar-lg:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-agotado-lg {
  background: #F5F5F5;
  color: #757575;
  cursor: not-allowed;
}

/* Contenido principal */
.detalle-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* Columna izquierda */
.info-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 1.2rem;
  color: #2C3E50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #0F4C3A;
}

.section-content {
  color: #2C3E50;
  line-height: 1.6;
}

.section-content p {
  margin-bottom: 15px;
}

.section-content p:last-child {
  margin-bottom: 0;
}

.text-muted {
  color: #757575;
  font-style: italic;
}

/* Detalle grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  gap: 15px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: #F5F5F5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F4C3A;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 0.85rem;
  color: #757575;
  margin-bottom: 5px;
}

.detail-value {
  font-weight: 600;
  color: #2C3E50;
}

.cupos-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* Información para inscritos */
.inscrito-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.success-message {
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 15px;
}

.success-message i {
  color: #0F4C3A;
  font-size: 1.5rem;
}

.success-message strong {
  color: #0F4C3A;
  display: block;
  margin-bottom: 5px;
}

.instrucciones {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 20px;
}

.instrucciones h4 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.instrucciones ul {
  padding-left: 20px;
  color: #757575;
}

.instrucciones li {
  margin-bottom: 8px;
}

.warning-message {
  background: #FFF3E0;
  border: 1px solid #FFE0B2;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 15px;
}

.warning-message i {
  color: #F57C00;
  font-size: 1.5rem;
}

.warning-message strong {
  color: #F57C00;
  display: block;
  margin-bottom: 5px;
}

/* Información para espera */
.espera-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-message {
  background: #FFF3E0;
  border: 1px solid #FFE0B2;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 15px;
}

.info-message i {
  color: #F57C00;
  font-size: 1.5rem;
}

.info-message strong {
  color: #F57C00;
  display: block;
  margin-bottom: 5px;
}

.espera-tips {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 20px;
}

.espera-tips h4 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.espera-tips ul {
  padding-left: 20px;
  color: #757575;
}

.espera-tips li {
  margin-bottom: 8px;
}

/* Columna derecha */
.status-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.status-card, .actions-card, .contact-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 1.2rem;
  color: #2C3E50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title i {
  color: #0F4C3A;
}

.status-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #F5F5F5;
  border-radius: 10px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.8rem;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ocupacion-chart {
  margin-top: 20px;
}

.chart-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #2C3E50;
}

.chart-bar {
  height: 10px;
  background: #F5F5F5;
  border-radius: 5px;
  overflow: hidden;
}

.chart-fill {
  height: 100%;
  background: #0F4C3A;
  border-radius: 5px;
  transition: width 0.3s ease;
}

/* Actions card */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
}

.action-btn.primary {
  background: #0F4C3A;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0d4032;
  transform: translateY(-2px);
}

.action-btn.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.warning {
  background: #DC3545;
  color: white;
}

.action-btn.warning:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.action-btn.warning:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #F5F5F5;
  color: #2C3E50;
  border: 1px solid #E0E0E0;
}

.action-btn.secondary:hover {
  background: #E0E0E0;
  transform: translateY(-2px);
}

.action-btn.outline {
  background: white;
  color: #0F4C3A;
  border: 1px solid #0F4C3A;
}

.action-btn.outline:hover {
  background: #0F4C3A;
  color: white;
}

.action-btn.disabled {
  background: #F5F5F5;
  color: #757575;
  cursor: not-allowed;
}

/* Contact card */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  gap: 15px;
}

.contact-item i {
  width: 40px;
  height: 40px;
  background: #F5F5F5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F4C3A;
}

.contact-content {
  flex: 1;
}

.contact-label {
  font-size: 0.85rem;
  color: #757575;
  margin-bottom: 5px;
}

.contact-value {
  font-weight: 600;
  color: #2C3E50;
}

.contact-note {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 10px;
  color: #757575;
  font-size: 0.9rem;
}

.contact-note i {
  color: #0F4C3A;
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
@media (max-width: 1024px) {
  .detalle-content {
    grid-template-columns: 1fr;
  }
  
  .detalle-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-actions {
    align-items: stretch;
    width: 100%;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detalle-container {
    padding: 20px;
  }
  
  .actividad-titulo {
    font-size: 1.5rem;
  }
  
  .status-stats {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    padding: 12px;
  }
  
  .toast {
    left: 20px;
    right: 20px;
    bottom: 20px;
    min-width: auto;
  }
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
/* Agrega estos estilos al final de la sección <style> */
.btn-asistencia-inactiva {
  background: #F5F5F5;
  color: #757575;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  cursor: not-allowed;
}
</style>
[file content end]