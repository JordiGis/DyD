# D&D Life Tracker - Gestor de Vida para D&D

Esta es una aplicación completa para gestionar la vida de personajes en sesiones de Dungeons & Dragons, con funcionalidades tanto para jugadores individuales como para Dungeon Masters.

## 🎯 Funcionalidades Principales

### Para Jugadores Individuales
- **Puntos de Vida**: Gestión completa de HP máximo y actual
- **Vida Temporal**: Sistema de HP temporal que se consume primero
- **Sistema de Curación**: Curación inteligente con límites
- **Regeneración**: Regeneración pasiva por turno configurable
- **Control de Turnos**: Contador de turnos con gestión automática
- **Historial Completo**: Logs detallados de todas las acciones

### Para Dungeon Masters (DM)
- **Múltiples Personajes**: Crear y gestionar tantos personajes como necesites
- **Vista General**: Estado de vida de todos los personajes en un solo lugar
- **Gestión Masiva**: Control de turnos que afecta a todos los personajes
- **Acciones Rápidas**: Aplicar daño, curación y vida temporal a cualquier personaje
- **Importar/Exportar**: Funcionalidad para respaldar y compartir partidas

## ⚔️ Funcionalidades de Combate

### Gestión de Vida Individual
- Barra de vida visual con colores dinámicos según el porcentaje
- Entrada manual de HP
- Botones de daño y curación rápidos
- Acciones rápidas con valores personalizables
- Sistema de vida temporal que se consume antes que la vida real

### Gestión de Vida para DM
- **Vista de Estado**: Ver el HP de todos los personajes de un vistazo
- **Acciones Masivas**: Aplicar daño, curación o vida temporal a múltiples personajes
- **Control de Turnos**: Sistema de turnos que afecta a todos los personajes
- **Regeneración Automática**: Aplicar regeneración pasiva a todos los personajes
- **Estados Visuales**: Identificación rápida de personajes muertos, críticos o heridos

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

### Para Jugadores
- **Inicio**: Vista principal con resumen del estado del personaje
- **Configuración**: Crear y configurar tu personaje
- **Personaje**: Interface completa de gestión de combate individual
- **Historial**: Logs detallados de todas las acciones realizadas

### Para Dungeon Masters
- **DM**: Panel completo para gestionar múltiples personajes
- **Vista General**: Estado de vida de todos los personajes
- **Control de Turnos**: Gestión de turnos para toda la partida
- **Acciones Masivas**: Aplicar efectos a múltiples personajes

### Navegación General
- **Header**: Navegación con estado del personaje en tiempo real

## 🎨 Diseño

La aplicación utiliza una paleta de colores temática para D&D:
- **Dorado/Naranja**: Acentos principales y elementos interactivos (#f39c12, #e67e22)
- **Azul Oscuro**: Fondo principal y elementos de interfaz (#1a1a2e, #16213e)
- **Verde**: Elementos de curación y vida (#27ae60, #2ecc71)
- **Rojo**: Elementos de daño y peligro (#e74c3c, #c0392b)
- **Azul Claro**: Vida temporal y elementos informativos (#3498db)

## 🌐 Demo

La aplicación está desplegada en: [https://jordigis.github.io/DyD/](https://jordigis.github.io/DyD/)

## 📋 Estructura del Proyecto

```
src/
├── components/
│   └── AppHeader.vue       # Navegación principal con enlaces a todas las vistas
├── views/
│   ├── HomeView.vue        # Página principal con funcionalidades
│   ├── CharacterConfigView.vue  # Configuración de personaje individual
│   ├── CharacterView.vue        # Vista de personaje individual
│   ├── LogsView.vue             # Historial de acciones del personaje
│   └── DMView.vue               # Panel del Dungeon Master
├── stores/
│   ├── useCharacterStore.js     # Estado del personaje individual
│   ├── useGameStore.js          # Estado global del juego
│   └── useDMStore.js            # Estado para gestión de múltiples personajes
├── router/
│   ├── index.js
│   └── routes.js
├── assets/
└── App.vue
```

## 🔧 Estado del Personaje

### Personaje Individual
El estado se gestiona mediante Pinia y incluye:

```javascript
character: {
    name: 'Nombre del Personaje',
    currentHp: 100,
    maxHp: 100,
    tempHp: 0,
    regeneration: 5,
    isConfigured: true
}
```

### Múltiples Personajes (DM)
El estado se gestiona mediante el store del DM y permite:

```javascript
characters: [
    {
        id: 'unique-id',
        name: 'Personaje 1',
        currentHp: 75,
        maxHp: 100,
        tempHp: 10,
        regeneration: 2,
        logs: [...]
    },
    // ... más personajes
]
```

## 🎯 Próximas Características

- [ ] Sistema de hechizos y habilidades
- [ ] Efectos y condiciones de estado
- [ ] Calculadora de daño avanzada
- [ ] Sistema de iniciativa y orden de turnos
- [ ] Gestión de NPCs y enemigos
- [ ] Sistema de experiencia y niveles
- [ ] Integración con APIs de D&D

## 🎭 Casos de Uso

### Para Jugadores
- **Sesiones Individuales**: Gestionar tu personaje durante el combate
- **Seguimiento de HP**: Mantener un registro preciso de tu estado
- **Historial de Acciones**: Revisar qué pasó en combates anteriores

### Para Dungeon Masters
- **Gestión de Combate**: Controlar múltiples personajes simultáneamente
- **Partidas Complejas**: Manejar grupos grandes de jugadores
- **Respaldo de Partidas**: Exportar e importar estados de partidas
- **Control de Turnos**: Gestionar el flujo del combate de manera eficiente

---

*"La aventura espera a aquellos que se atreven a buscarla."* - D&D