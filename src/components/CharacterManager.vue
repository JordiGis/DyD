<template>
  <div class="manager-container fade-in">
    <div class="manager-header">
      <h1><i class="bi bi-people-fill"></i> Gestor de Personajes</h1>
      <p class="manager-subtitle">Administra, crea, carga y comparte tus personajes</p>
    </div>

    <div class="manager-section">
      <div class="section-header">
        <h2><i class="bi bi-person-lines-fill"></i> Mis Personajes</h2>
      </div>
      <div class="section-content">
        <ul v-if="characters.length > 0" class="character-list">
          <li v-for="character in characters" :key="character.id"
              class="character-item"
              :class="{ 'active': character.id === activeCharacterId }">

            <div class="character-info">
              <i class="bi bi-person-circle character-icon"></i>
              <span class="character-name">{{ character.characterData.character.name || 'Personaje sin nombre' }}</span>
            </div>

            <div class="character-actions">
              <button @click="setActive(character.id)" class="btn btn-sm btn-primary" :disabled="character.id === activeCharacterId">
                <i class="bi bi-check-circle-fill"></i>
                <span>{{ character.id === activeCharacterId ? 'Cargado' : 'Cargar' }}</span>
              </button>
              <button @click="exportCharacter(character.id)" class="btn btn-sm btn-secondary">
                <i class="bi bi-box-arrow-up"></i>
                <span>Exportar</span>
              </button>
              <button @click="deleteCharacter(character.id)" class="btn btn-sm btn-danger">
                <i class="bi bi-trash-fill"></i>
                <span>Eliminar</span>
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="no-characters-message">
          <i class="bi bi-emoji-dizzy"></i>
          <p>No tienes ningún personaje todavía. ¡Crea uno para empezar!</p>
        </div>
      </div>
    </div>

    <div class="manager-section">
      <div class="section-header">
        <h2><i class="bi bi-plus-circle-fill"></i> Nuevas Aventuras</h2>
      </div>
      <div class="section-content action-buttons">
        <button @click="createNewCharacter" class="btn btn-success">
          <i class="bi bi-person-plus-fill"></i>
          <span>Crear Nuevo Personaje</span>
        </button>
        <button @click="importCharacter" class="btn btn-info">
          <i class="bi bi-box-arrow-down"></i>
          <span>Importar Personaje</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCharacterStore } from '@/stores/useCharacterStore';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';

const accountStore = useAccountStore();
const characterStore = useCharacterStore();
const router = useRouter();

const characters = computed(() => accountStore.accountData.characters);
const activeCharacterId = computed(() => accountStore.accountData.activeCharacterId);

const setActive = (characterId) => {
  characterStore.setActiveCharacter(characterId);
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Personaje cargado',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
};

const createNewCharacter = () => {
  const newCharacterId = uuidv4();
  const newCharacter = {
    id: newCharacterId,
    characterData: {
      character: { isConfigured: false, name: 'Nuevo Personaje' },
      turn: { current: 0, isActive: false },
      logs: [],
    },
    attacks: [],
    passiveDamages: [],
    counters: [],
    characterState: [],
  };

  accountStore.accountData.characters.push(newCharacter);
  characterStore.setActiveCharacter(newCharacterId);

  router.push('/config');
};

const deleteCharacter = (characterId) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, ¡bórralo!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      accountStore.accountData.characters = accountStore.accountData.characters.filter(c => c.id !== characterId);

      if (accountStore.accountData.activeCharacterId === characterId) {
        const newActiveId = accountStore.accountData.characters.length > 0 ? accountStore.accountData.characters[0].id : null;
        characterStore.setActiveCharacter(newActiveId);
      } else {
        accountStore.saveDataToLocalStorage();
      }

      Swal.fire(
        '¡Eliminado!',
        'El personaje ha sido eliminado.',
        'success'
      )
    }
  })
};

const exportCharacter = (characterId) => {
  const character = characters.value.find(c => c.id === characterId);
  if (character) {
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${character.characterData.character.name || 'character'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
};

const importCharacter = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = readerEvent => {
      try {
        const content = readerEvent.target.result;
        const newCharacter = JSON.parse(content);

        if (newCharacter.id && newCharacter.characterData) {
          newCharacter.id = uuidv4();
          accountStore.accountData.characters.push(newCharacter);
          accountStore.saveDataToLocalStorage();
          Swal.fire('¡Éxito!', 'Personaje importado correctamente.', 'success');
        } else {
          Swal.fire('Error', 'El archivo no tiene el formato de personaje esperado.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo leer o procesar el archivo.', 'error');
      }
    }
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
};
</script>

<style scoped>
.manager-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.manager-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(76, 41, 144, 0.1), rgba(111, 66, 194, 0.1));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.manager-header h1 {
  color: #c792ea;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.manager-subtitle {
  color: #b9bbbe;
  font-size: 1.1rem;
}

.manager-section {
  background: linear-gradient(145deg, #2c2f33, #23272a);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 30px;
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #4c2990, #6f42c2);
  padding: 18px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-content {
  padding: 25px;
}

.character-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.character-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.character-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(199, 146, 234, 0.3);
  transform: translateY(-2px);
}

.character-item.active {
  background: linear-gradient(135deg, rgba(199, 146, 234, 0.2), rgba(111, 66, 194, 0.2));
  border-color: #c792ea;
  box-shadow: 0 0 15px rgba(199, 146, 234, 0.2);
}

.character-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #ecf0f1;
}

.character-icon {
  font-size: 1.8rem;
  color: #c792ea;
}

.character-name {
  font-size: 1.1rem;
  font-weight: 500;
}

.character-actions {
  display: flex;
  gap: 10px;
}

.no-characters-message {
  text-align: center;
  padding: 40px 20px;
  color: #b9bbbe;
}

.no-characters-message i {
  font-size: 3rem;
  color: #6f42c2;
  margin-bottom: 15px;
}

.no-characters-message p {
  font-size: 1.1rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
  gap: 8px;
}

.btn i {
  font-size: 1.2em;
}

.btn-primary { background: linear-gradient(135deg, #3498db, #2980b9); color: white; }
.btn-secondary { background: linear-gradient(135deg, #95a5a6, #7f8c8d); color: white; }
.btn-danger { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; }
.btn-success { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; }
.btn-info { background: linear-gradient(135deg, #5dade2, #3498db); color: white; }
</style>
