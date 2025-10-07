<template> 
  <div>
    <!-- Fullscreen Loader -->
    <div v-if="isOverlay" class="loading-overlay">
      <div class="loading-container">
        <span class="loading-spinner">
          <i class="fas fa-hourglass-half text-primary" style="font-size: 80px;"></i>
        </span>
      </div>
    </div>

    <!-- Bottom-Right Loader for Auto-Save or Creation -->
    <div v-if="isAutoSave" class="auto-save-indicator">
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "HourGlassLoader",
  props: {
    isOverlay: {
      type: Boolean,
      default: false, // Affiche un overlay en plein écran
    },
    isAutoSave: {
      type: Boolean,
      default: false, // Affiche l'indicateur en bas à droite
    },
    message: {
      type: String,
      default: "Sauvegarde en cours...", // Message à afficher pour l'indicateur
    },
  },
};
</script>

<style scoped>
/* Fullscreen Loader */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
} 

.loading-spinner {
  display: inline-block;
  font-size: 50px;
  color: #333;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Bottom-Right Indicator */
.auto-save-indicator {
  position: fixed;
  bottom: 45px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  z-index: 9999; /* S'assurer qu'il apparaît au-dessus des autres éléments */
}

</style>