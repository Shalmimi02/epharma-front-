<template>
    <EpharmaTemplate>
        <template #page_title> GARDES </template>
        <template #page_counter>
            <i class="fa-solid fa-user mr-1"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        Nouvelle Garde
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>

import { defineComponent, defineAsyncComponent } from 'vue';
const CreateGarde = defineAsyncComponent(() => import('./CreateGarde.vue'));
const ShowGarde = defineAsyncComponent(() => import('./ShowGarde.vue'));
export default defineComponent({
    
    data() {
        return {
            lines: 0,
            table: 'gardes',
            columns: [
                {
                    key: 'id',
                    label: 'NUMERO',
                    exportable: true
                },
                {
                    key: 'date_debut',
                    label: 'DATE DE DEBUT',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'heure_debut',
                    label: 'HEURE DE DEBUT',
                    exportable: true
                },
                {
                    key: 'date_fin',
                    label: 'DATE DE FIN',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'heure_fin',
                    label: 'HEURE DE FIN',
                    exportable: true
                },
                {
                    key: 'montant_taxe',
                    label: 'TAXE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_taxe',
                    label: 'TOTAL TAXE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_garde',
                    label: 'C.A',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    exportable: true
                },
            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        openCreateModal() {
            this.$dialog.open(CreateGarde, {
                props: {
                    header: "Nouvelle Garde",
                    style: {
                        width: '80vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowGarde, {
                props: {
                    header: "Garde N°" + objData.id,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        }
    }
})
</script>