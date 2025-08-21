// src/utils/imageHelper.js

/**
 * Obtiene la URL correcta para una imagen en la carpeta public
 * considerando la configuración de base de Vite
 */
export function getImageUrl(imageName) {
    // Para desarrollo y producción con base path
    const baseUrl = import.meta.env.BASE_URL || '/'
    return `${baseUrl}${imageName}`
}

/**
 * URLs predefinidas para las imágenes del personaje
 */
export const characterImages = {
    escanor: () => getImageUrl('Escanor.png'),
    escanorFinaly: () => getImageUrl('EscanorFinaly.png'),
    escanorNoche: () => getImageUrl('EscanorNoche.png'),
    theOne: () => getImageUrl('TheOne.png'),
    icon: () => getImageUrl('icon.png')
}
