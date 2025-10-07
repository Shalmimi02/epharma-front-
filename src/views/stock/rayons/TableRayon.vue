<template>
    <AsdecodeTable noExport :key="key" :url="'/api/' + table + '?is_active=1&rayon=' + this.dialogRef.data.libelle"
        :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
        <template #action_btns=slotProps>
            <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                <i class="fas fa-edit"></i>
            </button>
        </template>
        <template #qte=slotProps>
            <span v-if="parseInt(slotProps.data.qte) >= parseInt(slotProps.data.qte_max)"
                class="rounded-pill badge badge-bleuqte p-2">
                {{ slotProps.data.qte }}
            </span>
            <span v-else-if="parseInt(slotProps.data.qte) > parseInt(slotProps.data.qte_min)"
                class="rounded-pill badge badge-orangeqte p-2">
                {{ slotProps.data.qte }}
            </span>
            <span v-else-if="parseInt(slotProps.data.qte) <= parseInt(slotProps.data.qte_min)"
                class="rounded-pill badge badge-rougeqte p-2">
                {{ slotProps.data.qte }}
            </span>
        </template>
        <template #libelle=slotProps>
            {{ slotProps.data.libelle }}
            <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
            <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
        </template>
    </AsdecodeTable>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const EditProduit = defineAsyncComponent(() => import('../produits/EditProduit'))
export default defineComponent({
    inject: ['dialogRef'],
    props: ['datas'],
    data() {
        return {
            table: 'produits',
            isLoading: false,
            // rayon_id: this.datas,
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
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'rayon',
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