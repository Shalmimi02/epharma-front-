<template>
  <div class="login-page">
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div class="card p-4" style="width: 400px;">
        <div class="card-body">
          <div class="d-flex justify-content-center">
            <img src="/img/epharma-sf.png" class="mx-auto" alt="" style="width: 150px;">
          </div>

          <h6 class="card-title text-center mb-4">
            LOGICIEL DE GESTION DE PHARMACIE
          </h6>
          <form @submit.prevent="login">
            <div class="form-group">
              <label for="name">Nom d'utilisateur</label>
              <input type="text" class="form-control" id="name" v-model="form.name" required />
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-group">
                <input :type="passwordFieldType" class="form-control" id="password" v-model="form.password" required />
                <div class="input-group-append">
                  <button type="button" class="btn btn-outline-secondary" @click="togglePasswordVisibility">
                    <i :class="passwordFieldType === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              Se connecter
              <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      form: {},
      passwordFieldType: 'password',
      userIP: null,
      cryptoKey: null,
    };
  },
  async mounted() {
    await this.getUserIP();
    this.axios.get('/sanctum/csrf-cookie').then(() => {
      console.log('csrf-cookie ok')
    }).catch(() => {
      window.location.reload()
      this.$toast.add({
        severity: 'error',
        summary: 'Probleme de connexion',
        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
        life: 5000
      });
    });
  },
  methods: {
    async getUserIP() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        this.userIP = data.ip;
        console.log('IP récupérée:', this.userIP);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'IP:', error);
        // Fallback avec une IP par défaut (non recommandé en production)
        this.userIP = '127.0.0.1';
      }
    },
    // Génération de clé basée sur l'IP
    async generateCryptoKey(ip) {
      const encoder = new TextEncoder();
      const data = encoder.encode(ip + 'EPHARMA_SALT_2024');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    },

    // Chiffrement du token
    async encryptToken(token, ip) {
      const key = await this.generateCryptoKey(ip);
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      
      const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
      encryptedArray.set(iv);
      encryptedArray.set(new Uint8Array(encryptedData), iv.length);
      
      return btoa(String.fromCharCode.apply(null, encryptedArray));
    },
    login() {
      this.isLoading = true;
      
      this.axios.post('/api/login', this.form).then(async response => {
        if (response.data.success === true) {
          const user = response.data.data;
          const originalToken = user.token; // Conserver le token original
          
          try {
            // S'assurer que l'IP est disponible
            if (!this.userIP) {
              await this.getUserIP();
            }
            
            // CHIFFRER LE TOKEN DANS L'OBJET USER
            user.token = await this.encryptToken(originalToken, this.userIP);
            
          } catch (error) {
            console.error('Erreur chiffrement token:', error);
            // En cas d'erreur, garder le token original
          }
          
          // Configurer Axios avec le token ORIGINAL (non chiffré)
          this.axios.defaults.headers.common = {
            'Authorization': 'Bearer ' + originalToken
          };
          
          // Envoyer l'objet user avec le token CHIFFRÉ au store
          this.$store.commit('setAuthenticated', user);
          
          this.$router.push({ name: 'home' });
          this.form = {};
          
        } else {
          this.$toast.add({
            severity: 'warn',
            detail: response.data.errors[0],
            life: 5000
          });
        }
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
        this.$toast.add({
          severity: 'error',
          summary: 'Probleme de connexion',
          detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
          life: 5000
        });
      });
    },

    togglePasswordVisibility() {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    },
  },
};
</script>

<style scoped>
.login-page {
  background-image: url('/public/img/bg-login.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.container {
  height: 100vh;
}

.card {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>