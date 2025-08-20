<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <AppHeader />
    
    <main class="container-fluid mx-auto px-5 py-5">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Estilos globales para la aplicación */
</style>
