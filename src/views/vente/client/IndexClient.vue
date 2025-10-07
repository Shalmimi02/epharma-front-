<template>
    <EpharmaTemplate>
        <template #page_title> CLIENTS</template>
        <template #page_counter>
            <i class="fa-solid fa-user mr-1"></i> {{ lines }}
        </template>
        <template #content>
            <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url=" '/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openCreateModal()">
                        Nouveau client
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                </template>
                <template #libelle=slotProps>
                    {{ slotProps.data.tab_libelle }}
                </template>
                <template #nom=slotProps>
                    {{ slotProps.data.tab_nom }}
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import MoneyCounter from '@/components/MoneyCounter.vue';
import { defineComponent, defineAsyncComponent } from 'vue';
const CreateClient = defineAsyncComponent(() => import('./CreateClient.vue'));
const ShowClient = defineAsyncComponent(() => import('./ShowClient.vue'));
export default defineComponent({
    components: { MoneyCounter },
    data() {
        return {
            lines: 0,
            table: 'clients',
            columns: [
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'remise_percent',
                    label: 'POURCENTAGE ASSURANCE',
                    exportable: true
                },
                {
                    key: 'nom',
                    label: 'Nom du client',
                    exportable: true
                },
                {
                    key: 'telephone',
                    label: 'Telephone',
                    exportable: true
                },
                {
                    key: 'email',
                    label: 'Email',
                    exportable: true
                },
                {
                    key: 'ville',
                    label: 'Ville',
                    exportable: true
                },
                {
                    key: 'current_remboursement_amount',
                    label: 'Credit',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'current_dette',
                    label: 'Dette',
                    format: 'money',
                    exportable: true
                },
            ],
            compteurs: [],
            keyCounter: 1,
            key: 1,
            keyWord: ''
        }
    },
    mounted() {
        this.calculerCoutTotal()
    },
    methods: {
        openCreateModal() {
            this.$dialog.open(CreateClient, {
                props: {
                    header: "Nouveau client",
                    style: {
                        width: '50vw',
                    },
                    modal: true
                }
            });
        },
        openShowModal(objData) {
            this.$dialog.open(ShowClient, {
                props: {
                    header: "Client N°" + objData.id,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        async updateLines(nb_lines) {
            await this.calculerCoutTotal()
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        // fonctions pur faire les calcules des totaux dans les compteurs
        calculerCoutTotal() {
            this.isLoading = true
            this.axios.get('/api/clients-calc-compteur').then(response => {
                this.isLoading = false
                this.compteurs = []
                this.compteurs.push(
                    {
                        value: response.data.total_credit,
                        label: 'TOTAL CREDIT'
                    },
                    {
                        value: response.data.total_dette,
                        label: 'TOTAL DETTE'
                    },
                )
                this.keyCounter++
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
    }
})
</script>
