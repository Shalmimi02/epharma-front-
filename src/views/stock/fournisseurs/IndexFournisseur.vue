<template>
    <EpharmaTemplate>
        <template #page_title> FOURNISSEURS </template>
        <template #page_counter>
            <i class="fas fa-dolly-flatbed"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        <i class="fa-solid fa-plus"></i> Nouveau fournisseur
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';

const FormFournisseur = defineAsyncComponent(() => import('./FormFournisseur.vue'));
const ShowFournisseur = defineAsyncComponent(() => import('./ShowFournisseur.vue'));
export default defineComponent({

    data() {
        return {
            lines: 0,
            table: 'fournisseurs',
            columns: [
                {
                    key: 'libelle',
                    label: 'NOM',
                    exportable: true
                },
                {
                    key: 'telephone',
                    label: 'TÉLÉPHONE',
                    exportable: true
                },

                {
                    key: 'email',
                    label: 'EMAIL',
                    exportable: true
                },
                {
                    key: 'adresse',
                    label: 'ADRESSE',
                    exportable: true
                },
                {
                    key: 'siteurl',
                    label: 'SITE INTERNET',
                    exportable: true
                }

            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        openCreateModal() {
            this.$dialog.open(FormFournisseur, {
                props: {
                    header: "Nouveau fournisseur",
                    style: {
                        width: '60vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowFournisseur, {
                props: {
                    header: "Fournisseur N°" + objData.id,
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
