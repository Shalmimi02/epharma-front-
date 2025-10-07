<template>

    <AsdecodeTable Export :key="key" :url="'/api/' + table + '?code_fournisseur='+ this.dialogRef.data.id"
        :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
        <template #action_btns=slotProps>
            <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
        </template>
        <template #libelle=slotProps>
            {{ slotProps.data.libelle }}
            <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
            <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
        </template>
    </AsdecodeTable>

</template>

<script>
import AsdecodeTable from "../../../components/AsdecodeTable.vue";
import { defineComponent, defineAsyncComponent } from 'vue';
const EditProduit = defineAsyncComponent(() => import('../produits/EditProduit'))
export default defineComponent({
    inject: ['dialogRef'],
    props: ['datas'],
    data() {
        return {
            table: 'produits',
            isLoading: false,
            fournisseur_id: this.datas,
            
            columns: [
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QUANTITE',
                    // format: 'slot',
                    exportable: true
                },
                {
                    key: 'rayon.libelle',
                    label: 'RAYON',
                    exportable: true
                },
                {
                    key: 'nature',
                    label: 'NATURE',
                    exportable: true
                },
                {
                    key: 'prix_achat',
                    label: 'PRIX ACHAT',
                    exportable: true,
                    format: 'money'
                },
                {
                    key: 'prix_de_vente',
                    label: 'PRIX VENTE',
                    exportable: true,
                    format: 'money'
                },
            ],
           
            key: 1,
            keyWord: '',


        }

    },

    methods: {
        openShowModal(objData) {
            this.$dialog.open(EditProduit, {
                props: {
                    header: "Produit N°" + objData.id,
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