<template>
    <SectionVisibility libelleSection="la premiere étape" :isOpen="true">
        <template #section_content>
            <!-- <div v-if="isLoading == true" class="d-flex justify-content-center">
                <div class="spinner-grow text-primary text-center" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div> -->
            <HourGlassLoader  v-if="isSaving == true" :isAutoSave="true" message="Sauvegarde en cours..." ></HourGlassLoader>
            <div  class="card card-body mb-3 position-relative">
                <div id="overlay" class="overlay "
                    v-if="localReservation.status == 'Annule' || localReservation.status == 'Devis' || localReservation.status == 'Termine'">
                </div>
                <!-- filgrane pour marquer le tatut de la reservation -->
                <div class="watermark border-danger px-5" v-if="localReservation.status == 'Annule'"> Reservation
                    annulée </div>
                <div class="watermark border-danger px-5" v-else-if="localReservation.status == 'Termine'"> Reservation
                    fermée
                </div>
                <div class="watermark border-danger px-5" v-else-if="localReservation.status == 'Devis'"> Transformée en
                    devis</div>
 
                <div class="d-flex flex-wrap mb-3">
                    <button type="button" v-for="caisse in caisses" :key="caisse.id"
                        :class="{ 'border border-primary': localReservation.caisse_id == caisse.id }"
                        class="btn btn-light mr-2 mb-2 py-3 px-4 text-dark" @click="setCaisseId(caisse)">
                        <i class="fas fa-cash-register mr-1"></i>
                        <span>{{ caisse.libelle }}</span>
                    </button>
                </div>
                <form>
                    <div class="form-row">
                        <div class="form-group col-md-5">
                            <label>Client</label>
                            <input v-if="this.nbProduits > 0" type="text" class="form-control" :value="localReservation.client" disabled>
                            <select v-else class="form-control border border-dark px-[4rem]" v-model="localReservation.client_id"
                                @change="setClientLibelle(true)">
                                <option :value="client.id" v-for="client in this.clients" :key="client.id">
                                    <span v-if="client.client_id">{{ client.nom }} ({{ client.libelle }})</span>
                                    <span v-else>{{ client.libelle }}</span>
                                </option>
                            </select>
                        </div>
                        <div
                            class="form-group col-md-5"
                            v-if="clientSelected && parseFloat(clientSelected.current_remboursement_amount) > 0 && localReservation.status !== 'Termine'"
                        >
                            <label>Credit</label>
                            <input
                                type="text"
                                class="form-control"
                                :class="creditClass"
                                :value="creditActuel"
                                disabled
                            />
                        </div>
                    </div>
                    <div class="form-row"
                        v-if="clientSelected != null && clientSelected.libelle && clientSelected.libelle != 'COMPTANT'">
                        <div class="form-group col-md-5">
                            <label>Identifiant de l' (NAG)</label>
                            <input type="text" v-model="localReservation.identifiant_assure" class="form-control border border-dark px-[4rem]"
                                @change="debouncedUpdateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>Nom de l'assuré</label>
                            <input type="text" v-model="localReservation.nom_assure" class="form-control border border-dark px-[4rem]"
                                @change="debouncedUpdateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>N° Feuille Assuré</label>
                            <input type="text" v-model="localReservation.numero_feuille_assure" class="form-control border border-dark px-[4rem]"
                                @change="debouncedUpdateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>Secteur</label>
                            <select v-model="localReservation.secteur_assure" class="form-control border border-dark px-[4rem]"
                                @change="debouncedUpdateReservation()">
                                <option>Secteur public</option>
                                <option>Secteur privé</option>
                                <option>GEF</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </SectionVisibility>
</template>

<script>

export default {
    props: [ 'reservation','nbProduits','total'],
    data() {
        return {
            isLoading: false,
            isSaving: false,
            clients: [],
            caisses: [],
            baseUrl: this.$store.state.api_epharma_ventes,
            clientSelected: null,
            localReservation: null,
            
            debounceTimer: null, // Timer pour gérer le debounce
           
        }
    },
    created(){
        if (this.reservation) {
            this.localReservation= this.reservation
        }
    },
    mounted() {
        this.getCaisses()
        this.getClients()
    },
    computed: {
        creditActuel() {
            // Vérifie et retourne la différence crédit initial - total
            const total = parseFloat(this.total) || 0;
            const creditInitial = parseFloat(this.clientSelected?.current_remboursement_amount) || 0;
            return (creditInitial - total).toFixed(2);
        },
        creditClass() {
            const creditActuel = parseFloat(this.creditActuel);
            const creditInitial = parseFloat(this.clientSelected?.current_remboursement_amount) || 0;

            if (creditInitial > 0) {
                const creditPercentage = (creditActuel / creditInitial) * 100;

                if (creditPercentage <= 25) {
                    return "border-danger"; // Rouge si < 25%
                } else if (creditPercentage <= 50) {
                    return "border-warning"; // Orange si < 50%
                }
            }

            return "border-success"; // Vert par défaut
        },
    },

    methods: {
        forceRecalculation() {
            // Force une mise à jour du champ crédit
            this.$nextTick(() => {
                this.$emit("refreshReservation");
            });
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
                this.setClientLibelle(false)
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
        setCaisseId(caisse) {
            this.localReservation.caisse_id = caisse.id
            this.localReservation.caisse = caisse.libelle
            this.updateReservation()
        },
        setClientLibelle(with_update) {
            let client = this.clients.filter(item => item.id == this.localReservation.client_id)
            if (client.length > 0) {
                this.clientSelected = client[0]
                if ( client[0].client_id) this.localReservation.client = client[0].nom
                else {this.localReservation.client = client[0].libelle}
                this.$emit('remise_percent', client[0].remise_percent)
            }
            if(with_update) this.updateReservation()
            this.forceRecalculation(); // Recalcule le crédit après avoir défini le client
        },
        debouncedUpdateReservation() {
            // Empêche les requêtes trop fréquentes grâce au debounce
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updateReservation();
                this.forceRecalculation();
            }, 500); // Délai de 500ms
        },
        updateReservation() {
            this.isSaving = true;
            this.axios.post(`${this.baseUrl}/api/reservations/${this.localReservation.id}/update`, this.localReservation).then(response => {
                this.isSaving  = false
                if (response.data.success === true) {
                    this.$emit('refreshReservation')
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
                this.isSaving  = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
    },
}
</script>

<style scoped>
.card .position-relative {
    position: relative;
}

.overlay {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.2);
    /* Grise l'arrière-plan */
    z-index: 1050;
    pointer-events: all;
    /* Désactive les interactions sur les éléments sous l'overlay */
}

.watermark {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(30deg);
    border-style: dashed;
    color: #ff0022;
    font-size: 2.1em;
    font-weight: bold;
    opacity: 0.5;
    z-index: 1060;
    /* z-index: 1; */
    pointer-events: none;
    /* Désactive les clics sur le filigrane */
}
</style>