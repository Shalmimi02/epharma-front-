<template>
    <AsdecodeTable :url="'/api/commandes-du-produit/' + this.dialogRef.data.id+ '?status=SUCCESS'" :columns="columns"
        :table="table" v-on:set-total-records="updateLines">
        <template #action_btns=slotProps>
            <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                <i class="fa-solid fa-folder-open"></i>
            </button>
        </template>
    </AsdecodeTable>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const FormCommande = defineAsyncComponent(() => import('./FormCommande.vue'));

export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            lines: 0,
            table: 'commandes-du-produit',
            columns: [
                {
                    key: 'numero',
                    label: 'Numero',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'Date de création',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'fournisseur.libelle',
                    label: 'Fournisseur',
                    exportable: true
                },
            
                {
                    key: 'total_achat',
                    label: 'Prix d\'achat ',
                    format: 'money',
                    exportable: true
                },
            ]
        }
    },
    methods: {
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        openShowModal(objData) {
            this.$dialog.open(FormCommande, {
                props: {
                    header: "Commande "+objData.numero,
                    style: {
                        width: '90vw',
                    },
                    modal: true
                },
                data: objData
            });
        }
    }
})
</script>
