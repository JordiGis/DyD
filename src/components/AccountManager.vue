<template>
  <div class="account-manager-overlay" @click.self="props.onClose">
    <div class="account-manager-content">
      <div class="account-manager-header">
        <h2><i class="bi bi-person-badge-fill"></i> Gestión de Cuenta</h2>
        <button @click="props.onClose" class="btn-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="account-manager-body">
        <!-- Sección de Exportación -->
        <div class="account-section">
          <h3><i class="bi bi-cloud-download-fill"></i> Exportar Datos</h3>
          <p>Guarda todos tus datos (personajes, DM, jugadores, etc.) en un archivo JSON para tener una copia de seguridad o para transferirlos a otro dispositivo.</p>
          <button @click="exportData" class="btn btn-primary">
            <i class="bi bi-download"></i> Exportar a Archivo
          </button>
        </div>

        <!-- Sección de Importación -->
        <div class="account-section">
          <h3><i class="bi bi-cloud-upload-fill"></i> Importar Datos</h3>
          <p>Pega el contenido de un archivo JSON exportado para cargar todos los datos en esta sesión. <strong>Advertencia:</strong> Esto reemplazará todos los datos actuales.</p>
          <textarea
            v-model="importJson"
            placeholder="Pega aquí el contenido de tu archivo JSON..."
            rows="6"
            class="import-textarea"
          ></textarea>
          <button @click="importData" :disabled="!importJson.trim()" class="btn btn-success">
            <i class="bi bi-upload"></i> Importar Datos
          </button>
        </div>

        <!-- Sección de Peligro -->
        <div class="account-section danger-zone">
          <h3><i class="bi bi-exclamation-triangle-fill"></i> Zona de Peligro</h3>
          <p>Esta acción eliminará permanentemente todos los datos de la aplicación de tu navegador. <strong>No se puede deshacer.</strong></p>
          <button @click="clearAllData" class="btn btn-danger">
            <i class="bi bi-trash-fill"></i> Borrar Todos los Datos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue';
import { useAccountStore } from '../stores/useAccountStore';
import Swal from 'sweetalert2';

const props = defineProps({
  onClose: {
    type: Function,
    required: true
  }
});

const accountStore = useAccountStore();
const importJson = ref('');

onMounted(() => {
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleEscape);
});

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    props.onClose();
  }
};

const exportData = () => {
  try {
    const jsonString = accountStore.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-account-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: '¡Exportado!',
      text: 'Tus datos se han guardado en un archivo JSON.',
      customClass: { container: 'high-z-index' },
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al Exportar',
      text: 'No se pudieron exportar los datos.',
      customClass: { container: 'high-z-index' },
    });
  }
};

const importData = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'La importación reemplazará todos tus datos actuales. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, importar',
    cancelButtonText: 'Cancelar',
    customClass: { container: 'high-z-index' },
  }).then((result) => {
    if (result.isConfirmed) {
      const { success, error } = accountStore.importData(importJson.value);
      if (success) {
        Swal.fire({
          title: '¡Importado!',
          text: 'Tus datos han sido cargados. La aplicación se recargará.',
          icon: 'success',
          customClass: { container: 'high-z-index' },
        }).then(() => {
          // La recarga ya la maneja el store, aquí solo cerramos el modal
          props.onClose();
        });
      } else {
        Swal.fire({
          title: 'Error de Importación',
          text: error,
          icon: 'error',
          customClass: { container: 'high-z-index' },
        });
      }
    }
  });
};

const clearAllData = () => {
  Swal.fire({
    title: '¿BORRAR TODOS LOS DATOS?',
    text: 'Esta acción es irreversible y eliminará todo. ¿Estás completamente seguro?',
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, borrar todo',
    cancelButtonText: 'Cancelar',
    customClass: { container: 'high-z-index' },
  }).then((result) => {
    if (result.isConfirmed) {
      accountStore.clearAllData();
      // La recarga la maneja el store
    }
  });
};
</script>

<style scoped>
/* Estilos similares a PlayerManager.vue para consistencia */
:global(body.modal-open) {
  overflow: hidden;
}

:global(.swal2-container.high-z-index) {
  z-index: 1300 !important;
}

.account-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.account-manager-content {
  background: linear-gradient(145deg, #2c2f33, #23272a);
  color: #f0f0f0;
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(243, 156, 18, 0.2);
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.account-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #2980b9, #3498db);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
}

.account-manager-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

.account-manager-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.account-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.account-section h3 {
  color: #f0f0f0;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-section p {
  color: #b9bbbe;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

.import-textarea {
  width: 100%;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #f0f0f0;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  margin-bottom: 16px;
  min-height: 120px;
  transition: all 0.3s ease;
}

.import-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.danger-zone {
  border-color: rgba(231, 76, 60, 0.4);
}

.danger-zone h3 {
  color: #e74c3c;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}
</style>
