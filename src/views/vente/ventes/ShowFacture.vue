<template>
  <div class="d-flex justify-content-between mb-3 border p-3 text-center">
    <div><strong>Client</strong><br>
      <input v-if="datas.client == 'COMPTANT'" type="text" v-model="clientName" class="form-control" @input="onChangeClientName()">
      <span v-else>{{ datas.client }}</span>
    </div>
    <div><strong>Date </strong><br> {{ dateFormat(datas.created_at) }}</div>
    <div><strong>Total TTC </strong><br> {{ moneyFormat(datas.total_client) }}</div>
  </div>

  <div class="mb-3">
    <table class="table table-sm table-bordered mb-3">
      <thead>
        <tr>
          <th>LIBELLE</th>
          <th>Qté</th>
          <th>P.U</th>
          <th>Coût TTC</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in reservation_produits" :key="index">
          <td>{{ item.libelle }}</td>
          <td>{{ item.qte }}</td>
          <td>{{ item.prix_de_vente }}</td>  
          <td>{{ moneyFormat(item.prix_de_vente * item.qte) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- <div class="mb-3">
    <div><strong>Remise: </strong> {{ moneyFormat(datas.remise) }}</div>
  </div> -->

  <div class="d-flex justify-content-end">
    <ExportFacture :key="key" :facture="datas" :clientName="clientName" :produits="reservation_produits"></ExportFacture>
  </div>

  <!-- Zone cachée pour le PDF -->
  <div hidden>
    <div id="factureContent" class="container-fluid">
      <!-- Informations de l'entreprise -->
      <div class=""><img src="/img/icons/epharma.png " alt="" style="width: 100px;" id="imglogo2epharma"></div>
      <div class="row d-flex justify-content-between">
        <div class="col-5 ">
          <p class="">
            <strong>Email:</strong> pharmacie.testrouteur@gmail.com
            <br><strong>Adresse:</strong> SING Post Epharma
            <br><strong>Téléphone:</strong> 062000000
          </p>
        </div>
        <div class="col-5">
          <p class="">
            <strong>Client: </strong> {{ datas.client }}<br>
            <strong>Nom assuré:</strong> {{datas.nom_assure}}
            <br><strong>Secteur:</strong> {{datas.secteur_assure}}
          </p>
        </div>

      </div>

      <!-- En-tête de la facture -->
      <div class="invoice-header">
        <div class="text-center mt-5">
          <h3>FACTURE N°{{ datas.id }}
          </h3>
        </div>
        <div class="text-right">
          <p>Date: {{ dateFormat(datas.created_at) }}</p>
        </div>
      </div>

      <!-- Tableau des produits -->
      <div>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>LIBELLE</th>
              <th>Qté</th>
              <th>P.U</th>
              <th>Coût TTC</th>
            </tr>
          </thead>
          <tbody>
        <tr v-for="item in reservation_produits" :key="index">
          <td>{{ item.libelle }}</td>
          <td>{{ item.qte }}</td>
          <td>{{ item.prix_de_vente }}</td>  
          <td>{{ moneyFormat(item.cout_total) }}</td>
             
        </tr>
     
            <!-- <tr>
              <th colspan="3">TVA</th>
              <td colspan="2">{{ produit.tva }}</td>
            </tr>
            <tr>
              <td colspan="3">CSS</td>
              <td colspan="2">{{ produit.css }}</td>
            </tr>
            <tr>
              <td colspan="3">Montant total</td>
              <td colspan="2">{{ produit.cout_total }}</td>
            </tr> -->
          </tbody>
        </table>
        <p><strong>Nombres de lignes:</strong></p>
        <!-- <p><strong>Arrété la présenre facture à la somme de :</strong> {{ moneyFormat(datas.reservation.montant) }} </p> -->


      </div>

      <!-- Pied de page -->

    </div>
  </div>
</template>

<script>
import moment from 'moment'
import ExportFacture from '../devis/ExportFacture.vue';

export default {
  inject: ['dialogRef'],
  components: { ExportFacture },
  data() {
    return {
      key: 1,
      datas: this.dialogRef.data,
      reservation_produits: [],
      clientName: this.dialogRef.data.client
    };
  },
  mounted() {
    this.getProduits()
  },
  methods: {
    onChangeClientName(){
      this.key++
    },
    getProduits() {
      this.isLoading = true
      this.axios.get('/api/reservation_produits?reservation_id=' + this.dialogRef.data.reservation_id).then((response) => {
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
    dateFormat(varDate) {
      if (varDate != '') {
        const newDate = new Date(varDate)
        if (newDate) return moment(newDate).format('DD/MM/YYYY')
      }
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
    }
  }
}
</script>