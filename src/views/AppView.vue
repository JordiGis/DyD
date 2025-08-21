<template>
    <component :is="currentComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CombatView from '../views/CombatView.vue'

const route = useRoute()

// Determinar qué componente mostrar basado en los query parameters
const currentComponent = computed(() => {
    const query = route.query
    
    // Si tiene el parámetro 'combat', mostrar CombatView
    if (query.hasOwnProperty('combat')) {
        return CombatView
    }
    
    // Por defecto, mostrar HomeView
    return HomeView
})
</script>
