<template>
    <EpharmaTemplate>
        <template #page_title> PRODUITS </template>
        <template #page_counter>
            <i class="fas fa-box"></i> {{ lines }}
        </template>
        <template #content>
            <!-- composant qui affiche les valeurs totales -->
            <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
            <!-- Partie qui affiche les filtres et la recherche   -->
            <div class="row border bg-light rounded p-1 mb-2 mx-auto d-flex align-items-center">
                <div class="col-md-6">
                    <form @submit.prevent="produitFilter">
                        <div class="form-row">
                            <div class="col-md">
                                <p class="mb-3"><small>Rechercher par rayon</small></p>
                                <select class="form-control form-control-sm border border-dark px-[4rem]" v-model="filterForm.rayon">
                                    <option v-for="rayon in rayons" :key="rayon.id" :value="rayon.libelle">{{ rayon.libelle }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md">
                                <p class="mb-3"><small>Rechercher par nature</small></p>
                                <select class="form-control form-control-sm border border-dark px-[4rem]" v-model="filterForm.nature">
                                    <option v-for="nature in natures" :key="nature" :value="nature.libelle">{{ nature.libelle }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md">
                                <p style="opacity: 0;">Actions</p>
                                <button class="btn" type="submit">
                                    <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                                        title="Appliquer le filtrage"></i>
                                </button>
                                <button type="button" class="btn" @click="removeFilter">
                                    <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                                        title="Annuler le filtrage"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="col-md-4 ml-auto">
                    <p class="mb-3"><small>Rechercher par mot clé</small></p>
                    <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" />
                </div>
            </div>
            <!-- tableau de donnee -->
            <AsdecodeTable :key="key" :newKeyWord="keyWord" :url="url" :columns="columns" :table="table"
                @set-total-records="updateLines" @set-extra_data="updateExtraDatas">
                <li v-for="column in filteredItems" :key="column">{{ column }}</li>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                   
                </template>
                <template #qte=slotProps>
                    <span v-if="parseInt(slotProps.data.qte) >= parseInt(slotProps.data.qte_max)"
                        class="rounded-pill badge badge-bleuqte p-2">
                        {{ slotProps.data.qte }}
                    </span>
                    <span v-else-if="parseInt(slotProps.data.qte) > parseInt(slotProps.data.qte_min)"
                        class="rounded-pill badge badge-orangeqte p-2">
                        {{ slotProps.data.qte }}
                    </span>
                    <span v-else-if="parseInt(slotProps.data.qte) <= parseInt(slotProps.data.qte_min)"
                        class="rounded-pill badge badge-rougeqte p-2">
                        {{ slotProps.data.qte }}
                    </span>
                </template>
                <template #libelle=slotProps>
                    {{ slotProps.data.libelle }}
                    <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
                    <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
                </template>
                <template #statistique=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openStatModal(slotProps.data)">
                            <i class="fa-solid fa-chart-simple"></i>
                            Statistique
                    </button>  
                </template>  
                
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';

import MoneyCounter from '@/components/MoneyCounter.vue';
import { FormatService } from '@/services/FormatService';
const EditProduit = defineAsyncComponent(() => import('./EditProduit.vue'))
const StatProduit = defineAsyncComponent(() => import('./StatProduit.vue'))

export default defineComponent({
    components: { MoneyCounter },
    data() {
        return {
            lines: 0,
            isLoading: false,
            table: 'produits',
            defaultUrl: '/api/produits?is_active=1',
            url: '/api/produits?is_active=1',
            columns: [
                {
                    key: 'libelle',
                    export_key: 'libelle_with_taxes',
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
                    key: 'qte',
                    label: 'QTE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'rayon',
                    label: 'RAYON',
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
                {
                    key: 'statistique',
                    label: 'STATISTIQUE',
                    format: 'slot',
                    exportable: true
                },

               
            ],
            key: 1,
            keyCounter: 1,
            keyWord: '',
            filterForm: {},
            rayons: [],
            compteurs: [],
            natures: [],
        }
    },
    created() {
        this.getRayons()
        this.getNature()
    },
    methods: {
        // filtrer les produit a partir 
        produitFilter() {
            let newUrl = this.defaultUrl
            if (this.filterForm.rayon) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'rayon=' + this.filterForm.rayon
            }

            if (this.filterForm.nature) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'nature=' + this.filterForm.nature
            }

            this.url = newUrl
            this.key++
        },
        // annuler et vider le filtre
        removeFilter() {
            this.filterForm = {}
            this.url = this.defaultUrl
            this.key++
        },
        // recuperer les rayons
        getRayons() {
            this.isLoading = true
            this.axios.get('/api/rayons').then(response => {
                this.rayons = response.data.data
                this.isLoading = false
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
        // recuperer la liste des natures
        getNature() {
            this.isLoading = true
            this.axios.get('/api/prod_natures').then(response => {
                this.natures = response.data.data
                this.isLoading = false
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
        // ouvrir le modal de modification d'un produit
        openShowModal(objData) {
            this.$dialog.open(EditProduit, {
                props: {
                    header: objData.libelle,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: objData
            });
        },
        openStatModal(objData) {
            this.$dialog.open(StatProduit, {
                props: {
                header: "Statistique "+objData.libelle,
                style: {
                    width: '70vw',
                },
                modal: true
                },
                data: objData
            });
        },

        // mettre a jour le nombre de ligne du tableau
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        // mettre a jour les compteurs et les incoherances si besoin
        updateExtraDatas(extraDatas) {
            const compteur = extraDatas.compteurs
            this.compteurs= []
            this.compteurs.push(
                {
                    value: compteur.cout_total_achat,
                    label: 'VALEUR À L\'ACHAT'
                },
                {
                    value: compteur.cout_total_vente,
                    label: 'VALEUR À LA VENTE'
                },
            )
            this.keyCounter++
        },
        // envoyer les mot cles dans le tableau pour actualiser les donnes
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        }
    }
})
</script>
