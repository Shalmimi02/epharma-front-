<!-- <template> -->

<template #content>
    <div class="container pt-3">
        <ProgressBar class="my-1" v-if="isLoading === true" mode="indeterminate" style="height: 6px">
        </ProgressBar>
        <div class="d-flex mx-auto align-items-center mb-3">
            <div class="h2 btn btn-lg bg-dark text-white mr-2">
                N° <span v-if="selectedReservation != null">{{ selectedReservation.position
                    }}</span>
            </div>
            <div class="d-flex " style="max-width: 100vh; overflow-x: auto;">
                <button type="button" class="btn rounded-circle mx-1 mb-2" v-for="(reservation, index) in reservations"
                    :key="index" :id="'reserv' + reservation.id"
                    :class="[selectedReservation != null && selectedReservation.id == reservation.id ? 'bg-white border-primary' : 'bg-white border-light']"
                    @click="select_reservation(reservation)">
                    {{ reservation.position }}
                </button>
            </div>
            <div class="d-flex ml-auto">

                <div class="mx-2 text-primary" style="cursor: pointer;" @click="getReservations" title="Rafraichir">
                    <i class="fa-solid fa-rotate bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                </div>
                <div class="mx-2 text-danger" style="cursor: pointer;" @click="logout()" title="Se déconnecter">
                    <i class="fas fa-minus-circle bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="row d-flex justify-content-center">
        <div class="col-md-8 h-fixed ">
            <div class="position-relative">
                <!-- <div id="overlay" class="overlay" v-if="selectedReservation.status == 'Termine'"></div>
                            <div class="watermark border-danger px-5" v-if="selectedReservation.status == 'Termine'">
                                Payé Livré
                            </div> -->
                {{ this.dialogRef.data }}
                <div class="card bg-white mb-3 pb-3 shadow ">

                    <div class="card body-bg-white shadow">
                        <table class="table table-striped" :key="key">
                            <thead class="bg-primary text-light">
                                <tr>
                                    <th scope="col">PRODUIT</th>
                                    <th scope="col">QUANTITE</th>
                                    <th scope="col">COÛT</th>
                                    <th scope="col">% TAUX</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in reservation_produits" :key="index">
                                    <td>{{ item.libelle }}</td>
                                    <td>{{ item.qte }}</td>
                                    <td>{{ moneyFormat(item.cout_total) }}</td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            <form class="col-md-4" @submit.prevent="updateReservation">

                <div class="d-flex justify-content-between">
                    <button type="submit" class="btn btn-black">
                        Payer
                    </button>


                    <button type="button" class="btn btn-black" @click="this.printReceipt()">
                        Imprimer
                    </button>

                    <button type="button" class="btn btn-black" @click="openBilletage()">
                        Billetage
                    </button>
                </div>
                <div class="bg-black rounded-sm mt-3 p-2  ">
                    <label class="text-white "> TTC</label>
                    <h5 class="text-white">100</h5>
                </div>
                <div class="bg-black mt-3 rounded-sm p-3">
                    <div class="form-group">
                        <label class="text-gri3">Montant reçu</label>
                        <input type="number" v-model="form.amount_gived"
                            class="form-control border border-dark px-[4rem]" required>
                    </div>
                    <div class="form-group">
                        <label class="text-gri3">Difference</label>
                        <!-- <input type="number"
                                   :value="(parseFloat(form.amount_gived) - parseFloat(selectedReservation.montant)).toFixed(2)"
                                    class="form-control border border-dark px-[4rem]" step="0.00" disabled> --> -->
                    </div>
                </div>
            </form>
        </div>

        <!-- <div  class="my-5 col-md-4" v-if="selectedReservation && caisse"> -->


            <section ref="" v-show="false">
            <div class="invoice-box" id="ticket de caisse">
                <!-- Première section : Logo et Informations de la Pharmacie -->
                <div class="section center">
                    <img v-if="this.$store.getters.pharmacie.logo" :src="this.$store.getters.pharmacie.logo"
                        alt="logo_pharmacie" id="logo_pharmacie" class="rounded mb-3" style="width: 100px">
                    <p class="center" style="padding: 20px;">
                        {{ getInfoPharmacie }}
                    </p>
                </div>

                <!-- Quatrième section : Liste des Médicaments -->
                <div class="section">
                    <h4>Liste des Médicaments</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Qté</th>
                                <th>Coût</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in reservation_produits" :key="index">
                                <td>{{ item.libelle }}</td>
                                <td>{{ item.qte }}</td>
                                <td>{{ item.prix_de_vente }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Permet de mettre le filigrane au dessus du texte -->
                    
                   
                         
                  
                    <!-- Total Section -->
                    <div class="total-section">
                        <table>
                            <thead>

                                <tr>
                                    <th colspan="6">Total TTC</th>
                                    <td v-if="selectedReservation.montant">{{ (parseFloat(selectedReservation.montant) +
                                        parseFloat(selectedReservation.total_prise_en_charge)).toFixed(2) }}</td>
                                    <td v-else>{{ selectedReservation.total_prise_en_charge }}</td>
                                </tr>

                                <tr v-if="selectedReservation.client != 'COMPTANT'">
                                    <th colspan="6">Pris en Charge</th>
                                    <td>{{ selectedReservation.total_prise_en_charge }}</td>
                                </tr>

                                <tr v-if="selectedReservation.client != 'COMPTANT'">
                                    <th colspan="6">Ticket Modérateur</th>
                                    <td>{{ (parseFloat(selectedReservation.montant)).toFixed(2) }}</td>
                                </tr>

                                <tr v-if="form.amount_gived">
                                    <th colspan="6">Montant Reçu</th>
                                    <td>{{ form.amount_gived }}</td>
                                </tr>
                                <tr v-if="form.amount_gived">
                                    <th colspan="6">Difference</th>
                                    <td>{{ (parseFloat(form.amount_gived) -
                                        parseFloat(selectedReservation.montant)).toFixed(2) }}</td>

                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

                <!-- Cinquième section : Slogan de la Pharmacie -->
                <p class="section center slogan" v-if="this.$store.getters.pharmacie.slogan"
                    style="margin-bottom: 20px;">
                    "{{ this.$store.getters.pharmacie.slogan }}"
                </p>
            </div>
           
       

            
                </section>
            <!-- </div> -->
    </div>
</template>

<!-- </template> -->

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const CreateBilletage = defineAsyncComponent(() => import('../../gestion/billetages/CreateBilletage.vue'));

export default defineComponent({
    inject: ['dialogRef'],
    // props: ['datas'],
    data() {
        return {
            key: 1,
            table: 'reservation_produit',
            isLoading: false,
            selectedReservation: null,
            form: {},
            caisse: null,
            reservation_produits: []
        }

    },
    beforeCreate() {
        if (this.$store.getters.caisseConnected != this.$route.params.id || !this.$store.getters.caisseAuthenticated) {
            this.$router.push({ name: 'caisse' })
        }
    },
    computed: {
        getInfoPharmacie() {
            let infos = 'Pharmacie '
            if (this.$store.getters.pharmacie) {
                if (this.$store.getters.pharmacie.nom_pharmacie) {
                    infos = this.$store.getters.pharmacie.nom_pharmacie + ' | '
                }
                if (this.$store.getters.pharmacie.statut_juridique) {
                    infos = infos + this.$store.getters.pharmacie.statut_juridique + ' | '
                }
                if (this.$store.getters.pharmacie.capital) {
                    infos = infos + ' au capital de ' + this.$store.getters.pharmacie.capital + ' FCFA | '
                }
                if (this.$store.getters.pharmacie.adresse) {
                    infos = infos + this.$store.getters.pharmacie.adresse + ' | '
                }
                if (this.$store.getters.pharmacie.bp) {
                    infos = infos + ' BP: ' + this.$store.getters.pharmacie.bp + ' | '
                }
                if (this.$store.getters.pharmacie.telephone1) {
                    infos = infos + ' Tel: ' + this.$store.getters.pharmacie.telephone1 + ' | '
                }
                if (this.$store.getters.pharmacie.rccm) {
                    infos = infos + ' Rccm: ' + this.$store.getters.pharmacie.rccm + ' | '
                }
                if (this.$store.getters.pharmacie.nif) {
                    infos = infos + ' Nif: ' + this.$store.getters.pharmacie.nif + ' | '
                }
                if (this.$store.getters.pharmacie.email) {
                    infos = infos + ' Email: ' + this.$store.getters.pharmacie.email
                }
            }
            return infos
        },
    },
    created() {
        this.getCaisse()
    },
    mounted() {
        this.getReservations()
    },
    methods: {
        getProduits() {
            this.isLoading = true
            this.axios.get( '/api/reservation_produits?reservation_id=' + this.selectedReservation.id).then((response) => {
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
        logout() {
            this.$store.commit('clearAuthenticatedCaisse')
            this.$router.push({ name: 'caisse' })
        },
        openBilletage() {
            this.$dialog.open(CreateBilletage, {
                props: {
                    header: "Enregistrement du billetage de la caisse " + this.caisse.libelle,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: this.caisse
            });
        },
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
        getCaisse() {
            this.isLoading = true
            this.axios.get('/api/caisses/' + this.$route.params.id).then((response) => {
                this.caisse = response.data.data
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
        getReservations() {
            this.isLoading = true
            this.axios.get( '/api/reservations/jour' + '?caisse_id=' + this.$route.params.id).then((response) => {
                this.reservations = response.data.data
                if (this.reservations.length > 0) {
                    this.selectedReservation = this.reservations[this.reservations.length - 1];
                    this.form = {
                        // status: this.selectedReservation.amount_gived,
                        amount_gived: this.selectedReservation.amount_gived,
                        switch_finish_at: this.selectedReservation.switch_finish_at
                    }
                    this.getProduits()
                    this.key++
                }
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
        select_reservation(reservation) {
            this.selectedReservation = reservation
            this.form = {
                // status: reservation.amount_gived,
                amount_gived: reservation.amount_gived,
                switch_finish_at: reservation.switch_finish_at
            }
            this.getProduits()
            this.key++
        },
        closeReservation() {
            this.selectedReservation.switch_finish_at = new Date().toLocaleString('fr-FR')
            this.printReceipt()
            // this.getReservations()
        },
        async updateReservation() {
            if ((parseFloat(this.form.amount_gived) - parseFloat(this.selectedReservation.montant)) < 0) {
                alert('Le difference ne peut etre negative');
                return
            }

            this.form.status = 'Termine'
            this.form.switch_finish_at = new Date().toLocaleString('fr-FR')
            this.form.switch_finish_by = this.$store.getters.user.fullname


            await this.axios.post(`/api/reservations/${this.selectedReservation.id}/update`, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.closeReservation()
                    this.selectedReservation.status = 'Termine'
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
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        printReceipt() {
            const receiptContent = this.$refs.ticket_caisse.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");

            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ticket de Caisse</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .invoice-box {
                        width: 350px;
                        background-color: #fff;
                        margin: 0 auto;
                        padding: 20px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        border-radius: 10px;
                    }
                         
                    .section {
                        margin-bottom: 20px;
                    }
                    .logo {
                        display: block;
                        margin: 0 auto;
                        width: 100px;
                    }
                    .center {
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 8px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #e4e4e4;
                        color: rgb(0, 0, 0);
                    }
                    .total-section {
                        margin-top: 10px;
                    }
                    .total-section th {
                        background-color: #f8f8f8;
                        color: black;
                    }
                    .total-section td {
                        font-weight: bold;
                    }
                    .slogan {
                        font-style: italic;
                        margin-top: 20px;
                        font-size: 1.1em;
                    }
                      

                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);

            // Attendre que le contenu soit chargé avant d'imprimer
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
})
</script>

<style scoped>
.h-fixed {
    height: 80vh;
    overflow-y: auto;
}

.card .position-relative {
    position: relative;
}


@page {
    size: 80mm 80mm;
    margin: 0;
}

body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

#content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: 1px solid black;
}
</style>
