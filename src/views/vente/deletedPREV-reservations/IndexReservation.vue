<template>
    <EpharmaTemplate :withHeader="false">
        <template #content>
            <div class="bg-primary rounded" v-if="gardeActive != null">
                <p class="text-center text-white">Une garde est en cours, taxe : {{ moneyFormat(gardeActive.montant_taxe) }}</p>
            </div>
            <div class="container py-3">
                <HourGlassLoader v-if="isLoading === true"></HourGlassLoader>
                <div v-else class="d-flex mx-auto align-items-center">
                    <div class="d-flex">
                        <div class="h2 btn btn-lg bg-primary text-white">
                            N° <span v-if="selectedReservation != null">{{ selectedReservation.position }}</span>
                        </div>

                        <div class="mx-2 text-primary" style="cursor: pointer;" @click="createLine" title="Nouvelle réservation">
                          <i class="fa-solid fa-circle-plus bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>  
                        </div>
                    </div>
                    <div class="d-flex" style="max-width: 90vw; overflow-x: auto;">
                        <button type="button" class="btn rounded-pill mx-1 px-3  mb-2"
                            v-for="(reservation, index) in reservations" :key="index"
                            :class="[selectedReservation != null && selectedReservation.id == reservation.id ? 'bg-white border-primary font-weight-bold' : 'bg-white border-light']"
                            @click="onClickReservation(reservation)">
                            <span :class="{ 'text-danger': reservation.status == 'Annule' }">
                                {{ reservation.position }}
                            </span>
                        </button>
                    </div>
                    <div class="d-flex ml-auto">
                        <div class="mx-2 text-danger" style="cursor: pointer;" @click="stopReservation" title="Annuler la réservation"
                        v-if="selectedReservation != null && selectedReservation.status != 'Termine' && selectedReservation.status != 'Annule' && selectedReservation.status != 'Devis'">
                          <i class="fas fa-minus-circle bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>  
                        </div>
                        <div class="mx-2 text-primary" style="cursor: pointer;" @click="getReservations" title="Rafraichir">
                          <i class="fa-solid fa-rotate bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>  
                        </div>
                    </div>
                </div>
            </div>
            <div class="container" v-if="selectedReservation !== null">
                <div class="row d-flex justify-content-center" :key="key">
                    <div class="col-md-9 h-fixed">
                        <EditReservation :reservation="selectedReservation" :nbProduits="nb_products" :caisses="caisses" @remise_percent="updatePercent"
                            :clients="clients" @update-reservation="updateGlobalReservation">
                        </EditReservation>
                        <SelectReservationProduit :key="keyStep2" v-if="isTreatable() == true" :remise_percent="clientRemisePercent"
                            :reservation="selectedReservation" :garde="gardeActive" @set-products="this.keyStep3++">
                        </SelectReservationProduit>
                        <ShowReservation :key="keyStep3" :reservation="selectedReservation" :remise_percent="clientRemisePercent" :garde="gardeActive"
                            @product-removed="this.keyStep2++" @switch-to-devis="switchToDevis()"
                            @nb_products="updateNbProduit">
                        </ShowReservation>
                    </div>
                    <div class="col-md-3" >
                        <button hidden id="refreshreservationmontant" type="button"
                            @click="refreshReservation()">Raffraichir</button>
                        <div class="card card-body p-1 bg-primary text-white mb-2">
                            <h4>TTC</h4>
                            <span v-if="refreshIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <h3 v-else class="text-nowrap">{{ moneyFormat(selectedReservation.montant) }}</h3>
                        </div>
                        <div class="card card-body p-1 bg-info text-white mb-2">
                            <span v-if="refreshIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                                aria-hidden="true"></span>
                            <div v-else>
                                <h6 class="text-nowrap">% TAUX : {{ moneyFormat(selectedReservation.total_prise_en_charge)
                                    }}</h6>
                                <h6 class="text-nowrap">TOTAL HT: {{ moneyFormat(selectedReservation.total_ht) }}</h6>
                                <h6 class="text-nowrap">TOTAL TVA: {{ moneyFormat(selectedReservation.total_tva) }}</h6>
                                <h6 class="text-nowrap">TOTAL CSS: {{ moneyFormat(selectedReservation.total_css) }}</h6>
                                <h6 class="text-nowrap" v-if="gardeActive != null">Garde: {{ moneyFormat(selectedReservation.total_garde) }}</h6>
                            </div>
                        </div>
                        <!-- <div class="d-flex">
                            <label >Remise:</label>
                            <input type="number" style="width: 90px;" class="form-control border border-dark px-[4rem] ml-2 mb-3"
                            name="" @input="calculRemise()" v-model="form.remise">
                        </div> -->
                        <div class="mt-3" v-if="selectedReservation.client_id && selectedReservation.switch_caisse_at">
                            <p>Réservation envoyé à la caisse {{ selectedReservation.caisse }}</p>
                        </div>
                        <div v-else-if="(selectedReservation.caisse_id) && isTreatable() == true && nb_products > 0">
                            <button type="button" class="btn btn-primary mx-auto mt-5 mb-1" @click="sendReservation()">
                                <i class="fa-solid fa-share mr-1"></i> Passer à la caisse
                            </button>
                        </div>
                        <BuyReservation :key="keyReglement" v-if="nb_products > 0" :reservation="selectedReservation"
                            @paiement-reservation="updatePaiement" >
                        </BuyReservation>
                    </div>
                </div>
            </div>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent } from 'vue'
import EditReservation from "./EditReservation.vue";
import ShowReservation from "./ShowReservation.vue";
import BuyReservation from "./BuyReservation.vue";
import SelectReservationProduit from "./SelectReservationProduit.vue";

export default defineComponent({
    components: { EditReservation, SelectReservationProduit, ShowReservation, BuyReservation },
    data() {
        return {
            key: 1,
            keyStep2: 1,
            keyStep3: 1,
            keyReglement: 1,
            isLoading: false,
            // remise: {},
            refreshIsLoading: false,
            nb_products: 0,
            selectedReservation: null,
            reservations: [],
            caisses: [],
            clients: [],
            gardeActive: null,
            baseUrl: this.$store.state.api_epharma_ventes,
            clientRemisePercent: 0
        }
    },
    created() {
        this.checkGardeActive()
    },
    mounted() {
        this.getClients()
        this.getCaisses()
        this.getReservations()
    },
    methods: {
        updatePercent(percent) {
            this.clientRemisePercent = parseFloat(percent)
            this.keyShow++
            this.keySelection++
        },
        updatePaiement(){
            this.selectedReservation.status = 'Termine';
            this.key++
            this.keyStep2++
            this.keyStep3++
        },
        moneyFormat(varMoney) {
            if (varMoney) {
                // Arrondir d'abord la valeur à l'entier le plus proche
                const roundedValue = Math.round(varMoney);
                // Formater sans décimales
                return new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(roundedValue) + ' FCFA';
            }
            return '0 FCFA';
        },
        onClickReservation(reservation) {
            this.selectedReservation = reservation
            this.key++
        },
        createLine() {
            this.checkGardeActive()
            this.isLoading = true
            let form = {
                created_by: this.$store.getters.user.fullname
            }
            this.axios.post(this.baseUrl + '/api/reservations', form).then((response) => {
                if (response.data.success == true) {
                    this.selectedReservation = response.data.data
                    this.getReservations()
                    this.isLoading = false
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
                    this.isLoading = false
                }
            })
        },
        getReservations() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/reservations/jour').then((response) => {
                this.reservations = response.data.data
                if (this.reservations.length > 0) {
                    this.selectedReservation = this.reservations[0]
                    this.key++
                }
                this.isLoading = false
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
        // calculRemise(){
        //     let remise = this.selectedReservation
        //     this.form.remise = this.selectedReservation.montant - 
            

        // },
        checkGardeActive() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/gardes/actuelle').then((response) => {
                if (response.data && response.data.data) {
                    this.gardeActive = response.data.data
                    this.keyStep2
                }
                this.isLoading = false
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
        sendReservation() {
            this.selectedReservation.switch_caisse_at = new Date().toLocaleString('fr-FR')
            this.updateReservation()
        },
        stopReservation() {
            this.selectedReservation.status = 'Annule'
            this.updateReservation()
        },
        updateReservation() {
            this.axios.post(`${this.baseUrl}/api/reservations/${this.selectedReservation.id}/update`, this.selectedReservation).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.key++
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
        updateGlobalReservation(newReservation) {
            this.selectedReservation.caisse = newReservation.caisse;
            this.selectedReservation.caisse_id = newReservation.caisse_id;
            this.selectedReservation.client = newReservation.client;
            this.selectedReservation.client_id = newReservation.client_id;
            this.selectedReservation.identifiant_assure = newReservation.identifiant_assure;
            this.selectedReservation.nom_assure = newReservation.nom_assure;
            this.selectedReservation.numero_feuille_assure = newReservation.numero_feuille_assure;
            this.selectedReservation.secteur_assure = newReservation.secteur_assure;
            this.keyStep2++
            this.keyStep3++
        },
        updateNbProduit(lines) {
            this.nb_products = lines
        },
        switchToDevis() {
            this.selectedReservation.status = 'Devis'
            this.selectedReservation.switch_devis_at = new Date().toLocaleString('fr-FR')
            this.updateReservation()
        },
        getCaisses() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/caisses?statut=Ouvert').then(response => {
                this.isLoading = false
                this.caisses = response.data.data
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
        getClients() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/clients').then(response => {
                this.isLoading = false
                this.clients = response.data.data
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
        refreshReservation() {
            this.refreshIsLoading = true
            this.axios.get(this.baseUrl + '/api/reservations/' + this.selectedReservation.id).then((response) => {
                const reservation = response.data.data
                this.selectedReservation.montant = reservation.montant
                this.selectedReservation.total_prise_en_charge = reservation.total_prise_en_charge
                this.selectedReservation.total_tva = reservation.total_tva
                this.selectedReservation.total_css = reservation.total_css
                this.selectedReservation.total_ht = reservation.total_ht
                this.selectedReservation.total_garde = reservation.total_garde
                this.refreshIsLoading = false
                this.keyReglement++
            }).catch(() => {
                this.refreshIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        isTreatable() {
            if (this.selectedReservation.status != 'Termine' && this.selectedReservation.status != 'Annule' && this.selectedReservation.status != 'Devis') {
                return true
            } else return false
        },
       
    },

})
</script>

<style scoped>
.h-fixed {
    height: 70vh;
    overflow-y: auto;
}
</style>