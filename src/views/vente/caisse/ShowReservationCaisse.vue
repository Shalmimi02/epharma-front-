<template>
    <EpharmaTemplate :withHeader="false">
        <template #content>
            <div class="container pt-3" :key="refreshKey">
                <ProgressBar class="my-1" v-if="isLoading === true" mode="indeterminate" style="height: 6px">
                </ProgressBar>
                <div class="d-flex mx-auto align-items-center mb-3">
                    <div class="h2 btn btn-lg bg-dark text-white mr-2">
                        N° <span v-if="firstSelectedReservation != null">{{ firstSelectedReservation.position
                            }}</span>
                    </div>
                    <div class="d-flex " style="max-width: 100vh; overflow-x: auto;">
                        <button type="button" class="btn rounded-circle mx-1 mb-2"
                            v-for="(reservation, index) in reservations" :key="index" :id="'reserv' + reservation.id"
                            :class="[firstSelectedReservation != null && firstSelectedReservation.id == reservation.id ? 'bg-white border-primary' : 'bg-white border-light']"
                            @click="select_reservation(reservation)">
                            {{ reservation.position }}
                        </button>
                    </div>
                    <div class="d-flex ml-auto">

                        <div class="mx-2 text-primary" style="cursor: pointer;" @click="getReservations"
                            title="Rafraichir">
                            <i class="fa-solid fa-rotate bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                        </div>
                        <div class="mx-2 text-danger" style="cursor: pointer;" @click="logout()" title="Se déconnecter">
                            <i class="fa-solid fa-right-to-bracket bg-white p-2 rounded-circle"
                                style="font-size: 2rem;"></i>
                        </div>

                    </div>
                </div>

                <div class="row d-flex justify-content-center" v-if="isLoading === false && selectedReservation">
                    <div class="col-md-8 h-fixed ">
                        <div class="position-relative">
                            <div id="overlay" class="overlay" v-if="selectedReservation.status == 'Termine'"></div>
                            <div class="watermark border-danger px-5" v-if="selectedReservation.status == 'Termine'">
                                Payé Livré
                            </div>

                            <div class="card bg-white mb-3 pb-3 shadow ">
                                <div class="bg-bleuN m-3" v-if="caisse != null">
                                    <h6 class="text-center p-4">{{ caisse.libelle }}</h6>
                                </div>
                                <div class="col-md-4 form-group">
                                    <label>Client</label>
                                    <input type="text" :value="selectedReservation.client"
                                        class="form-control border border-dark px-[4rem] " style=" border-bottom: 1px solid black ; 
                                        border-left: none; border-right: none; border-top: none; 
                                    background: #fafafa;" disabled>
                                </div>
                            </div>
                            <div class="card body-bg-white shadow">
                                <table class="table table-striped" :key="keyTable">
                                    <thead class="bg-primary text-light">
                                        <tr>
                                            <th scope="col">PRODUIT</th>
                                            <th scope="col">QUANTITE</th>
                                            <th scope="col">COÛT</th>
                                            <th scope="col">% TAUX</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in reservation_produits" :key="item">
                                            <td>{{ item.libelle }}</td>
                                            <td>{{ item.qte }}</td>
                                            <td>{{ moneyFormat(item.prix_de_vente) }}</td>
                                            <td>{{ item.prise_en_charge }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>


                    <form class="col-md-4" @submit.prevent="updateReservation">
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-black" v-if="!selectedReservation.switch_finish_at"
                                :disabled="isPaying">
                                {{ isPaying ? 'Traitement en cours...' : (netAPayer == 0 ? 'Prise en charge' : 'Payer')
                                }}
                                <span v-if="isPaying" class="spinner-border spinner-border-sm" role="status"></span>
                            </button>

                            <button type="button" class="btn btn-black" v-else @click="this.printReceipt()">
                                Imprimer
                            </button>

                            <button type="button" class="btn btn-black" v-show="!billetageExistePourUtilisateur"
                                @click="openBilletage()">
                                Billetage
                            </button>
                        </div>
                        <!-- Section TTC - afficher dans tous les cas -->
                        <div class="bg-black rounded-sm mt-3 p-2">
                            <label class="text-white "> TTC</label>
                            <!-- Badge Remise -->
                            <transition name="fade">
                                <span v-if="selectedReservation.remise > 0"
                                    class="remisebadge badge bg-warning text-dark m-2">
                                    MT avant remise : {{ $moneyFormat((selectedReservation.avant_remise)) }}
                                </span>
                            </transition>
                            <h5 class="text-white">{{ moneyFormat(selectedReservation.montant) }}</h5>
                            <div v-if="netAPayer == 0" class="bg-success text-white rounded p-1 mt-2 text-center">
                                <small>Prise en charge à 100%</small>
                            </div>
                        </div>

                        <!-- Section Montant reçu - afficher et adapter selon le contexte -->
                        <div class="bg-black mt-3 rounded-sm p-3">
                            <div class="form-group" v-if="netAPayer != 0">
                                <label class="text-gri3">Montant reçu</label>
                                <input type="number" v-model="form.amount_gived"
                                    class="form-control border border-dark px-[4rem]" required
                                    :disabled="selectedReservation.switch_finish_at">
                            </div>
                            <div class="form-group" v-if="netAPayer != 0">
                                <label class="text-gri3">Difference</label>
                                <input type="number"
                                    :value="(parseFloat(form.amount_gived) - parseFloat(selectedReservation.montant)).toFixed(2)"
                                    class="form-control border border-dark px-[4rem]" step="0.00" disabled>
                            </div>
                            <div class="form-group" v-else>
                                <p class="text-white text-center">Aucun paiement client requis</p>
                                <input type="hidden" v-model="form.amount_gived" value="0">
                            </div>
                        </div>
                    </form>
                </div>

                <div v-else class="col-md-4 my-3 mx-auto">
                    <button type="button" class="btn btn-black" v-show="!billetageExistePourUtilisateur"
                        @click="openBilletage()">
                        Billetage
                    </button>
                </div>
                <!-- <TicketCaisseReservation v-if="key > 1" :key="key" :reservation="selectedReservation"
                    :amount_gived="form.amount_gived" :netAPayer="netAPayer"
                    :reservation_produits="reservation_produits" v-show="false"></TicketCaisseReservation> -->
                <TicketPrinter v-if="key > 1" ref="ticketPrinter" :key="key" :reservation="selectedReservation"
                    :reservation_produits="reservation_produits" :amount_gived="form.amount_gived"
                    :difference="((parseFloat(form.amount_gived) - parseFloat(selectedReservation?.montant || 0)).toFixed(2))"
                    :caisse="caisse" v-show="false" />
            </div>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const CreateBilletage = defineAsyncComponent(() => import('../../gestion/billetages/CreateBilletage.vue'));
// import TicketCaisseReservation from '@/views/vente/reservations/TicketCaisseReservation.vue'
import TicketPrinter from '@/views/vente/reservations/TicketPrinter.vue';

export default defineComponent({
    components: { TicketPrinter },
    data() {
        return {
            key: 1,
            keyTable: 1,

            table: 'reservations',
            netAPayer: null,
            refreshKey: 1, // <-- Clé de rafraîchissement globale
            isLoading: false,
            isPaying: false, // <-- Nouvelle propriété pour suivre l'état du paiement
            firstSelectedReservation: null,
            selectedReservation: null,
            form: {
                amount_gived: 0
            },
            caisse: {},
            reservation_produits: [],
            clientSelected: {},
            clients: [],
            reservations: [],
            billetageExistePourUtilisateur: false,
            billetages: []
        }
    },
    beforeCreate() {
        if (this.$store.getters.caisseConnected != this.$route.params.id || !this.$store.getters.caisseAuthenticated) {
            this.$router.push({ name: 'caisse' })
        }
    },
    created() {
        this.getCaisse()
        this.verifierBilletagesExistants()

        // Écouter l'événement de création de billetage
        window.addEventListener('billetage:created', this.verifierBilletagesExistants);
    },
    mounted() {
        this.getReservations()
    },
    beforeUnmount() {
        // Supprimer l'écouteur d'événements lorsque le composant est détruit
        window.removeEventListener('billetage:created', this.verifierBilletagesExistants);
    },
    methods: {
        getProduits() {
            this.isLoading = true
            this.axios.get('/api/reservation_produits?reservation_id=' + this.selectedReservation.id).then((response) => {
                this.reservation_produits = response.data.data
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
            this.isLoading = true
            this.axios.get('/api/reservations/' + this.firstSelectedReservation.id).then((response) => {
                this.selectedReservation = response.data.data
                this.keyTable++
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
        logout() {
            this.$store.commit('clearAuthenticatedCaisse')
            this.$router.push({ name: 'caisse' })
        },
        getClient() {
            this.isLoading = true
            this.axios.get('/api/clients/' + this.selectedReservation.client_id).then((response) => {
                this.clientSelected = response.data.data
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
        openBilletage() {
            const dialogRef = this.$dialog.open(CreateBilletage, {
                props: {
                    header: "Enregistrement du billetage de la caisse " + this.caisse.libelle,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: this.caisse
            });

            // Vérifier si dialogRef et dialogRef.onClose existent avant d'appeler then()
            if (dialogRef && dialogRef.onClose) {
                dialogRef.onClose.then(() => {
                    this.verifierBilletagesExistants();
                });
            } else {
                // Si onClose n'est pas disponible, vérifier quand même les billetages
                // après un court délai pour permettre à l'utilisateur d'interagir avec le dialogue
                setTimeout(() => {
                    this.verifierBilletagesExistants();
                }, 1000);
            }
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
        getCaisse() {
            this.isLoading = true
            this.axios.get('/api/caisses/' + this.$route.params.id).then((response) => {
                this.caisse = response.data.data
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
        getReservations() {
            this.isLoading = true
            this.axios.get('/api/reservations/jour/caisse' + '?caisse_id=' + this.$route.params.id).then((response) => {
                const reserv = response.data.data
                this.reservations = reserv
                this.refreshKey++;
                if (reserv.length > 0) {
                    this.firstSelectedReservation = reserv[reserv.length - 1];
                    this.select_reservation(this.firstSelectedReservation)
                    return;
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
        select_reservation(reservation) {
            this.firstSelectedReservation = reservation
            this.selectedReservation = reservation

            this.netAPayer = reservation.montant

            this.form = {
                // status: reservation.amount_gived,
                amount_gived: reservation.amount_gived,
                switch_finish_at: reservation.switch_finish_at
            }

            //     if (this.selectedReservation.status != 'Termine' && this.selectedReservation.status != 'Annule' && this.selectedReservation.status != 'Devis') {
            //     this.duplicata = false
            // } 
            this.getClient()
            this.getProduits()
            this.keyTable++
        },
        updateReservation() {
            if (parseFloat(this.form.amount_gived) < parseFloat(this.selectedReservation.montant)) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La difference ne peut etre négative',
                    life: 7000
                });
                return
            }

            // Activer l'indicateur de paiement en cours
            this.isPaying = true;

            this.form.status = 'Termine'
            this.form.switch_finish_at = new Date().toLocaleString('fr-FR')
            this.form.switch_finish_by = this.$store.getters.user.fullname
            this.form.printed_at = new Date().toLocaleString('fr-FR')


            this.axios.post('/api/reservations/' + this.selectedReservation.id + '/update', this.form).then(response => {
                this.isLoading = false
                this.isPaying = false // Réinitialiser l'indicateur à la fin du traitement
                if (response.data.success === true) {
                    this.selectedReservation.status = 'Termine'
                    this.$toast.add({
                        severity: 'success',
                        detail: 'Vente enregistré',
                        life: 3000
                    });
                    this.refreshSelectedReservation()

                    // Imprime immédiatement après la mise à jour
                    this.printReceipt()
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
                this.isPaying = false // Réinitialiser l'indicateur en cas d'erreur
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        printReceipt() {
            // Incrémente la key pour recréer le composant TicketPrinter 
            this.key++

            // Au tick suivant, le composant enfant est recréé en DOM
            this.$nextTick(() => {
                // Vérifie que le composant enfant est bien présent
                if (this.$refs.ticketPrinter) {
                    // Appelle la méthode d'impression interne
                    this.$refs.ticketPrinter.printReceipt()
                }
            })
        },
        verifierBilletagesExistants() {
            const now = new Date();
            const today = now.toISOString().split('T')[0]; // Format YYYY-MM-DD

            // Formater l'heure actuelle en HH:MM:SS
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}:${seconds}`;

            this.axios.get('/api/billetages').then(response => {
                if (response.data && response.data.data) {
                    this.billetages = response.data.data;

                    // Vérifier si un billetage existe pour l'utilisateur actuel à la date et heure actuelles
                    const userFullname = this.$store.getters.user.fullname;

                    this.billetageExistePourUtilisateur = this.billetages.some(billetage => {
                        // Vérifier si on est dans la période de date
                        if (billetage.date_debut > today || billetage.date_fin < today) {
                            return false; // En dehors de la période de date
                        }

                        // Si on est à la date de début, vérifier si l'heure actuelle est après l'heure de début
                        if (billetage.date_debut === today && billetage.heure_debut > currentTime) {
                            return false; // Avant l'heure de début
                        }

                        // Si on est à la date de fin, vérifier si l'heure actuelle est avant l'heure de fin
                        if (billetage.date_fin === today && billetage.heure_fin < currentTime) {
                            return false; // Après l'heure de fin
                        }

                        // Vérifier si le billetage est créé par l'utilisateur actuel
                        if (billetage.created_by !== userFullname && billetage.ended_with !== userFullname) {
                            return false; // Pas créé par cet utilisateur
                        }

                        // Si toutes les conditions sont remplies, on est dans la période du billetage
                        return true;
                    });
                }
            }).catch(error => {
                console.error('Erreur lors de la récupération des billetages:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Problème de connexion',
                    detail: 'Impossible de vérifier les billetages existants',
                    life: 5000
                });
            });
        }
    }
})
</script>

<style scoped>
.h-fixed {
    height: 80vh;
    overflow-y: auto;
}

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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

@page {
    size: 80mm 80mm;
    margin: 0;
}

body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

#content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: 1px solid black;
}
</style>
