import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/',
      component: () => import('@/components/Layout/LayoutPrincipal.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },

        // ======================
        // ESTUDIANTE
        // ======================
        {
          path: '/estudiante/actividades',
          name: 'estudiante-actividades',
          component: () => import('@/views/estudiante/ActividadesView.vue'),
          meta: { roles: ['estudiante'] },
        },
        {
          path: '/estudiante/actividades/:id',
          name: 'estudiante-ver-actividad',
          component: () =>
            import('@/views/estudiante/VerDetalleActividadView.vue'),
          meta: { roles: ['estudiante'] },
        },
        {
          path: '/estudiante/mis-inscripciones',
          name: 'estudiante-mis-inscripciones',
          component: () => import('@/views/estudiante/MisInscripcionesView.vue'),
          meta: { roles: ['estudiante'] },
        },

        // ======================
        // ADMIN
        // ======================
        {
          path: '/admin/actividades',
          name: 'admin-actividades',
          component: () => import('@/views/admin/ActividadesView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },
        {
          path: '/admin/inscripciones',
          name: 'admin-inscripciones',
          component: () => import('@/views/admin/InscripcionesView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },
        {
          path: '/admin/actividades/nueva',
          name: 'nueva-actividad',
          component: () => import('@/views/admin/NuevaActividadView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },
        {
          path: '/admin/actividades/editar/:id',
          name: 'editar-actividad',
          component: () => import('@/views/admin/NuevaActividadView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },
        {
          path: '/admin/actividades/:id',
          name: 'ver-actividad',
          component: () => import('@/views/admin/VerActividadView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },

        // ======================
        // OTROS
        // ======================
        {
          path: '/asistencia',
          name: 'asistencia',
          component: () => import('@/views/AsistenciaQRView.vue'),
          meta: { roles: ['director', 'staff_dae', 'profesor'] },
        },
        {
          path: '/reportes',
          name: 'reportes',
          component: () => import('@/views/ReportesView.vue'),
          meta: { roles: ['director', 'staff_dae'] },
        },
        {
          path: '/perfil-estudiante',
          name: 'perfil-estudiante',
          component: () =>
            import('@/views/estudiante/PerfilEstudianteView.vue'),
          meta: { roles: ['estudiante'] },
        },
        {
          path: '/perfil',
          name: 'perfil',
          component: () => import('@/views/PerfilView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  const isAuthenticated = !!token && !!user

  if (token && user && !authStore.user) {
    authStore.token = token
    authStore.user = JSON.parse(user)
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return next('/dashboard')
  }

  if (to.meta.roles) {
    const userRole = authStore.userRole || authStore.user?.rol
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next('/dashboard')
    }
  }

  next()
})

export default router
