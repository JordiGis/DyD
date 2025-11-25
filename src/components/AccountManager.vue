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
          <p>Guarda una copia de seguridad de todos tus personajes y configuraciones.</p>
          <button @click="exportData" class="btn btn-primary full-width">
            <i class="bi bi-download"></i> Descargar Copia de Seguridad
          </button>
        </div>

        <!-- Sección de Importación -->
        <div class="account-section">
          <h3><i class="bi bi-cloud-upload-fill"></i> Importar Datos</h3>
          <p>Restaura tus datos desde un archivo de copia de seguridad. <strong>Esto reemplazará los datos actuales.</strong></p>
          
          <div class="file-upload-container">
            <label for="file-upload" class="file-upload-label">
              <i class="bi bi-folder2-open"></i>
              <span>{{ fileName || 'Seleccionar archivo JSON...' }}</span>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept=".json" 
              @change="handleFileUpload" 
              class="file-input"
            />
          </div>

          <div v-if="importJson" class="preview-section">
             <p class="preview-text">Archivo cargado listo para importar.</p>
          </div>

          <button @click="importData" :disabled="!importJson" class="btn btn-success full-width">
            <i class="bi bi-upload"></i> Restaurar Datos
          </button>
        </div>

        <!-- Sección de Peligro -->
        <div class="account-section danger-zone">
          <h3><i class="bi bi-exclamation-triangle-fill"></i> Zona de Peligro</h3>
          <p>Eliminar todos los datos guardados en este navegador.</p>
          <button @click="clearAllData" class="btn btn-danger full-width">
            <i class="bi bi-trash-fill"></i> Borrar Todo
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
const fileName = ref('');

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

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    importJson.value = e.target.result;
  };
  reader.readAsText(file);
};

const exportData = () => {
  try {
    const jsonString = accountStore.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: '¡Exportado!',
      text: 'Copia de seguridad guardada correctamente.',
      customClass: { container: 'high-z-index' },
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron exportar los datos.',
      customClass: { container: 'high-z-index' },
    });
  }
};

const importData = () => {
  Swal.fire({
    title: '¿Restaurar datos?',
    text: 'Se reemplazarán todos los datos actuales por los del archivo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2ecc71',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar',
    customClass: { container: 'high-z-index' },
  }).then((result) => {
    if (result.isConfirmed) {
      const { success, error } = accountStore.importData(importJson.value);
      if (success) {
        Swal.fire({
          title: '¡Restaurado!',
          text: 'Los datos se han cargado correctamente.',
          icon: 'success',
          customClass: { container: 'high-z-index' },
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          props.onClose();
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: error || 'El archivo no es válido.',
          icon: 'error',
          customClass: { container: 'high-z-index' },
        });
      }
    }
  });
};

const clearAllData = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se borrarán todos los personajes y configuraciones. No se puede deshacer.',
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
      props.onClose();
    }
  });
};
</script>

<style scoped>
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
  max-width: 500px;
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
  font-size: 1.4rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
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
  gap: 20px;
}

.account-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease;
}

.account-section:hover {
  background: rgba(0, 0, 0, 0.25);
}

.account-section h3 {
  color: #f0f0f0;
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-section p {
  color: #b9bbbe;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.file-upload-container {
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #b9bbbe;
}

.file-upload-label:hover {
  border-color: #3498db;
  color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.preview-text {
  color: #2ecc71;
  font-size: 0.85rem;
  margin-bottom: 12px;
  text-align: center;
}

.danger-zone {
  border-color: rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.05);
}

.danger-zone h3 {
  color: #e74c3c;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.full-width {
  width: 100%;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
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
