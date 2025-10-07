<template>
    <div>
    <div class="d-flex mb-3" v-if="formLocked == true && datas.id !== 1">
        <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()">
            <i class="fas fa-trash-alt"></i> Supprimer
        </button>
        <button type="button" class="btn btn-dark btn-sm mr-2" @click.prevent="openClientTier()"
            v-if="!datas.client_id">
            <i class="fas fa-eye"></i> Voir les clients
        </button>
        <button v-else type="button" class="btn btn-secondary btn-sm mr-2" @click.prevent="openModal()">
            <i class="fas fa-eye"></i> Voir les factures
        </button>
        <SoldeClient :datas="datas"></SoldeClient>
        <button type="button" class="btn btn-outline-primary btn-sm mr-2" @click.prevent="openStatistique()">
            <i class="fa-solid fa-chart-simple"></i> Statistiques
        </button>
    </div>

    <section :key="key">
        <FormClientTier v-if="this.dialogRef.data.client_id != null && this.dialogRef.data.client_id != ''" :formLocked="formLocked" :datas="this.dialogRef.data" v-on:line_updated="switchStatutModif"/>
        <FormClientBase v-else :formLocked="formLocked" :datas="this.dialogRef.data" v-on:line_updated="switchStatutModif"/>
    </section>
    

    <div v-if="!datas.client_id">
        <div v-if="openForm">
            <h5>Nouveau client tier</h5>
            <FormClientTier :client="this.dialogRef.data"/>
        </div>    
        <button v-if="datas.id != 1 && !openForm && formLocked" type="button" class="btn btn-bleu2 sm mr-auto mb-3" @click="openForm = true">
            Créer un compte tier
        </button>
    </div>

    <div v-if="formLocked == true && datas.client_id">
        <div class="card card-body bg-primary text-uppercase text-white mb-3" style="width: 28rem;">
            <span v-if="counterIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            <h6>Montant de la dette actuelle</h6>
            <h5>{{ $moneyFormat(detteActuelle) }}</h5>
        </div>

        <!-- partie pour enregistrer et voir les remboursements  -->
        <section>
            <h5 class="mb-3">Remboursements</h5>
            <form @submit.prevent="saveRemboursement()" v-if="detteActuelle > 0" class="form-inline">
                <div class="form-group mb-2">
                    <select class="form-control" v-model="form.vente" style="min-width: 200px;" @change="showMontant()">
                        <option v-for="(vente, index) in mesventes" :key="index" :value="vente">
                            Vente {{ vente.position_and_date }}, montant: {{ $moneyFormat(vente.total_prise_en_charge) }}
                        </option>
                    </select>
                </div>
                <div class="form-group mx-sm-3 mb-2">
                    <input type="number" placeholder="Montant du versement" min="0" step="any" v-model="form.montant"
                        class="form-control" disabled>
                </div>
                <button type="submit" class="btn btn-primary mb-2" :disabled="!form.montant">Enregistrer le versement
                    <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                </button>
            </form>

            <AsdecodeTable noExport :key="key" :url="'/api/remboursements?client_id=' + this.datas.id"
                :columns="columns" table="remboursements" />
        </section>
    </div>
</div>
</template>

<script>
import $ from "jquery"
import { defineComponent, defineAsyncComponent } from 'vue';
import MoneyCounter from "@/components/MoneyCounter.vue";
import StatClient from './StatClient'
const SoldeClient = defineAsyncComponent(() => import('./SoldeClient.vue'))
const ShowFactureClient = defineAsyncComponent(() => import('./ShowFactureClient.vue'));
const ClientTierModal = defineAsyncComponent(() => import('./ListeClientTierModal.vue'));
import FormClientBase from './FormClientBase.vue'
import FormClientTier from './FormClientTier.vue'

export default defineComponent({
    name: 'ShowClient',
    inject: ['dialogRef'],
    components: { FormClientBase, FormClientTier, MoneyCounter, ShowFactureClient, SoldeClient },
    data() {
        return {
            key: 1,
            lines: 0,
            table: 'clients',
            isLoading: false,
            counterIsLoading: false,
            resIsLoading: false,
            formLocked: true,
            openForm: false,
            datas: this.dialogRef.data,
            detteActuelle: parseFloat(this.dialogRef.data.current_dette),
            clients: [],
            columns: [
                {
                    key: 'created_at',
                    label: 'DATE',
                    format: 'datetime',
                    exportable: true
                },
                {
                    key: 'montant',
                    label: 'MONTANT PAYE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'reste_a_payer',
                    label: 'RESTE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'UTILISATEUR',
                    exportable: true
                }

            ],
            key: 1,
            keyWord: '',
            formClient: {
                client_id: this.dialogRef.data.client_id,
                remise_percent: this.dialogRef.data.remise_percent,
                libelle: this.dialogRef.data.libelle
            },
            form: {
                client_id: this.dialogRef.data.id,
                created_by: this.$store.getters.user.fullname
            },
            mesventes: []
        }
    },
    mounted() {
        this.getMesVentes()
    },
    methods: {
        openModal() {
            this.$dialog.open(ShowFactureClient, {
                props: {
                    header: "Listes des ventes  de " + this.datas.libelle,
                    style: {
                        width: '80vw',
                    },
                    modal: true
                },
                data: this.datas
            });
        },
        openStatistique() {
            this.$dialog.open(StatClient, {
                props: {
                    header: "Listes des ventes  de " + this.datas.libelle,
                    style: {
                        width: '80vw',
                    },
                    modal: true
                },
                data: this.datas
            });
        },
        showMontant() {
            const vente = this.form.vente
            this.form.montant = vente.total_prise_en_charge
            this.form.venteId = vente.id

        },

        getMesVentes() {
            this.resIsLoading = true
            this.axios.get('/api/ventes?clientId=' + this.datas.id + '&statut=Impayé').then(response => {
                this.resIsLoading = false
                this.mesventes = response.data.data
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
        refreshCounter() {
            this.counterIsLoading = true
            this.axios.get('/api/' + this.table + '/' + this.datas.id).then(response => {
                this.counterIsLoading = false
                const client = response.data.data
                this.detteActuelle = client.current_dette
            }).catch(() => {
                this.counterIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        saveRemboursement() {
            this.isLoading = true
            this.axios.post('/api/remboursements', this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.refreshCounter()
                    this.getMesVentes()
                    $('#refreshremboursements').click()
                    $('#refreshclients').click()
                    this.form = {
                        client_id: this.dialogRef.data.id,
                        created_by: this.$store.getters.user.fullname
                    }
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
                    })
                }
            })

        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        openClientTier() {
            this.$dialog.open(ClientTierModal, {
                props: {
                    header: "Listes des clients tiers  de " + this.datas.libelle,
                    style: {
                        width: '80vw',
                    },
                    modal: true
                },
                data: this.datas
            });
        },
        
    }
})
</script>