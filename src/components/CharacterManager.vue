<template>
  <div class="character-manager card">
    <div class="card-header">
      <h2>Gestor de Personajes</h2>
    </div>
    <div class="card-body">
      <ul class="list-group">
        <li v-for="character in characters" :key="character.id" class="list-group-item d-flex justify-content-between align-items-center" :class="{ 'active': character.id === activeCharacterId }">
          {{ character.characterData.character.name }}
          <div>
            <button @click="setActive(character.id)" class="btn btn-primary btn-sm me-2" :disabled="character.id === activeCharacterId">
              Cargar
            </button>
            <button @click="exportCharacter(character.id)" class="btn btn-secondary btn-sm me-2">
              Exportar
            </button>
            <button @click="deleteCharacter(character.id)" class="btn btn-danger btn-sm">
              Eliminar
            </button>
          </div>
        </li>
      </ul>
      <div class="mt-3">
        <button @click="createNewCharacter" class="btn btn-success me-2">
          Crear Nuevo Personaje
        </button>
        <button @click="importCharacter" class="btn btn-info">
          Importar Personaje
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
  Swal.fire('Éxito', 'Personaje cargado correctamente.', 'success');
};

const createNewCharacter = () => {
  const newCharacterId = uuidv4();
  const newCharacter = {
    id: newCharacterId,
    characterData: {
      character: { isConfigured: false },
      turn: { current: 0, isActive: false },
      logs: [],
    },
    attacks: [],
    passiveDamages: [],
    counters: [],
    characterState: [],
  };

  accountStore.accountData.characters.push(newCharacter);
  accountStore.accountData.activeCharacterId = newCharacterId;
  accountStore.saveDataToLocalStorage();

  router.push('/config');
};

const deleteCharacter = (characterId) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, ¡bórralo!'
  }).then((result) => {
    if (result.isConfirmed) {
      accountStore.accountData.characters = accountStore.accountData.characters.filter(c => c.id !== characterId);

      if (accountStore.accountData.activeCharacterId === characterId) {
        accountStore.accountData.activeCharacterId = null;
        if (accountStore.accountData.characters.length > 0) {
          accountStore.accountData.activeCharacterId = accountStore.accountData.characters[0].id;
        }
      }

      accountStore.saveDataToLocalStorage();
      characterStore.loadAllCharacterData();

      Swal.fire(
        '¡Borrado!',
        'Tu personaje ha sido eliminado.',
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
          newCharacter.id = uuidv4(); // Asignar un nuevo ID para evitar colisiones
          accountStore.accountData.characters.push(newCharacter);
          accountStore.saveDataToLocalStorage();
          Swal.fire('Éxito', 'Personaje importado correctamente.', 'success');
        } else {
          Swal.fire('Error', 'El archivo no tiene el formato de personaje esperado.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo leer el archivo.', 'error');
      }
    }
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
};

</script>

<style scoped>
.character-manager {
  margin: 20px;
}
</style>
