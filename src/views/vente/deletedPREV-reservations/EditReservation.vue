<template>
    <SectionVisibility libelleSection="la premiere étape" :isOpen="true">
        <template #section_content>
            <div v-if="isLoading == true" class="d-flex justify-content-center">
                <div class="spinner-grow text-primary text-center" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>

            <div v-if="this.reservation && isLoading == false" class="card card-body mb-3 position-relative">
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
                    <button type="button" v-for="caisse in this.caisses" :key="caisse.id"
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
                            <input v-if="this.nbProduits > 0" type="text" class="form-control" :value="this.reservation.client" disabled>
                            <select v-else class="form-control border border-dark px-[4rem]" v-model="localReservation.client_id"
                                @change="setClientLibelle(true)">
                                <option :value="client.id" v-for="client in this.clients" :key="client.id">
                                    <span v-if="client.client_id">{{ client.nom }} ({{ client.libelle }})</span>
                                    <span v-else>{{ client.libelle }}</span>
                                </option>
                            </select>
                        </div>
                        <div class="form-group col-md-5" v-if="clientSelected && parseFloat(clientSelected.current_remboursement_amount) > 0" >
                            <label>Credit</label>
                            <input type="text" class="form-control border border-success"  :value="clientSelected.current_remboursement_amount" disabled>
                        </div>
                    </div>
                    <div class="form-row"
                        v-if="clientSelected != null && clientSelected.libelle && clientSelected.libelle != 'COMPTANT'">
                        <div class="form-group col-md-5">
                            <label>Identifiant de l' (NAG)</label>
                            <input type="text" v-model="localReservation.identifiant_assure" class="form-control border border-dark px-[4rem]"
                                @change="updateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>Nom de l'assuré</label>
                            <input type="text" v-model="localReservation.nom_assure" class="form-control border border-dark px-[4rem]"
                                @change="updateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>N° Feuille Assuré</label>
                            <input type="text" v-model="localReservation.numero_feuille_assure" class="form-control border border-dark px-[4rem]"
                                @change="updateReservation()">
                        </div>
                        <div class="form-group col-md-5">
                            <label>Secteur</label>
                            <select v-model="localReservation.secteur_assure" class="form-control border border-dark px-[4rem]"
                                @change="updateReservation()">
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
    props: ['reservation', 'nbProduits', 'clients', 'caisses'],
    data() {
        return {
            isLoading: false,
            baseUrl: this.$store.state.api_epharma_ventes,
            clientSelected: null,
            localReservation: { ...this.reservation }
        }
    },
    mounted() {
        this.setClientLibelle(false)
    },
    methods: {
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
                else this.localReservation.client = client[0].libelle

                // if(!client[0].remise_percent) this.localReservation.prise_en_charge = parseFloat('0')
                // else this.localReservation.prise_en_charge = parseFloat(client[0].remise_percent)
            }
            if(with_update) this.updateReservation()
        },
        updateReservation() {
            this.axios.post(`${this.baseUrl}/api/reservations/${this.localReservation.id}/update`, this.localReservation).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.$emit('update-reservation', this.localReservation)
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