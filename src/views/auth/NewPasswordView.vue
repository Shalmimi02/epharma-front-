<template>
    <div class="reset-password-page">
      <div class="d-flex vh-100">
        <div class="card card-full-height">
          <div class="card-body">
            <div class="d-flex justify-content-center mb-3">
                <img src="/img/epharma-sf.png" class="mx-auto" alt="" style="width: 150px;">
            </div>
            <h5 class="mb-3">Activation de compte</h5>
            <h6 class="mb-5">Vous devez changer votre mot de passe pour pouvoir activer votre compte !</h6>
            <form @submit.prevent="resetPassword">
              <div class="form-group">
                <label for="password">Nouveau mot de passe</label>
                <div class="input-group">
                  <input
                    :type="passwordFieldType"
                    class="form-control"
                    id="password"
                    v-model="form.password"
                    required
                  />
                  <div class="input-group-append">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="togglePasswordVisibility"
                    >
                      <i :class="passwordFieldType === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="password_confirm">Confirmer nouveau mot de passe</label>
                <div class="input-group">
                  <input
                    :type="passwordConfirmFieldType"
                    class="form-control"
                    id="password_confirm"
                    v-model="form.password_confirm"
                    required
                  />
                  <div class="input-group-append">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="togglePasswordConfirmVisibility"
                    >
                      <i :class="passwordConfirmFieldType === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                Enregistrer
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
        passwordConfirmFieldType: 'password',
      };
    },
    methods: {
      resetPassword() {
        this.isLoading = true
            this.axios.post('/api/utilisateurs/' + this.$store.getters.user.id + '/update-password', this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    const user = response.data.data
                    this.$store.commit('setUserProfileDatas', user)
                    this.$router.push({ name: 'home' })
                    this.form = {}
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
      },
      togglePasswordVisibility() {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
      },
      togglePasswordConfirmVisibility() {
        this.passwordConfirmFieldType =
          this.passwordConfirmFieldType === 'password' ? 'text' : 'password';
      },
    },
  };
  </script>
  
  <style scoped>
  .reset-password-page {
    background-image: url('/public/img/bg-newpass.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .card-full-height {
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 0;
  }
  
  .d-flex {
    display: flex;
  }
  </style>
  