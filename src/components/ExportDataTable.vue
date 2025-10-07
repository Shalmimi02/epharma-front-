<template>
    <div :id="this.table + '_export'" class="card w-100">
        <div class="card-header p-1">
            <h5 class="card-title">Tableau des {{ this.table }}</h5>
        </div>
        <div class="card-body p-0" id="pdf-content">
            <table class="table table-striped text-sm table-to-export">
                <thead class=" bg-bleu2 text-white">
                    <tr>
                        <th v-for="column in this.fields" :key="column" scope="col">{{ column.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in this.datas" :key="rowIndex">
                        <td v-for="column in this.fields" :key="column.key">
                            <div v-if="column.format">
                                <span v-if="column.format == 'slot'">
                                    {{ checkIfExist(row, column.key) }}
                                </span>
                                <span v-else-if="column.format == 'date'">
                                    {{ dateFormat(checkIfExist(row, column.key)) }}
                                </span>
                                <span v-else-if="column.format == 'money'">
                                    {{ moneyFormat(checkIfExist(row, column.key)) }}
                                </span>
                                <span v-else-if="column.format == 'state'"
                                    :class="'p-2 rounded-pill badge badge-' + setStateColor(checkIfExist(row, column.key))">
                                    <span>{{ checkIfExist(row, column.key) }}</span>
                                </span>
                            </div>
                            <span v-else>
                                {{ checkIfExist(row, column.key) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import html2pdf from "html2pdf.js";
import moment from 'moment'
export default {
    name: 'ExportDataTable',
    props: ['table', 'fields', 'datas'],
    mounted() {
        this.$nextTick(() => {
            this.printPdf()
        })
    },
    methods: {
        printPdf() {
            let basDePage = 'Pharmacie ', basDePage2 = ''
            if (this.$store.getters.pharmacie) {
                if (this.$store.getters.pharmacie.nom_pharmacie) {
                    basDePage = this.$store.getters.pharmacie.nom_pharmacie + ' | '
                }
                if (this.$store.getters.pharmacie.statut_juridique) {
                    basDePage = basDePage + this.$store.getters.pharmacie.statut_juridique + ' | '
                }
                if (this.$store.getters.pharmacie.capital) {
                    basDePage = basDePage+ ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
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
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
                margin: [0.5, 0.5],
                filename: "Liste des " + this.table,
                html2canvas: { scale: 2 }
            }).from(document.getElementById(this.table + "_export"))
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
        setStateColor(varState) {
            if (varState == 'Confirmé' || varState == 'Terminé' || varState == 'Payé' || varState == 'Accepté' || varState == 'Disponible' || varState == 'Credit') {
                return 'success'
            }
            else if (varState == 'En cours' || varState == 'En course') {
                return 'primary'
            }
            else if (varState == 'Brouillon' || varState == 'Programmé') {
                return 'secondary'
            }
            else if (varState == 'Annulé' || varState == 'En attente' || varState == 'Refusé' || varState == 'Rompu' || varState == 'Debit') {
                return 'danger'
            }
            else return 'light border border-dark'
        },
        checkIfExist(arr, key) {
            const tabSegment = key.split('.')
            let result = arr
            for (let index = 0; index < tabSegment.length; index++) {
                const element = tabSegment[index];
                if (result[element]) {
                    result = result[element]
                }
                else result = ''
            }
            return result
        },
    }

}
</script>

<style scoped>
.table-to-export {
    width: 100%;
    border-collapse: collapse;
}

.table-to-export th,
.table-to-export td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
}

#pdf-content {
    width: 100% !important;
    overflow-x: auto;
}
</style>