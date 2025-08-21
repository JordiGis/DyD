// src/router/routes.js
import HomeView from '../views/HomeView.vue'
import CombatView from '../views/CombatView.vue'

const routes = [
    { path: '/', component: HomeView, name: 'home' },
    { path: '/combat', component: CombatView, name: 'combat' },
]

export default routes