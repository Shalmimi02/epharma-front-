<template>
    <div class="d-flex">
        <button type="button" class="btn btn-success mr-2" @click="showModal = true" v-if="isTreatable() == true ">
            <i class="fa-solid fa-check mr-1"></i> Payer maintenant
        </button>
        <button v-else-if="this.localReservation.status != 'Annule' && this.localReservation.status != 'Devis'"
            type="button" class="btn btn-dark mr-2" @click="printReceipt()">
            <i class="fa-solid fa-print mr-1"></i> Imprimer
        </button>
        <button type="button" class="btn btn-dark mr-2" @click="openBilletage()" v-show="!billetageExistePourUtilisateur">
            <i class="fa-solid fa-bills mr-1"></i> Billetage
        </button>
    </div>

    <!-- Modal PrimeVue -->
    <Dialog header="Reglement" v-model:visible="showModal" modal>
        <form @submit.prevent="submitForm">
            <div class="bg-black mt-3 p-3 rounded-sm mb-3">
                <div class="form-group">
                    <label class="text-gri3">Montant reçu</label>
                    <input type="number" v-model="amount_gived" class="form-control border border-dark px-[4rem]"
                        required :disabled="localReservation.switch_finish_at">
                </div>
                <div class="form-group">
                    <label class="text-gri3">Difference</label>
                    <input type="number"
                        :value="(parseFloat(amount_gived) - parseFloat(localReservation.montant)).toFixed(0)"
                        class="form-control border border-dark px-[4rem]" >
                </div>
            </div>
            <button type="submit" class="btn btn-dark btn-block" @click="">
                <i class="fa-solid fa-save mr-1"></i> Enregister le paiement
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </form>
    </Dialog>

    <div class="container" ref="ticket_caisse" v-show="false">
        <!-- Première section : Logo et Informations de la Pharmacie -->
        <div class="section center">
            <img v-if="this.$store.getters.pharmacie.logo" :src="this.$store.getters.pharmacie.logo"
                alt="logo_pharmacie" id="logo_pharmacie" class="rounded mb-3" style="width: 100px">
            <p class="center" style="padding: 20px;">
                {{ getInfoPharmacie }}
            </p>
        </div>

        <!-- Deuxième section : Informations de l'Assuré -->
        <div class="section" v-if="localReservation.client != 'COMPTANT'">
            <h4>Informations du client</h4>
            <p>
                Nom : {{ localReservation.client }}<br>
                <span v-if="localReservation.identifiant_assure">Numéro Assuré : {{ localReservation.identifiant_assure
                    }}<br></span>
                <span v-if="localReservation.secteur_assure">Secteur : {{ localReservation.secteur_assure }}<br></span>
                <span v-if="localReservation.numero_feuille_assure">N° feuille :
                    {{ localReservation.numero_feuille_assure }}<br></span>

            </p>

        </div>
        

        <!-- Troisième section : Informations de la Caisse -->
        <div class="section">
            <h4>Détails de la Caisse</h4>
            <p>
                Numéro : {{ localReservation.position }}<br>
                Date : {{ new Date().toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) }}<br>
                Vendeur(se) : {{ this.$store.getters.user.fullname }}<br>
                <span v-if="localReservation.caisse = !'Default'">Caisse : {{ caisse.libelle }}</span>

            </p>
        </div>

        <!-- Quatrième section : Liste des Médicaments -->
        <div class="section">
            <h4>Liste des Médicaments</h4>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>Coût</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in reservation_produits" :key="index">
                        <td>{{ item.libelle }}</td>
                        <td>{{ item.qte }}</td>
                        <td>{{ item.prix_de_vente }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Total Section -->
            <div class="total-section">
                <table>
                    <thead>

                        <tr>
                            <th colspan="6">Total TTC</th>
                            <td v-if="localReservation.montant">{{ (parseFloat(localReservation.montant) +
                                parseFloat(localReservation.total_prise_en_charge)).toFixed(2) }}</td>
                            <td v-else>{{ localReservation.total_prise_en_charge }}</td>
                        </tr>

                        <tr
                            v-if="localReservation.client != 'COMPTANT' && parseFloat(localReservation.total_prise_en_charge) > 0">
                            <th colspan="6">Prise en Charge</th>
                            <td>{{ localReservation.total_prise_en_charge }}</td>
                        </tr>

                        <tr
                            v-if="localReservation.client != 'COMPTANT' && parseFloat(localReservation.total_prise_en_charge) > 0">
                            <th colspan="6">Ticket Modérateur</th>
                            <td>{{ (parseFloat(localReservation.montant)).toFixed(2) }}</td>
                        </tr>

                        <tr v-if="amount_gived">
                            <th colspan="6">Montant Reçu</th>
                            <td>{{ amount_gived }}</td>
                        </tr>
                        <tr v-if="amount_gived">
                            <th colspan="6">Difference</th>
                            <td>{{ (parseFloat(amount_gived) - parseFloat(localReservation.montant)).toFixed(0) }}</td>

                        </tr>
                    </thead>
                </table>
            </div>
        </div>

        <!-- Cinquième section : Slogan de la Pharmacie -->
        <p class="section center slogan" v-if="this.$store.getters.pharmacie.slogan" style="margin-bottom: 20px;">
            "{{ this.$store.getters.pharmacie.slogan }}"
        </p>


        <div id="overlay" class="overlay ">
        </div>
        <!-- filgrane pour marquer le statut de la reservation -->
        <div  v-if="this.duplicata == true" class="watermark"> DUPLICATA </div>

        <div class="footer">
            <strong>{{ this.$store.getters.pharmacie.nom_pharmacie }}.</strong><br>
            {{ this.$store.getters.pharmacie.adresse }} | BP: <br>
            TEL: {{ this.$store.getters.pharmacie.telephone1 }} / {{ this.$store.getters.pharmacie.telephone2 }} |
            Email: {{ this.$store.getters.pharmacie.email }}<br>
            {{ this.$store.getters.pharmacie.rccm }} | {{ this.$store.getters.pharmacie.nif }}
        </div>
    </div>
</template>

<script>
const CreateBilletage = defineAsyncComponent(() => import('../../gestion/billetages/CreateBilletage.vue'));
import { defineComponent, defineAsyncComponent } from 'vue';
import Dialog from 'primevue/dialog';
export default defineComponent({
    props: ['reservation'],
    components: {
        Dialog
    },
    data() {
        return {
            lines: 0,
            isLoading: false,
            duplicata: true,
            baseUrl: this.$store.state.api_epharma_ventes,
            showModal: false,
            amount_gived: 0,
            clientSelected: {},
            localReservation: { ...this.reservation },
            reservation_produits: [],
            form: {},
            caisse: {
                libelle: 'Default'
            },
            billetageExistePourUtilisateur: false,
            billetages: [],
        }
    },
    computed: {
        getInfoPharmacie() {
            let infos = 'Pharmacie '
            if (this.$store.getters.pharmacie) {
                if (this.$store.getters.pharmacie.nom_pharmacie) {
                    infos = this.$store.getters.pharmacie.nom_pharmacie + ' | '
                }
                if (this.$store.getters.pharmacie.statut_juridique) {
                    infos = infos + this.$store.getters.pharmacie.statut_juridique + ' | '
                }
                if (this.$store.getters.pharmacie.capital) {
                    infos = infos + ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
                }
                if (this.$store.getters.pharmacie.adresse) {
                    infos = infos + this.$store.getters.pharmacie.adresse + ' | '
                }
                if (this.$store.getters.pharmacie.bp) {
                    infos = infos + ' BP: ' + this.$store.getters.pharmacie.bp + ' | '
                }
                if (this.$store.getters.pharmacie.telephone1) {
                    infos = infos + ' Tel: ' + this.$store.getters.pharmacie.telephone1 + ' | '
                }
                if (this.$store.getters.pharmacie.rccm) {
                    infos = infos + ' Rccm: ' + this.$store.getters.pharmacie.rccm + ' | '
                }
                if (this.$store.getters.pharmacie.nif) {
                    infos = infos + ' Nif: ' + this.$store.getters.pharmacie.nif + ' | '
                }
                if (this.$store.getters.pharmacie.email) {
                    infos = infos + ' Email: ' + this.$store.getters.pharmacie.email
                }
            }
            return infos
        },
    },
    mounted() {
        this.getProduits()
        this.getClients()
        this.verifierBilletagesExistants()

        // Écouter l'événement de création de billetage
        window.addEventListener('billetage:created', this.verifierBilletagesExistants);
    },
    beforeUnmount() {
        // Supprimer l'écouteur d'événements lorsque le composant est détruit
        window.removeEventListener('billetage:created', this.verifierBilletagesExistants);
    },
    methods: {
        getProduits() {
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/reservation_produits?reservation_id=' + this.localReservation.id).then((response) => {
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
        getClients(){
            this.isLoading = true
            this.axios.get(this.baseUrl + '/api/clients/' + this.localReservation.client_id).then((response) => {
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
            this.$dialog.open(CreateBilletage, {
                props: {
                    header: "Enregistrement du billetage de la caisse Default",
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: {
                    libelle: 'Default'
                }
            });
        },
        isTreatable() {
            if (this.localReservation.status != 'Termine' && this.localReservation.status != 'Annule' && this.localReservation.status != 'Devis') {
                this.duplicata = false
                return true
            } else return false
        },
        submitForm() {
            if ((parseFloat(this.amount_gived) - parseFloat(this.localReservation.montant)) < 0 ) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La difference ne peut etre négative',
                    life: 7000
                });
                return
            }
        //    else if (((this.localReservation.total_prise_en_charge) > (this.clientSelected.current_remboursement_amount))  && (parseFloat(this.localReservation.montant) <= (this.clientSelected.current_remboursement_amount) ) ) {
        //         this.$toast.add({
        //             severity: 'warn',
        //             summary: 'Oups !',
        //             detail: 'Le montant de la prise en charge doit etre inferieur au crédit',
        //             life: 7000
        //         });
        //         return
        //     }
            this.isLoading = true
            this.form.status = 'Termine'
            this.form.caisse = 'Default'
            this.form.caisse_id = 1
            this.form.amount_gived = this.amount_gived
            this.form.switch_finish_at = new Date().toLocaleString('fr-FR')
            this.form.switch_finish_by = this.$store.getters.user.fullname

            this.axios.post(`${this.baseUrl}/api/reservations/${this.localReservation.id}/update`, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.showModal = false
                    this.localReservation.status = 'Termine'
                    this.$emit('paiement-reservation')
                    this.$toast.add({
                        severity: 'success',
                        detail: 'Vente enregistré',
                        life: 3000
                    });
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
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        printReceipt() {
            const receiptContent = this.$refs.ticket_caisse.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");

            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ticket de Caisse</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        width: 350px;
                        background-color: #fff;
                        margin: 0 auto;
                        padding: 20px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        border-radius: 10px;
                    }
                         .overlay {
                            position: relative ;
                            bottom: 70%;
                            left: 0%;
                            width: 100%;
                            height: 100%;   
                            /* mettre le filigrane derriere le texte */
                             z-index: 1;
                        }
                        .watermark {                      
                            position: relative;
                            bottom: 90%;
                            left: 80%;
                            transform: translate(-50%, -50%) rotate(20deg);
                            color: #FF0000;
                            font-size: 2em;
                            font-weight: bold;
                            opacity: 0.3;
                            z-index: 1; 
                            pointer-events: none;
                            /* Désactive les clics sur le filigrane */
                        }
                    .section {
                        margin-bottom: 20px;
                    }
                    .logo {
                        display: block;
                        margin: 0 auto;
                        width: 100px;
                    }
                    .center {
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #e4e4e4;
                        color: rgb(0, 0, 0);
                    }
                    .total-section {
                        margin-top: 10px;
                    }
                    .total-section th {
                        background-color: #f8f8f8;
                        color: black;
                    }
                    .total-section td {
                        font-weight: bold;
                    }
                    .slogan {
                        font-style: italic;
                        margin-top: 20px;
                        font-size: 1.1em;
                    }
                         .footer {
                        background-color: #f1f1f1; /* Light gray background */
                        text-align: center;
                        padding: 10px;
                        border-top: 1px solid #eee;
                        font-size: 14px;
                        color: #777;
                        width: 100%;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        }

                        .footer strong {
                        color: #333;
                        }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);

            // Attendre que le contenu soit chargé avant d'imprimer
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            this.duplicata = true
        },
        verifierBilletagesExistants() {
            const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
            this.axios.get('/api/billetages').then(response => {
                if (response.data && response.data.data) {
                    this.billetages = response.data.data;
                    
                    // Vérifier si un billetage existe pour l'utilisateur actuel à la date actuelle
                    const userFullname = this.$store.getters.user.fullname;
                    this.billetageExistePourUtilisateur = this.billetages.some(billetage => {
                        return (
                            billetage.created_by === userFullname &&
                            billetage.date_debut <= today &&
                            billetage.date_fin >= today
                        );
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
        },
    }
})
</script>
