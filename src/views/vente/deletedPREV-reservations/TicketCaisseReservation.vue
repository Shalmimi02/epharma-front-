<template>
    <div class="container" ref="ticket_caisse">
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
                <span v-if="localReservation.caisse != 'Default'">Caisse : {{ localReservation.caisse}}</span>

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
                    <tr v-for="item in this.reservation_produits" :key="index">
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
                            <td v-if="this.netAPayer">{{ (parseFloat(this.netAPayer) +
                                parseFloat(localReservation.total_prise_en_charge)).toFixed(2) }}</td>
                            <td v-else>{{ localReservation.total_prise_en_charge }}</td>
                        </tr>

                        <tr v-if="parseFloat(localReservation.remise) > 1">
                            <th colspan="6">Remise</th>
                            <td>{{ (parseFloat(localReservation.remise)).toFixed(2) }}</td>
                        </tr>

                        <tr
                            v-if="localReservation.client != 'COMPTANT' && parseFloat(localReservation.total_prise_en_charge) > 0">
                            <th colspan="6">Prise en Charge</th>
                            <td>{{ localReservation.total_prise_en_charge }}</td>
                        </tr>

                        <tr
                            v-if="localReservation.client != 'COMPTANT' && parseFloat(localReservation.total_prise_en_charge) > 0">
                            <th colspan="6">Ticket Modérateur</th>
                            <td>{{ (parseFloat(this.netAPayer)).toFixed(2) }}</td>
                        </tr>

                        <tr v-if="this.amount_gived">
                            <th colspan="6">Montant Reçu</th>
                            <td>{{ this.amount_gived }}</td>
                        </tr>
                        <tr v-if="this.amount_gived">
                            <th colspan="6">Difference</th>
                            <td>{{ (parseFloat(this.amount_gived) - parseFloat(this.netAPayer)).toFixed(0) }}</td>

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
        <!-- filgrane pour marquer le tatut de la reservation -->
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
import { defineComponent } from 'vue';
export default defineComponent({
    props: ['reservation', 'amount_gived', 'netAPayer', 'reservation_produits'],
    data() {
        return {
            isLoading: false,
            duplicata: false,
            localReservation: this.reservation,
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
    created(){
        if (this.reservation.status != 'Termine' && this.reservation.status != 'Annule' && this.reservation.status != 'Devis') {
            this.duplicata = false
        } 
    },
    mounted() {
        this.printReceipt()
    },
    methods: {
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
        }
    }
})
</script>
