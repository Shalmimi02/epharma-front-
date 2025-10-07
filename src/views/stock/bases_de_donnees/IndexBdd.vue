<template>
    <EpharmaTemplate>
        <template #page_title> BASE DE DONNÉES PRODUIT EPHARMA </template>
        <template #page_counter>
            <i class="fas fa-database"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="importExcelDatabase()">
                        <i class="fa-solid fa-file-excel mr-2"></i> Importer
                    </button>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        <i class="fa-solid fa-plus mr-2"></i> Nouveau produit
                    </button>
                </template>
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
                 <template #cip_deux=slotProps>
                    {{ slotProps.data.cip_deux }}
                    <span class="badge badge-secondary" v-if="slotProps.data.cip_deux">FSSE </span>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>

import { defineComponent, defineAsyncComponent } from 'vue';
const FormProduit = defineAsyncComponent(() => import('./FormBaseDonnee.vue'));
const ShowBaseDonnee = defineAsyncComponent(() => import('./ShowBaseDonnee.vue'));
const ExcelImportBdd = defineAsyncComponent(() => import('./ExcelImportBdd.vue'));
export default defineComponent({
    data() {
        return {
            lines: 0,
            table: 'produits',
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
                    key: 'cip_deux',
                    label: 'CIP 2',
                    format: 'slot',
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
            keyWord: ''
        }
    },
    methods: {
        importExcelDatabase(){
            this.$dialog.open(ExcelImportBdd, {
                props: {
                    header: "Importer à partir d'un fichier excel",
                    style: {
                        width: '40vw',
                    },
                    modal: true
                }
            });
        },
        openCreateModal() {
            this.$dialog.open(FormProduit, {
                props: {
                    header: "Nouveau produit",
                    style: {
                        width: '80vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowBaseDonnee, {
                props: {
                    header: objData.libelle,
                    style: {
                        width: '80vw',
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