<template>
    <div class="d-flex">
        <!-- Bouton de paiement -->
        <button 
            type="button" 
            class="btn btn-success mr-2" 
            @click="showModal = true" 
            v-if="isTreatable() == true"
        >
            <i class="fa-solid fa-check mr-1"></i> Payer maintenant
        </button>

        <!-- Bouton d'impression si c'est déjà payé ou si c'est Annule/Devis -->
        <button 
            v-else-if="localReservation.status != 'Annule' && localReservation.status != 'Devis'"
            type="button" 
            class="btn btn-dark mr-2" 
            @click="printReceipt()"
        >
            <i class="fa-solid fa-print mr-1"></i> Imprimer
        </button>

        <!-- Billetage -->
        <button type="button" class="btn btn-dark mr-2" @click="openBilletage()">
            <i class="fa-solid fa-bills mr-1"></i> Billetage
        </button>
    </div>

    <!-- Modal PrimeVue : Fenêtre de paiement -->
    <Dialog header="Reglement" v-model:visible="showModal" modal>
        <form @submit.prevent="submitForm">
            <div class="bg-black mt-3 p-3 rounded-sm mb-3">
                <div class="form-group">
                    <label class="text-gri3">Montant reçu</label>
                    <input 
                        type="number" 
                        v-model="amount_gived" 
                        class="form-control border border-dark px-[4rem]"
                        required 
                        :disabled="localReservation.switch_finish_at"
                    />
                </div>
                <div class="form-group">
                    <label class="text-gri3">Difference</label>
                    <!-- 
                        COMMENTAIRE: On utilise 'montant' (la prop qu'on reçoit du parent) 
                        au lieu de localReservation.montant
                    -->
                    <input 
                        type="number"
                        :value="(parseFloat(amount_gived) - parseFloat(montant)).toFixed(0)"
                        class="form-control border border-dark px-[4rem]" 
                    />
                </div>
            </div>
            <button type="submit" class="btn btn-dark btn-block">
                <i class="fa-solid fa-save mr-1"></i> Enregister le paiement
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </form>
    </Dialog>

    <!-- Zone cachée (v-show=false) pour l'impression du ticket de caisse -->
    <div class="container" ref="ticket_caisse" v-show="false">
        <!-- Première section : Logo et Infos Pharmacie -->
        <div class="section center">
            <img 
                v-if="$store.getters.pharmacie.logo" 
                :src="$store.getters.pharmacie.logo"
                alt="logo_pharmacie" 
                id="logo_pharmacie" 
                class="rounded mb-3" 
                style="width: 100px"
            />
            <p class="center" style="padding: 20px;">
                {{ getInfoPharmacie }}
            </p>
        </div>

        <!-- ...autres sections de la facture... -->

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
                    <tr v-for="(item, index) in reservation_produits" :key="index">
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
                        <!-- 
                            Total TTC = (montant + prise en charge) ?
                            Selon ta logique, tu peux t'adapter.
                            ICI on prend "montant" + localReservation.total_prise_en_charge
                        -->
                        <tr>
                            <th colspan="6">Total TTC</th>
                            <td v-if="montant">
                                {{ (parseFloat(montant) + parseFloat(localReservation.total_prise_en_charge)).toFixed(2) }}
                            </td>
                            <td v-else>
                                {{ localReservation.total_prise_en_charge }}
                            </td>
                        </tr>

                        <!-- ...tes autres lignes de prise en charge, ticket modérateur, etc. -->

                        <tr v-if="amount_gived">
                            <th colspan="6">Montant Reçu</th>
                            <td>{{ amount_gived }}</td>
                        </tr>
                        <tr v-if="amount_gived">
                            <th colspan="6">Difference</th>
                            <!-- 
                                Ici aussi on utilise 'montant' 
                                au lieu de localReservation.montant 
                            -->
                            <td>{{ (parseFloat(amount_gived) - parseFloat(montant)).toFixed(0) }}</td>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>

        <!-- Filigrane, Footer, etc. -->
        <!-- ... -->
    </div>
</template>

<script>
/* COMMENTAIRE: On ajoute une nouvelle prop "montant"
   pour recevoir la valeur TTC du parent */
import { defineComponent, defineAsyncComponent } from 'vue';
import Dialog from 'primevue/dialog';

const CreateBilletage = defineAsyncComponent(() => import('../../gestion/billetages/CreateBilletage.vue'));

export default defineComponent({
    props: {
        // La réservation
        reservation: {
            type: Object,
            required: true
        },
        // COMMENTAIRE: La valeur TTC Client, transmise depuis le parent
        montant: {
            type: Number,
            default: 0
        }
    },
    components: {
        Dialog
    },
    data() {
        return {
            lines: 0,
            isLoading: false,
            duplicata: true,
            showModal: false,
            amount_gived: 0,
            clientSelected: {},
            // Local copy de la reservation
            localReservation: { ...this.reservation },
            reservation_produits: [],
            form: {},
            caisse: {
                libelle: 'Default'
            }
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
        }
    },
    mounted() {
        this.getProduits();
        this.getClients();
    },
    methods: {
        // Récupération des produits de la réservation
        getProduits() {
            this.isLoading = true;
            this.axios.get( '/api/reservation_produits?reservation_id=' + this.localReservation.id)
                .then((response) => {
                    this.reservation_produits = response.data.data;
                    this.isLoading = false;
                })
                .catch(() => {
                    this.isLoading = false;
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                });
        },
        // Récupération du client
        getClients() {
            this.isLoading = true;
            this.axios
                .get( '/api/clients/' + this.localReservation.client_id)
                .then((response) => {
                    this.clientSelected = response.data.data;
                    this.isLoading = false;
                })
                .catch(() => {
                    this.isLoading = false;
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                });
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
        // Vérifie si la réservation est traitable
        isTreatable() {
            if (
                this.localReservation.status != 'Termine' &&
                this.localReservation.status != 'Annule' &&
                this.localReservation.status != 'Devis'
            ) {
                this.duplicata = false;
                return true;
            } else {
                return false;
            }
        },
        // Soumission du formulaire de paiement
        submitForm() {
            // COMMENTAIRE: On utilise 'this.montant' pour comparer
            if ((parseFloat(this.amount_gived) - parseFloat(this.montant)) < 0) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La difference ne peut etre négative',
                    life: 7000
                });
                return;
            }
            this.isLoading = true;
            // On met à jour le statut de la reservation
            this.form.status = 'Termine';
            this.form.caisse = 'Default';
            this.form.caisse_id = 1;
            this.form.amount_gived = this.amount_gived;
            this.form.switch_finish_at = new Date().toLocaleString('fr-FR');
            this.form.switch_finish_by = this.$store.getters.user.fullname;

            // Requête d'update
            this.axios
                .post(`/api/reservations/${this.localReservation.id}/update`, this.form)
                .then(response => {
                    this.isLoading = false;
                    if (response.data.success === true) {
                        this.showModal = false;
                        this.localReservation.status = 'Termine';
                        this.$emit('paiement-reservation');
                        this.$toast.add({
                            severity: 'success',
                            detail: 'Vente enregistré',
                            life: 3000
                        });
                        this.printReceipt();
                    } else {
                        response.data.errors.forEach(element => {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Oups !',
                                detail: element,
                                life: 7000
                            });
                        });
                    }
                })
                .catch(() => {
                    this.isLoading = false;
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                });
        },
        // Impression du ticket de caisse
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
                            position: relative;
                            bottom: 70%;
                            left: 0%;
                            width: 100%;
                            height: 100%;
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
                            background-color: #f1f1f1;
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
            this.duplicata = true;
        }
    }
});
</script>
