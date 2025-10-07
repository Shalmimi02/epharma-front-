<template>

  <SelectProduitDevis :key="keyStep2" :isDevis="true" v-if="this.formLocked == false"
      :reservation="localReservation" @set-products="this.key++">
  </SelectProduitDevis>
  <AsdecodeTable :key="key" noExport
    :url=" '/api/reservation_produits?reservation_id=' + this.localReservation.id" :columns="columns"
    table="reservation_produits" v-on:set-total-records="updateLines">

    <template #action_btns=slotProps v-if="this.formLocked == false">
      <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <button v-else type="button" class="btn btn-sm text-danger" @click="deleteLine(slotProps.data.id)">
        <i class="fa-solid fa-trash-alt"></i>
      </button>
    </template>
    <template #qte=slotProps>
      <input type="number" style="width: 90px;" class="form-control border border-dark px-[4rem]" name="qte"
        :value="slotProps.data.qte" min="1"
        @change="updateReservationProduit(slotProps.data, $event)" :disabled=" isLoadingInput[slotProps.data.id] == true || this.formLocked  ">
    </template>
    <!-- <template #prise_en_charge=slotProps>
      <input type="number" style="width: 90px;" class="form-control border border-dark px-[4rem]" name="prise_en_charge"
        :value="parseFloat(slotProps.data.prise_en_charge)" min="0" max="100" step="any"
        @change="updateReservationProduit(slotProps.data, $event)" :disabled=" isLoadingInput[slotProps.data.id] == true || this.formLocked  ">
    </template> -->
  </AsdecodeTable>

  <div class="mt-3 d-flex justify-content-end" v-if="this.formLocked == false">
    <button type="button" class="btn btn-light" @click="refreshDevis">
      Terminer
      <span v-if="MAJisLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button>
  </div>
</template>

<script>
import $ from 'jquery'
import { defineComponent } from 'vue'
import SelectProduitDevis from "./SelectProduitDevis.vue";

export default defineComponent({
  components: { SelectProduitDevis },
  inject: ['dialogRef'],
  props: ['formLocked', 'datas'],
  data() {
    return {
      lines: 0,
      isLoading: false,
      isLoadingInput: [],
      localReservation: { ...this.datas.reservation },
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
          label: 'P.U.',
          format: 'money',
          exportable: true
        }
      ]
    }
  },
  methods: {
    updateReservationProduit(line, event) {
      this.isLoadingInput[line.id] = true;
      let form = {}

      if (event.target.name == 'qte') {
        let total = parseInt(event.target.value) * parseFloat(line.prix_de_vente)
        let totalPrise_en_charge = total * (parseFloat(line.prise_en_charge) / 100)
        let totalTVA = parseFloat(line.total_tva)
        let totalCSS = parseFloat(line.total_css)
        let totalHT = total
        let totalGarde = parseInt(event.target.value) * parseFloat(line.produit.montant_taxe)

        if (line.produit.tva == true) {
          totalTVA = (total * this.$store.getters.tva).toFixed(2)
          totalHT = (total - totalTVA).toFixed(2)
        }

        if (line.produit.css == true) {
          totalCSS = (total * this.$store.getters.css).toFixed(2)
          totalHT = (totalHT - totalCSS).toFixed(2)
        }

        form = {
          'qte': event.target.value,
          'produit_qte': line.produit.qte,
          'cout_total': total - totalPrise_en_charge,
          'cout_total_reel': total,
          'total_prise_en_charge': totalPrise_en_charge,
          'total_tva': totalTVA,
          'total_css': totalCSS,
          'total_ht': totalHT,
          'total_garde': totalGarde ? totalGarde : 0,
        }
      }
      else if (event.target.name == 'prise_en_charge') {
        let total = parseInt(line.qte) * parseFloat(line.prix_de_vente)
        let totalPrise_en_charge = total * (parseFloat(event.target.value) / 100)
        let totalTVA = parseFloat(line.total_tva)
        let totalCSS = parseFloat(line.total_css)
        let totalHT = total
        let totalGarde = parseInt(line.qte) * parseFloat(line.produit.montant_taxe)

        if (line.produit.tva == true) {
          totalTVA = ((total * this.$store.getters.tva) / (1 + this.$store.getters.tva)).toFixed(2)
          totalHT = (total - totalTVA).toFixed(2)
        }

        if (line.produit.css == true) {
          totalCSS = ((total * this.$store.getters.css) / (1 + this.$store.getters.css)).toFixed(2)
          totalHT = (totalHT - totalCSS).toFixed(2)
        }

        form = {
          'prise_en_charge': event.target.value,
          'cout_total': total - totalPrise_en_charge,
          'cout_total_reel': total,
          'total_prise_en_charge': totalPrise_en_charge,
          'total_tva': totalTVA,
          'total_css': totalCSS,
          'total_ht': totalHT,
          'total_garde': totalGarde ? totalGarde : 0,
        }
      }

      this.axios.post('/api/reservation_produits/'+line.id+'/facture/update', form).then(response => {
        this.isLoading = false
        if (response.data.success === true) {
          $('#refreshreservationmontant').click()
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
    deleteLine(id) {
      this.$confirm.require({
        group: 'headless',
        header: 'Etes-vous sûr?',
        message: 'Cette action est irréversible!',
        accept: () => {
      
      this.isLoadingInput[id] = true;
      this.axios.post('/api/reservation_produits/' + id + '/destroy').then((response) => {
        this.isLoading = false
        if (response.data.success === true) {
          this.$emit('product-removed')
          $('#refreshreservation_produits').click()
          $('#refreshreservationmontant').click()
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
        })
      
      })
    }
    })
    },
    updateLines(lines) {
      this.lines = lines
    },
    refreshDevis(){
      this.MAJisLoading = true
      this.axios.get('/api/reservations/' + this.localReservation.id).then(response => {
        const reserv = response.data.data
        this.$emit('refresh_reserv', reserv)
        this.$emit('line_updated')
        $('#refreshfactures').click()
        this.MAJisLoading = false
      }).catch(() => {
        this.MAJisLoading = false
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