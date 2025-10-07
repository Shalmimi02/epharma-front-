<template>
    <EpharmaTemplate>
        <template #page_title> FIN DE JOURNÉE </template>
        <template #content>
            <form @submit.prevent="periodFilter" class="row border bg-white rounded p-3 mx-auto mb-2"
                style="opacity: 0.7;">
                <div class="form-group col-sm">
                    <div>
                        <small class="font-weight-bold pl-3">Rechercher par date</small>
                        <div>
                            <label></label>
                            <input class="form-control form-control-sm" type="date" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;" v-model="filterForm.debut">
                        </div>
                    </div>
                </div>
                <div class="form-group col-sm">
                    <div>
                        <small class="font-weight-bold pl-3"></small>
                        <div>
                            <label></label>
                            <input class="form-control form-control-sm" type="date" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;" v-model="filterForm.fin">
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
            </form>

            <p class="h5 my-3">Billetage</p>
            <AsdecodeTable :key="key"
                :url="'/api/billetages?from_period_debut=' + this.filterForm.debut + '&from_period_fin=' + this.filterForm.fin"
                :columns="columns">
            </AsdecodeTable><br><br>

            <p class="h5 my-3">Chiffre d'affaire</p>
            <button hidden id="refreshcounter" type="button" @click="refreshCounters">Raffraichir le compteur</button>
            <MoneyCounter  :key="keyCounter" :compteurs="compteurs" /><br>
            <p class="h5 my-3">Ventes</p>
            <AsdecodeTable :key="keyVente"
                :url="venteURL"
                :columns="columns1" @get-table-url="refreshCounters">
                <template #header_action_btns>
                    <!-- <button style="border:none">
                        Recapitulatif CNAMGS
                    </button> -->
                </template>
            </AsdecodeTable>

            <p class="h5 my-3">Produits vendus dans la période</p>
            <AsdecodeTable :key="key"
                :url="'/api/reservation_produits/vendus?from_period_debut=' + this.filterForm.debut + '&from_period_fin=' + this.filterForm.fin"
                :columns="columns2" >
                <template #id="slotProps">
                    <button class="btn  btn-primary" @click="filterByProduct(slotProps.data.produit_id)">
                        <i class="fa-solid fa-magnifying-glass mr-1"></i> Trouver les ventes
                    </button>
                </template>
            </AsdecodeTable>

            <p class="h5 my-3">Mouvements de la periode</p>
            <!-- <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" /><br> -->
            <form @submit.prevent="mouvementFilter" class="border bg-white rounded p-3 mx-auto" style="opacity: 0.7;">
                <div class="form-row">
                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold">Rechercher par motif</small>
                            <div>
                                <label></label>
                                <select class="form-control form-control-sm" style="
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;" v-model="filterForm.motif">
                                    <option v-for="motif in motifs" :key="motif" :value="motif.libelle">{{ motif.libelle }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-group col-lg">
                        <div>
                            <small class="font-weight-bold">Rechercher par type</small>
                            <div>
                                <label></label>
                                <select class="form-control form-control-sm" style="
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
            <AsdecodeTable :key="key" :newKeyWord="keyWord" :url="url" :columns="columns3"
                :v-on:set-total-records="updateLines">
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>

</template>

<script>

import { defineComponent } from 'vue';
import moment from 'moment';
import MoneyCounter from '@/components/MoneyCounter.vue';
    
export default defineComponent({
    components: { MoneyCounter },
    data() {
        return {
            lines: 0,
            table: 'billetages',
            table1: 'ventes',
            table3: 'reservation_produits',
            table2: 'mouvements',
            defaultUrl: '/api/mouvements?from_period_debut=' + moment().format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
            url: '/api/mouvements?from_period_debut=' + moment().format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
            venteURL: '/api/ventes?from_period_debut=' + moment().format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
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
                    key: 'created_at',
                    label: 'PÉRIODE',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    exportable: true
                },


            ],
            columns1: [
                {
                    key: 'caisse',
                    label: 'CAISSE',
                    exportable: true
                },
                {
                    key: 'user',
                    label: 'VENDEUSE',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUS',
                    exportable: true
                },
                {
                    key: 'client',
                    label: 'CLIENT',
                    exportable: true
                },
                {
                    key: 'reservation_id',
                    label: 'RESERVATION',
                    exportable: true
                },
                {
                    key: 'total',
                    label: 'TTC',
                    exportable: true
                },
                {
                    key: 'ht',
                    label: 'HT',
                    exportable: true
                },
                {
                    key: 'tva',
                    label: 'TVA',
                    exportable: true
                },
                {
                    key: 'css',
                    label: 'CSS',
                    exportable: true
                },
                {
                    key: 'total',
                    label: 'TOTAL CLIENT FCFA',
                    exportable: true
                },
                {
                    key: 'total_prise_en_charge',
                    label: 'TOTAL PRIS EN CHARGE FCFA',
                    exportable: true
                }

            ],
            columns2: [
                {
                    key: 'cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'qte_vendus',
                    label: 'QTE VENDUS',
                    exportable: true
                },
                {
                    key: 'qte_actu',
                    label: 'QTE ACTU',
                    exportable: true
                },
                {
                    key: 'prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'money',
                    exportable: true
                },  
                {
                    key: 'coef',
                    label: 'COEF',
                    exportable: true
                },
                {
                    key: 'id',
                    label: 'VENTE',
                    format: 'slot',
                },
            ],
            columns3: [
                {
                    key: 'produit.libelle',
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
                    key: 'produit.prix_achat',
                    label: 'PRIX ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit.prix_de_vente',
                    label: 'PRIX VENTE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'DATE',
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
                }
            ],
            key: 1,
            keyVente:1,
            keyWord: '',
            keyCounter: 1,
            filterForm: {
                debut: moment().format('YYYY-MM-DD'),
                fin: moment().add(1, 'days').format('YYYY-MM-DD')
            },
            isLoading: false,
            compteurs: [],
            motifs: []
        }
    },
    created() {
        this.getMotif()
    },
    mounted (){
        this.calculerCoutTotal()
    },
    methods: {
        filterByProduct(id){
            this.venteURL = this.checkUrlFormat(this.venteURL)+ 'contain_product='+id
            this.keyVente++
        },
        //fonction pour empecher les erreurs lors du filtre
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        dateFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY HH:mm:ss')
            }
        },
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        periodFilter() {
            let dateDebut = new Date(this.filterForm.debut);
            let dateFin = new Date(this.filterForm.fin);

            if (dateFin < dateDebut) {
                // La date de debut est supérieure à la date de fin
                this.filterForm.debut = null
                this.filterForm.fin = null

                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La date de fin ne peut etre supérieure à la date de début',
                    life: 7000
                });
                return
            }

            let newUrl = this.defaultUrl
            let newUrlVente = this.venteURL

            if (this.filterForm.debut) {

                newUrl = this.checkUrlFormat(newUrl) + 'from_period_debut=' + this.filterForm.debut
                newUrlVente = this.checkUrlFormat(newUrlVente) + 'from_period_debut=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_fin=' + this.filterForm.fin
                newUrlVente = this.checkUrlFormat(newUrlVente) + 'from_period_fin=' + this.filterForm.fin
            }
            this.url = newUrl
            this.venteURL = newUrlVente
            this.key++
            this.keyVente++
            this.calculerCoutTotal()
        },
        mouvementFilter() {
            let newUrl = this.defaultUrl

            if (this.filterForm.motif) {
                newUrl = this.checkUrlFormat(newUrl) + 'motif=' + this.filterForm.motif
            }

            if (this.filterForm.type) {
                newUrl = this.checkUrlFormat(newUrl) + 'type=' + this.filterForm.type
            }

            this.url = newUrl
            this.key++
        },
        removeFilter() {
            this.filterForm = {
                debut: moment().format('YYYY-MM-DD'),
                fin: moment().add(1, 'days').format('YYYY-MM-DD')
            }
            this.url = this.defaultUrl
            this.key++
        },
        async updateLines(nb_lines) {
            await this.calculerCoutTotal()
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        // fonctions pour calculer les totaux dans le compteur
        calculerCoutTotal() {
            this.isLoading = true
            let newUrl = '/api/ventes-calc-compteur'

            if (this.filterForm.debut) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_debut=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_fin=' + this.filterForm.fin
            }
            this.axios.get(newUrl).then(response => {
                this.isLoading = false
                this.compteurs= []
                this.compteurs.push(
                    {
                        value: response.data.total_client,
                        label: 'CLIENT'
                    },
                    {
                        value:  response.data.total_pc,
                        label: 'ASSURANCE'
                    },
                    {
                        value: response.data.total_ca,
                        label: 'CHIFFRE D\'AFFAIRE'
                    },
                    {
                        value: response.data.total_ht,
                        label: 'HT'
                    },
                    {
                        value: response.data.total_tva,
                        label: 'TVA'
                    },
                    {
                        value: response.data.total_css,
                        label: 'CSS'
                    },
                    {
                        value: response.data.marge,
                        label: 'MARGE'
                    },
                    {
                        value: response.data.panier_moyen,
                        label: 'PANIER MOYEN'
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

})
</script>