<template>
    <div class="d-flex mb-3" v-if="formLocked == true">
        <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()" v-show="datas.name != 'superadmin'">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()" v-show="datas.name != 'superadmin'">
            <i class="fas fa-trash-alt"></i> Supprimer
        </button>
        <button type="button" class="btn btn-secondary btn-sm mr-2" @click.prevent="resetPassword()">
            <i class="fas fa-trash-alt"></i> Reinitialiser mot de passe
            <span v-if="resetIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
        </button>
    </div>
   
    <EditUtilisateur v-if="userAfterReset == null" :key :formLocked="formLocked" :datas="datas"
        v-on:line_updated="switchStatutModif"></EditUtilisateur>
    <div v-else class="container">
        <hr class="my-2">
        <div class="col-md-8 mx-auto mb-3">
            <p class="text-center h5">Le nouvel utilisateur a été créé avec succès! Veuillez récupérer les identifiants
                du compte ci-dessous</p>
        </div>

        <div class="col-md-4 text-center mx-auto bg-gris p-3" v-if="userAfterReset != null">
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <div class="row">
                    <h5 class="col-md-10 text-primary" ref="usernameRef">{{ userAfterReset.user.name }}</h5>
                    <button @click="copyToClipboard('usernameRef')" class="col-md-2 btn btn-light">
                        <i :class="copyIconUsername"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Mot de passe temporaire</label>
                <div class="row">
                    <h5 class="col-md-10 text-primary" ref="passwordRef">{{ userAfterReset.password }}</h5>
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
import { defineComponent, defineAsyncComponent } from 'vue';
const EditUtilisateur = defineAsyncComponent(() => import('./EditUtilisateur.vue'));

export default defineComponent({
    name: 'ShowUtilisateur',
    inject: ['dialogRef'],
    components: { EditUtilisateur },
    data() {
        return {
            key: 1,
            table: 'utilisateurs',
            isLoading: false,
            resetIsLoading: false,
            userAfterReset: null,
            formLocked: true,
            datas: this.dialogRef.data,
           
            copiedUsername: false,
            copiedPassword: false,
            copyIconUsername: 'fas fa-copy',
            copyIconPassword: 'fas fa-copy',
        }
    },
    methods: {
        switchStatutModif() {
            this.key++
            if (this.formLocked == false) {
                this.formLocked = true
            }
            else this.formLocked = false
        },
        deleteLine() {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.isLoading = true
                    this.axios.post('/api/' + this.table + '/' + this.datas.id + '/destroy').then((response) => {
                        this.isLoading = false
                        if (response.data.success === true) {
                            $('#refresh' + this.table).click()
                            this.dialogRef.close()
                            this.$toast.add({
                                severity: 'success',
                                detail: response.data.message,
                                life: 3000
                            });
                        }
                        else {
                            response.data.errors.forEach(element => {
                                this.$toast.add({
                                    severity: 'warn',
                                    summary: 'Oups !',
                                    detail: element,
                                    life: 20000
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
                    });
                }
            })
        },
        resetPassword() {
            this.resetIsLoading = true
            this.axios.post('/api/' + this.table + '/' + this.datas.id + '/reset-password', this.form).then(response => {
                this.resetIsLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    this.userAfterReset = response.data.data
                    // this.dialogRef.close()
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
                this.resetIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
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