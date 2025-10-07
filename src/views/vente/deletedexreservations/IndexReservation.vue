<template>
    <EpharmaTemplate :withHeader="false">
        <template #content v-if="isReady == true">
            <div class="bg-primary rounded" v-if="gardeActive != null">
                <p class="text-center text-white">Une garde est en cours, taxe : {{
                    $moneyFormat(gardeActive.montant_taxe) }}</p>
            </div>
            <div class="container py-3">
                 <!-- Loader Condition for isLoading or isSaving -->
                <HourGlassLoader
                    v-if="isLoading"
                    :isOverlay="true"
                   
                ></HourGlassLoader>

                <HourGlassLoader
                    v-else-if="isSaving"
                    :isAutoSave="true"
                    message="Sauvegarde en cours..."
                ></HourGlassLoader>
                <div v-else class="d-flex mx-auto align-items-center">
                    <div class="d-flex">
                        <div class="h2 btn btn-lg bg-primary text-white">
                            N° <span v-if="selectedReservation != null">{{ selectedReservation.position }}</span>
                        </div>

                        <div class="mx-2 text-primary" style="cursor: pointer;" @click="createReservation"
                            title="Nouvelle réservation">
                            <i class="fa-solid fa-circle-plus bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                    <div style="max-width: 65vw; overflow-x: auto;">
                        <div class="d-flex justify-content-center px-3">
                            <div v-for="reservation in reservations" :key="reservation.id"
                                class="rounded-pill reservation-circle mx-2" :class="{
                                    'border-primary text-primary': reservation.id === selectedReservation.id && !reservation.canceled,
                                    'bg-danger border-danger text-white': reservation.status == 'Annule',
                                }" @click="selectReservation(reservation)">
                                <span>{{ reservation.position }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex ml-auto">
                        <div class="mx-2 text-danger" style="cursor: pointer;" @click="cancelReservation"
                            title="Annuler la réservation"
                            v-if="selectedReservation != null && selectedReservation.status != 'Termine' && selectedReservation.status != 'Annule' && selectedReservation.status != 'Devis'">
                            <i class="fas fa-minus-circle bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                        </div>
                        <div class="mx-2 text-primary" style="cursor: pointer;" @click="refreshReservations"
                            title="Rafraichir">
                            <i class="fa-solid fa-rotate bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                </div>
            </div>
            <section class="container" v-if="globalReservation !== null" :key="key">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-9 h-fixed">
                        <FormReservation :key="keyForm"  :reservation="globalReservation"
                            :nbProduits="nb_products" @refreshReservation="refreshSelectedReservation" @remise_percent="updatePercent" 
                            :total="globalReservation.total_prise_en_charge"
                            />
                        <SelectReservationProduit v-if="isTreatable() == true " :key="keySelection"
                        :garde="gardeActive" :reservationId="globalReservation.id" @refreshReservation="refreshSelectedReservation" :remise_percent="clientRemisePercent"/>
                        <ShowReservation :garde="gardeActive" :key="keyShow" :reservation="globalReservation"
                            @nb_products="updateNbProduit" @refreshReservation="refreshSelectedReservation" :remise_percent="clientRemisePercent">
                        </ShowReservation>
                    </div>
                    <div class="col-md-3">
                        <ResultReservation :key="keyResult" :reservation="globalReservation"
                            :nbProduits="nb_products" @montant_updated="keyReglement++"
                            @refreshReservation="refreshSelectedReservation"></ResultReservation
                            >
                        <BuyReservation :key="keyReglement" v-if="nb_products > 0 && globalReservation.caisse == 'Default'" :reservation="globalReservation"
                            @refreshReservation="refreshSelectedReservation" >
                        </BuyReservation>
                    </div>
                </div>
            </section>
        </template>
    </EpharmaTemplate>
</template>
<script>
import FormReservation from "./FormReservation.vue";
import SelectReservationProduit from "./SelectReservationProduit.vue";
import ShowReservation from "./ShowReservation.vue";
import ResultReservation from "./ResultReservation.vue";
import BuyReservation from "./BuyReservation.vue";

export default {
    name: "Reservations",
    components: { FormReservation, SelectReservationProduit, ShowReservation, ResultReservation, BuyReservation },
    data() {
        return {
            isReady: false,
            key: 1,
            keyForm: 1,
            keySelection: 1,
            keyShow: 1,
            keyResult: 1,
            keyReglement: 1,
            isLoading: false,
            isSaving:false,
            nb_products: 0,
            reservations: [], // Liste des réservations
            selectedReservation: null, // la réservation sélectionnée
            globalReservation: null, // objet de la réservation sélectionnée qui va recevoir les modification
            baseUrl: this.$store.state.api_epharma_ventes,
            gardeActive: null,
            clientRemisePercent: 0
        };
    },
    created() {
        this.checkGardeActive()
    },
    methods: {
        updatePercent(percent) {
            this.clientRemisePercent = parseFloat(percent)
            this.keyShow++
            this.keySelection++
        },
        checkGardeActive() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/gardes/actuelle').then((response) => {
                if (response.data && response.data.data) {
                    this.gardeActive = response.data.data
                }
                this.isReady = true
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
        updateNbProduit(lines) {
            this.nb_products = lines
        },
        refreshReservations() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/reservations/jour').then((response) => {
                this.reservations = response.data.data
                if (this.reservations.length > 0) {
                    this.selectedReservation = this.reservations[0]
                    this.globalReservation = this.reservations[0]   
                    this.key++
                }
                this.keyResult++; // Force la mise à jour du composant ResultReservation
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
        refreshSelectedReservation() {
            this.isSaving = true;

            // Requête pour obtenir les dernières données de la réservation
            this.axios
                .get(`${this.baseUrl}/api/reservations/${this.selectedReservation.id}`)
                .then((response) => {
                    const updatedReservation = response.data.data;

                    // Vérifiez si le nombre de produits a changé
                    const previousNbProducts = this.nb_products;
                    const newNbProducts = updatedReservation.produits?.length || 0;

                    // Mettez à jour les données locales
                    this.globalReservation = { ...updatedReservation };
                    this.nb_products = newNbProducts;

                    // Actualisez uniquement si le nombre de produits a changé
                    if (newNbProducts !== previousNbProducts) {
                        console.log(
                            `Nouveau produit détecté : ${newNbProducts - previousNbProducts}`
                        );
                       
                        this.key++;
                    }

                    // Forcer l'actualisation des composants dépendants
                    this.keyShow++;
                    this.keyResult++;
                    this.keyReglement++;

                    this.isSaving = false;
                })
                .catch(() => {
                    this.isSaving = false;
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000,
                    });
                });
        },
        createReservation() {
            // Ajouter une nouvelle réservation
            this.isLoading = true
            let form = {
                created_by: this.$store.getters.user.fullname
            }
            this.axios.post(this.baseUrl + '/api/reservations', form).then((response) => {
                if (response.data.success == true) {
                    this.selectedReservation = response.data.data
                    this.refreshReservations()
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
        selectReservation(reserv) {
            this.selectedReservation = reserv;
            this.globalReservation = reserv;
            this.key++
        },
        cancelReservation() {
            if (this.selectedReservation) {
                this.isLoading = true
                this.selectedReservation.status = 'Annule'
                this.axios.post(`${this.baseUrl}/api/reservations/${this.selectedReservation.id}/update`, this.selectedReservation).then(response => {
                    this.isLoading = false
                    if (response.data.success === true) {
                        this.refreshSelectedReservation
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
            }
        },
        isTreatable() {
            if (this.selectedReservation.status != 'Termine' && this.selectedReservation.status != 'Annule' && this.selectedReservation.status != 'Devis') {
                return true
            } else return false
        }
    },
    mounted() {
        this.refreshReservations();
    },
    watch: {
    globalReservation: {
        deep: true,
        handler(newVal) {
           
            this.keyResult++; // Forcer la mise à jour
        },
    },
},
     
};
</script>
<style scoped>
.reservation-circle {
    min-width: 50px;
    width: 50px;
    height: 50px;
    border: 2px solid lightgray;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
}

.reservation-circle:hover {
    border-color: gray;
}

.border-primary {
    border-color: #007bff !important;
}

.text-primary {
    color: #007bff !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.border-danger {
    border-color: #dc3545 !important;
}

.text-white {
    color: #fff !important;
}

.h-fixed {
    height: 70vh;
    overflow-y: auto;
}
</style>