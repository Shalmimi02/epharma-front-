<template>
    <form @submit.prevent="saveLine()">
        <div>
            <p class="h5">Informations générales</p>
            <div class="form-row">
                <label>Nom du produit</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                    v-model="form.libelle"  disabled>
           
            </div>
            <div class="form-row">
                <div class="form col-md-6">
                    <label>Fournisseur</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                    v-model="form.nom_fournisseur" disabled>
                       
                    </input>
                </div>
                <div class="form col-md-6">
                    <label>Statut de mouvement</label>
                    <select name="" class="form-control border border-dark px-[4rem]" id="exampleFormControlSelect1"
                    v-model="form.statut"  :disabled="this.formLocked" required>
                    <option value="En attente de remboursement">En attente de remboursement</option>
                    <option value="Rembourse">Remboursé</option>
                </select>
                </div>
            </div>
        </div>

        <div class=" d-flex justify-content-end " v-if="this.formLocked == false">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">
                {{ buttonLabel }} <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </div>

    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FormRetour',
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
            table: 'retours',
            isLoading: false,
            line: null,
            form: {},
            fournisseurs: [],
            motifs: []
        }
    },
    created(){
        if (this.dialogRef.data) {
            this.line = this.dialogRef.data
        }
        else if (this.datas) {
            this.line = this.datas
        }
    },
    mounted() {
        if(this.line){
            this.form = {
            libelle: this.line.libelle,
            quantite: this.line.qte,
            nom_fournisseur: this.line.nom_fournisseur,
            statut: this.line.statut,
        }
        }
        this.getFournisseurs();
        this.getMotifs();
        
    },
    computed: {
        buttonLabel() {
            return this.line ? "Mettre à jour" : "Enregistrer";
        }
    },
    methods: {
        saveLine() {
            this.isLoading = true

            let url = '/api/' + this.table
            if (this.line) {
                url = '/api/' + this.table + '/' + this.line.id + '/update', this.form
            }

            this.axios.post(url, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refreshretours' + this.table).click()

                    if (this.line) {
                        this.$emit('line_updated')
                    }

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
        // resetForm() {
            // this.form = {
            //     libelle: '',
            //     nom_fournisseur: '',
            //     statut: ''
            // }
        // },
        getFournisseurs() {
            this.axios.get('/api/fournisseurs').then(response => {
                this.fournisseurs = response.data.data;
            }).catch(() => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les fournisseurs.',
                    life: 5000
                });
            });
        },
        getMotifs() {
            this.axios.get( '/api/mouv_motifs').then(response => {
                this.motifs = response.data.data;
            }).catch(() => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les motifs.',
                    life: 5000
                });
            });
        }
    }
})
</script>
