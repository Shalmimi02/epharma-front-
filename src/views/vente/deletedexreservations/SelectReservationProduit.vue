<template>
    <SectionVisibility libelleSection="la selection des produits" :isOpen="true">
        <template #section_content>
            <div v-if="this.reservationId" class="card card-body p-3 mb-3 position-relative">
                <div class="form-group">
                    <input type="search" class="form-control form-control-lg search-form"
                        placeholder="Tapez le mot clé à rechercher" v-model="keyWord" @input="key++">
                </div>
                <AsdecodeTable v-if="keyWord != ''" :key="key" noExport
                    :url="this.$store.state.api_epharma_stock + '/api/produits?is_active=1'" :columns="columns"
                    :newKeyWord="keyWord" table="produits" >
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
                            
                            <button v-else-if="!produits_selected.includes(slotProps.data.id) && slotProps.data.qte > 0 && parseFloat(slotProps.data.prix_de_vente) > 0"
                                type="button" class="btn btn-success btn-sm  m-1" @click="debouncedAddProduit(slotProps.data)"
                                title="Ajouter">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        
                            <button type="button" class="btn btn-secondary btn-sm"
                                @click="debouncedCommandProduit(slotProps.data.id)" title="Commander">
                                <i class="fa-solid fa-cart-arrow-down"></i>
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
import { Produit, calculerProduit } from '@/views/calculs/add-produits-reservation.ts';

export default defineComponent({
    props: ['reservationId', 'garde', 'remise_percent'],
    data() {
        return {
            isLoading: false,
            isLoadingInput: [],
            key: 1,
            keyWord: '',
            table: 'reservation_produits',
            debounceTimer: null, // Timer pour le debounce
            baseUrl: this.$store.state.api_epharma_ventes,
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
                    key: 'rayon',
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
         // Méthode debounce pour commander un produit
         debouncedCommandProduit(id) {
            this.$emit('refreshReservation')
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.commandProduit(id);
            }, 500); // Délai de 500ms
        },
        commandProduit(id) {
            this.isLoadingInput[id] = true;
                    this.axios.post(this.$store.state.api_epharma_stock + '/api/commandes/ajouter-produit/' + id).then(response => {
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
            this.axios.get(this.baseUrl + '/api/' + this.table + '?reservation_id=' + this.reservationId).then(response => {
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
        // Méthode debounce pour ajouter un produit
        debouncedAddProduit(line) {
            this.$emit('refreshReservation')
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.addProduit(line);
            }, 500); // Délai de 500ms
        },
        addProduit(line) {
            console.log('garde',this.garde)
            this.produits_selected.push(line.id)
           
            this.updateReservationProduit(line)
        },
        removeProduit(line) {
            this.produits_selected = this.produits_selected.filter(item => item != line.id)
            this.removeReservationProduit(line.id)
        },
        updateReservationProduit(line) {
            this.isLoadingInput[line.id] = true;
            let result
            if (this.garde) {
                result = calculerProduit(line, 1, this.garde, this.remise_percent);
            } else result = calculerProduit(line, 1, null, this.remise_percent);
            
            // console.log('calcul result',result)

            let form = {
                'reservation_id': this.reservationId,
                'produit': line,
                'produit_qte': line.qte,
                'produit_id': line.id,
                'libelle': line.libelle,
                'prix_de_vente': line.prix_de_vente,
                'prix_achat': line.prix_achat,
                'qte': 1,
                'prise_en_charge': result.priseEnCharge,
                'total_tva': result.totalTVA,
                'total_css': result.totalCSS,
                'total_ht': result.totalHorsTaxe,
                'total_garde': result.totalGarde,
                'total_prise_en_charge':  result.totalPriseEnCharge,
                'cout_total': result.totalClient,
                'cout_total_reel': result.total,
            }

            this.axios.post(this.baseUrl + '/api/' + this.table, form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$emit('refreshReservation')
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
        removeReservationProduit(produitId) {
            this.isLoadingInput[produitId] = true;
            let form = {
                reservation_id: this.reservationId
            }
            this.axios.post(this.baseUrl + '/api/' + this.table + '/' + produitId + '/destroy2', form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$emit('refreshReservation')
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
        }
    },
})
</script>