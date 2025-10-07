<template>
    <div class="container mb-3">
        <div class="card mb-3">
            <div class="card-body row #shadow p-2">
                <form @submit.prevent="filterByInterval" class="col-md-6">
                    <small class="font-weight-bold">Intervalle de quantité</small>
                    <div class="container row">
                        <div class="col-md-10 form-row">
                            <div class="form-group col-md">
                                <label>Min</label>
                                <input class="form-control form-control-sm" placeholder="Quantité minimale restante"
                                    min="0" type="number" v-model="filterForm.qte_min" required>
                            </div>
                            <div class="form-group col-md">
                                <label>Max</label>
                                <input class="form-control form-control-sm" placeholder="Quantité maximale restante"
                                    min="0" type="number" v-model="filterForm.qte_max">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <label> </label>
                            <button type="submit" class="btn m-auto">
                                <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"></i>
                            </button>
                        </div>
                    </div>
                </form>

                <form @submit.prevent="periodFilter" class="col-md-6">
                    <small class="font-weight-bold">Vendu sur un intervalle de date</small>
                    <div class="container row">
                        <div class="col-md-10 form-row">
                            <div class="form-group col-md">
                                <label>Debut</label>
                                <input class="form-control form-control-sm" type="date" v-model="filterForm.debut">
                            </div>
                            <div class="form-group col-md">
                                <label>Fin</label>
                                <input class="form-control form-control-sm" type="date" v-model="filterForm.fin">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <label> </label>
                            <button type="submit" class="btn m-auto">
                                <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <!-- <searchByKeyword v-on:set-keyword-filter="searchLines" /> -->
    </div>


    <AsdecodeTable noExport :key="key" useSearch :url="url" :columns="columns" :table="table2"
        v-on:set-total-records="updateLines">
        <template #header_action_btns>
            <button type="button" class="btn btn-light text-secondary mr-2" @click="removeFilter()">
                <i class="fa-solid fa-scissors mr-1"></i> Vider le filtre
            </button>
            <button type="button" class="btn btn-light text-secondary mr-2" @click="this.dialogRef.close()">
                <i class="fa-solid fa-stop mr-1"></i> Terminer la sélection
            </button>
            <button v-if="produits_selected.length > 0" class="btn btn-light text-secondary mr-2" disabled>
                {{ produits_selected.length }} produits sélectionnés
            </button>
        </template>
        <template #action_btns=slotProps>
            <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            <div v-else>
                <button v-if="produits_selected.includes(slotProps.data.id)" class="btn btn-danger"
                    @click="removeProduit(slotProps.data)">
                    <i class="fa-solid fa-trash-alt"></i> Retirer
                </button>
                <button v-else type="button" class="btn btn-success" @click="addProduit(slotProps.data)">
                    <i class="fa-solid fa-plus"></i> Ajouter
                </button>
            </div>
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
    </AsdecodeTable>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue';
import { calculerProduit } from '@/views/calculs/add-produits-commande.ts';

export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            isLoadingInput: [],
            table: 'commande_produit',
            table2: 'produits',
            defaultUrl: '/api/produits',
            url: '/api/produits',
            isLoadingInput: [],
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
                    key: 'qte',
                    label: 'QUANTITE',
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
            ],
            produits_selected: [],
            form: {},
            key: 1,
            keyword: '',
            filterForm: {
                qte_min: 0
            },
        }
    },
    mounted() {
        this.initSelection()
    },
    methods: {
        periodFilter() {
            // Commencer l'URL avec le paramètre vendu=1
            let newUrl = this.defaultUrl + '?vendu=1'

            // Ajouter les paramètres de période en utilisant & au lieu de ? puisqu'on a déjà commencé l'URL avec un paramètre
            if (this.filterForm.debut && this.filterForm.fin) {
                newUrl = newUrl + '&from_period_debut=' + this.filterForm.debut + '&from_period_fin=' + this.filterForm.fin
            }
            else if (this.filterForm.debut) {
                newUrl = newUrl + '&from_period_debut=' + this.filterForm.debut
            }
            else if (this.filterForm.fin) {
                newUrl = newUrl + '&from_period_fin=' + this.filterForm.fin
            }

            this.url = newUrl
            this.key++
        },
        filterByInterval() {
            let newUrl = this.defaultUrl

            if (this.filterForm.qte_min || this.filterForm.qte_max) {
                newUrl = newUrl + '?req_qte_min=' + this.filterForm.qte_min + '&req_qte_max=' + this.filterForm.qte_max
            }
            else if (this.filterForm.qte_min) {
                newUrl = newUrl + '?req_qte_min=' + this.filterForm.qte_min
            }
            else if (this.filterForm.qte_max) {
                newUrl = newUrl + '?req_qte_max=' + this.filterForm.qte_max
            }

            this.url = newUrl
            this.key++
        },
        removeFilter() {
            this.filterForm = {}
            this.url = this.defaultUrl
            this.key++
        },
        initSelection() {
            this.isLoading = true
            this.axios.get('/api/' + this.table + '?commande_id=' + this.dialogRef.data.id).then(response => {
                response.data.data.forEach(element => {
                    this.produits_selected.push(element.produit_id)
                });
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
        addProduit(line) {
            this.produits_selected.push(line.id)
            this.updateCommandeProduit(line)
        },
        removeProduit(line) {
            this.produits_selected = this.produits_selected.filter(item => item != line.id)
            this.removeCommandeProduit(line.id)
        },
        async updateCommandeProduit(line) {
            this.isLoadingInput[line.id] = true;
            let result = calculerProduit(line, 1);

            let form = {
                'commande_id': this.dialogRef.data.id,
                'produit_id': line.id,
                'prix_achat': line.prix_achat,
                'total_achat': result.total,
                'qte': 1,
                'qte_initiale': line.qte,
                'qte_finale': parseInt(line.qte) + 1,
                'produit_libelle': line.libelle,
                'produit_cip': line.cip,
                'rayonId': line.rayon_id,
                'rayon': line.rayon,
                'prix_de_vente': line.prix_de_vente,
                'total_tva': result.totalTVA,
                'total_css': result.totalCSS,
                'total_ht': result.totalHorsTaxe,
                'total_ttc': result.totalPrixVente,
                'coef_conversion_de_prix_vente_achat': line.coef_conversion_de_prix_vente_achat,
            }
            if (line.rayon && line.rayon.libelle) {
                form['rayon'] = line.rayon.libelle
            }


            await this.axios.post('/api/' + this.table, form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    $('#refreshcommandes').click()
                    $('#refreshcountercommande').click()
                    $('#refreshcountercreatecommande').click()

                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
                this.isLoadingInput[line.id] = false;

            }).catch(() => {
                this.isLoadingInput[line.id] = false;

                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        async removeCommandeProduit(id) {
            this.isLoadingInput[id] = true;
            let form = {
                commande_id: this.dialogRef.data.id,
                produit_id: id
            }
            await this.axios.post('/api/' + this.table + '/destroy', form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    $('#refreshcountercommande').click()
                    $('#refreshcountercreatecommande').click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
                this.isLoadingInput[id] = false;
            }).catch(() => {
                this.isLoadingInput[id] = false;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
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