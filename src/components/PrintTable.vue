<template>
    <div class=" mr-2">
        <button class="btn btn-light" type="button" @click="getDatas()">
            <i class="fa-solid fa-print mr-1"></i>
            <span class="mr-1">Imprimer</span>
            <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
        </button>
    </div>
    <div v-show="false">
        <ExportDataTable v-if="key > 1 && datas.length > 0" :table="this.table" :fields="this.fields" :datas="datas"></ExportDataTable>
    </div>
</template>

<script>
import ExportDataTable from "./ExportDataTable.vue";

export default {
    name: 'PrintTable',
    props: ['table', 'fields', 'url'],
    components: {ExportDataTable},
    data() {
        return {
            isLoading: false,
            datas: [],
            key: 1,
        }
    },
    methods: {
        getDatas() {
            this.isLoading = true
            this.axios.get(this.url).then(response => {
                this.datas = response.data.data
                this.$nextTick(() => {
                    // Une fois les données affichées, générer le PDF
                    this.key++
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
        }
    }

}
</script>

