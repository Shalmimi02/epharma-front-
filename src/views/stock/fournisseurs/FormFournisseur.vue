<template>
    <form @submit.prevent="createLine()">
        <div>
            <p>Informations générales </p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Nom du Fournisseur(s)*</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.libelle" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Site internet
                    </label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.siteurl" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Adresse</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.adresse" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Adresse email</label>
                    <input type="email" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.email" :disabled="this.formLocked">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Téléphone</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.telephone" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Site
                    </label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.site"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Rang</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.rang"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Compte bancaire
                    </label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.compte_bancaire" :disabled="this.formLocked">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Ville</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.ville" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Pays
                    </label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.pays" :disabled="this.formLocked">
                </div>
            </div>
        </div>

        <div class=" d-flex justify-content-end " v-if="this.formLocked == false">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">
                {{ buttonLabel }} <span v-if="isLoading == true"
                    class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </div>
    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FormFournisseur',
    props: {
        datas: {
            type: Object,
            default: null,
        },
        formLocked: {
            type: Boolean,
            default: false
        }
    },
    inject: ['dialogRef'],
    data() {
        return {
            table: 'fournisseurs',
            isLoading: false,
            line: null,
            form: {}
        }
    },
    created() {
        if (this.dialogRef.data) {
            this.line = this.dialogRef.data
        }
        else if (this.datas) {
            this.line = this.datas
        }
    },
    mounted() {
        if(this.line) {
            this.form = {
                libelle: this.line.libelle,
                siteurl: this.line.siteurl,
                adresse: this.line.adresse,
                email: this.line.email,
                telephone: this.line.telephone,
                site: this.line.site,
                rang: this.line.rang,
                compte_bancaire: this.line.compte_bancaire,
                ville: this.line.ville,
                pays: this.line.pays,
            }
        }
    },
    computed: {
        buttonLabel() {
            return this.line ? "Mettre à jour" : "Enregistrer";
        }
    },
    methods: {
        createLine() {
            this.isLoading = true
            let url = '/api/' + this.table
            if (this.line) {
                url = '/api/' + this.table + '/' + this.line.id + '/update'
            }

            this.axios.post(url, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()

                    if (this.line) {
                        this.$emit('line_updated')
                    }
                    else this.resetForm()

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
        }
    }
})
</script>
