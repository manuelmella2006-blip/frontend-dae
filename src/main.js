import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import sessionManager from './utils/sessionManager'
import './assets/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
console.log('API URL:', import.meta.env.VITE_API_URL);
// NO iniciar sessionManager aquí, se hará desde el authStore después del login

// Montar la aplicación
app.mount('#app')