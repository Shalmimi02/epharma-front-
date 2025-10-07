<template>
    <EpharmaTemplate>
        <template #page_title> UTILISATEURS </template>
        <template #page_counter>
            <i class="fa-solid fa-user mr-1"></i> {{ lines }}
        </template>
        <template #content>
            <div class="col-md-4 ml-auto mb-3">
               <searchByKeyword v-on:set-keyword-filter="searchLines" /> 
            </div>
            
            <AsdecodeTable :useSearch :key="key" :url="'/api/' + table" :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        Nouvel utilisateur
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light" @click="openShowModal(slotProps.data)">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';

const CreateUtilisateur = defineAsyncComponent(() => import('./CreateUtilisateur.vue'));
const ShowUtilisateur = defineAsyncComponent(() => import('./ShowUtilisateur.vue'));
export default defineComponent({

    data() {
        return {
            lines: 0,
            table: 'utilisateurs',
            columns: [
                {
                    key: 'fullname',
                    label: 'NOM ET PRÉNOM',
                    exportable: true
                },
                {
                    key: 'name',
                    label: 'NOM D\'UTILISATEUR',
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
                    key: 'last_connexion',
                    label: 'DERNIÈRE ACTIVITÉ',
                    exportable: true
                },
            ],
            key: 1,
            keyWord: ''
        }
    },
    methods: {
        openCreateModal() {
            this.$dialog.open(CreateUtilisateur, {
                props: {
                    header: "Nouvel utilisateur",
                    style: {
                        width: '60vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowUtilisateur, {
                props: {
                    header: objData.fullname,
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
    },

})
</script>