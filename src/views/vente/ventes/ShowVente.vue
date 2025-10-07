<template>
    <div class="d-flex justify-content-center text-center border bottom">
        <div class="mb-1">
            <h6 class="font-weight-light">Client</h6>
            <p class="text-primary font-weight-bold">{{ this.dialogRef.data.client }}</p>
        </div>
        <div class="mb-1 mx-md-5">
            <h6 class="font-weight-light">Reservation</h6>
            <span class="font-weight-bold">N°{{ this.dialogRef.data.reservation_id }}</span><br>
            <span class="text-primary">{{ this.dialogRef.data.user }}</span>
        </div>
        <div class="mb-1">
            <h6 class="font-weight-light">Caisse</h6>
            <span class="font-weight-bold">{{ this.dialogRef.data.caisse }}</span><br>
            <span class="text-primary">{{ this.dialogRef.data.user }}</span>
        </div>
    </div>
    <div class="my-3 text-center w-100 bg-danger text-white" v-if="this.dialogRef.data.statut == 'Annulé'">
        Cette vente a été annulé.
    </div>
    <div class="my-3" v-else>
        <button type="button" class="btn btn-sm bg-OrangeVente text-white px-5" @click="cancelVente()">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i> Annuler la vente
            <span v-if="cancelIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
        </button>
    </div>
    <div class="mb-3">
        <div class="d-flex justify-content-between p-2 border-dark border-top border-bottom">
            <span class="font-weight-bold">TTC</span>
            <span>{{ moneyFormat(this.dialogRef.data.total_client) }}</span>
        </div>
        <div class="d-flex justify-content-between p-2 border-dark border-bottom">
            <span class="font-weight-bold">Montant reçu</span>
            <span>{{ moneyFormat(this.dialogRef.data.montant_recu) }}</span>
        </div>
        <div class="d-flex justify-content-between p-2 border-dark border-bottom">
            <span class="font-weight-bold">Difference</span>
            <span>{{ moneyFormat(parseFloat(this.dialogRef.data.montant_recu) - parseFloat(this.dialogRef.data.total_client))
                }}</span>
        </div>
    </div>
    <div>
        <table class="table table-bordered">
            <thead class="">
                <tr>
                    <th></th>
                    <th scope="col">PRODUIT</th>
                    <th scope="col">QTE</th>
                    <th scope="col">P.U.</th>
                    <th scope="col">COÛT</th>
                    <th scope="col">% TAUX</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in reservation_produits" :key="index">
                     <button  class="btn btn-danger btn-sm  m-1"
                         @click="deleteProduit(item.produit_id)" title="Retirer">
                        <i class="fa-solid fa-trash-alt"></i>
                     </button>
                    <td>{{ item.libelle }}</td>
                    <td>{{ item.qte }}</td>
                    <td>{{ moneyFormat(item.prix_de_vente) }}</td>
                    <td>{{ moneyFormat(item.cout_total) }}</td>
                    <td>{{ item.prise_en_charge }}</td>
                </tr>
            </tbody>
        </table>
    </div>



</template>

<script>
import { defineComponent } from 'vue';
import $ from 'jquery'

export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            key: 0,
            table: 'ventes',
            cancelIsLoading: false,
            reservation_produits: [],
        }
    },
    mounted() {
        this.getProduits()
    },
    methods: {
        moneyFormat(varMoney) {
            if (varMoney) {
                // Arrondir d'abord la valeur à l'entier le plus proche
                const roundedValue = Math.round(varMoney);
                // Formater sans décimales
                return new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(roundedValue) + ' FCFA';
            }
            return '0 FCFA';
        },
        getProduits() {
            this.isLoading = true
            this.axios.get( '/api/reservation_produits?reservation_id=' + this.dialogRef.data.reservation_id).then((response) => {
                this.reservation_produits = response.data.data
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

        deleteProduit(reservationProduitId) {

            this.$confirm.require({
                    group: 'headless',
                    header: 'Etes-vous sûr?',
                    message: 'Cette action est irréversible!',
                    accept: () => { 
            this.cancelIsLoading = true;
        
            this.axios.post('/api/reservation_produits/' + reservationProduitId + '/destroy2', {
                reservation_id: this.dialogRef.data.reservation_id }).then(response => {
                this.cancelIsLoading = false
                if (response.data.success === true) {
                    this.getProduits(); // Rafraîchir la liste après suppression
                    this.$emit('refreshventes')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                } else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
            this.cancelIsLoading= false;
            }).catch(() => {
                this.cancelIsLoading = false;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
                    }
                })
        },
        cancelVente() {
             this.$confirm.require({
                 group: 'headless',
                 header: 'Etes-vous sûr?',
                 message: 'Cette action est irréversible!',
                    accept: () => {
            this.cancelIsLoading = true
            this.axios.post( '/api/' + this.table + '/' + this.dialogRef.data.id + '/cancel').then(response => {
                this.cancelIsLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    this.dialogRef.close()
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
                this.cancelIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
         }
        })

        }
    }
})

</script>
