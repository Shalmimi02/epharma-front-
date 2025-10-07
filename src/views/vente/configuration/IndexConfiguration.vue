<template>
    <EpharmaTemplate>
        <template #page_title>CONFIGURATION</template>
        <template #page_counter>
            <i class="fas fa-cash-register" style="font-size: 25px;"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        Nouvelle caisse
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <div class="d-flex">
                        <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </div>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>

import { defineComponent, defineAsyncComponent } from 'vue';
const FormConfiguration = defineAsyncComponent(() => import('./FormConfiguration.vue'));
const ShowConfiguration = defineAsyncComponent(() => import('./ShowConfiguration.vue'));
export default defineComponent({

    data() {
        return {
            lines: 0,
            table: 'caisses',
            columns: [
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'DERNIER UTILISATEUR CONNECTÉ',
                    exportable: true
                },
                {
                    key: '',
                    label: 'DERNIERE CONNEXION',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'CREER PAR',
                    exportable: true
                }
            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        openCreateModal() {
            this.$dialog.open(FormConfiguration, {
                props: {
                    header: "Nouvelle caisse",
                    style: {
                        width: '60vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowConfiguration, {
                props: {
                    header: "Caisse N°" + objData.id,
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