<template>
    <AsdecodeTable :key="key" :url="'/api/' + table + '?clientId=' + this.dialogRef.data.id"
        :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
        <template #header_action_btns>
        </template>
        <template #action_btns=slotProps>
            <div class="d-flex">
                <button class="btn btn-sm btn-light m-1" @click="openShowVente(slotProps.data)">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </template>
    </AsdecodeTable>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const ShowVente = defineAsyncComponent(() => import('../ventes/ShowVente.vue'));
export default defineComponent({
    name: 'ShowFactureClient',
    inject: ['dialogRef'],
    data() {
        return {
            table: 'ventes',
            table2: 'reservations_produits',
           
            columns: [
                {
                    key: 'caisse',
                    label: 'CAISSE',
                    exportable: true
                },
                {
                    key: 'user',
                    label: 'VENDEUSE',
                    exportable: true
                },
                {
                    key: 'position_and_date',
                    label: 'RESERVATION',
                    exportable: true
                },
                {
                    key: 'total',
                    label: 'TTC',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'ht',
                    label: 'HT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'tva',
                    label: 'TVA',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'css',
                    label: 'CSS',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_client',
                    label: 'TOTAL CLIENT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_prise_en_charge',
                    label: 'PRISE EN CHARGE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'montant_rendu',
                    label: 'MT RENDU',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    format: 'state',
                    exportable: true
                }
            ],
        }
    },
    methods: {
        openShowVente(objData){
            this.$dialog.open(ShowVente, {
                props: {
                    header: "Liste des produits achetés",
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        

    }

})
</script>