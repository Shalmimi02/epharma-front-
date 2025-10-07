<template>
    <div class="position-relative">
        <div id="overlay" class="overlay" v-if="reservation.status == 'Termine'"></div>
        <div class="watermark border-danger px-5" v-if="reservation.status == 'Termine'"> Payé Livré
        </div>

        <div class="card bg-white mb-3 pb-3 shadow ">
            <div class="bg-bleuN m-3" v-if="caisse != null">
                <h6 class="text-center p-4">{{ caisse.libelle }}</h6>
            </div>
            <div class="col-md-4 form-group">
                <label>Client</label>
                <input type="text" :value="reservation.client" class="form-control border border-dark px-[4rem]" style=" border-bottom: 1px solid black ; 
                                        border-left: none; border-right: none; border-top: none; 
                                    background: #fafafa;" disabled>
            </div>
        </div>
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
                        <td>{{ item.prise_en_charge }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div hidden class="my-5 col-md-4" v-if="selectedReservation && caisse">
        <div id="ticket" class="container-fluid">
            <div class="d-flex justify-content-center">
                <img src="/img/epharma-sf.png " alt="" style="width: 100px;" id="imglogo2epharma">
            </div>
            <p class="text-center">
                <small>LIBREVILLE-NKEMBO,RCCM:2010B08828, NIF:
                    07078800, avoilenzme@gmail.com Tél:0234567
                </small>
            </p>

            <div style="font-size: 10px; line-height: 1">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">N°</th>
                            <th scope="col">Date</th>
                            <th scope="col">Caisse</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ selectedReservation.position }}</td>
                            <td>{{ new Date().toLocaleString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) }}</td>
                            <td class="d-flex justify-content-end">{{ caisse.libelle }}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">Qté</th>
                            <th scope="col">Libelle</th>
                            <th scope="col">P.U.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in reservation_produits" :key="index">
                            <td>{{ item.qte }}</td>
                            <td>{{ item.libelle }}</td>
                            <td class="d-flex justify-content-end">{{ item.prix_de_vente }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="d-flex justify-content-between dashed-line py-2">
                    <span>TTC</span>
                    <span>{{ selectedReservation.montant }}</span>
                </div>
                <div v-if="selectedReservation.prise_en_charge">
                    <div class="d-flex justify-content-between dashed-line py-2">
                        <span>Pris en charge</span>
                        <span>{{ ((selectedReservation.prise_en_charge) / 100 *
                            parseFloat(selectedReservation.montant)) }}</span>
                    </div>
                    <div class="d-flex justify-content-between dashed-line py-2">
                        <span>Ticket modérateur</span>
                        <span>{{ parseFloat(selectedReservation.montant) -
                            ((selectedReservation.prise_en_charge) / 100 *
                                parseFloat(selectedReservation.montant)) }}</span>
                    </div>
                </div>
                <div class="d-flex justify-content-between dashed-line py-2">
                    <span>Montant reçu</span>
                    <span>{{ parseFloat(form.amount_gived) }}</span>
                </div>
                <div class="d-flex justify-content-between dashed-line py-2">
                    <span>Reste</span>
                    <span v-if="selectedReservation.prise_en_charge">{{ (parseFloat(form.amount_gived) -
                        (parseFloat(selectedReservation.montant) -
                            ((selectedReservation.prise_en_charge) / 100 *
                                parseFloat(selectedReservation.montant)))).toFixed(2) }}</span>
                    <span v-else>{{ (parseFloat(form.amount_gived) -
                        parseFloat(selectedReservation.montant)).toFixed(2) }}</span>
                </div>
            </div>
            <p class="text-center font-weight-bold mt-3">
                Les produits vendus ne sont ni repris, ni échangés Merci et bonne guérison
            </p>

            <p class="text-center">
                Rien ne vaut la sante bonne guerison!
            </p>


        </div>
    </div>
</template>

<script>

export default {
    props: ['reservation'],
    data() {
        return {
            isLoading: false,
        }
    },
    mounted() {
        this.getProduits()
    },
    methods: {
        getProduits() {
            this.isLoading = true
            this.axios.get('/api/reservation_produits?reservation_id=' + this.reservation.id).then((response) => {
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
    },
}
</script>