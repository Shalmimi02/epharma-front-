<template>
    <form @submit.prevent="createLine()" v-if="userIsReady == false">
        <div>
            <p>Informations personnelles</p>

            <div class="form-row">
                <div class="form-group col-md-4">
                    <label>Nom(s)*</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" required
                        v-model="form.last_name">
                </div>
                <div class="form-group col-md-4">
                    <label>Prénom(s)*</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" required
                        v-model="form.first_name">
                </div>
                <div class="form-group col-md-4">
                    <label>Téléphone</label>
                    <input type="tel" class="form-control border border-dark px-[4rem]"
                        v-model="form.telephone">
                </div>
                <div class="form-group col-md-4">
                    <label>Email</label>
                    <input type="email" class="form-control border border-dark px-[4rem]"
                        v-model="form.email">
                </div>
            </div>
        </div>
        <div class=" d-flex justify-content-end ">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Fermer</button>
            <button type="submit" class="btn btn-light">
                Enregistrer
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </div>
    </form>
    <div v-else class="container">
        <div class="col-md-8 mx-auto mb-3">
            <p class="text-center h5">Le nouvel utilisateur a été créé avec succès! Veuillez récupérer les identifiants
                du compte ci-dessous</p>
        </div>

        <div class="col-md-4 text-center mx-auto bg-gris p-3" v-if="newUser != null">
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <div class="row">
                    <h5 class="col-md-10 text-primary" ref="usernameRef">{{ newUser.user.name }}</h5>
                    <button @click="copyToClipboard('usernameRef')" class="col-md-2 btn btn-light">
                        <i :class="copyIconUsername"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Mot de passe temporaire</label>
                <div class="row">
                    <h5 class="col-md-10 text-primary" ref="passwordRef">{{ newUser.password }}</h5>
                    <button @click="copyToClipboard('passwordRef')" class="col-md-2 btn btn-light">
                        <i :class="copyIconPassword"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CreateUtilisateur',
    inject: ['dialogRef'],
    data() {
        return {
            table: 'utilisateurs',
            isLoading: false,
            userIsReady: false,
            newUser: null,
            form: {},
            copiedUsername: false,
            copiedPassword: false,
            copyIconUsername: 'fas fa-copy',
            copyIconPassword: 'fas fa-copy',
        }
    },
    methods: {
        createLine() {
            this.isLoading = true
            this.form.fullname = this.form.last_name + ' ' + this.form.first_name
            this.axios.post('/api/' + this.table, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.resetForm()
                    $('#refresh' + this.table).click()
                    // this.dialogRef.close()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    this.newUser = response.data.data
                    this.userIsReady = true
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
        resetForm() {
            this.form = {}
        },
        copyToClipboard(refName) {
            // Accéder à l'élément via la référence
            const textToCopy = this.$refs[refName].innerText;

            // Créer un élément temporaire pour copier le texte
            const el = document.createElement('textarea');
            el.value = textToCopy;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);

            // Mettre à jour les états en fonction de la référence copiée
            if (refName === 'usernameRef') {
                this.copiedUsername = true;
                this.copyIconUsername = 'fas fa-check';

                setTimeout(() => {
                    this.copiedUsername = false;
                    this.copyIconUsername = 'fas fa-copy';
                }, 5000);
            } else if (refName === 'passwordRef') {
                this.copiedPassword = true;
                this.copyIconPassword = 'fas fa-check';

                setTimeout(() => {
                    this.copiedPassword = false;
                    this.copyIconPassword = 'fas fa-copy';
                }, 5000);
            }
        }
    }
})
</script>
