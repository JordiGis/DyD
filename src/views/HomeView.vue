<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="text-center mb-5">
                        <h1 class="display-4 mb-4">¡Bienvenido!</h1>
                        <p class="lead mb-4">Esta es tu aplicación base de Vue.js</p>
                        <p class="text-muted">
                            Construida con Vue 3, Vue Router, Pinia y Bootstrap 5
                        </p>
                        
                        <div class="mt-4">
                            <button @click="incrementCounter" class="btn btn-primary me-2">
                                Contador: {{ counter }}
                            </button>
                            <button @click="resetCounter" class="btn btn-outline-secondary">
                                Resetear
                            </button>
                        </div>
                    </div>
                    
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <ExampleComponent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ExampleComponent from '../components/ExampleComponent.vue'

// Estado reactivo simple
const counter = ref(0)

// Métodos
const incrementCounter = () => {
    counter.value++
}

const resetCounter = () => {
    counter.value = 0
}
</script>

<style scoped>
/* Estilos específicos del componente */
</style>
