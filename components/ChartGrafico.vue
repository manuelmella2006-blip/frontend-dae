<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: Array,
  type: {
    type: String,
    default: 'bar'
  }
});

const chartCanvas = ref(null);
let chartInstance = null;

onMounted(() => {
  if (props.data && props.data.length > 0) {
    renderChart();
  }
});

watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (props.data && props.data.length > 0) {
    renderChart();
  }
});

const renderChart = () => {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  
  chartInstance = new Chart(ctx, {
    type: props.type,
    data: {
      labels: props.data.map(d => d.mes.substring(5)),
      datasets: [{
        label: 'Participantes',
        data: props.data.map(d => d.participantes),
        backgroundColor: '#0F4C3A',
        borderColor: '#0F4C3A',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};
</script>