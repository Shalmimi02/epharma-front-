<template>
  <div class="activation-page">
    <div class="containerform">
      <form class="form">
        <template v-if="!activatedDisplay">
          <div class="title">Activation de l'application</div>
          <div class="title text-muted">Epharma</div>
          <div class="inputs">
            <!-- Ajout de @keydown pour gérer la suppression continue -->
            <input id="input1" type="text" maxlength="4" v-model="input1" @input="onInput($event, 1)"
              @keydown="onKeyDown($event, 1)" :class="inputClass"  @paste="onPaste"/>
            <input id="input2" type="text" maxlength="4" v-model="input2" @input="onInput($event, 2)"
              @keydown="onKeyDown($event, 2)" :class="inputClass" />
            <input id="input3" type="text" maxlength="4" v-model="input3" @input="onInput($event, 3)"
              @keydown="onKeyDown($event, 3)" :class="inputClass" />
            <input id="input4" type="text" maxlength="4" v-model="input4" @input="onInput($event, 4)"
              @keydown="onKeyDown($event, 4)" :class="inputClass" />
          </div>
          <span v-if="loading" class="loading-message">verification...</span>
          <!-- Badge en cas d'absence de connexion -->
          <div v-if="!isOnline" class="mt-3 connection-badge">
            <img src="/public/img/barre-oblique-wi-fi.png" alt="Icône de connexion" class="badge-icon" />
            <span class="badge-text">
              Pas de connexion internet, Veuillez vous connecter pour effectuer la vérification
            </span>
          </div>
          <!-- Message d'erreur -->
          <div v-if="errorMessage" class="mt-3 alert alert-danger">
            {{ errorMessage }}
          </div>
        </template>
        <template v-else>
          <div class="activated-content">
            <i class="fa-solid fa-circle-check fa-bounce" style="color: #63E6BE; font-size: 48px;"></i>
            <p class="activated-text">Activé</p>
            <p class="activated-text">Veuillez patienter ...</p>
          </div>
        </template>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerificationApplication',
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      loading: false,
      isOnline: navigator.onLine,
      errorMessage: '',
      codeValid: false, // true si le code est validé par l'API
      token: '',
      shake: false,     // déclenche l'animation de tremblement en cas d'erreur
      activatedDisplay: false // affiche le contenu de succès
    };
  },
  computed: {
    // Applique la classe en fonction de l'état : succès (vert) ou erreur (rouge avec tremblement)
    inputClass() {
      if (this.codeComplete) {
        if (this.codeValid) {
          return 'input-success';
        } else {
          return this.shake ? 'input-error shake' : 'input-error';
        }
      }
      return '';
    },
    // Vérifie que le code complet (16 caractères) a été saisi
    codeComplete() {
      return (this.input1 + this.input2 + this.input3 + this.input4).length === 16;
    },
    // Concatène les 4 inputs
    code() {
      return this.input1 + this.input2 + this.input3 + this.input4;
    }
  },
  watch: {
    // Dès que le code complet est saisi, on le vérifie automatiquement via l'API
    code(newCode) {
      if (newCode.length === 16) {
        this.checkCode();
      } else {
        this.codeValid = false;
      }
    }
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
    },
    onInput(event, index) {
      // Dès que le champ atteint sa longueur maximale (4 caractères), passe au suivant
      if (event.target.value.length === event.target.maxLength) {
        const nextInput = document.getElementById(`input${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    },
    // Méthode pour gérer la suppression continue avec la touche Backspace
    onKeyDown(event, index) {
      if (event.key === 'Backspace' && event.target.value === '') {
        // Recherche du champ précédent
        let prevIndex = index - 1;
        while (prevIndex >= 1) {
          const prevInput = document.getElementById(`input${prevIndex}`);
          if (prevInput) {
            prevInput.focus();
            // Efface la valeur du champ précédent
            if (prevIndex === 1) this.input1 = '';
            else if (prevIndex === 2) this.input2 = '';
            else if (prevIndex === 3) this.input3 = '';
            break;
          }
          prevIndex--;
        }
      }
    },
    
    onPaste(event) {
      // Empêcher le comportement par défaut (coller directement dans un seul champ)
      event.preventDefault();

      // Récupérer le texte collé
      const pastedData = (event.clipboardData || window.clipboardData).getData('text');
      // Facultatif : nettoyer les espaces, caractères spéciaux, etc. selon ton besoin
      // Par exemple, pour garder seulement 16 caractères maximum :
      const code = pastedData.slice(0, 16);

      // Remplir chaque input de 4 caractères
      this.input1 = code.slice(0, 4);
      this.input2 = code.slice(4, 8);
      this.input3 = code.slice(8, 12);
      this.input4 = code.slice(12, 16);

      // Focaliser le champ suivant si tout n’a pas été collé
      if (code.length <= 4) {
        document.getElementById('input2').focus();
      } else if (code.length <= 8) {
        document.getElementById('input3').focus();
      } else if (code.length <= 12) {
        document.getElementById('input4').focus();
      }
    },
    // async getLocalIP() {
    //   return new Promise((resolve, reject) => {
    //     const rtc = new RTCPeerConnection({ iceServers: [] });
    //     rtc.createDataChannel("");
    //     rtc.createOffer().then(offer => rtc.setLocalDescription(offer)).catch(reject);
    //     rtc.onicecandidate = event => {
    //       if (event?.candidate?.candidate) {
    //         const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}(?:\.[0-9]{1,3}){3})/);
    //         if (ipMatch) resolve(ipMatch[0]);
    //         rtc.close();
    //       }
    //     };
    //   });
    // },
    async checkCode() {
      // Vérification du code auprès de l'API et activation automatique en cas de succès
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await this.axios.post(this.$store.state.superviseurApi + '/api/verify-code', { activation_code: this.code });
        if (response.data.success == true) {
          // Extraction des objets activation & parametres depuis la réponse
          const { activation, parametres } = response.data.data;

          // Enregistrement du token et de la date d'activation dans le localStorage
          const activationData = {
            token: activation.token,
            date_activation: activation.date_activation
          };
          window.localStorage.setItem('activationData', JSON.stringify(activationData));

          if (activation.type === "serveur") {
              // Création de l'objet form directement à partir des données de parametres
              let form = {
                id: parametres.id,
                nom_pharmacie: parametres.nom_pharmacie,
                adresse: parametres.adresse,
                bp: parametres.bp,
                capital: parametres.capital,
                statut_juridique: parametres.statut_juridique,
                rccm: parametres.rccm,
                nif: parametres.nif,
                telephone1: parametres.telephone1,
                telephone2: parametres.telephone2,
                email: parametres.email,
                site_web: parametres.site_web,
                slogan: parametres.slogan,
                logo_url: parametres.logo_url,
                lien_distant: parametres.lien_distant,
                proprietaire: parametres.proprietaire,
                souscription: parametres.souscription,
                lat: parametres.lat,
                lng: parametres.lng,
                public_ip: parametres.public_ip,
                extra: parametres.extra,
                created_at: parametres.created_at,
                updated_at: parametres.updated_at,
                deleted_at: parametres.deleted_at
              };

              // Si le logo est fourni, on l'ajoute également
              if (parametres.logo_url) {
                form.logo_url = parametres.logo_url;
              }
            
            
              
              // Adresse IP autorisée, on envoie le formulaire
              const companyResponse = await this.axios.post('/api/pharmacie-info', form, {
                headers: { "Content-Type": "multipart/form-data" }
              });
          
          
              // Gestion des réponses après l'envoi des données
            if (companyResponse.data.success === true) {
              this.$toast.add({
                severity: 'success',
                detail: companyResponse.data.message,
                life: 3000
              });
              
            } else {
              companyResponse.data.errors.forEach(error => {
                this.$toast.add({
                  severity: 'warn',
                  summary: 'Oups !',
                  detail: error,
                  life: 7000
                });
              });
            }
          }
          this.activatedDisplay = true;
          // Redirection vers la page login dans tous les cas après 5 secondes
          setTimeout(() => {
            window.location.reload(); // Actualise la page courante
          }, 5000);
        
        }  else {
          // Code invalide, gestion des erreurs retournées par l'API
          this.shake = true;
          setTimeout(() => {
            this.shake = false;
          }, 500);
          response.data.errors.forEach(error => {
            this.$toast.add({
              severity: 'warn',
              summary: 'Oups !',
              detail: error,
              life: 7000
            });
          });
        }
        } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        this.codeValid = false;
        this.token = '';
        this.shake = true;
        setTimeout(() => {
          this.shake = false;
        }, 500);
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: "Erreur lors de la communication avec le serveur. Vérifiez l'URL de l'API et votre connexion.",
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.activation-page {
  background-image: url('/public/img/Background-epg-blur.jpg') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.containerform {
  height: 100vh;
  display: flex;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  margin: auto;
  width: 400px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  min-height: 214px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: black;
}

.text-muted {
  color: #6c757d;
}

.inputs {
  margin-top: 10px;
}

.inputs input {
  width: 50px !important;
  height: 32px;
  text-align: center;
  border: none;
  border-bottom: 1.5px solid #a7a7a7;
  margin: 0 10px;
  transition: border-color 0.3s;
}

.inputs input:focus {
  border-bottom: 1.5px solid royalblue;
  outline: none;
}

.input-success {
  border-bottom: 1.5px solid green !important;
}

.input-error {
  border-bottom: 1.5px solid red !important;
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
}

.loading-message {
  margin-top: 10px;
  font-style: italic;
}

.connection-badge {
  display: flex;
  align-items: center;
  padding: 2px;
  border: solid 1px #b7b7b7;
  border-radius: 7px;
  gap: 8px;
  white-space: normal;
}

.badge-icon {
  width: 24px;
  height: 24px;
}

.badge-text {
  display: block;
  word-wrap: break-word;
}

.activated-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.activated-text {
  color: green;
  font-size: 24px;
  margin-top: 10px;
}
</style>
