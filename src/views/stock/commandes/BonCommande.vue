<template>
    
    <button type="button" class="btn btn-success btn-sm mr-2" @click.prevent="printSolde()"
        v-if="commande.status != 'SUCCESS' ">
        <i class="fa-solid fa-print"></i> Bon de commande 
    </button>

    <section ref="Bon_comm" v-show="false">
        <div class="invoice-box" id="Bon_comm">
            <div class="invoice">
                <div class=""> 
                        <img v-if="this.$store.state.pharmacie.logo" :src="this.$store.state.pharmacie.logo"
                            alt="logo_pharmacie" id="logo_pharmacie" class="rounded mb-3" style="width: 100px">                   
                    <p>
                        Nom:{{ this.$store.state.pharmacie.nom_pharmacie }}<br>
                        Adresse: {{ this.$store.state.pharmacie.adresse }} <br>
                        Tel1: {{ this.$store.state.pharmacie.telephone1 }} <br>
                        Tel2: {{ this.$store.state.pharmacie.telephone2 }}
                    </p>
                </div>
                <div v-if="fournisseur">
                    <p>
                        Fournisseur:{{ this.fournisseur.libelle }} <br>
                        Site: {{ this.fournisseur.site }} <br>
                        Tel: {{ this.fournisseur.telephone }} <br>
                        Ville: {{ this.fournisseur.ville }} <br>
                        Adresse: {{ this.fournisseur.adresse }}
                    </p>
                </div>
            </div>
            <div class="invoice-b">
                <h2>BON DE COMMANDE N°{{ commande.id }}</h2>
            </div>

            <table class="table table-bordered" cellpadding="0" cellspacing="4">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>CIP</th>
                        <th>PRIX D'ACHAT</th>
                        <th>QTE COMMANDEE</th>
                        <th>TOTAL TTC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="produit in commande_produits" :key="produit">
                        <td>{{ produit.produit_libelle }}</td>
                        <td>{{ produit.produit_cip }}</td>
                        <td>{{ $moneyFormat(produit.prix_achat) }}</td>
                        <td>{{ produit.qte }}</td>
                        <td>{{ $moneyFormat(produit.prix_achat * produit.qte) }}</td>
                    </tr>
                    <td colspan="4">TOTAL</td>
                    <td>{{ $moneyFormat(totalAchatLocal) }}</td>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <strong>{{ this.$store.getters.pharmacie.nom_pharmacie }}.</strong><br>
            {{ this.$store.getters.pharmacie.adresse }} | BP: <br>
            TEL: {{ this.$store.getters.pharmacie.telephone1 }} / {{ this.$store.getters.pharmacie.telephone2 }} |
            Email: {{ this.$store.getters.pharmacie.email }}<br>
            {{ this.$store.getters.pharmacie.rccm }} | {{ this.$store.getters.pharmacie.nif }}
        </div>
    </section>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    props: ['commande', 'fournisseur'],
    inject: ['dialogRef'],
    totalAchatLocal: 0,
    data() {
        return {
            table: 'commande_produit',
            commande_produits: [],
        }
    },
    mounted() {
        this.getProduits()
    },
    methods: {
        calculateTotalAchat() {
            // Calculer la somme des produits
            this.totalAchatLocal = this.commande_produits.reduce((sum, produit) => {
                return sum + (produit.prix_achat * produit.qte);
            }, 0);
        },
        getProduits() {
            this.resIsLoading = true
            this.axios.get('/api/commande_produit' + '?commande_id=' + this.commande.id).then((response) => {
                this.commande_produits = response.data.data
                this.resIsLoading = false
                
                this.calculateTotalAchat();
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
        printSolde() {
            this.getProduits()
            const receiptContent = this.$refs.Bon_comm.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");
            
            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <style>
                body {
                font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
               
                }

                .invoice-box {  
                font-size: 16px;
                line-height: 24px;
                color: #555;
                }

                .invoice {
                display: flex;
                 justify-content: space-between;
                font-size: 16px;
                line-height: 24px;
                color: ;
                }

                .invoice-box table {
                border: solid;
                  border-collapse: collapse; 
                width: 100%;
                   
                
                }
                .invoice-box th, td {
                border: 1px solid black;
                padding: 5px ;
                 
                }
                .invoice-b {
                 text-align: center;
                }
                 .invoice-h {
                 text-align: center;
                  border: solid;
                  padding: 2px
                }


                .invoice-box table td {
               
                vertical-align: top;
                }

                .invoice-box table tr td:nth-child(2) {
                text-align: center;
                }

                .invoice-box table tr.top table td {
                padding-bottom: 20px;
                }

                .invoice-box table tr.top table td.title {
                font-size: 45px;
                line-height: 45px;
                color: #333;
                }

                .invoice-box table tr.information table td {
                text-align: center;
                }

                .invoice-box table tr.heading td {
                background: #eee;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                }

                .invoice-box table tr.details td {
                padding-bottom: 20px;
                }

                .invoice-box table tr.item td {
                border-bottom: 1px solid #eee;
                }

                .invoice-box table tr.item.last td {
                border-bottom: none;
                }

                .invoice-box table tr.total td:nth-child(2) {
                border-top: 2px solid #eee;
                font-weight: bold;
                }

                .print-button {
                display: block;
                width: 100px;
                margin: 20px auto;
                padding: 10px;
                background-color: #007bff;
                color: white;
                text-align: center;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                }
                .print-logo {
                width: 150px;
                }

                .print-button:hover {
                background-color: #0056b3;
                }
                .footer {
                background-color: #f1f1f1; /* Light gray background */
                text-align: center;
                padding: 10px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                width: 100%;
                
                }
                /* --- MODIFICATION AJOUTÉE POUR L'EXPORT PDF --- */
                @media print {
                    thead { 
                        display: table-header-group !important; 
                    }
                    tfoot { 
                        display: table-footer-group !important; 
                    }
                    tr, th, td {
                        page-break-inside: avoid !important;
                    }
                    table {
                        page-break-inside: auto;
                    }
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
            

        }

    }
})
</script>

<!-- <style>
.invoice-box {
    max-width: 800px;
    margin: 20px auto;
    padding: 30px;
    /* border: 1px solid #eee; */
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); */
    font-size: 16px;
    line-height: 24px;
    color: #555;
}

.invoice-box table {
    width: 100%;
    line-height: inherit;
    /* text-align: left; */
}

.invoice-box table td {
    padding: 5px;
    vertical-align: top;
}

.invoice-box table tr td:nth-child(2) {
    text-align: right;
}

.invoice-box table tr.top table td {
    padding-bottom: 20px;
}

.invoice-box table tr.top table td.title {
    font-size: 45px;
    line-height: 45px;
    color: #333;
}

.invoice-box table tr.information table td {
    padding-bottom: 40px;
}

.invoice-box table tr.heading td {
    background: #eee;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
}

.invoice-box table tr.details td {
    padding-bottom: 20px;
}

.invoice-box table tr.item td {
    border-bottom: 1px solid #eee;
}

.invoice-box table tr.item.last td {
    border-bottom: none;
}

.invoice-box table tr.total td:nth-child(2) {
    border-top: 2px solid #eee;
    font-weight: bold;
}

.print-button {
    display: block;
    width: 100px;
    margin: 20px auto;
    padding: 10px;
    background-color: #007bff;
    color: white;
    text-align: center;
    cursor: pointer;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
}

.print-button:hover {
    background-color: #0056b3;
}

.total {
    margin-top: 5px;
}
</style> -->