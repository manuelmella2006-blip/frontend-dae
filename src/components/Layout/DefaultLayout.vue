<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
</script>