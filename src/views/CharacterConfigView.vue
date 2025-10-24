<template>
  <div class="character-config-container fade-in">
    <div class="config-card">
      <h1 class="config-title">Configuración del Personaje</h1>
      
      <form @submit.prevent="saveConfiguration" class="config-form">
        <div class="form-group">
          <label for="characterName" class="form-label">Nombre del Personaje</label>
          <input
            id="characterName"
            v-model="characterName"
            type="text"
            class="form-control"
            placeholder="Ej: Gandalf, Aragorn..."
            required
          />
        </div>
        
        <div class="form-group">
          <label for="maxHp" class="form-label">Puntos de Vida Máximos</label>
          <input
            id="maxHp"
            v-model.number="maxHp"
            type="number"
            class="form-control"
            min="1"
            max="999"
            placeholder="Ej: 50"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="regeneration" class="form-label">Regeneración Pasiva por Turno</label>
          <input
            id="regeneration"
            v-model.number="regeneration"
            type="number"
            class="form-control"
            min="0"
            max="50"
            placeholder="Ej: 5 (opcional)"
          />
          <small class="form-text">Deja en 0 si no hay regeneración</small>
        </div>
        
        <button type="submit" class="btn btn-primary btn-save">
          Guardar Configuración
        </button>
      </form>
      
      <CharacterStateManager />

      <div v-if="hasExistingData" class="existing-data">
        <h3>Datos Existentes</h3>
        <p>Ya tienes un personaje configurado. ¿Quieres cargarlo o crear uno nuevo?</p>
        <div class="btn-group">
          <button @click="loadExistingData" class="btn btn-secondary">
            Cargar Existente
          </button>
          <button @click="clearExistingData" class="btn btn-danger">
            Crear Nuevo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import Swal from 'sweetalert2'
import CharacterStateManager from '../components/CharacterStateManager.vue'

const router = useRouter()
const characterStore = useCharacterStore()

const characterName = ref('')
const maxHp = ref(50)
const regeneration = ref(0)
const hasExistingData = ref(false)

onMounted(() => {
  // Cargar datos existentes del localStorage
  characterStore.loadFromLocalStorage()
  
  // Verificar si ya hay datos configurados
  if (characterStore.character.isConfigured) {
    hasExistingData.value = true
    characterName.value = characterStore.character.name
    maxHp.value = characterStore.character.maxHp
    regeneration.value = characterStore.character.regeneration
  }
})

const saveConfiguration = () => {
  if (!characterName.value.trim() || maxHp.value <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor completa todos los campos correctamente'
    })
    return
  }
  
  try {
    characterStore.configureCharacter(
      characterName.value.trim(),
      maxHp.value,
      regeneration.value
    )
    
    Swal.fire({
      icon: 'success',
      title: '¡Configuración Guardada!',
      text: `${characterName.value} está listo para la aventura`,
      showConfirmButton: true
    }).then(() => {
      router.push('/character')
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar la configuración'
    })
  }
}

const loadExistingData = () => {
  router.push('/character')
}

const clearExistingData = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esto eliminará todos los datos del personaje actual',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      characterStore.clearData()
      hasExistingData.value = false
      characterName.value = ''
      maxHp.value = 50
      regeneration.value = 0
      
      Swal.fire({
        icon: 'success',
        title: 'Datos Eliminados',
        text: 'Puedes crear un nuevo personaje'
      })
    }
  })
}
</script>

<style scoped>
.character-config-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 56px);
  padding: 20px;
}

.config-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 100%;
}

.config-title {
  color: #f39c12;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #ecf0f1;
  font-weight: 600;
  font-size: 1.1rem;
}

.form-control {
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.form-control::placeholder {
  color: rgba(236, 240, 241, 0.6);
}

.form-text {
  color: rgba(236, 240, 241, 0.7);
  font-size: 0.9rem;
  font-style: italic;
}

.btn-save {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
}

.existing-data {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.existing-data h3 {
  color: #ecf0f1;
  margin-bottom: 15px;
}

.existing-data p {
  color: rgba(236, 240, 241, 0.8);
  margin-bottom: 20px;
}

.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .config-container {
    padding: 15px;
    min-height: calc(100vh - 65px);
  }
  
  .config-card {
    padding: 25px 20px;
    margin: 10px;
    border-radius: 15px;
  }
  
  .config-title {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  
  .form-control {
    padding: 14px 16px;
    font-size: 1rem;
    border-radius: 10px;
    min-height: 50px;
  }
  
  .form-text {
    font-size: 0.85rem;
    margin-top: 6px;
  }
  
  .btn-save {
    width: 100%;
    padding: 18px 20px;
    font-size: 1.1rem;
    min-height: 60px;
    border-radius: 12px;
    margin-top: 15px;
  }
  
  .existing-data {
    margin-top: 25px;
    padding-top: 25px;
  }
  
  .existing-data h3 {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
  
  .existing-data p {
    font-size: 0.95rem;
    margin-bottom: 18px;
  }
  
  .btn-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn {
    width: 100%;
    padding: 16px 20px;
    min-height: 55px;
    font-size: 1rem;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .config-container {
    padding: 10px;
  }
  
  .config-card {
    padding: 20px 15px;
    margin: 5px;
  }
  
  .config-title {
    font-size: 1.8rem;
    margin-bottom: 18px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-label {
    font-size: 0.95rem;
  }
  
  .form-control {
    padding: 16px 14px;
    font-size: 1rem;
    min-height: 55px;
  }
  
  .btn-save {
    padding: 20px 16px;
    min-height: 65px;
    font-size: 1.15rem;
  }
  
  .existing-data {
    margin-top: 20px;
    padding-top: 20px;
  }
  
  .existing-data h3 {
    font-size: 1.2rem;
  }
  
  .btn {
    padding: 18px 16px;
    min-height: 60px;
    font-size: 1.05rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn-save:hover,
  .btn:hover {
    transform: none;
  }
  
  .btn-save:active,
  .btn:active {
    transform: scale(0.98);
  }
  
  .form-control:focus {
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.3);
  }
}
</style>
