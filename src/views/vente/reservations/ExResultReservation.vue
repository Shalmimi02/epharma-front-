<template>
    <ProgressBar class="my-1" v-if="refreshIsLoading === true" mode="indeterminate" style="height: 6px"></ProgressBar>
    <div v-if="selectedReservation !== null && refreshIsLoading == false">
        <div class="card card-body p-1 bg-primary text-white mb-2">
            <h4>TTC CLIENT</h4>
            <span v-if="refreshIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            <h3 v-else class="text-nowrap">{{ $moneyFormat(selectedReservation.montant) }}</h3>
        </div>
        <div class="card card-body p-1 bg-info text-white mb-2" v-if="selectedReservation.total_prise_en_charge">
            <span v-if="refreshIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            <div v-else>
                <span class="text-nowrap">% TAUX : {{ $moneyFormat(selectedReservation.total_prise_en_charge) }}</span><br>
                <span class="text-nowrap">TOTAL TTC : {{ $moneyFormat(selectedReservation.total) }}</span><br>
                <span class="text-nowrap">TOTAL HT: {{ $moneyFormat(selectedReservation.total_ht) }}</span><br>
                <span class="text-nowrap">TOTAL TVA: {{ $moneyFormat(selectedReservation.total_tva) }}</span><br>
                <span class="text-nowrap">TOTAL CSS: {{ $moneyFormat(selectedReservation.total_css) }}</span><br>
                <span class="text-nowrap" v-if="parseFloat(selectedReservation.montant_taxe) > 0">Garde: {{
                    $moneyFormat(selectedReservation.total_garde) }}
                </span><br>
            </div>
        </div>
        <div class=" p-1">
            <form @submit.prevent="updateReservation" class="mb-2">
                <div class="form-group">
                    <label>Remise:</label>
                    <input type="number" class="form-control border border-dark mb-3" @input="calculRemise"
                        v-model="formRemise.remise" required :disabled="isTreatable() == false ">
                </div>
                <button type="submit" class="btn btn-info btn-block" v-if="isTreatable() == true && formRemise.remise > 0 && selectedReservation.remise != formRemise.remise">
                    Appliquer
                    <span v-if="remiseIsLoading" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                </button>
            </form>
        </div>
        <div class="mb-2" v-if="selectedReservation.client_id && selectedReservation.switch_caisse_at">
            <p>Réservation envoyé à la caisse {{ selectedReservation.caisse }}</p>
        </div>
        <div v-else-if="(selectedReservation.caisse_id) && isTreatable() == true && this.nbProduits > 0 && selectedReservation.caisse != 'Default'">
            <button type="button" class="btn btn-primary mx-auto mb-1" @click="sendReservation()">
                <i class="fa-solid fa-share mr-1"></i> Passer à la caisse
            </button>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    props: ['reservation', 'nbProduits'],
    data() {
        return {
            isLoading: false,
            remiseIsLoading: false,
            formRemise: {
                remise: 0
            },
            refreshIsLoading: false,
            selectedReservation: this.reservation,
        }
    },
    created(){
        if (this.reservation && this.reservation.remise) {
            this.formRemise.remise = this.reservation.remise
        }
    },
   
    methods: {
        calculRemise() {
            if (this.formRemise.remise > 0 && this.formRemise.remise <= this.selectedReservation.montant_avant_remise) {
                this.selectedReservation.montant = parseFloat(this.selectedReservation.montant_avant_remise) - parseFloat(this.formRemise.remise);
            } else {
                if (this.formRemise.remise != 0) {
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Oups !',
                        detail: 'La remise est incorrecte',
                        life: 7000
                    });
                }
                
                this.selectedReservation.montant = parseFloat(this.selectedReservation.montant_avant_remise)
                this.formRemise.remise = 0
            }
        },
        sendReservation() {
            this.selectedReservation.switch_caisse_at = new Date().toLocaleString('fr-FR')
            this.updateReservation()
        },
        updateReservation() {
            this.remiseIsLoading = true
            let form = this.selectedReservation
            form.remise = this.formRemise.remise

            this.axios.post(`/api/reservations/${this.selectedReservation.id}/update`, form).then(response => {
                this.remiseIsLoading = false
                if (response.data.success === true) {
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
            }).catch(() => {
                this.remiseIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        isTreatable() {
            if (this.selectedReservation.status != 'Termine' && this.selectedReservation.status != 'Annule' && this.selectedReservation.status != 'Devis') {
                return true
            } else return false
        },
    },
    watch: {
        reservation: {
            deep: true,
            handler(newReservation) {
                this.selectedReservation = newReservation;
            }
        }
    },
})
</script>

<style scoped>
.h-fixed {
    height: 70vh;
    overflow-y: auto;
}
</style>