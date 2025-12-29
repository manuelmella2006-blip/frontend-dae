<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/dashboard" class="text-xl font-bold text-blue-600">
              Sistema DAE
            </router-link>
          </div>
          
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- ... enlaces según rol ... -->
          </div>
        </div>
        
        <div class="flex items-center">
          <div class="ml-3 relative">
            <div class="flex items-center space-x-4">
              <!-- Dropdown de usuario -->
              <div class="relative">
                <button
                  @click="toggleDropdown"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span class="text-gray-700 hover:text-gray-900">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {{ userName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="ml-2 text-left">
                        <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
                        <p class="text-xs text-gray-500">{{ userRole }}</p>
                      </div>
                      <svg class="ml-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </span>
                </button>
                
                <!-- Dropdown menu -->
                <div
                  v-if="dropdownOpen"
                  @click.away="dropdownOpen = false"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="px-4 py-2 border-b">
                    <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                    <p class="text-xs text-gray-500">{{ user?.correo }}</p>
                    <p class="text-xs text-gray-500">{{ userRole }}</p>
                  </div>
                  
                  <router-link
                    to="/dashboard"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </router-link>
                  
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <div class="flex items-center">
                      <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { ref, computed } from 'vue';

const authStore = useAuthStore();
const dropdownOpen = ref(false);

const userRole = computed(() => authStore.userRole);
const userName = computed(() => authStore.userName);
const user = computed(() => authStore.user);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>