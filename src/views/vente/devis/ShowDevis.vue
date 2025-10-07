<template>
  <div class="d-flex mb-3" v-if="formLocked == true && datas.est_valide == false">
    <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()">
      <i class="fas fa-edit"></i> Modifier
    </button>


    <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()">
      <i class="fas fa-trash-alt"></i> Supprimer
    </button>
    <ExportFacture :key="key" :produits="produits" :facture="localReservation"></ExportFacture>
    <button @click="createNewReservation()" class="btn btn-outline-primary">
      <i class="fa-solid fa-circle-chevron-down mr-1"></i> Valider le devis
      <span v-if="isLoadingNewReservation == true" class="spinner-border spinner-border-sm" role="status"
        aria-hidden="true"></span>
    </button>
       <button class="btn btn-secondary ml-2" @click="openModal()">
        <i class="fas fa-envelop" ></i>
          Envoyer par email
        </button>


  </div>
<!-- Afficher la liste des clients -->
 <div v-if="showModal">
<Dialog v-model:visible="showModal">
  <MailClient :devisId="devis.id" @sent="onDevisSent" />
</Dialog>
</div>

  <div v-if="formLocked == true">
    <div class=" border p-3 mb-3 ">
      <div class="d-flex justify-content-between mx-3">
        
        <div><strong>Client : </strong>{{ datas.client }}</div>
        <div><strong>Date :</strong> {{ dateFormat(datas.created_at) }}</div>
        <div><strong>Net à payer :</strong> {{ moneyFormat(totalCout) }}</div>
      </div>
    </div>

    <!-- <div class="p-3 border mb-3" v-if="datas.client != 'COMPTANT'">
      <strong>Total: </strong> <span>{{ moneyFormat(this.localReservation.total) }}</span><br>
      <strong>Prise en charge: </strong> <span> {{ moneyFormat(this.localReservation.total_prise_en_charge) }}</span>
    </div> -->
    
  </div>
  <EditDevis :key="key" :formLocked="formLocked" :datas="datas" @line_updated="switchStatutModif"
    @refresh_reserv="refreshReservationDatas"></EditDevis>


</template>

<script>
import moment from 'moment'
import { defineComponent, defineAsyncComponent } from 'vue';
import html2pdf from 'html2pdf.js';
import $ from 'jquery'
import ExportFacture from './ExportFacture.vue';
import MailClient from './MailClient.vue';
const EditDevis = defineAsyncComponent(() => import('./EditDevis.vue'))

export default defineComponent({
  inject: ['dialogRef'],
  components: { EditDevis, ExportFacture, MailClient },
  data() {
    return {
      isLoadingNewReservation: false,
      datas: this.dialogRef.data,
      localReservation: this.dialogRef.data.reservation,
      produits: [],
      // 
      devis: {}, 
      showModal: false,
      // 
      total_tva: 0,
      total_css: 0,
      key: 1,
      formLocked: true,
    };
  },
  mounted() {
    this.getProduits();
   
  // Charger le devis
  this.getDevis();
  },
  computed: {
    totalCout() {
      return this.produits.reduce((total, produit) => {
        // Convertir en nombre et ajouter au total
        return total + Number(produit.cout_total || 0);
      }, 0);
    }
  },   
  methods: {
     switchStatutModif() {
      this.key++
      if (this.formLocked == false) {
        this.formLocked = true
      }
      else this.formLocked = false
    },
     onDevisSent() {
    this.showModal = false
    this.$toast.add({ severity: "success", summary: "Succès", detail: "Devis envoyé ✅", life: 3000 })
  },
  async getDevis() {
    const id = this.datas.reservation.id;
  try {
    const res = await this.axios.get(`/api/reservations/${id}`);
    if (!res.data) {
      console.error("Aucune réservation trouvée !");
      return;
    }
        console.log("Réponse API :", res.data); //  debug

    // 👉 Ici on détermine si la réservation est bien un devis
    if(!res.data.status || res.data.status !== 'Devis') {
      console.error("Cette réservation n'est pas un devis !");
      return;
    }

    this.devis = res.data;
    console.log("Devis chargé :", this.devis);

  } catch (error) {
    console.error("Erreur lors de la récupération du devis :", error);
  }
},

  openModal() {
     if (!this.devis) {
       console.error("Aucun devis à envoyer !");
         return;
       }

//       if (!this.devis.status || this.devis.status !== 'Devis') {
//     console.error("Cette réservation n'est pas un devis !");
//     return;
// }

    this.$dialog.open(MailClient, {
      props: {
        header: "Envoyer le devis par email",
        style: { width: '50vw' },
        data: { devis: this.devis } // ✅ passe l'objet complet
      }
    });
  } ,

    getProduits() {
      this.isLoading = true
      this.axios.get('/api/reservation_produits?reservation_id=' + this.datas.reservation.id).then(response => {
        this.isLoading = false
        this.produits = response.data.data
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
    },
    // openEditModal(objData) {
    //   this.$dialog.open(EditDevis, {
    //     props: {
    //       header: "Modifier le devis N°",
    //       style: {
    //         width: '60vw',
    //       },
    //       modal: true,
    //      data: objData

    //     },
    //   });
    // },
    downloadPDF() {
      this.isLoading = true
      html2pdf().set({
        pagebreak: { mode: 'avoid-all' },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        margin: [0.3, 0.3],
        filename: "Facture proforma n°" + this.datas.id,
        html2canvas: { scale: 2 },
        image: { type: 'jpeg', quality: 0.98 },
      }).from(document.getElementById("factureContent"))
        .toPdf()
        .get('pdf')
        .then(function (pdf) {
          var totalPages = pdf.internal.getNumberOfPages();
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          for (var i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.text(' S.A.R.L au capital de xxxxxxxxx FCFA | xxxxx - BP: xxxxxxxxx | Tel: +241 xxxxxx xxxxxxx ' + "\n" + 'RCCM: xxxxxxxxxxxx / NIF: xxxxxxxxxxxxx  |Email: xxxxxxxxx / Site web: xxxxxxxxxx', pdf.internal.pageSize.getWidth() - 0.50, pdf.internal.pageSize.getHeight() - 0.50, { align: 'right' });
          }
        })
        .save();
      setTimeout(() => {
        this.isLoading = false

      }, 5000)
    },
    createNewReservation() {
      this.$confirm.require({
        group: 'headless',
        header: 'Etes-vous sûr?',
        message: 'Cette action est irréversible!',
        accept: () => {
          this.isLoadingNewReservation = true;
          const form = {
            user: this.$store.getters.user.fullname,
            factureId: this.datas.id
          };

          // Création de la réservation
          this.axios.post('/api/reservation/facture/' + this.datas.reservation.id, form)
            .then(response => {
              if (response.data.success === true) {
                // Mise à jour du net à payer avec le coût total calculé
                const form2 = {
                  net_a_payer: this.totalCout
                };
                
                return this.axios.post(`/api/factures/${this.datas.id}/update`, form2);
              } else {
                throw new Error('Erreur lors de la création de la réservation');
              }
            })
            .then(factureResponse => {
              if (factureResponse.data.success) {
                $('#refreshfactures').click();
                this.$toast.add({
                  severity: 'success',
                  detail: 'Devis validé et net à payer mis à jour avec succès',
                  life: 3000
                });
                this.dialogRef.close();
              }
              // Gestion des erreurs de la deuxième requête
              factureResponse.data.errors?.forEach(element => {
                this.$toast.add({
                  severity: 'warn',
                  summary: 'Oups !',
                  detail: element,
                  life: 7000
                });
              });
            })
            .catch((error) => {
              // Gestion des erreurs générales
              if (error.response?.data?.errors) {
                error.response.data.errors.forEach(element => {
                  this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: element,
                    life: 7000
                  });
                });
              } else {
                this.$toast.add({
                  severity: 'error',
                  summary: 'Problème de connexion',
                  detail: 'Une erreur s\'est produite lors de la communication avec le serveur !',
                  life: 5000
                });
              }
            })
            .finally(() => {
              this.isLoadingNewReservation = false;
            });
        }
      });
    },
        deleteLine() {
          this.$confirm.require({
            group: 'headless',
            header: 'Etes-vous sûr?',
            message: 'Cette action est irréversible!',
            accept: () => {
              this.isLoading = true
              this.axios.post('/api/factures/' + this.datas.id + '/destroy').then((response) => {
                this.isLoading = false
                if (response.data.success === true) {
                  $('#refreshfactures').click()
                  this.dialogRef.close()
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
              }).catch(() => {
                this.isLoading = false
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
        refreshReservationDatas(reserv) {
          this.localReservation.total = reserv.total
          this.localReservation.montant = reserv.montant
          this.localReservation.total_prise_en_charge = reserv.total_prise_en_charge
          this.localReservation.total_tva = reserv.total_tva
          this.localReservation.total_css = reserv.total_css
          this.localReservation.total_ht = reserv.total_ht
          this.key++
          this.getProduits()
        }
      }
});

</script>