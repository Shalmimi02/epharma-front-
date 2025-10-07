<template>
    <EpharmaTemplate>
        <template #page_title> INVENTAIRES </template>
        <template #page_counter>
            <i class="fa-solid fa-folder mr-1"></i> {{ lines }}
        </template>
        <template #content>
            <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" />
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <div class="dropdown">
                        <button class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Nouvel inventaire
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <button type="button" class="dropdown-item" @click="openChoiceRayon()">Partiel</button>
                            <button type="button" class="dropdown-item" @click="openCreateModalTotal()">Total</button>
                        </div>
                    </div>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>

import { defineComponent, defineAsyncComponent } from 'vue';
const CreateInventaireTotal = defineAsyncComponent(() => import('./CreateInventaireTotal.vue'));
const CreateInventairePartiel = defineAsyncComponent(() => import('./CreateInventairePartiel.vue'));
const ShowInventaire = defineAsyncComponent(() => import('./ShowInventaire.vue'));
const ChoiceRayon = defineAsyncComponent(() => import('./ChoiceRayon.vue'));
export default defineComponent({

    data() {
        return {
            lines: 0,
            table: 'inventaires',
            columns: [
                {
                    key: 'numero',
                    label: 'NUMÉRO',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'DATE DE CRÉATION',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'type',
                    label: 'Type',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    format: 'state',
                    exportable: true
                },
            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        openChoiceRayon() {
            this.$dialog.open(ChoiceRayon, {
                props: {
                    header: "Inventaire partiel",
                    style: {
                        width: '40vw',
                    },
                    modal: true
                }
            });
        },
        openCreateModalPartiel() {
            this.$dialog.open(CreateInventairePartiel, {
                props: {
                    header: "Inventaire partiel",
                    style: {
                        width: '90vw',
                    },
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    modal: true
                }
            });
        },
        openCreateModalTotal() {
            this.$dialog.open(CreateInventaireTotal, {
                props: {
                    header: "Inventaire total",
                    style: {
                        width: '90vw',
                    },
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    modal: true
                }
            });
        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        openShowModal(objData) {
            let custom_header = "Inventaire " + objData.type
            if (objData.type == 'Partiel') {
                custom_header = custom_header + " (" + objData.rayon + ")"
            }

            this.$dialog.open(ShowInventaire, {
                props: {
                    header: custom_header,
                    style: {
                        width: '90vw',
                    },
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    modal: true
                },
                data: objData
            });
        }
    }
})
</script>