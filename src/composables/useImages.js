// src/composables/useImages.js
import { ref, computed } from 'vue'

// Importar todas las imágenes directamente
import EscanorImg from '/public/Escanor.png?url'
import EscanorFinalyImg from '/public/EscanorFinaly.png?url'
import EscanorNocheImg from '/public/EscanorNoche.png?url'
import TheOneImg from '/public/TheOne.png?url'
import IconImg from '/public/icon.png?url'

export function useImages() {
    // Mapeo de nombres de archivo a imports
    const imageMap = {
        'Escanor.png': EscanorImg,
        'EscanorFinaly.png': EscanorFinalyImg,
        'EscanorNoche.png': EscanorNocheImg,
        'TheOne.png': TheOneImg,
        'icon.png': IconImg
    }

    const getImageUrl = (imageName) => {
        // Primero intentar con el mapa de imports
        if (imageMap[imageName]) {
            console.log('Using imported image:', imageName, '→', imageMap[imageName])
            return imageMap[imageName]
        }
        
        // Fallback con BASE_URL
        const url = `${import.meta.env.BASE_URL}${imageName}`
        console.log('Using BASE_URL for image:', imageName, '→', url)
        return url
    }

    return {
        getImageUrl
    }
}
