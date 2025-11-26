// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useAccountStore } from './stores/useAccountStore';

const app = createApp(App);

// Crear e instalar Pinia
const pinia = createPinia();
app.use(pinia);

// Inicializar el store de la cuenta y cargar/migrar datos
const accountStore = useAccountStore();
accountStore.loadInitialData();

app.use(router);
app.mount('#app');
