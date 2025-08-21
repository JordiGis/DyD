// src/router/routes.js
import AppView from '../views/AppView.vue'

const routes = [
    { path: '/', redirect: '/DyD/' },
    { path: '/DyD/', component: AppView, name: 'app' },
    // Redirección para cualquier ruta no encontrada
    { 
        path: '/:pathMatch(.*)*', 
        redirect: '/DyD/' 
    }
]

export default routes