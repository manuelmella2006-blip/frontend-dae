<template>
  <div class="reportes-container">
    <!-- FILTERS -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Período</label>
        <select v-model="filters.periodo" @change="fetchReportData">
          <option value="semestre">Semestre Actual</option>
          <option value="mes">Último mes</option>
          <option value="trimestre">Últimos 3 meses</option>
          <option value="anual">Año completo</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Tipo de Actividad</label>
        <select v-model="filters.tipo" @change="fetchReportData">
          <option value="all">Todas</option>
          <option value="taller">Talleres</option>
          <option value="charla">Charlas</option>
          <option value="capacitacion">Capacitación</option>
          <option value="deportivo">Deportivo</option>
          <option value="cultural">Cultural</option>
          <option value="voluntariado">Voluntariado</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Carrera</label>
        <select v-model="filters.carrera" @change="fetchReportData">
          <option value="all">Todas las carreras</option>
          <option v-for="carrera in carrerasUnicas" :key="carrera" :value="carrera">
            {{ carrera }}
          </option>
        </select>
      </div>
      <div style="margin-top: auto;">
        <button class="btn btn-primary" @click="exportReport">
          <i class="fas fa-download"></i>
          Exportar Reporte
        </button>
      </div>
    </div>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.actividadesRealizadas }}</h3>
          <p>Actividades Realizadas</p>
          <div class="stat-trend" :class="stats.tendenciaActividades > 0 ? 'up' : 'down'">
            <i :class="stats.tendenciaActividades > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stats.tendenciaActividades) }}% vs periodo anterior
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.participantesUnicos }}</h3>
          <p>Participantes Únicos</p>
          <div class="stat-trend" :class="stats.tendenciaParticipantes > 0 ? 'up' : 'down'">
            <i :class="stats.tendenciaParticipantes > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stats.tendenciaParticipantes) }}% vs periodo anterior
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.tasaAsistencia }}%</h3>
          <p>Tasa de Asistencia</p>
          <div class="stat-trend" :class="stats.tendenciaAsistencia > 0 ? 'up' : 'down'">
            <i :class="stats.tendenciaAsistencia > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stats.tendenciaAsistencia) }}% vs periodo anterior
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.satisfaccionPromedio }}</h3>
          <p>Satisfacción Promedio</p>
          <div class="stat-trend" :class="stats.satisfaccionPromedio > 5.5 ? 'up' : 'down'">
            <i :class="stats.satisfaccionPromedio > 5.5 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            Meta: 5.5
          </div>
        </div>
      </div>
    </div>

    <!-- CHARTS AND DISTRIBUTION -->
    <div class="charts-grid">
      <div class="chart-card">
        <h2>
          <i class="fas fa-chart-line"></i>
          Participación por Mes
        </h2>
        <div class="chart-placeholder">
          <canvas ref="participationChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h2>
          <i class="fas fa-chart-pie"></i>
          Distribución por Tipo
        </h2>
        
        <div v-for="(dist, index) in distributionByType" :key="index" class="distribution-item">
          <div class="distribution-icon" :class="getDistributionIconClass(dist.tipo)">
            <i :class="getDistributionIcon(dist.tipo)"></i>
          </div>
          <div class="distribution-info">
            <div class="distribution-label">{{ formatTipo(dist.tipo) }}</div>
            <div class="distribution-value">{{ dist.cantidad }} actividades</div>
          </div>
          <div class="distribution-number">{{ dist.porcentaje }}%</div>
        </div>
      </div>
    </div>

    <!-- METRICS SECTION -->
    <div class="metrics-section">
      <div class="metrics-card">
        <h3>
          <i class="fas fa-venus-mars"></i>
          Participación por Género
        </h3>
        
        <div v-for="(value, key) in genderDistribution" :key="key" class="metric-row">
          <span class="metric-label">{{ formatGender(key) }}</span>
          <span class="metric-value">{{ value }}%</span>
          <div class="metric-bar">
            <div class="metric-bar-fill" :style="{ width: value + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <h3>
          <i class="fas fa-map-marker-alt"></i>
          Procedencia de Estudiantes
        </h3>
        
        <div v-for="(value, key) in locationDistribution" :key="key" class="metric-row">
          <span class="metric-label">{{ key }}</span>
          <span class="metric-value">{{ value }}%</span>
          <div class="metric-bar">
            <div class="metric-bar-fill" :style="{ width: value + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <h3>
          <i class="fas fa-calendar-alt"></i>
          Participación por Año
        </h3>
        
        <div v-for="(value, key) in yearDistribution" :key="key" class="metric-row">
          <span class="metric-label">{{ key }}</span>
          <span class="metric-value">{{ value }}%</span>
          <div class="metric-bar">
            <div class="metric-bar-fill" :style="{ width: value + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="metrics-card">
        <h3>
          <i class="fas fa-trophy"></i>
          Top 5 Actividades
        </h3>

        <div v-for="(activity, index) in topActivities" :key="activity.id" class="top-activity">
          <div class="activity-rank">{{ index + 1 }}</div>
          <div class="activity-details">
            <div class="activity-name">{{ activity.titulo }}</div>
            <div class="activity-participants">{{ activity.inscritos }} participantes</div>
          </div>
          <div class="activity-score">{{ activity.tasaAsistencia }}%</div>
        </div>
      </div>
    </div>

    <!-- INSIGHTS -->
    <div class="insights-card">
      <h3>
        <i class="fas fa-lightbulb"></i>
        Insights y Recomendaciones
      </h3>
      <p v-for="insight in insights" :key="insight.id">
        <strong>{{ insight.icon }} {{ insight.title }}:</strong> {{ insight.description }}
      </p>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin fa-3x"></i>
        <p>Cargando reportes...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { reportesService } from '@/services/reportesService'; // Importa el servicio real

Chart.register(...registerables);

// Refs y estado
const loading = ref(true);
const participationChart = ref(null);
let chartInstance = null;

// Filtros
const filters = reactive({
  periodo: 'semestre',
  tipo: 'all',
  carrera: 'all'
});

// Datos del reporte
const reportData = reactive({
  stats: {},
  activities: [],
  participants: [],
  attendances: [],
  distributionByType: [],
  genderDistribution: {},
  locationDistribution: {},
  yearDistribution: {},
  topActivities: [],
  insights: []
});

// Computed properties
const stats = computed(() => ({
  actividadesRealizadas: reportData.stats?.actividades?.total || 0,
  participantesUnicos: reportData.stats?.participantes?.unicos || 0,
  tasaAsistencia: reportData.stats?.asistencias?.tasa_asistencia || 0,
  satisfaccionPromedio: reportData.stats?.satisfaccion || 0,
  tendenciaActividades: reportData.stats?.actividades?.tendencia || 0,
  tendenciaParticipantes: reportData.stats?.participantes?.tendencia || 0,
  tendenciaAsistencia: reportData.stats?.asistencias?.tendencia || 0
}));

const distributionByType = computed(() => reportData.distribuciones?.por_tipo || []);
const genderDistribution = computed(() => reportData.distribuciones?.por_genero || {});
const locationDistribution = computed(() => reportData.distribuciones?.por_sede || {});
const yearDistribution = computed(() => reportData.distribuciones?.por_anio || {});
const topActivities = computed(() => reportData.top_actividades || []);
const insights = computed(() => reportData.insights || []);
const carrerasUnicas = computed(() => {
  const carreras = new Set();
  // Si tienes datos de participantes con carrera
  Object.keys(reportData.distribuciones?.por_carrera || {}).forEach(carrera => {
    if (carrera && carrera !== 'No especificada') {
      carreras.add(carrera);
    }
  });
  return Array.from(carreras).sort();
});

// Métodos
const fetchReportData = async () => {
  loading.value = true;
  try {
    // Obtener datos del backend usando el servicio real
    const response = await reportesService.getGeneralStats(filters);
    
    // Asignar los datos del backend directamente
    Object.assign(reportData, response);
    
    // Crear/actualizar gráfico con datos reales
    await nextTick();
    createParticipationChart();
    
    // También obtener datos mensuales para el gráfico
    if (participationChart.value) {
      await updateChartWithRealData();
    }
    
  } catch (error) {
    console.error('Error fetching report data:', error);
  } finally {
    loading.value = false;
  }
};

const updateChartWithRealData = async () => {
  try {
    // Obtener datos mensuales para el gráfico
    const monthlyData = await reportesService.getMonthlyParticipation(filters);
    
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = participationChart.value?.getContext('2d');
    if (!ctx) return;

    // Usar datos reales del backend
    const labels = monthlyData.map(item => item.mes_nombre);
    const data = monthlyData.map(item => item.inscritos);

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Participantes',
          data: data,
          borderColor: '#0F4C3A',
          backgroundColor: 'rgba(15, 76, 58, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Participantes'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error updating chart with real data:', error);
    // Si hay error, crear gráfico con datos de ejemplo
    createParticipationChart();
  }
};

const createParticipationChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = participationChart.value?.getContext('2d');
  if (!ctx) return;

  // Datos de ejemplo - solo si no hay datos reales
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const data = labels.map(() => Math.floor(Math.random() * 200) + 50);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Participantes',
        data: data,
        borderColor: '#0F4C3A',
        backgroundColor: 'rgba(15, 76, 58, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Participantes'
          }
        }
      }
    }
  });
};

// Las funciones auxiliares (formatTipo, getDistributionIcon, etc.) se mantienen igual
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

const getDistributionIcon = (tipo) => {
  const icons = {
    'taller': 'fas fa-users',
    'charla': 'fas fa-comments',
    'capacitacion': 'fas fa-graduation-cap',
    'deportivo': 'fas fa-futbol',
    'cultural': 'fas fa-palette',
    'voluntariado': 'fas fa-hands-helping',
    'otros': 'fas fa-ellipsis-h'
  };
  return icons[tipo] || 'fas fa-ellipsis-h';
};

const getDistributionIconClass = (tipo) => {
  const classes = {
    'taller': 'tal',
    'charla': 'cha',
    'capacitacion': 'cap',
    'deportivo': 'dep',
    'cultural': 'cul',
    'voluntariado': 'vol',
    'otros': 'oth'
  };
  return classes[tipo] || 'oth';
};

const formatGender = (gender) => {
  const genders = {
    'M': 'Masculino',
    'F': 'Femenino',
    'O': 'Otro/No especifica',
    'No especificado': 'No especificado'
  };
  return genders[gender] || gender;
};

const exportReport = async () => {
  try {
    // Usar el servicio de exportación
    const response = await reportesService.exportReport({
      periodo: filters.periodo,
      tipo: filters.tipo,
      carrera: filters.carrera
    }, 'json');
    
    // Si el backend devuelve la URL del archivo
    if (response.url) {
      window.open(response.url, '_blank');
    } else {
      // Exportar localmente como JSON
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `reporte-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Error al exportar el reporte');
  }
};

// Lifecycle
onMounted(async () => {
  await fetchReportData();
});

// Watchers
watch(filters, () => {
  fetchReportData();
});
</script>

<style scoped>
.reportes-container {
  padding: 20px;
  position: relative;
  min-height: 500px;
}

/* Filtros */
.filters-bar {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2C3E50;
}

.filter-group select {
  padding: 12px 15px;
  border: 2px solid #E9ECEF;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #0F4C3A;
}

/* Stats Grid */
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
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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

.stat-icon.green { background: #E8F5E9; color: #0F4C3A; }
.stat-icon.blue { background: #E3F2FD; color: #1976D2; }
.stat-icon.orange { background: #FFF3E0; color: #F57C00; }
.stat-icon.purple { background: #F3E5F5; color: #7B1FA2; }

.stat-content h3 {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 5px;
}

.stat-content p {
  color: #7F8C8D;
  font-size: 0.9rem;
}

.stat-trend {
  font-size: 0.85rem;
  margin-top: 5px;
}

.stat-trend.up { color: #28A745; }
.stat-trend.down { color: #DC3545; }

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.chart-card h2 {
  color: #2C3E50;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
}

.chart-placeholder {
  height: 300px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Distribution Items */
.distribution-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #F8F9FA;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.distribution-item:hover {
  background: #E9ECEF;
  transform: translateX(5px);
}

.distribution-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.distribution-icon.cap { background: #E8F5E9; color: #0F4C3A; }
.distribution-icon.tal { background: #E3F2FD; color: #1976D2; }
.distribution-icon.cha { background: #FFF3E0; color: #F57C00; }
.distribution-icon.dep { background: #F3E5F5; color: #7B1FA2; }
.distribution-icon.cul { background: #FCE4EC; color: #C2185B; }
.distribution-icon.vol { background: #F3E5F5; color: #7B1FA2; }
.distribution-icon.oth { background: #F5F5F5; color: #757575; }

.distribution-info {
  flex: 1;
}

.distribution-label {
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 5px;
}

.distribution-value {
  font-size: 0.85rem;
  color: #7F8C8D;
}

.distribution-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F4C3A;
}

/* Metrics */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.metrics-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.metrics-card h3 {
  color: #2C3E50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #E9ECEF;
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-label {
  color: #2C3E50;
  font-weight: 500;
  flex: 1;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0F4C3A;
  margin: 0 15px;
}

.metric-bar {
  width: 100%;
  height: 8px;
  background: #E9ECEF;
  border-radius: 10px;
  margin-top: 8px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0F4C3A, #1B5E20);
  border-radius: 10px;
}

/* Top Activities */
.top-activity {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  background: #F8F9FA;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.top-activity:hover {
  background: #E9ECEF;
  transform: translateX(5px);
}

.activity-rank {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0F4C3A, #1B5E20);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.activity-details {
  flex: 1;
}

.activity-name {
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 5px;
}

.activity-participants {
  font-size: 0.85rem;
  color: #7F8C8D;
}

.activity-score {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0F4C3A;
}

/* Insights */
.insights-card {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  padding: 25px;
  border-radius: 15px;
  border-left: 5px solid #0F4C3A;
  margin-top: 30px;
}

.insights-card h3 {
  color: #0F4C3A;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insights-card p {
  color: #2C3E50;
  line-height: 1.6;
  margin-bottom: 10px;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: #0F4C3A;
}

.loading-spinner i {
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-section {
    grid-template-columns: 1fr;
  }
  
  .chart-placeholder {
    height: 250px;
  }
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
</style>