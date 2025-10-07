<template>
    <div class="card ">
        <div class="card-header p-1">
            <div class="d-flex ">
                <button :id="'refresh' + this.table" class="btn btn-light mr-2" @click="getDatas()">
                    <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role='status'
                    aria-hidden="true"></span>
                    <i v-else class="fa fa-refresh"></i>
                    <span v-if="!this.perPage"> Actualiser </span>
                </button>
                <ExportTableCSV v-if="ExportCSV && datas.length > 0" :table="this.table" :url="exportUrl" :fields="exportableFields(this.columns)"></ExportTableCSV>
                <ExportTable v-if="!this.noExport && datas.length > 0" :table="this.table" :url="exportUrl" :fields="exportableFields(this.columns)"></ExportTable>
                <PrintTable v-if="!this.noExport && datas.length > 0" :table="this.table" :url="exportUrl" :fields="exportableFields(this.columns)"></PrintTable>
                <slot name="header_action_btns"></slot>
                <div class="ml-auto" v-if="this.useSearch">
                    <input type="search" v-model="keyWord" class="form-control form-control-sm" placeholder="Rechercher" @input="getDatas()" >
                </div>
            </div>
        </div>
        <div class="card-body p-0 overflow-auto">
            <ProgressBar class="my-1" v-if="isLoading === true" mode="indeterminate" style="height: 6px"></ProgressBar>
            <table class="table table-striped table-sm text-sm">
                <thead class=" bg-bleu2 text-white">
                    <tr>
                        <th scope="col"></th>
                        <th v-for="column in this.columns" :key="column.id" scope="col">{{ column.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in datas" :key="rowIndex" >
                        <td>
                            <slot name="action_btns" :data="row"></slot>
                        </td>
                        <td v-for="column in this.columns" :key="column.key" >
                            <div v-if="column.format">
                                <span v-if="column.format == 'slot'">
                                    <slot :name="column.key" :data="row"></slot>
                                </span>
                                <span v-else-if="column.format == 'date'">
                                    {{ dateFormat(checkIfExist(row, column.key)) }}
                                </span>
                                <span v-else-if="column.format == 'datetime'">
                                    {{ dateTimeFormat(checkIfExist(row, column.key)) }}
                                </span>
                                <span v-else-if="column.format == 'money'">
                                    {{ moneyFormat(checkIfExist(row, column.key)) }}
                                </span>
                                <span v-else-if="column.format == 'state'" :class="'p-2 rounded-pill badge badge-'+setStateColor(checkIfExist(row, column.key))">
                                    <span>{{ checkIfExist(row, column.key) }}</span>
                                </span>
                            </div>
                            <span v-else-if="column.export_key">
                                {{ checkIfExist(row, column.export_key) }}
                            </span>
                            <span v-else>
                                {{ checkIfExist(row, column.key) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="card-footer d-flex justify-content-end align-items-center bg-white p-0" >
            <div class="mr-2">
              <select v-model="rows" class="form-control form-control-sm" @change="getDatas()" style="width: 90px;">
                <option v-for="option in showEntries" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="mr-2">
              {{ totalRecords }} Lignes
            </div>
            <Paginator v-model:first="first" :rows="rows" :totalRecords="totalRecords" @page="getDatas()" class="m-0" style="cursor: pointer;"></Paginator>
        </div>
    </div>
</template>
<script>
import moment from 'moment'
import { defineComponent } from 'vue';
import Paginator from 'primevue/paginator';
import ExportTable from './ExportTable.vue'
import ExportTableCSV from './ExportTableCSV.vue'
import PrintTable from './PrintTable.vue';


export default defineComponent({
    name: "AsdecodeTable",
    components: { Paginator, ExportTable, PrintTable, ExportTableCSV },
    props: {
        table: { type: String },
        url: { type: String },
        perPage: { type: Number },
        columns: { type: Array },
        newKeyWord: { type: String },
        noExport: { type: Boolean },
        ExportCSV: { type: Boolean },
        useSearch: { type: Boolean }
    },
    data() {
        return {
            key: 1,
            isLoading: true,
            initialUrl: '',
            exportUrl: '',
            first: 0,
            line: [],
            datas: [],
            showEntries: [5, 10, 25, 50, 100, 500],
            rows: 5,
            page: 1,
            keyWord: '',
            filters: [],
            period: moment().format('YYYY-MM'),
            currentPeriod: moment().format('YYYY-MM'),
            totalRecords: 0,
        }
    },
    created() {
        if (this.perPage) {
            this.rows = this.perPage
        }
        if (this.url) {
            this.initialUrl = this.url
        }
        if (this.newKeyWord) {
            this.keyWord = this.newKeyWord
        }
    },
    mounted() {
        this.getDatas();
    },
    methods: {
        dateTimeFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY HH:mm:ss')
            }
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
            if (varState == 'Confirmé' || varState == 'Terminé' || varState == 'Payé' || varState == 'Accepté' || varState == 'Disponible' || varState == 'Credit' || varState == 'Soldé') {
                return 'success'
            }
            else if (varState == 'En cours' || varState == 'En course') {
                return 'primary'
            }
            else if (varState == 'Brouillon' || varState == 'Programmé') {
                return 'secondary'
            }
            else if (varState == 'Annulé' || varState == 'En attente' || varState == 'Refusé' || varState == 'Rompu' || varState == 'Debit' || varState == 'Impayé') {
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
        exportableFields(fields) {
            if (fields && fields.length > 0) {
                return fields.filter(item => item.exportable && item.exportable == true)
            }
        },
        getDatas() {
            this.isLoading = true
            //lister les colonnes pour la requete
            let columns = []
            this.columns.forEach(element => {
                columns.push(element.key)
            });

            //vider le tableau avant de recharger
            // this.datas = []
            this.selectedLines = []

            if (this.first <= 0) {
                this.page = 1
            }
            else {
                this.page = (this.first / this.rows) + 1
            }
            let link = this.initialUrl
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'

            //le lien pour les totaux, les exports pdf et excel
            this.exportUrl = link + 'search_by_keyword=' + this.keyWord + '&columns=' + columns
            this.$emit('get-table-url', link + 'columns=' + columns)

            this.axios.get(link + 'page=' + this.page + '&rows=' + this.rows + '&search_by_keyword=' + this.keyWord + '&columns=' + columns).then((response) => {
                let resData = response.data
                if (response.data && response.data.datas) {
                    resData = response.data.datas
                }
                this.datas = resData.data
                this.totalRecords = resData.meta.total
                this.$emit('set-total-records', resData.meta.total)
                this.$emit('set-datas', resData.data)
                this.$emit('set-extra_data', resData.extra_data)
                this.isLoading = false
                 // Émettez l'événement pour informer le composant parent que les items sont disponibles
                this.$emit('update:items', this.datas)
                this.key++
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            });
        },
    },
});

</script>

<style scoped>
table  {
    font-size: 0.8rem !important; 
}

table tr td, 
table tr th {
  padding: 0.5rem !important; 
}

table .btn {
  padding: 0 !important; 
}

table input, table select {
  font-size: 0.8rem !important; 
  padding: 0.25rem !important; 
}
</style>