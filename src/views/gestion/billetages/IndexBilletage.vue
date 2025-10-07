<template>
    <EpharmaTemplate>
        <template #page_title> ARRÊTÉ DE CAISSE </template>
        <template #page_counter>
            <i class="fa-solid fa-money-bill"></i> {{ lines }}
        </template>
        <template #content>
            <div class="bg-white row border shadow-md rounded p-1 mb-2 mx-auto d-flex align-items-center">
                <div class="col-md-6">
                    <p class="mb-3"><small>Rechercher par date</small></p>
                    <form @submit.prevent="periodFilter" class="form-row">
                        <div class="col-md">
                            <input class="form-control form-control-sm border border-dark px-[4rem]" type="date" v-model="filterForm.debut">
                        </div>
                        <div class="col-md">
                            <input class="form-control form-control-sm border border-dark px-[4rem] " type="date" v-model="filterForm.fin">
                        </div>
                        <div class="col-md-3">
                            <button type="submit" class="btn">
                                <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                                    title="Appliquer le filtrage"></i>
                            </button>
                            <button type="button" class="btn" @click="removeFilter">
                                <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                                    title="Annuler le filtrage"></i>
                            </button>
                        </div>
                    </form>
                </div>

                <div class="col-md-6">
                    <p class="mb-3"><small>Rechercher par mot clé</small></p>
                    <searchByKeyword v-on:set-keyword-filter="searchLines" />
                </div>
            </div>
            <AsdecodeTable :key="key" :url=" url" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                </template>
                <template #statut=slotProps>
                    <h6 class="text-orangebillet bg-bgbillet text-center p-1 " v-if="slotProps.data.statut == 'En attente de validation'"> {{ slotProps.data.statut }}</h6>
                    <h6 class="text-vertbilet bg-Bgbilletage  text-center p-1 " v-if="slotProps.data.statut == 'validé'"> {{ slotProps.data.statut }}</h6>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>

</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const EditBilletage = defineAsyncComponent(() => import('./EditBilletage.vue'));
export default defineComponent({
    data() {
        return {
            lines: 0,
            table: 'billetages',
            defaultUrl: '/api/billetages',
            url: '/api/billetages',
            key: 1,
            keyWord: '',
            columns: [
                {
                    key: 'caisse_libelle',
                    label: 'CAISSE',
                    exportable: true
                },
                {
                    key: 'ended_with',
                    label: 'CLÔTURÉ PAR',
                    exportable: true
                },
                {
                    key: 'total_vente',
                    label: 'TOTAL VENTE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_billetage',
                    label: 'TOTAL BILLETAGE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'ecart',
                    label: 'ECART',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'periode',
                    label: 'PÉRIODE',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    format: 'slot',
                    exportable: true
                }
            ],
            filterForm: {},

        }

    },
    methods: {
        periodFilter() {
            let newUrl = this.defaultUrl

            if (this.filterForm.debut && this.filterForm.fin) {
                newUrl = newUrl + '?period_from=' + this.filterForm.debut + '&period_to=' + this.filterForm.fin
            }

            else if (this.filterForm.debut) {
                newUrl = newUrl + '?period_from=' + this.filterForm.debut
            }

            else if (this.filterForm.fin) {
                newUrl = newUrl + '?period_to=' + this.filterForm.fin
            }

            this.url = newUrl
            this.key++
        },
        removeFilter() {
            this.url = this.defaultUrl
            this.key++
        },
        openShowModal(objData) {
            this.$dialog.open(EditBilletage, {
                props: {
                    header: 'Billetage',
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
