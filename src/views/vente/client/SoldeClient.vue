<template>
    <button type="button" class="btn btn-success btn-sm mr-2" @click.prevent="printSolde()">
        <i class="fa-solid fa-print"></i> Solde du compte
    </button>
    <section ref="solde" v-show="false">
        <div class="invoice-box" id="facture">

            <h1 class="mb-3">SOLDE DU COMPTE</h1>
            <div class="facture-p">
                <div class="">
                    <p>
                        <strong>Nom: </strong> {{ this.datas.nom }} <br>
                        <strong>E-mail: </strong> {{ this.datas.email }} <br>
                        <strong>Téléphone: </strong> {{ this.datas.telephone }}
                    </p>
                </div>

                <div class="">
                    <p>
                        Nom:{{ this.$store.state.pharmacie.nom_pharmacie }}<br>
                        Adresse: {{ this.$store.state.pharmacie.adresse }} <br>
                        Tel1: {{ this.$store.state.pharmacie.telephone1 }} <br>
                        Tel2: {{ this.$store.state.pharmacie.telephone2 }}
                    </p>
                </div>
            </div>
           
                <table class="">
                    <thead>
                        <tr>
                            <th>TOTAL CREDIT</th>
                            <th>TOTAL DETTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td> {{ moneyFormat(this.datas.current_remboursement_amount) }}</td>
                            <td> {{ moneyFormat(this.datas.current_dette) }}</td>
                        </tr>
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
import html2pdf from 'html2pdf.js';
import { defineComponent } from 'vue';


export default defineComponent({
    inject: ['dialogRef'],
    props: ['datas'],
    data() {
        return {

        }

    },
    methods: {
        printSolde() {
            const receiptContent = this.$refs.solde.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");

            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>facture</title>
            <style>
                body {
                font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
                }

                .facture-p {
                display: flex;
                 justify-content: space-between;
               
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

        },
        downloadPDF() {
            this.isLoading = true
            // let basDePage = 'Pharmacie ', basDePage2 = ''
            // if (this.$store.getters.pharmacie) {
            //     if (this.$store.getters.pharmacie.nom_pharmacie) {
            //         basDePage = basDePage + this.$store.getters.pharmacie.nom_pharmacie + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.statut_juridique) {
            //         basDePage = basDePage + this.$store.getters.pharmacie.statut_juridique + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.capital) {
            //         basDePage = basDePage + ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
            //     }
            //     if (this.$store.getters.pharmacie.adresse) {
            //         basDePage = basDePage + this.$store.getters.pharmacie.adresse + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.bp) {
            //         basDePage = basDePage + ' BP: ' + this.$store.getters.pharmacie.bp + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.telephone1) {
            //         basDePage = basDePage + ' TEL: ' + this.$store.getters.pharmacie.telephone1 + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.rccm) {
            //         basDePage2 = basDePage2 + ' RCCM: ' + this.$store.getters.pharmacie.rccm + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.nif) {
            //         basDePage2 = basDePage2 + ' NIF: ' + this.$store.getters.pharmacie.nif + ' | '
            //     }
            //     if (this.$store.getters.pharmacie.email) {
            //         basDePage2 = basDePage2 + ' EMAIL: ' + this.$store.getters.pharmacie.email + ' | '
            //     }
            // }
            html2pdf().set({
                pagebreak: { mode: 'avoid-all' },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                margin: [0.3, 0.3],
                filename: "Solde #" + this.solde.id,
                html2canvas: { scale: 2 },
                image: { type: 'jpeg', quality: 0.98 },
            }).from(document.getElementById("solde"))
                .toPdf()
                .get('pdf')
                .then(function (pdf) {
                    var totalPages = pdf.internal.getNumberOfPages();
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    for (var i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.text(basDePage + "\n" + basDePage2, pdf.internal.pageSize.getWidth() - 0.50, pdf.internal.pageSize.getHeight() - 0.50, { align: 'right' });
                    }
                })
                .save();
            setTimeout(() => {
                this.isLoading = false

            }, 5000)
        },
        // getClients() {
        //     this.isLoading = true
        //     this.axios.get( '/api/clients?client_id=' + this.dialogRef.data.id).then(response => {
        //         this.isLoading = false
        //         this.produits = response.data.data
        //     }).catch(() => {
        //         this.isLoading = false
        //         this.$toast.add({
        //             severity: 'error',
        //             summary: 'Probleme de connexion',
        //             detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
        //             life: 5000
        //         });
        //     })
        // },
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

    }
})
</script>
