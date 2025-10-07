<template>
    <form @submit.prevent="saveLine()" class="py-3">
        <p class="h5">Informations générales</p>
        <div class="form-row">
            <div class="form-group col-md-6">
                <label>libelle</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                    v-model="formClient.libelle" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-6">
                <label>Pourcentage assurance %</label>
                <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" min="0" required
                    v-model="formClient.remise_percent" :disabled="this.formLocked">
            </div>
        </div><br>
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
import $ from 'jquery'
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'FormClentBase',
    inject: ['dialogRef'],
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
    data() {
        return {
            table: 'clients',
            isLoading: false,
            formClient: {
                remise_percent: 0,
                created_by: this.$store.getters.user.fullname
            },
            line: null,
        }
    },
    created() {
        if (this.datas) {
            this.line = this.datas
        }
    },
    mounted() {
        if(this.line) {
            this.formClient = {
                libelle: this.line.libelle,
                remise_percent:  this.line.remise_percent,
            }
        }
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
                url ='/api/' + this.table + '/' + this.line.id + '/update'
            }
            this.axios.post(url, this.formClient).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    if (!this.line) {
                        this.resetForm()
                    }

                    this.dialogRef.close();
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
            this.formClient = {
                remise_percent: 0,
                created_by: this.$store.getters.user.fullname
            }
        }
    }
})
</script>
