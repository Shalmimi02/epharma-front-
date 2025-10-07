<template>
    <SectionVisibility libelleSection="les produits selectionnés" :isOpen="true">
        <template #section_content>
            <AsdecodeTable v-if="localReservation !== null" :key="key" noExport
                :url="baseUrl + '/api/reservation_produits?reservation_id=' + localReservation.id" :columns="columns"
                table="reservation_produits" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                    <button type="button" class="btn btn-light mr-2" @click="transformToInvoice"
                        v-if="(isTreatable() == true) && (lines > 0)">
                        <i class="fa-solid fa-file-pdf"></i> Transformer en devis
                        <span v-if="devisIsLoading" class="spinner-border spinner-border-sm"
                        role="status" aria-hidden="true"></span>
                    </button>
                </template>
                <template #action_btns=slotProps v-if="isTreatable() == true">
                    <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm"
                        role="status" aria-hidden="true"></span>
                    <button v-else type="button" class="btn btn-sm text-danger" @click="deleteLine(slotProps.data.id)">
                        <i class="fa-solid fa-trash-alt"></i>
                    </button>
                </template>
                <template #qte=slotProps>
                    <input type="number" style="width: 90px;" class="form-control border border-dark px-[4rem]"
                        name="qte" :value="slotProps.data.qte" :max="parseInt(slotProps.data.produit.qte)" min="1"
                        @change="updateReservationProduit(slotProps.data, $event)"
                        :disabled="isLoadingInput[slotProps.data.id] == true || localReservation.status == 'Annule' || localReservation.status == 'Termine' || localReservation.status == 'Devis'">
                </template>
                <template #prise_en_charge=slotProps>
                    <input type="number" style="width: 90px;" class="form-control border border-dark px-[4rem]"
                        name="prise_en_charge" :value="parseFloat(slotProps.data.prise_en_charge)" min="0" max="100"
                        step="any" @change="updateReservationProduit(slotProps.data, $event)"
                        :disabled="isLoadingInput[slotProps.data.id] == true || localReservation.status == 'Annule' || localReservation.status == 'Termine' || localReservation.status == 'Devis' || localReservation.client == 'COMPTANT'">
                </template>
            </AsdecodeTable>
        </template>
    </SectionVisibility>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue'
import { calculerProduit } from '@/views/calculs/add-produits-reservation';

export default defineComponent({
    props: ['reservation', 'garde', 'remise_percent'],
    data() {
        return {
            lines: 0,
            isLoading: false,
            devisIsLoading: false,
            isLoadingInput: [],
            localReservation: this.reservation,
            baseUrl: this.$store.state.api_epharma_ventes,
            columns: [
                {
                    key: 'libelle',
                    label: 'PRODUIT',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QUANTITE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'COÛT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'prise_en_charge',
                    label: '% TAUX',
                    format: 'slot',
                    exportable: true
                },
            ]
        }
    },
    methods: {
        createFacture() {
            this.devisIsLoading = true
            let FactureForm = {
                client: this.localReservation.client,
                reservation_id: this.localReservation.id,
                net_a_payer: this.localReservation.montant,
                type: 'Devis',
                created_by: this.$store.getters.user.fullname
            }
            this.axios.post(this.baseUrl + '/api/factures', FactureForm).then((response) => {
                if (response.data.success == true) {
                    this.updateReservation()
                    this.devisIsLoading = false
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
                    this.devisIsLoading = false
                }
            })
        },
        updateReservationProduit(line, event) {
            this.isLoadingInput[line.id] = true;
            let form = {}
            

            if (event.target.name == 'qte') {
                const result = calculerProduit(line.produit, event.target.value, this.garde, this.remise_percent);
                this.$emit('refreshReservation');
              
                // console.log('calcul result',result)
                form = {
                    'produit_qte': line.produit.qte,
                    'qte': event.target.value,
                    'prise_en_charge': this.remise_percent,
                    'total_tva': result.totalTVA,
                    'total_css': result.totalCSS,
                    'total_ht': result.totalHorsTaxe,
                    'total_garde': result.totalGarde,
                    'total_prise_en_charge':  result.totalPriseEnCharge,
                    'cout_total': result.totalClient,
                    'cout_total_reel': result.total,
                }
            }
            else if (event.target.name == 'prise_en_charge') {
                const result2 = calculerProduit(line.produit, line.qte, this.garde, event.target.value);
                // console.log('calcul result',result2)
                form = {
                    'produit_qte': line.produit.qte,
                    'qte': line.qte,
                    'prise_en_charge': event.target.value,
                    'total_tva': result2.totalTVA,
                    'total_css': result2.totalCSS,
                    'total_ht': result2.totalHorsTaxe,
                    'total_garde': result2.totalGarde,
                    'total_prise_en_charge':  result2.totalPriseEnCharge,
                    'cout_total': result2.totalClient,
                    'cout_total_reel': result2.total,
                }
            }

            this.axios.post(`${this.baseUrl}/api/reservation_produits/${line.id}/update`, form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refreshreservationmontant').click()
                    $('#refreshreservation_produits').click()
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
        transformToInvoice() {
            this.localReservation.status = 'Devis'
            this.localReservation.switch_devis_at = new Date().toLocaleString('fr-FR')
            this.createFacture()
        },
        deleteLine(id) {
            this.isLoadingInput[id] = true;
            this.axios.post(this.baseUrl + '/api/reservation_produits/' + id + '/destroy').then((response) => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.$emit('refreshReservation')
                    $('#refreshreservation_produits').click()
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
                            life: 20000
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
        updateLines(lines) {
            this.lines = lines
            this.$emit('nb_products', lines)
        },
        updateReservation() {
            this.devisIsLoading = true
            this.axios.post(`${this.baseUrl}/api/reservations/${this.reservation.id}/update`, this.localReservation).then(response => {
                this.devisIsLoading = false
                if (response.data.success === true) {
                    
                    this.$emit('switch-to-devis')
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
            }).catch(() => {
                this.devisIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        isTreatable() {
            if (this.localReservation.status != 'Termine' && this.localReservation.status != 'Annule' && this.localReservation.status != 'Devis') {
                return true
            } else return false
        }
    },
})
</script>