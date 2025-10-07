<template>
    <SectionVisibility libelleSection="la selection des produits" :isOpen="true">
        <template #section_content>
            <div v-if="this.reservation" class="card card-body p-3 mb-3 position-relative">
                <div class="form-group">
                    <input type="search" class="form-control form-control-lg search-form"
                        placeholder="Tapez le mot clé à rechercher" v-model="keyWord" @input="key++">
                </div>
                <AsdecodeTable v-if="keyWord != ''" :key="key" noExport
                    url="/api/produits" :columns="columns"
                    :newKeyWord="keyWord" table="produits" v-on:set-total-records="updateLines">
                    <template #header_action_btns>
                        <button v-if="produits_selected.length > 0" class="btn btn-light text-secondary mr-2" disabled>
                            {{ produits_selected.length }} produits sélectionnés
                        </button>
                    </template>
                    <template #action_btns=slotProps>
                        <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <div v-else >
                            <button v-if="produits_selected.includes(slotProps.data.id)" class="btn btn-danger btn-sm  m-1"
                                @click="removeProduit(slotProps.data)" title="Retirer">
                                <i class="fa-solid fa-trash-alt"></i>
                            </button>
                            
                            <button v-else-if="!produits_selected.includes(slotProps.data.id) && parseFloat(slotProps.data.prix_de_vente) > 0"
                                type="button" class="btn btn-success btn-sm  m-1" @click="addProduit(slotProps.data)"
                                title="Ajouter">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        
                           
                    </div>
                    </template>
                    <template #libelle=slotProps>
                        {{ slotProps.data.libelle }}
                        <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
                        <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
                    </template>
                </AsdecodeTable>
            </div>
        </template>
    </SectionVisibility>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue';

export default defineComponent({
    props: ['reservation', 'garde'],
    data() {
        return {
            lines: 0,
            isLoading: false,
            isLoadingInput: [],
            key: 1,
            keyWord: '',
            table: 'reservation_produits',
            columns: [
                {
                    key: 'libelle',
                    label: 'NOM',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'P.U.',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QT. ACTU',
                    exportable: true,

                },
                {
                    key: 'rayon.libelle',
                    label: 'RAYON',
                    exportable: 'true'

                }
            ],
            produits_selected: [],
        }
    },
    mounted() {
        this.initSelection()
    },
    methods: {
        commandProduit(id) {
            this.isLoadingInput[id] = true;
                    this.axios.post('/api/commandes/ajouter-produit/' + id).then(response => {
                        if (response.data.success === true) {
                            this.$toast.add({
                                severity: 'success',
                                detail: response.data.message,
                                life: 3000
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
        initSelection() {
            this.isLoading = true
            this.axios.get('/api/' + this.table + '?reservation_id=' + this.reservation.id).then(response => {
                response.data.data.forEach(element => {
                    this.produits_selected.push(element.produit.id)
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
            this.updateReservationProduit(line)
        },
        removeProduit(line) {
            this.produits_selected = this.produits_selected.filter(item => item != line.id)
                    this.removeReservationProduit(line.id)
        },
        async updateReservationProduit(line) {
            this.isLoadingInput[line.id] = true;
            let prix_de_vente = parseFloat(line.prix_de_vente)
            let montant_taxe = 0
            let totalTVA = 0
            let totalCSS = 0
            let totalHT = parseFloat(line.prix_de_vente)
            // let totalGarde = 0

            if (this.reservation != null &&this.reservation.montant_taxe) {
                montant_taxe = parseFloat(this.reservation.montant_taxe)
                prix_de_vente = prix_de_vente + montant_taxe
            }

            if (line.tva == true) {
                totalTVA = (prix_de_vente * this.$store.getters.tva).toFixed(2)
                totalHT = (totalHT - totalTVA).toFixed(2)
            }

            if (line.css == true) {
                totalCSS = (prix_de_vente * this.$store.getters.css).toFixed(2)
                totalHT = (totalHT - totalCSS).toFixed(2)
            }

            let form = {
                'produit_qte': line.qte,
                'reservation_id': this.reservation.id,
                'produit': line,
                'produit_id': line.id,
                'prix_de_vente': prix_de_vente,
                'prix_achat': line.prix_achat,
                'cout_total': prix_de_vente,
                'cout_total_reel': prix_de_vente,
                'qte': 1,
                'libelle': line.libelle,
                'total_tva': totalTVA,
                'total_css': totalCSS,
                'total_ht': totalHT,
                'total_garde': montant_taxe,
            }

            await this.axios.post('/api/' + this.table +'/facture', form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    $('#refreshreservationmontant').click()
                    this.$emit('set-products', this.produits_selected.length)
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    this.produits_selected = this.produits_selected.filter(item => item != line.id)
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
        async removeReservationProduit(produitId) {
            this.isLoadingInput[produitId] = true;
            let form = {
                reservation_id: this.reservation.id
            }
            await this.axios.post('/api/' + this.table + '/' + produitId + '/destroy2', form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    $('#refreshreservationmontant').click()
                    this.$emit('set-products')
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
                this.isLoadingInput[produitId] = false;
            }).catch(() => {
                this.isLoadingInput[produitId] = false;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        updateLines(lines) {
            this.lines = lines
        }
    },
})
</script>