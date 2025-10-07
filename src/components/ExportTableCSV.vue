<template>
    <button class="btn btn-light mr-2" type="button" @click="getDatas()">
        <i class="fa-solid fa-download mr-1"></i>
        <span class="mr-1">Export CSV</span>
        <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button>
</template>

<script>
import * as XLSX from 'xlsx';
export default {
    name: 'ExportTable',
    props: ['table', 'fields', 'url'],
    data() {
        return {
            datas: [],
            isLoading: false
        }
    },
    methods: {
        getDatas() {
            this.isLoading = true
            this.axios.get(this.url).then(response => {
                this.datas = response.data.data
                this.$nextTick(() => {
                    // Une fois les données affichées, générer le PDF
                    // this.key++
                    this.exportToExcel()
                });

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
        exportToExcel() {
            const selectedColumns = this.datas.map(item => {
                let filteredItem = {};
                this.fields.forEach(col => {
                    if (col.toCSV) {
                        filteredItem[col.label] = item[col.key];
                    }
                });
                return filteredItem;
            });

            // const worksheet = XLSX.utils.json_to_sheet(selectedColumns);
            // const workbook = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(workbook, worksheet, this.table);

            // // Générer un fichier Excel
            // XLSX.writeFile(workbook, this.table + '.csv', { bookType: "csv" });

            const worksheet = XLSX.utils.json_to_sheet(selectedColumns);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, this.table);

            // Générer un fichier Excel
            XLSX.writeFile(workbook, this.table + '.xlsx');
        }
    }
}
</script>