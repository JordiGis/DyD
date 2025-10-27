# D&D Life Tracker - Gestor de Vida para D&D

Esta es una aplicación completa para gestionar la vida de personajes en sesiones de Dungeons & Dragons, con funcionalidades tanto para jugadores individuales como para Dungeon Masters.

## 🎯 Funcionalidades Principales

### Para Jugadores Individuales
- **Puntos de Vida**: Gestión completa de HP máximo, actual y temporal.
- **Gestor de Ataques**: Crea y personaliza ataques con múltiples dados, modificadores y efectos.
- **Estados de Personaje**: Define diferentes estados para tu personaje, cada uno con su propia imagen para reflejar su aspecto actual (ej. normal, enfurecido, transformado).
- **Contadores Personalizados**: Añade contadores para gestionar cualquier recurso (puntos de ki, cargas de habilidad, etc.) con botones configurables.
- **Descansos Cortos y Largos**: Funciones para recuperar recursos y vida según las reglas de D&D.
- **Historial Completo**: Logs detallados de todas las acciones.

### Para Dungeon Masters (DM)
- **Gestión de Múltiples Personajes**: Crea, edita y gestiona NPCs y enemigos de forma masiva.
- **Panel de Combate Avanzado**: Controla el estado de todos los personajes, su HP y sus turnos.
- **Seguimiento de Derrotas**: Asigna quién ha derrotado a cada enemigo para un seguimiento narrativo y de experiencia.
- **Función de Revivir**: Revive a cualquier NPC con un solo clic, especificando la cantidad de vida.
- **Tirador de Dados Integrado**: Lanza dados directamente desde el panel del DM.
- **Lista de Tareas (To-do List)**: Gestiona notas y recordatorios importantes durante la sesión.
- **Importar/Exportar Partidas**: Guarda y carga el estado completo de tus encuentros.

## ⚔️ Gestión de Personajes (Jugador)

### Estados del Personaje
- **Imágenes Personalizadas**: Asigna una imagen diferente a cada "estado" de tu personaje (normal, furia, transformación, etc.) para visualizar su condición actual.
- **Cambio Rápido**: Cambia entre estados con un solo clic para que la imagen se actualice al instante.

### Gestor de Ataques
- **Ataques Complejos**: Configura ataques con múltiples tiradas de daño (ej. 2d6 + 1d8), modificadores fijos y efectos adicionales.
- **Críticos Configurables**: Define cómo se calculan los golpes críticos, ya sea duplicando los dados o tirando dados adicionales.
- **Robo de Vida (Lifesteal)**: Añade robo de vida a tus ataques para recuperar un porcentaje del daño infligido.

### Contadores y Recursos
- **Contadores Ilimitados**: Crea tantos contadores como necesites para gestionar puntos de ki, cargas de conjuros, usos de habilidad, etc.
- **Botones de Acceso Rápido**: Cada contador tiene botones personalizables (+1, -1, etc.) para un ajuste rápido.
- **Vinculación con Estados**: Asocia contadores a estados para que al activar un estado, se consuma automáticamente un recurso del contador.

### Descansos
- **Descanso Corto y Largo**: Recupera vida y recursos con las funciones de descanso, que reponen automáticamente los contadores según las reglas que hayas configurado.

## 🎲 Panel del Dungeon Master

### Combate y Seguimiento
- **Vista de Combate Centralizada**: Visualiza el HP, CA y estado de todos los NPCs y enemigos en una sola pantalla.
- **Asignación de Derrotas**: Cuando un enemigo es derrotado, puedes asignar el "golpe de gracia" a un jugador para llevar un registro.
- **Función de Revivir**: Revive a un NPC caído con la cantidad de HP que elijas.

### Herramientas del DM
- **Tirador de Dados**: Realiza cualquier tipo de tirada de dados (d4, d6, d8, d10, d12, d20, d100) directamente desde la aplicación.
- **Lista de Tareas (To-Do List)**: Mantén un registro de eventos importantes, recordatorios o ideas para la sesión.

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
│   ├── useCharacterStore.js     # Estado principal del personaje (vida, HP, etc.)
│   ├── useAttackStore.js        # Gestión de ataques y sus configuraciones
│   ├── useCharacterStateStore.js # Gestión de estados de personaje (imágenes)
│   ├── useCounterStore.js       # Gestión de contadores y recursos personalizados
│   ├── useGameStore.js          # Estado global del juego
│   └── useDMStore.js            # Lógica y estado del panel del Dungeon Master
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

- [x] **Gestor de Ataques**: Sistema completo para crear y gestionar ataques.
- [x] **Estados y Contadores**: Gestión de estados de personaje y contadores de recursos.
- [ ] **Sistema de Iniciativa**: Una herramienta integrada para gestionar el orden de turnos en combate.
- [ ] **Gestor de Inventario**: Para que los jugadores puedan llevar un registro de sus objetos.
- [ ] **Libro de Hechizos**: Una interfaz para que los lanzadores de conjuros gestionen sus hechizos preparados y disponibles.
- [ ] **Integración con APIs de D&D**: Para importar monstruos, hechizos y objetos directamente desde fuentes oficiales.
- [ ] **Modo Multijugador en Tiempo Real**: Sincronización en tiempo real entre la vista del DM y la de los jugadores.

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