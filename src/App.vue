<template>
  <div id="app">
    <!-- Bannière pour une mise à jour disponible -->
    <div v-if="updateAvailable && !updateDownloaded && !dismissUpdateBanner" class="update-banner" :class="{ 'no-footer': $route.meta.noFooter }">
      <p class="mb-1 text-white">
        Une nouvelle version <span class="badge bg-success text-white">{{ updateInfo?.version }}</span> est disponible.
      </p>
      <button class="close-btnBadge" @click="dismissUpdateBanner = true">Fermer</button>
      <button class="btn download-btn" @click="startDownload">
        Télécharger la mise à jour
      </button>
    </div>

    <!-- Bannière une fois la mise à jour téléchargée -->
    <!-- <div v-if="updateDownloaded" class="update-banner">
      <p>La mise à jour a été téléchargée. Redémarrer pour l'installer ?</p>
      <button @click="installUpdate">Redémarrer et mettre à jour</button>
    </div> -->
    <!-- Bannière pour le téléchargement FTP (affichée si l'API indique que c'est disponible) -->
    <div v-if="majDownloadAvailable && !updateDownloaded && !dismissMajBanner" class="update-bannerFTP"  :class="{ 'no-header': $route.meta.noHeader }">
          <p class="mb-1 text-white">
            Une nouvelle version {{ majDownloadInfo.version }} est disponible.
          </p>
          <button class="close-btnBadge" @click="dismissMajBanner = true">Fermer</button>
          
    </div>
    <div
      v-else-if="updateDownloaded && !dismissMajBanner"
      class="update-bannerFTP"
      :class="{ 'no-header': $route.meta?.noHeader }"
    >
      <p class="mb-1 text-white">
        La mise à jour a été installée, veuillez actualiser la page.
      </p>
      
      <button class="close-btnBadge" @click="refreshPage()">
        Actualiser
      </button>
    </div>
    <!-- Intégration du composant enfant pour le loader et les actions -->
     <!-- On passe la prop "mode" pour gérer l'état : "update" (par défaut) ou "ftp" -->
     <!--<UpdateComponent 
      :update-available="updateAvailable" 
      :update-downloaded="updateDownloaded" 
      :update-info="updateInfo"
      :mode="currentMode"
      @start-download="startDownload"
      @install-update="installUpdate"
    />
    TesteurFTP émettra un événement quand le téléchargement FTP sera terminé -->
    <!-- <CheckUpdateButton  @check-update="checkMajAvailability" /> -->

    <RouterView />
    <ShowToast />
    <DynamicDialog />

    <!-- template des alertes -->
    <ConfirmDialog group="headless">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div class="card card-body rounded surface-overlay" style="width: 18rem;">
          <h1 class="text-center mb-2">
            <span class="bg-warning rounded-pill px-3 py-1">
              <i class="fa-solid fa-triangle-exclamation text-light"></i>
            </span>
          </h1>
          <div class="text-center">
            <h3 class="font-weight-bold mb-2">{{ message.header }}</h3>
            <p class="mb-2">{{ message.message }}</p>
            <div class="d-flex align-items-center justify-content-center">
              <button type="button" @click="acceptCallback" class="btn btn-primary mr-2">OUI</button>
              <button type="button" @click="rejectCallback" class="btn btn-danger">NON</button>
            </div>
          </div>
        </div>
      </template>
    </ConfirmDialog>
    <ChatbotWidget
      mode="iframe"
      :configUrl="botpressConfigUrl"
      stylesheet="/custom-chat.css"
    />
  </div>
</template>

<script>
// import AlertBanner from './layouts/AlertBanner.vue';
import packageJson from '../package.json'; // Utilisation d'import ES6
import UpdateComponent from './components/UpdateComponent.vue';
import CheckUpdateButton from './views/admin/parametres/CheckUpdateButton.vue'
import ChatbotWidget from './components/ChatbotWidget.vue';
import { emitter } from '@/event-bus';
export default {
  components: {
    UpdateComponent,
    CheckUpdateButton,
    ChatbotWidget
  },
  data() {
    return {
      showLoading: true,
      showAlertBanner: false,
      alertMessage: '',
      updateAvailable: false,
      updateDownloaded: false,
      updateInfo: null,
      majoff: false,
      timerId: null,             // Pour stocker l'intervalle
      // Nouvelle donnée pour gérer le mode du loader ("update" ou "ftp")
      currentMode: 'update',
      // Variable qui détermine si le téléchargement FTP est disponible (définie via une API) à remettre à false quand l'api sera configuré
      majDownloadAvailable: false,
      majDownloadInfo : {},
      dismissUpdateBanner: false,
      dismissMajBanner: false,
      localUpdates: [],
      // URL de configuration Botpress (générée à partir du botId fourni)
      botpressConfigUrl: 'https://files.bpcontent.cloud/2025/08/05/10/20250805101355-9W50FQDF.json'
    };
  },
  created() {
    this.getCompanyInfo();
    this.checkHabilitations();
    this.checkMajAvailability();
    
    
    const storedUpdateDismiss = localStorage.getItem('dismissUpdateBanner');
    if (storedUpdateDismiss) this.dismissUpdateBanner = storedUpdateDismiss === 'true';

    const storedMajDismiss = localStorage.getItem('dismissMajBanner');
    if (storedMajDismiss) this.dismissMajBanner = storedMajDismiss === 'true';
  },
  mounted() {
    
    // this.checkForUpdates();
    emitter.on('check-maj-update', this.checkMajAvailability);
     // Écoute des événements d'auto-update envoyés par le main process
     if (window.versions) {
      window.versions.onUpdateAvailable((event, info) => {
        console.log('Mise à jour disponible (renderer) :', info);
        this.updateAvailable = true;
        this.updateInfo = info;
      });

      window.versions.onUpdateDownloaded((event, info) => {
        console.log('Mise à jour téléchargée (renderer) :', info);
        this.updateDownloaded = true;
      });
    }
  },
  beforeUnmount() {
    emitter.off('check-maj-update', this.checkMajAvailability);
  },
  watch: {
    // Si majDownloadAvailable devient true, on appelle fetchLocalUpdates
    majDownloadAvailable(newVal) {
      if (newVal) {
        // Si majDownloadAvailable vient de passer à true, on lance un intervalle
        this.timerId = setInterval(() => {
          this.fetchLocalUpdates();
        }, 240000); // 1 minute = 60000 ms
      } else {
        // Si ça repasse à false, on arrête l'intervalle
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = null;
        }
      }
    }
  },
  methods: {
    async getCompanyInfo() {
      try {
        const response = await this.axios.get('/api/pharmacie-info');
        const pharmacie = response.data.data;
        this.$store.commit('setPharmacieDatas', pharmacie)
      } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
      }
    },
    async checkHabilitations() {
      try {
        const response = await this.axios.get('/api/utilisateurs/'+this.$store.getters.user.id);
        const user = response.data.data;
        if (user.is_admin == false){
          this.$store.commit('setUserHabilitations', user)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des habilitations:', error);
      }
    },
    // Méthode pour recharger la page
    refreshPage() {
      window.location.reload();
    },
    // async checkForUpdates() {
    //   try {
    //     const response = await this.axios.get('/api/latest-version');
    //     const latestVersion = response.data.numero_version;
    //     const currentVersion = packageJson.version;
    //     if (latestVersion && latestVersion !== currentVersion) {
    //       this.showAlertBanner = true;
    //       this.alertMessage = `Une nouvelle version (${latestVersion}) est disponible.`;
    //     }
    //   } catch (error) {
    //     console.error('Erreur lors de la vérification des mises à jour :', error);
    //   }
    // },
    async fetchLocalUpdates() {
      try {
        const response = await this.axios.get('/api/epg/list-versions');
        if (response.data.status === 'success') {
          const zipFile = response.data.data; // Objet { name, version, date }
          console.log('Fichier ZIP trouvé:', zipFile);

          // Version actuelle de l'app
          const currentVersion = packageJson.version; // ex: "3.3.1"

          // Compare
          if (this.versionCompare(zipFile.version, currentVersion) > 0 && zipFile.version == this.majDownloadInfo.version ) {
            // Si zipFile.version == currentVersion ou zipFile.version > currentVersion
            this.updateDownloaded = true;
          } else {
            this.updateDownloaded = false;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des versions:', error);
      }
    },

    versionCompare(a, b) {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const numA = aParts[i] || 0;
        const numB = bParts[i] || 0;
        if (numA > numB) return 1;
        if (numA < numB) return -1;
      }
      return 0; // Égalité
    },
    async checkMajAvailability() {
       // Vérifier s'il y a une connexion internet
      if (!navigator.onLine) {
        console.warn("Pas de connexion internet. La vérification de la mise à jour est désactivée.");
        return;
      }
      try {
        // Appel API pour vérifier la disponibilité de la mise à jour FTP
        const response = await this.axios.get(this.$store.state.superviseurApi +'/api/epg/latest-maj');
        // On suppose que la réponse renvoie { version: "3.3.4", download_url: "..." }
        
        const apiVersion = response.data.data.version;
        const downloadUrl = response.data.data.lien_telechargement;

        
        // Si la version renvoyée par l'API est supérieure à la version installée
        if (this.isNewerVersion(apiVersion, packageJson.version)) {
          this.majDownloadAvailable = true;
          this.fetchLocalUpdates();
          // Vous pouvez stocker d'autres infos utiles
          this.majDownloadInfo = { version: apiVersion, download_url: downloadUrl };
        } else {
          this.majDownloadAvailable = false;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la disponibilité FTP :', error);
        this.majDownloadAvailable = false;
      }
    },

    // Méthode utilitaire pour comparer les versions (format "X.Y.Z")
    isNewerVersion(newVersion, currentVersion) {
      const newParts = newVersion.split('.').map(Number);
      const currentParts = currentVersion.split('.').map(Number);
      for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
        const newVal = newParts[i] || 0;
        const curVal = currentParts[i] || 0;
        if (newVal > curVal) return true;
        if (newVal < curVal) return false;
      }
      return false;
    },
    startDownload() {
      if (window.versions) {
        window.versions.downloadUpdate();
        this.updateDownloaded = true;
      }
    },
    installUpdate() {
      if (window.versions) {
        window.versions.installUpdate();
      }
    },
    // async startDownloadMaj() {
    //   if (!this.majDownloadInfo || !this.majDownloadInfo.download_url) {
    //     console.error("Aucune information de mise à jour du backend disponible.");
    //     return;
    //   }
    //   const downloadUrl = this.majDownloadInfo.download_url;
    //   // Spécifiez les chemins locaux pour le fichier ZIP, son extraction et une copie de sauvegarde
    //   const localZipPath = `C:\\laragon\\www\\epg-epharma\\update-${this.majDownloadInfo.version}.zip`;
    //   const extractPath = 'C:\\laragon\\www\\epg-epharma';
     
    //   this.updateDownloaded=true;
    //   // Changer le mode du loader pour le mode FTP update
    //   this.currentMode = 'ftp';
    //   try {
    //     const result = await window.updateApi.downloadAndProcess(downloadUrl, localZipPath, extractPath);
    //     console.log(result.message);
    //   } catch (error) {
    //     console.error('Erreur lors du téléchargement update:', error.message);
    //   }
    // },
    // Dans les méthodes :
    closeUpdateBanner() {
      this.dismissUpdateBanner = true;
      localStorage.setItem('dismissUpdateBanner', 'true');
    },
    closeMajBanner() {
      this.dismissMajBanner = true;
      localStorage.setItem('dismissMajBanner', 'true');
    }
    // async startFtpDownload() {
    //   // Options SFTP pour le téléchargement FTP
    //   const sftpOptions = {
    //     host: 'releases.srv557357.hstgr.cloud',
    //     port: 22,
    //     username: 'epharma_updater',
    //     password: 'MVrB65EAZOP0M?$n'
    //   };
    //   const remoteFilePath = '/home/epharma_updater/public_html/update-3.3.4.zip';
    //   const localZipPath = 'C:\\laragon\\www\\epg-epharma\\public\\update-3.3.4.zip';
    //   const extractPath = 'C:\\laragon\\www\\epg-epharma\\public';
    //   const backupZipPath = 'C:\\Users\\USER\\Desktop\\update-3.3.4.zip';

    //   // Changer le mode du loader pour le FTP
    //   this.updateDownloaded = true;
    //   this.currentMode = 'ftp';
    //   this.ftpDownloadAvailable=false;

    //   try {
    //     const result = await window.ftpApi.downloadAndProcess(sftpOptions, remoteFilePath, localZipPath, extractPath, backupZipPath);
    //     console.log(result.message);
    //   } catch (error) {
    //     console.error('Erreur FTP:', error.message);
    //   }
    // }
  
  },
};
</script>

<style lang="scss">
@import './style/app.scss';
.update-banner {
  position: fixed;
  bottom: 40px;
  width: 100%;
  background-color: rgba(42, 57, 99, 0.8);
  text-align: center;
  padding: 0.5rem 1rem;
  z-index: 1020;
  &.no-footer {
    bottom: 0;
    padding: 1rem;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
}

.update-bannerFTP {
  position: fixed;
  top: 60px;
  width: 100%;
  background-color: rgba(42, 57, 99, 0.8);
  text-align: center;
  padding: 0.5rem 1rem;
  z-index: 1020;
  &.no-header {
    top: 0;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  } 
}
/* ------------------------------ */
/* Nouveau style pour le bouton downloadUpdate */
/* ------------------------------ */
     
.download-btn {
  background: none;
  border: none;
  color: #007bff; /* couleur Bootstrap pour les liens */
  padding: 0;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
}
.close-btnBadge {
    /* ... autres propriétés ... */
    position: absolute;
    top: 8px;
    right: 12px;
    display: inline-block;
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    padding: 2px 5px;
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Effet de soulignement animé */
    background-image: linear-gradient(white, white);
    background-size: 0% 2px;
    background-repeat: no-repeat;
    background-position: left 85%;
}

.close-btnBadge:hover {
    background-size: 100% 2px;
    opacity: 0.9;
} 
.download-btn:hover {
  text-decoration: underline;
  color: #94a0ab;
}
</style>
