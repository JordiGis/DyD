// src/router/routes.js
import HomeView from '../views/HomeView.vue'
import CharacterConfigView from '../views/CharacterConfigView.vue'
import CharacterView from '../views/CharacterView.vue'
import LogsView from '../views/LogsView.vue'

const routes = [
    { path: '/', component: HomeView, name: 'home' },
    { path: '/config', component: CharacterConfigView, name: 'config' },
    { path: '/character', component: CharacterView, name: 'character' },
    { path: '/logs', component: LogsView, name: 'logs' },
    // Redirección para cualquier ruta no encontrada
    { 
        path: '/:pathMatch(.*)*', 
        redirect: '/' 
    }
]

export default routes