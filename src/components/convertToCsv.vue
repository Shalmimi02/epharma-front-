<template>
    <button class="btn btn-light" type="button" @click="getDatas()">
        <i class="fa-solid fa-download mr-1"></i>
        <span class="mr-1">Export CSV</span>
        <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button>
    <div hidden>
        <table>
            <thead>
                <tr>
                    <th>Cip</th>
                    <th>Qte COMM</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{produit_cip}}</td>
                    <td>{{qte}}</td>
                </tr>
            </tbody>
   
        </table>
    </div>
</template>


<script>
export default {
    name: 'convertToCsv',
    props: ['table', 'fields', 'url'],
    data() {
        return {
            table: 'commandes',
            datas: [],
            isLoading: false,
            tableData: [
                'produit_cip' ,
                'qte'
            ]
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
                    this.exportToCsv()
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
        exportToCsv() {
            //  Convertir les données en chaîne CSV
            const csvContent = this.convertToCSV(this.tableData);
            // Créer un lien temporaire pour le téléchargement
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        },
        convertToCSV(data) {
            // const headers = Object.keys(tableData[0]);

            // colonnes à exporter
            const headers = ["cip 1","Qte COMM"];
            const rows = data.map(obj => Object.values(obj).join(';'));
            return [headers.join(';'), ...rows].join('\n');
        },
        async updateLines(nb_lines) {
            await this.calculerCoutTotal()
            this.lines = nb_lines
        },


    }
}
</script>