<template>
  <div class="account-view-container fade-in">
    <div class="account-header">
      <h1><i class="bi bi-person-badge-fill"></i> Gestión de Cuenta</h1>
      <p class="account-subtitle">Administra tus datos y configuraciones</p>
    </div>

    <div class="account-sections">
      <!-- Sección de Gestión de Personajes -->
      <div class="account-section character-management-section">
        <div class="section-header">
          <h2><i class="bi bi-people-fill"></i> Gestor de Personajes</h2>
        </div>
        <div class="section-content">
          <p>Administra todos tus personajes: crea, elimina, importa, exporta y selecciona cuál quieres usar.</p>
          <router-link to="/character-manager" class="btn btn-primary">
            <i class="bi bi-folder-symlink"></i>
            <span>Ir al Gestor de Personajes</span>
          </router-link>
        </div>
      </div>

      <!-- Sección de Exportación -->
      <div class="account-section export-section">
        <div class="section-header">
          <h2><i class="bi bi-cloud-download-fill"></i> Exportar Cuenta Completa</h2>
        </div>
        <div class="section-content">
          <p>Guarda una copia de seguridad de todos tus personajes y configuraciones en un archivo JSON.</p>
          <button @click="exportData" class="btn btn-primary">
            <i class="bi bi-download"></i>
            <span>Descargar Copia de Seguridad</span>
          </button>
        </div>
      </div>

      <!-- Sección de Importación -->
      <div class="account-section import-section">
        <div class="section-header">
          <h2><i class="bi bi-cloud-upload-fill"></i> Importar Datos</h2>
        </div>
        <div class="section-content">
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
            <i class="bi bi-check-circle-fill"></i>
            <span>Archivo cargado y listo para importar</span>
          </div>

          <button @click="importData" :disabled="!importJson" class="btn btn-success">
            <i class="bi bi-upload"></i>
            <span>Restaurar Datos</span>
          </button>
        </div>
      </div>

      <!-- Sección de Peligro -->
      <div class="account-section danger-section">
        <div class="section-header danger-header">
          <h2><i class="bi bi-exclamation-triangle-fill"></i> Zona de Peligro</h2>
        </div>
        <div class="section-content">
          <p>Eliminar todos los datos guardados en este navegador. <strong>Esta acción no se puede deshacer.</strong></p>
          <button @click="clearAllData" class="btn btn-danger">
            <i class="bi bi-trash-fill"></i>
            <span>Borrar Todos los Datos</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAccountStore } from '../stores/useAccountStore';
import Swal from 'sweetalert2';

const accountStore = useAccountStore();
const importJson = ref('');
const fileName = ref('');

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
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron exportar los datos.',
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
  }).then((result) => {
    if (result.isConfirmed) {
      const { success, error } = accountStore.importData(importJson.value);
      if (success) {
        Swal.fire({
          title: '¡Restaurado!',
          text: 'Los datos se han cargado correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: error || 'El archivo no es válido.',
          icon: 'error',
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
  }).then((result) => {
    if (result.isConfirmed) {
      accountStore.clearAllData();
    }
  });
};
</script>

<style scoped>
.account-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 80px);
}

.account-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 30px 20px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%);
  border-radius: 20px;
  border: 2px solid rgba(52, 152, 219, 0.3);
}

.account-header h1 {
  color: #3498db;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.account-subtitle {
  color: #b9bbbe;
  font-size: 1.1rem;
  margin: 0;
}

.account-sections {
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr;
}

.account-section {
  background: linear-gradient(145deg, #2c2f33, #23272a);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.account-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.section-header {
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 20px 30px;
  border-bottom: 2px solid rgba(52, 152, 219, 0.3);
}

.section-header h2 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.danger-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-bottom-color: rgba(231, 76, 60, 0.3);
}

.section-content {
  padding: 30px;
}

.section-content p {
  color: #b9bbbe;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 25px;
}

.section-content p strong {
  color: #ecf0f1;
  font-weight: 600;
}

.file-upload-container {
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #b9bbbe;
  font-size: 1rem;
}

.file-upload-label:hover {
  border-color: #3498db;
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
  transform: translateY(-2px);
}

.file-upload-label i {
  font-size: 1.5rem;
}

.preview-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 10px;
  color: #2ecc71;
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.preview-section i {
  font-size: 1.2rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.btn i {
  font-size: 1.2rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5dade2, #3498db);
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #58d68d, #2ecc71);
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ec7063, #e74c3c);
}

/* Responsive */
@media (max-width: 768px) {
  .account-view-container {
    padding: 20px 15px;
  }

  .account-header {
    padding: 20px 15px;
    margin-bottom: 30px;
  }

  .account-header h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 10px;
  }

  .account-subtitle {
    font-size: 1rem;
  }

  .account-sections {
    gap: 20px;
  }

  .section-header {
    padding: 15px 20px;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }

  .section-content {
    padding: 20px;
  }

  .btn {
    padding: 14px 24px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .account-header h1 {
    font-size: 1.7rem;
  }

  .section-header h2 {
    font-size: 1.2rem;
    flex-direction: column;
    gap: 8px;
  }

  .file-upload-label {
    flex-direction: column;
    padding: 15px;
  }
}
</style>
