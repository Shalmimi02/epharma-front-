<template>
  <div>
    <!-- Loader pendant le téléchargement (affiché si isDownloading et downloadProgress < 100) -->
    <div v-if="isDownloading && downloadProgress < 100" class="loader">
      {{ downloadProgress.toFixed(0) }}%
      <!-- Tooltip affichant les infos détaillées -->
      <div class="tooltip">
        <p>
          Téléchargé : <br />
          <span style="color: #fff;">{{ formatBytes(transferred) }} / {{ formatBytes(total) }}</span>
        </p>
        <p v-show="bytesPerSecond > 0">
          Vitesse : <br />
          <span style="color: #fff;">{{ formatBytes(bytesPerSecond) }}/s</span>
        </p>
      </div>
    </div>

    <!-- Bouton (affiché lorsque le téléchargement est terminé) -->
    <div
      v-if="downloadProgress >= 100"
      class="install-button-container"
      style="position: absolute; right: 4%; bottom: 5%;"
    >
      <button class="Btn" @click="handleButtonClick">
        <!-- Afficher l’icône FontAwesome si mode === "ftp" -->
        <template v-if="mode === 'ftp'">
          <i class="fa-solid fa-rotate-right" style="font-size: 1.3rem; color: #d6b2ff;"></i>
        </template>
        <!-- Sinon, garder le SVG existant -->
        <template v-else>
          <svg
            class="svgIcon"
            viewBox="0 0 384 512"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160
              c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3
              0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32
              14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5
              -32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160
              160z"
            ></path>
          </svg>
        </template>

        <span class="icon2"></span>
        <span class="Btn-tooltip">{{ buttonTooltip }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdateComponent',
  props: {
    updateAvailable: {
      type: Boolean,
      default: false
    },
    updateDownloaded: {
      type: Boolean,
      default: false
    },
    updateInfo: {
      type: Object,
      default: () => ({})
    },
    // Nouveau prop pour déterminer le mode ("update" ou "ftp")
    mode: {
      type: String,
      default: 'update'
    }
  },
  data() {
    return {
      isDownloading: false,
      downloadProgress: 0,
      transferred: 0,
      total: 1000000, // Total simulé en octets (1 Mo)
      bytesPerSecond: 0,
      downloadInterval: null
    };
  },
  computed: {
    buttonTooltip() {
      return this.mode === 'ftp' ? 'Actualiser' : 'Installer la mise à jour';
    }
  },
  methods: {
    formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    handleButtonClick() {
      if (this.mode === 'ftp') {
        // Recharger la fenêtre Electron
        window.location.reload();
      } else {
        // Émettre l'événement pour installer la mise à jour
        this.$emit('install-update');
      }
    }
  },
  mounted() {
    // Écoute de la progression FTP
    // if (window.ftpProgress) {
    //   window.ftpProgress.onProgress((event, progress) => {
    //     this.isDownloading = true;
    //     if (progress && progress.percent !== undefined) {
    //       this.downloadProgress = progress.percent;
    //     }
    //     if (progress && progress.transferred !== undefined) {
    //       this.transferred = progress.transferred;
    //     }
    //     if (progress && progress.total !== undefined) {
    //       this.total = progress.total;
    //     }
    //     if (progress.percent >= 100) {
    //       this.downloadProgress = 100;
    //       this.isDownloading = false;
    //     }
    //   });
    // }

    if (window.updateProgress) {
      window.updateProgress.onProgress((event, progress) => {
        console.log('Progression update reçue:', progress); // Debug
        this.isDownloading = true;
        if (progress && progress.percent !== undefined) {
          this.downloadProgress = progress.percent;
        }
        if (progress && progress.downloaded !== undefined) {
          this.transferred = progress.downloaded;
        }
        if (progress && progress.total !== undefined) {
          this.total = progress.total;
        }
        if (progress.percent >= 100) {
          this.downloadProgress = 100;
          this.isDownloading = false;
        }
      });
    }
    // Écoute d'un événement de téléchargement via electronAPI (si disponible)
    if (window.versions) {
      window.versions.onDownloadProgress((event, progress) => {
        this.isDownloading = true;
        if (progress && progress.percent !== undefined) {
          this.downloadProgress = progress.percent;
        }
        if (progress && progress.transferred !== undefined) {
          this.transferred = progress.transferred;
        }
        if (progress && progress.total !== undefined) {
          this.total = progress.total;
        }
        if (progress && progress.bytesPerSecond !== undefined) {
          this.bytesPerSecond = progress.bytesPerSecond;
        }
        if (progress.percent >= 100) {
          this.downloadProgress = 100;
          this.isDownloading = false;
        }
      });
    }
  }
};
</script>

<style>
/* Loader personnalisé */
.loader {
  position: absolute;
  right: 2%;
  bottom: 5%;
  width: 60px;
  height: 60px;
  background: #fff;
  border: 3px solid rgba(0, 102, 255, 0.1);
  border-radius: 50%;
  text-align: center;
  line-height: 60px;
  font-family: sans-serif;
  font-size: 16px;
  color: #0066ff;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #0066ff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
.loader::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 20px 5px #0066ff;
  border: 3px solid transparent;
  border-top: 3px solid #0066ff;
  border-right: 3px solid #0066ff;
  border-radius: 50%;
  animation: animateC 2s linear infinite;
}
@keyframes animateC {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.tooltip {
  background-color: black;
  position: absolute;
  bottom: 0px;
  right: -12px;
  transform: translateX(-50%);
  padding: 1em 2em;
  min-height: 80px;
  min-width: 180px;
  box-sizing: border-box;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s, top 0.3s;
  border-radius: 25px;
  font-size: 14px;
  white-space: nowrap;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.loader:hover .tooltip {
  opacity: 1;
  pointer-events: auto;
  display: flex;
}
.tooltip p {
  margin: 0;
  text-align: center;
  line-height: 1.2;
}

/* Bouton d'installation / Actualisation */
.Btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background-color: rgb(27, 27, 27);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition-duration: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.11);
}
.svgIcon {
  fill: rgb(214, 178, 255);
}
.icon2 {
  width: 18px;
  height: 5px;
  border-bottom: 2px solid rgb(182, 143, 255);
  border-left: 2px solid rgb(182, 143, 255);
  border-right: 2px solid rgb(182, 143, 255);
}
.Btn .Btn-tooltip {
  position: absolute;
  right: 58px;
  bottom: 5px;
  width: 100px;
  opacity: 0;
  background-color: rgb(12, 12, 12);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-duration: 0.2s;
  pointer-events: none;
  letter-spacing: 0.5px;
}
.Btn:hover .Btn-tooltip {
  opacity: 1;
  transition-duration: 0.3s;
}
.Btn:hover {
  background-color: rgb(150, 94, 255);
  transition-duration: 0.3s;
}
.Btn:hover .icon2 {
  border-bottom: 2px solid rgb(235, 235, 235);
  border-left: 2px solid rgb(235, 235, 235);
  border-right: 2px solid rgb(235, 235, 235);
}
.Btn:hover .svgIcon {
  fill: rgb(255, 255, 255);
  animation: slide-in-top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
@keyframes slide-in-top {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}
</style>
