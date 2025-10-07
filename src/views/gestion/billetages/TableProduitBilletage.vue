<template>
    <!-- <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" /> -->
    <AsdecodeTable noExport :key="key" :url="'/api/billetages/'+this.dialogRef.data.id+'/produits'"
        :columns="columns" :table="table"  >
        <template #libelle=slotProps>
            {{ slotProps.data.libelle }}
            <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
            <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
        </template>
    </AsdecodeTable>
</template>

<script>

import { defineComponent } from 'vue';


export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            key: 1,
            table: 'produits',
            columns: [
            {
                    key: 'libelle',
                    export_key: 'libelle_with_taxes',
                    label: 'LIBELLE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'produit.cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QUANTITE',
                    exportable: true
                },
                {
                    key: 'produit.rayon',
                    label: 'RAYON',
                    exportable: true
                },
                {
                    key: 'produit.nature',
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
            ]
        }
    }

})

</script>