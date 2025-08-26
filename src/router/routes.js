// src/router/routes.js
import HomeView from '../views/HomeView.vue'
import CharacterConfigView from '../views/CharacterConfigView.vue'
import CharacterView from '../views/CharacterView.vue'

const routes = [
    { path: '/', component: HomeView, name: 'home' },
    { path: '/config', component: CharacterConfigView, name: 'config' },
    { path: '/character', component: CharacterView, name: 'character' },
    // Redirección para cualquier ruta no encontrada
    { 
        path: '/:pathMatch(.*)*', 
        redirect: '/' 
    }
]

export default routes