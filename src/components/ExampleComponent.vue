<template>
    <div class="card">
        <div class="card-body text-center">
            <i class="bi bi-lightbulb fs-1 text-warning mb-3"></i>
            <h5 class="card-title">Componente de Ejemplo</h5>
            <p class="card-text">
                Este es un componente básico que puedes usar como plantilla para crear otros componentes.
            </p>
            <button @click="showAlert" class="btn btn-primary">
                ¡Haz clic aquí!
            </button>
        </div>
    </div>
</template>

<script setup>
const showAlert = () => {
    alert('¡Componente funcionando correctamente!')
}
</script>

<style scoped>
.card {
    max-width: 400px;
    margin: 0 auto;
}
</style>
