<template>
    <form @submit.prevent="saveLine()" class="py-3">
        <div class="row">
            <div class="form-group col-md-3">
                <label>Nom</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.nom" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Code</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.code" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Téléphone</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.telephone" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Email</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.email" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Ville</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.ville" :disabled="this.formLocked">
            </div>
            <div v-if="!client" class="form-group col-md-3">
                <label>Client</label>
                <span v-if="resIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                <select class="form-control bg-bg-input border border-dark px-[4rem]" v-model="formClient.client_id"
                    @change="setLibelle()" required :disabled="this.formLocked">
                    <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.libelle }}
                    </option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <label>Numéro d'assurance</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.numero_assurance" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Numéro CNSS</label>
                <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.numero_cnss" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Pourcentage assurance %</label>
                <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" min="0" required
                    v-model="formClient.remise_percent" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3">
                <label>Plafond dette</label>
                <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.plafond_dette" :disabled="this.formLocked">
            </div>
            <div class="form-group col-md-3" v-if="this.formLocked">
                <label>Crédit disponible</label>
                <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]"
                    v-model="formClient.current_remboursement_amount" disabled>
            </div>
        </div>
        <div class=" d-flex justify-content-end " v-if="this.formLocked == false">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">
                {{ buttonLabel }} <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </div>
    </form>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'FormClentTier',
    inject: ['dialogRef'],
    props: {
        datas: {
            type: Object,
            default: null,
        },
        formLocked: {
            type: Boolean,
            default: false
        },
        client: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            resIsLoading: false,
            table: 'clients',
            isLoading: false,
            clients: [],
            line: null,
            formClient: {
                created_by: this.$store.getters.user.fullname
            }
        }
    },
    created() {
        if (this.datas) {
            this.line = this.datas
        }
    },
    mounted() {
        if (this.line) {
            this.formClient = {
                nom: this.line.nom,
                libelle: this.line.libelle,
                email: this.line.email,
                telephone: this.line.telephone,
                remise_percent: this.line.remise_percent,
                ville: this.line.ville,
                current_remboursement_amount: this.line.current_remboursement_amount,
                numero_assurance: this.line.numero_assurance,
                numero_cnss: this.line.numero_cnss,
                code: this.line.code,
                client_id: this.line.client_id,
                plafond_dette: this.line.plafond_dette,
                current_remboursement_amount: this.line.current_remboursement_amount,

            }
        } else if (this.client) {
            this.formClient = {
                libelle: this.client.libelle,
                remise_percent: this.client.remise_percent,
                client_id: this.client.id,
            }
        }
        this.getClients()
    },
    computed: {
        buttonLabel() {
            return this.line ? "Mettre à jour" : "Enregistrer";
        }
    },
    methods: {
        getClients() {
            this.resIsLoading = true
            this.axios.get( '/api/' + this.table + '/base').then(response => {
                this.resIsLoading = false
                const allClientsBase = response.data.data
                //on retire le client comptant de la selection
                this.clients = allClientsBase.filter(item => item.libelle.toLowerCase() !== 'comptant')
            }).catch(() => {
                this.resIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        setLibelle() {
            let client = this.clients.filter(item => item.id == this.formClient.client_id)
            if (client.length > 0 && client[0].libelle) {
                this.formClient.libelle = client[0].libelle
                this.formClient.remise_percent = client[0].remise_percent
            }
        },
        saveLine() {
            this.isLoading = true
            let url = '/api/' + this.table
            if (this.line) {
                url = '/api/' + this.table + '/' + this.line.id + '/update'
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
                created_by: this.$store.getters.user.fullname
            }
        }
    }
})
</script>
