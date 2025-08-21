// src/router/routes.js
import AppView from '../views/AppView.vue'

const routes = [
    { path: '/', component: AppView, name: 'app' },
    // Redirección para cualquier ruta no encontrada
    { 
        path: '/:pathMatch(.*)*', 
        redirect: '/' 
    }
]

export default routes