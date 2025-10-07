<template>
    <button class="btn btn-info mr-2" @click="printReceipt()">
        <i class="fa-solid fa-print mr-1"></i> Imprimer
        <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button> 


    <section ref="facture" v-show="false">
        <div class="invoice-box" id="facture">
            <table cellpadding="0" cellspacing="0">
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="title">
                                    <img :src="this.$store.getters.pharmacie.logo" style="width:100%; max-width:150px;">
                                </td>

                                <td>
                                    FACTURE <span v-if="facture.status =='Devis'">PROFORMA</span> : #{{ facture.id }}<br>
                                    Date: {{ dateFormat(facture.created_at) }}<br>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr class="information ">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                    {{ this.$store.getters.pharmacie.nom_pharmacie }}.<br>
                                    {{ this.$store.getters.pharmacie.adresse }}<br>
                                    {{ this.$store.getters.pharmacie.telephone1 }}<br>
                                    {{ this.$store.getters.pharmacie.email }}
                                </td>

                                <td v-if="this.clientName">
                                    {{ this.clientName }}<br>
                                    {{ this.facture.nom_assure }}<br>
                                    {{ this.facture.secteur_assure }}<br>
                                </td>
                                <td v-else>
                                    {{ this.facture.client }}<br>
                                   
                                    
                                 </td>
                            </tr>
                        </table>
                    </td>
                </tr>


                <tr class="heading">
                    <td>LIBELLE</td>
                    <td>QTE</td>
                    <td>P.U.</td>
                    <td>TOTAL</td>
                </tr>

                <tr class="item" v-for="item in produits" :key="index">
                    <td>{{ item.libelle }}</td>
                    <td>{{ item.qte }}</td>
                    <td>{{ moneyFormat2(item.prix_de_vente) }}</td>
                    <td>{{ moneyFormat2(item.cout_total) }}</td>
                </tr>



                <!-- <tr class="item last">
                    <td>Domain name (1 year)</td>
                    <td>$10.00</td>
                </tr> -->

                <tr class="total ">
                    <td>Signature et cachet</td>
                    <td v-if="facture.status =='Devis'">Total: {{ moneyFormat(facture.montant) }}</td>
                    
                    <td v-else>Total: {{ moneyFormat(facture.total) }}</td>
                </tr>
                <!-- <tr class="total">
                    <td></td>
                    <td>Total: {{ moneyFormat(facture.total_prise_en_charge) }}</td>
                </tr> -->
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
import moment from 'moment'
import html2pdf from 'html2pdf.js';

export default defineComponent({
    inject: ['dialogRef'],
    props: ['facture', 'clientName', 'produits'],
    data() {
        return {
            isLoading: false
        };
    },
    computed: {
        getBasDePage() {
            let basDePage = 'Pharmacie '
            if (this.$store.getters.pharmacie) {
                if (this.$store.getters.pharmacie.nom_pharmacie) {
                    basDePage = basDePage + this.$store.getters.pharmacie.nom_pharmacie + ' | '
                }
                if (this.$store.getters.pharmacie.statut_juridique) {
                    basDePage = basDePage + this.$store.getters.pharmacie.statut_juridique + ' | '
                }
                if (this.$store.getters.pharmacie.capital) {
                    basDePage = basDePage + ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
                }
                if (this.$store.getters.pharmacie.adresse) {
                    basDePage = basDePage + this.$store.getters.pharmacie.adresse + ' | '
                }
                if (this.$store.getters.pharmacie.bp) {
                    basDePage = basDePage + ' BP: ' + this.$store.getters.pharmacie.bp + ' | '
                }
                if (this.$store.getters.pharmacie.telephone1) {
                    basDePage = basDePage + ' TEL: ' + this.$store.getters.pharmacie.telephone1 + ' | '
                }
                if (this.$store.getters.pharmacie.rccm) {
                    basDePage = basDePage + ' RCCM: ' + this.$store.getters.pharmacie.rccm + ' | '
                }
                if (this.$store.getters.pharmacie.nif) {
                    basDePage = basDePage + ' NIF: ' + this.$store.getters.pharmacie.nif + ' | '
                }
                if (this.$store.getters.pharmacie.email) {
                    basDePage = basDePage + ' EMAIL: ' + this.$store.getters.pharmacie.email + ' | '
                }

            }
            return basDePage;
        }
    },
    methods: {
        downloadPDF() {
            this.isLoading = true
            let basDePage = 'Pharmacie ', basDePage2 = ''
            if (this.$store.getters.pharmacie) {
                if (this.$store.getters.pharmacie.nom_pharmacie) {
                    basDePage = basDePage + this.$store.getters.pharmacie.nom_pharmacie + ' | '
                }
                if (this.$store.getters.pharmacie.statut_juridique) {
                    basDePage = basDePage + this.$store.getters.pharmacie.statut_juridique + ' | '
                }
                if (this.$store.getters.pharmacie.capital) {
                    basDePage = basDePage + ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
                }
                if (this.$store.getters.pharmacie.adresse) {
                    basDePage = basDePage + this.$store.getters.pharmacie.adresse + ' | '
                }
                if (this.$store.getters.pharmacie.bp) {
                    basDePage = basDePage + ' BP: ' + this.$store.getters.pharmacie.bp + ' | '
                }
                if (this.$store.getters.pharmacie.telephone1) {
                    basDePage = basDePage + ' TEL: ' + this.$store.getters.pharmacie.telephone1 + ' | '
                }
                if (this.$store.getters.pharmacie.rccm) {
                    basDePage2 = basDePage2 + ' RCCM: ' + this.$store.getters.pharmacie.rccm + ' | '
                }
                if (this.$store.getters.pharmacie.nif) {
                    basDePage2 = basDePage2 + ' NIF: ' + this.$store.getters.pharmacie.nif + ' | '
                }
                if (this.$store.getters.pharmacie.email) {
                    basDePage2 = basDePage2 + ' EMAIL: ' + this.$store.getters.pharmacie.email + ' | '
                }
            }
            html2pdf().set({
                pagebreak: { mode: 'avoid-all' },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                margin: [0.3, 0.3],
                filename: "Facture #" + this.facture.id,
                html2canvas: { scale: 2 },
                image: { type: 'jpeg', quality: 0.98 },
            }).from(document.getElementById("facture"))
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
        getProduits() {
            this.isLoading = true
            this.axios.get('/api/reservation_produits?reservation_id=' + this.datas.reservation.id).then(response => {
                this.isLoading = false
                this.produits = response.data.data
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
        dateFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY')
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
        moneyFormat2(varMoney) {
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
        printReceipt() {
            // this.isLoading = true
            // setTimeout(() => {
                const receiptContent = this.$refs.facture.innerHTML;
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
                    padding: 0;
                    margin: 0;
                    }

                    .invoice-box {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 30px;
                    font-size: 16px;
                    line-height: 24px;
                    color: #555;
                    }

                    .invoice-box table {
                    width: 100%;
                    line-height: inherit;
                    text-align: left;
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
                this.isLoading = false
            // }, 3000);
        }

    }
})
</script>

<style scoped>
body {
    font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
    padding: 0;
    margin: 0;
}

.footer {
    background-color: #f1f1f1;
    /* Light gray background */
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
</style>