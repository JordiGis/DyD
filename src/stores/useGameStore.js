// src/stores/useAppStore.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        // Estado global de la aplicación
        user: null,
        theme: 'light',
        isLoading: false,
    }),
    
    getters: {
        // Getters calculados
        isLoggedIn: (state) => !!state.user,
        isDarkTheme: (state) => state.theme === 'dark',
    },
    
    actions: {
        // Acciones para modificar el estado
        setUser(userData) {
            this.user = userData
        },
        
        logout() {
            this.user = null
        },
        
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
        },
        
        setLoading(status) {
            this.isLoading = status
        }
    }
})
