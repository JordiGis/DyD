# Aplicación de Combate D&D - Escanor

Esta es una aplicación especializada para gestionar el combate de Escanor, el León del Orgullo, en sesiones de Dungeons & Dragons.

## 🦁 Características del Personaje

- **Puntos de Vida**: 246 HP máximos con gestión completa de daño y curación
- **Sistema de Furia**: Contador de furia con máximo de 3 cargas
- **Estados del Personaje**: 4 estados diferentes que afectan las estadísticas
- **Resistencias**: Sistema de resistencias activado por la furia

## ⚔️ Funcionalidades de Combate

### Gestión de Vida
- Barra de vida visual con colores dinámicos
- Entrada manual de HP
- Botones de daño y curación rápidos
- Acciones rápidas con valores personalizables

### Sistema de Furia
- **Contador**: Máximo 3 cargas, con botones para añadir/quitar
- **Activación**: La furia debe activarse manualmente usando las cargas
- **Resistencias**: Cuando está activa, otorga resistencia a:
  - Daño contundente
  - Daño perforante  
  - Daño cortante

### Estados del Personaje
1. **Noche** - Estado más débil
2. **Amanecer** - Despertar del poder
3. **Día** - Poder creciente
4. **El Cenit (The One)** - Poder absoluto

Cada estado tiene su imagen característica y color temático.

### Descansos
- **Descanso Largo**: Restaura HP completo y todas las cargas de furia
- **Descanso Corto**: Recupera 25% de HP y añade 1 carga de furia

## 🚀 Tecnologías Utilizadas

- **Vue 3** con Composition API
- **Vite** para desarrollo rápido
- **Vue Router** para navegación
- **Pinia** para gestión de estado
- **Bootstrap 5** para estilos y componentes
- **Bootstrap Icons** para iconografía

## 📦 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de la construcción
npm run preview

# Despliegue en GitHub Pages
npm run deploy
```

## 🎮 Navegación

- **Inicio**: Vista principal con resumen del estado del personaje
- **Combate**: Interface completa de gestión de combate
- **Header**: Navegación con estado del personaje en tiempo real

## 🎨 Diseño

La aplicación utiliza una paleta de colores inspirada en Escanor:
- **Dorado/Naranja**: Poder del sol (#f39c12, #e67e22)
- **Azul Oscuro**: Noche y misterio (#1a1a2e, #16213e)
- **Rojo**: Furia y combate (#e94560)

## 🌐 Demo

La aplicación está desplegada en: [https://jordigis.github.io/DyD/](https://jordigis.github.io/DyD/)

## 📋 Estructura del Proyecto

```
src/
├── components/
│   ├── AppHeader.vue       # Navegación con estado del personaje
│   └── ExampleComponent.vue
├── views/
│   ├── HomeView.vue        # Página principal temática
│   └── CombatView.vue      # Interface de combate completa
├── stores/
│   └── useGameStore.js     # Estado global del personaje
├── router/
│   ├── index.js
│   └── routes.js
├── assets/
└── App.vue
```

## 🔧 Estado del Personaje

El estado se gestiona mediante Pinia y incluye:

```javascript
character: {
    name: 'Escanor',
    currentHp: 246,
    maxHp: 246,
    furyCount: 0,
    maxFury: 3,
    isFuryActive: false,
    currentState: 'noche'
}
```

## 🎯 Próximas Características

- [ ] Modificadores de estadísticas por estado
- [ ] Sistema de hechizos y habilidades
- [ ] Historial de combate
- [ ] Efectos y condiciones de estado
- [ ] Calculadora de daño avanzada

---

*"¿Quién decidió eso? Solo hay una persona en este mundo que puede decidir lo que hago... y esa persona soy yo."* - Escanor