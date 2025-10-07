<template>
    <EpharmaTemplate>
        <template #page_title> MOUVEMENTS </template>
        <template #page_counter>
            <i class="fas fa-skating"></i>{{ lines }}
        </template>
        <template #content>
            <form @submit.prevent="mouvementFilter" class="border bg-light rounded p-3 mx-auto" style="opacity:">
                <div class="form-row">
                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold">Rechercher par motif</small>
                            <div>
                                <label></label>
                                <select class="form-control form-control-sm border border-dark px-[4rem]" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;" v-model="filterForm.motif">
                                    <option v-for="motif in motifs" :key="index" :value="motif.libelle">{{ motif.libelle }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold pl-3">Rechercher par date</small>
                            <div>
                                <label></label>
                                <input class="form-control form-control-sm border border-dark px-[4rem]" type="date" v-model="filterForm.debut"
                                    style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold pl-3"></small>
                            <div>
                                <label></label>
                                <input class="form-control form-control-sm border border-dark px-[4rem]" type="date" v-model="filterForm.fin" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold">Rechercher par type</small>
                            <div>
                                <label></label>
                                <select class="form-control form-control-sm border border-dark px-[4rem]" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;" v-model="filterForm.type">
                                    <option value="Entrée">Entrée</option>
                                    <option value="Sortie">Sortie</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mt-5">
                        <button type="submit" class="btn">
                            <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                                title="Appliquer le filtrage"></i>
                        </button>
                        <button type="button" class="btn" @click="removeFilter()">
                            <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                                title="Annuler le filtrage"></i>
                        </button>
                    </div>
                </div>
            </form><br>
            <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines"/>

            <AsdecodeTable :key="key" :newKeyWord="keyWord" :url="url" :columns="columns" :table="table"
                v-on:set-total-records="updateLines">
                <template #header_action_btns>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import moment from 'moment'

export default {
    
    data() {
        return {  
            lines: 0,
            table: 'mouvements',
            defaultUrl: '/api/mouvements?from_period_debut='+moment().subtract(1, 'days').format('YYYY-MM-DD')+'&from_period_fin='+moment().add(1, 'days').format('YYYY-MM-DD'),
            url: '/api/mouvements?from_period_debut='+moment().subtract(1, 'days').format('YYYY-MM-DD')+'&from_period_fin='+moment().add(1, 'days').format('YYYY-MM-DD'),
            columns: [
                {
                    key: 'produit_libelle',
                    label: 'PRODUIT',
                    exportable: true
                },
                {
                    key: 'type',
                    label: 'CATEGORIE',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QUANTITE',
                    exportable: true
                },
                {
                    key: 'produit_prix_achat',
                    label: 'PRIX ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit_prix_de_vente',
                    label: 'PRIX VENTE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'Date',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'motif',
                    label: 'MOTIF',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'UTILISATEUR',
                    exportable: true
                },

            ],
            key: 1,
            keyWord: '',
            keyCounter: 1,
            filterForm: {
                debut: moment().startOf('month').format('YYYY-MM-DD'),
                fin: moment().endOf('month').format('YYYY-MM-DD')
            },
            motifs: [],
        }
    },
    created() {
        this.getMotif();
    },
    mounted() {
        this.mouvementFilter()
    },
    methods: {
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        mouvementFilter() {
            let newUrl = this.defaultUrl

            if (this.filterForm.motif) {
                newUrl = this.checkUrlFormat(newUrl) + 'motif=' + this.filterForm.motif
            }

            if (this.filterForm.type) {
                newUrl = this.checkUrlFormat(newUrl) + 'type=' + this.filterForm.type
            }

            if (this.filterForm.debut) {
                newUrl = this.checkUrlFormat(newUrl) + 'period_from=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = this.checkUrlFormat(newUrl) + 'period_to=' + this.filterForm.fin
            }

            this.url = newUrl
            this.key++
        },
        removeFilter() {
            this.filterForm = {
                debut: moment().startOf('month').format('YYYY-MM-DD'),
                fin: moment().endOf('month').format('YYYY-MM-DD')
            }
            this.url = this.defaultUrl
            this.key++
        },
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        getMotif() {
            this.isLoading = true
            this.axios.get('/api/mouv_motifs').then(response => {
                this.motifs = response.data.data
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

        
    }

}
</script>