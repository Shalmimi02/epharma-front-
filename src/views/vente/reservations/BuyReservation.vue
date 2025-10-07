<template>
  <!-- Boutons d'action : Payer, Imprimer, Billetage -->
  <div class="d-flex">
    <!-- Bouton paiement/prise en charge -->
    <button v-if="isTreatable && reservation.caisse == 'Default'"
      :type="parseInt(montantTTC) === 0 ? 'submit' : 'button'" :class="[
        'btn',
        parseInt(montantTTC) === 0 ? 'btn-secondary' : 'btn-success',
        'mr-2'
      ]" @click="handleButtonClick" :disabled="shouldDisableRemiseButton || isProcessing">
      <i class="fa-solid" :class="parseInt(montantTTC) === 0 ? 'fa-save mr-1' : 'fa-check mr-1'"></i>
      {{ parseInt(montantTTC) === 0 ? 'Prise en charge' : 'Payer maintenant' }}
      <span v-if="isLoading || isProcessing" class="spinner-border spinner-border-sm" role="status"></span>
    </button>

    <!-- Bouton Imprimer (si pas Annulée ni Devis) -->
    <button
      v-else-if="reservation.status != 'Annule' && reservation.status != 'Devis' && reservation.caisse == 'Default'"
      type="button" class="btn btn-dark mr-2" @click="printReceipt(reservation)">
      <i class="fa-solid fa-print mr-1"></i> Imprimer
    </button>

    <!-- Bouton Billetage -->
    <button type="button" class="btn btn-dark" @click="openBilletage">
      <i class="fa-solid fa-money-bill"></i> Billetage
    </button>
  </div>

  <!-- Modal de règlement -->
  <Dialog header="Règlement" v-model:visible="showModal" modal :closable="!isProcessing">
    <form @submit.prevent="submitForm">
      <div class="bg-black mt-3 p-3 rounded-sm mb-3 text-white">
        <!-- Montant reçu -->
        <div class="form-group">
          <label class="text-gri3">Montant reçu</label>
          <input type="number" v-model="amount_gived" class="form-control border border-dark px-[4rem]" required
            :disabled="reservation.switch_finish_at" />
        </div>
        <!-- Différence (lecture seule) -->
        <div class="form-group">
          <label class="text-gri3">Différence (Rendu)</label>
          <input type="number" :value="difference" class="form-control border border-dark px-[4rem]" disabled />
        </div>
      </div>

      <button type="submit" class="btn btn-dark btn-block" :disabled="isProcessing">
        <i class="fa-solid fa-save mr-1"></i> Enregistrer le paiement
        <span v-if="isLoading || isProcessing" class="spinner-border spinner-border-sm" role="status"></span>
      </button>
    </form>
  </Dialog>

  <!-- Le composant enfant TicketPrinter -->
  <TicketPrinter :key="printerKey" ref="ticketPrinter" :reservation="reservation"
    :reservation_produits="reservation_produits" :amount_gived="amount_gived" :difference="difference"  :showPosologie="showPosologie"
    :caisse="caisse" />
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
import Dialog from 'primevue/dialog';
import TicketPrinter from './TicketPrinter.vue'; // <-- Votre composant enfant

// Billetage asynchrone
const CreateBilletage = defineAsyncComponent(() =>
  import('../../gestion/billetages/CreateBilletage.vue')
);

import {
  readJsonFromFile,
  updateReservationInJson,
  initializeJsonFile,
} from '@/views/calculs/logUtils.ts';

export default defineComponent({
  name: 'PaymentHandler',
  components: {
    Dialog,
    TicketPrinter, // On déclare le composant enfant
  },
  props: {
    reservation: { type: Object, required: true },
    montantTTC: { type: Number, default: 0 },
    reservation_produits: { type: Array, required: true },
    clientSelected: { type: Object, required: true },
    remiseValue: { type: [Number, String], required: true },
    showPosologie: {
        type: Boolean,
        default: true
    }
  },
  data() {
    return {
      isLoading: false,
      isProcessing: false, // Nouvel état pour suivre le traitement en cours
      showModal: false,
      amount_gived: 0, // Montant reçu
      caisse: { libelle: 'Default' },
      reservations: [],
      printerKey: 0, // Clé réactive pour TicketPrinter
      billetageExistePourUtilisateur: false,
      billetages: [],
      paymentTimeout: null, // Timeout pour prévenir les doubles clics
    };
  },
  computed: {
    // La réservation est-elle traitable ?
    isTreatable() {
      return (
        this.reservation &&
        this.reservation.status !== 'Termine' &&
        this.reservation.status !== 'Annule' &&
        this.reservation.status !== 'Devis'
      );
    },
    // Différence entre montant reçu et le total à payer
    difference() {
      // On prend le "montant" réel de la réservation si disponible
      const total = parseFloat(this.reservation.montant) || 0;
      // Montant reçu = ce que l'utilisateur vient de saisir OU, si 0, la valeur stockée en base
      const recu = parseFloat(this.amount_gived) || parseFloat(this.reservation.amount_gived) || 0;

      const diff = recu - total;
      return isNaN(diff) ? '0.00' : diff.toFixed(2);
    },
    // Désactive le bouton si prise en charge > remboursement
    shouldDisableRemiseButton() {
      // Vérifier d'abord que le client a un plafond
      const plafond = parseFloat(this.clientSelected?.plafond_dette || '0');
      if (plafond <= 0) {
        // Si le client n'a pas de plafond, la vérification ne s'applique pas
        return false;
      }

      // Récupérer la prise en charge totale de la réservation
      const priseEnCharge = Number(this.reservation.total_prise_en_charge) || 0;

      // Récupérer le crédit restant (celui qui est mis à jour après paiement ou modification)
      const creditRestant = parseFloat(this.clientSelected.current_remboursement_amount || 0);

      // Vérifier si, après application de la prise en charge, le crédit restant est positif
      // Si (creditRestant - priseEnCharge) <= 0, on désactive le bouton
      return (creditRestant - priseEnCharge) < 0;
    },
  },
  mounted() {
    // Initialiser JSON local
    initializeJsonFile();
    this.refreshReservations();
    this.verifierBilletagesExistants();

    // Écouter l'événement de création de billetage
    window.addEventListener('billetage:created', this.verifierBilletagesExistants);
  },
  beforeUnmount() {
    // Supprimer l'écouteur d'événements lorsque le composant est détruit
    window.removeEventListener('billetage:created', this.verifierBilletagesExistants);
  },
  methods: {
    // Ouvre le billetage
    openBilletage() {
      const dialogRef = this.$dialog.open(CreateBilletage, {
        props: {
          header: 'Enregistrement du billetage de la caisse Default',
          style: { width: '60vw' },
          modal: true,
        },
        data: { libelle: 'Default' },
      });

      // Vérifier si dialogRef et dialogRef.onClose existent avant d'appeler then()
      if (dialogRef && dialogRef.onClose) {
        dialogRef.onClose.then(() => {
          this.verifierBilletagesExistants();
        });
      } else {
        // Si onClose n'est pas disponible, vérifier quand même les billetages
        // après un court délai pour permettre à l'utilisateur d'interagir avec le dialogue
        setTimeout(() => {
          this.verifierBilletagesExistants();
        }, 1000);
      }
    },

    // Bouton principal
    // Bouton principal
    handleButtonClick() {
      // Éviter le traitement multiple si déjà en cours
      if (this.isProcessing) return;

      const priseEnCharge = parseFloat(this.reservation.total_prise_en_charge);
      const remboursement = parseFloat(this.clientSelected.current_remboursement_amount) || 0;
      const isPriseEnCharge = parseInt(this.montantTTC) === 0;

      // Vérification du plafond de remboursement
      if (priseEnCharge > remboursement && remboursement > 0) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Oups !',
          detail: 'Le plafond est depassé, veillez retirer un produit.',
          life: 7000,
        });
        return;
      }

      // Si tout est pris en charge => Enregistre direct
      if (isPriseEnCharge) {
        this.isProcessing = true;
        this.isLoading = true;
        // Reset ce champ à 0 explicitement (pour prise en charge)
        this.amount_gived = 0;
        this.processPriseEnCharge();
      } else {
        // Sinon, affichage de la modal pour saisie du montant
        this.showModal = true;
      }
    },

    // Nouvelle méthode spécifique pour les prises en charge
    async processPriseEnCharge() {
      try {
        // Construire la réservation mise à jour (spécifique pour prise en charge)
        const updatedReservation = {
          ...this.reservation,
          client: this.clientSelected.libelle || this.clientSelected.nom,
          status: 'Termine',
          caisse: 'Default',
          caisse_id: 1,
          switch_finish_at: new Date().toLocaleString('fr-FR'),
          switch_finish_by: this.$store.getters.user.fullname,
          amount_gived: "0.00", // Montant reçu forcé à 0 pour prise en charge
          reservation_produits: this.reservation_produits,
          printed_at: new Date().toLocaleString('fr-FR'),
        };

        // Envoi au backend
        const response = await this.axios.post(
          `/api/reservations/${this.reservation.id}/update`,
          updatedReservation
        );

        if (response.data.success) {
          // Mise à jour localStorage
          await updateReservationInJson(updatedReservation.id, {
            status: 'Termine',
          });

          this.$toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Prise en charge enregistrée avec succès.',
            life: 5000,
          });

          this.printerKey += 1;
          await this.printReceipt(updatedReservation);

          // Émettre l'événement pour informer les composants parents
          this.$emit('reservation-updated', updatedReservation);
        } else {
          this.handleBackendErrors(response);
        }
      } catch (error) {
        console.error('Erreur lors de la prise en charge :', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: "Une erreur s'est produite lors de la connexion au serveur !",
          life: 5000,
        });
      } finally {
        // Important: réinitialiser les états
        setTimeout(() => {
          this.isProcessing = false;
          this.isLoading = false;
        }, 3000);
      }
    },

    // Soumission du paiement (pour mode paiement normal)
    async submitForm() {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.isLoading = true;

      try {
        // Vérification du montant reçu
        const total = parseFloat(this.montantTTC) || 0;
        const montantRecu = parseFloat(this.amount_gived) || 0;

        if (montantRecu < total) {
          this.$toast.add({
            severity: 'warn',
            summary: 'Oups !',
            detail: 'Le montant reçu ne peut être inférieur au total.',
            life: 7000,
          });
          this.isProcessing = false;
          this.isLoading = false;
          return;
        }

        // Vérification des stocks
        if (!this.verifierStocks()) {
          this.isProcessing = false;
          this.isLoading = false;
          return;
        }

        // Construction et envoi de la réservation
        const updatedReservation = this.preparerReservation();
        const response = await this.axios.post(
          `/api/reservations/${this.reservation.id}/update`,
          updatedReservation
        );

        if (response.data.success) {
          await this.finaliserPaiement(updatedReservation);
        } else {
          this.handleBackendErrors(response);
        }
      } catch (error) {
        this.handleError(error);
      } finally {
        // Ne pas réinitialiser ici, car c'est fait après l'impression ou en cas d'erreur
        this.isLoading = false;
      }
    },

    // Nouvelles méthodes utilitaires pour rendre le code plus modulaire
    verifierStocks() {
      try {
        for (const line of this.reservation_produits) {
          const qte = parseInt(line.qte, 10);
          if (isNaN(qte) || qte <= 0) {
            this.$toast.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Quantité invalide pour la ligne ID ${line.id}.`,
              life: 5000,
            });
            return false;
          }

          const qteDispo = parseInt(line.produit?.qte, 10) || 0;
          if (qte > qteDispo) {
            this.$toast.add({
              severity: 'error',
              summary: 'Stock insuffisant',
              detail: `La quantité demandée (${qte}) dépasse le stock disponible (${qteDispo}) pour "${line.libelle}".`,
              life: 7000,
            });
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error('Erreur lors de la vérification des stocks:', error);
        return false;
      }
    },

    preparerReservation() {
      return {
        ...this.reservation,
        client: this.clientSelected.libelle || this.clientSelected.nom,
        status: 'Termine',
        caisse: 'Default',
        caisse_id: 1,
        switch_finish_at: new Date().toLocaleString('fr-FR'),
        switch_finish_by: this.$store.getters.user.fullname,
        amount_gived: (this.amount_gived || 0).toFixed(2),
        reservation_produits: this.reservation_produits,
        printed_at: new Date().toLocaleString('fr-FR'),
      };
    },

    async finaliserPaiement(updatedReservation) {
      // Mise à jour localStorage
      await updateReservationInJson(updatedReservation.id, {
        status: 'Termine',
      });

      this.$toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Vente enregistrée avec succès.',
        life: 5000,
      });

      // Fermer la modal
      this.showModal = false;

      // Impression du ticket
      this.printerKey += 1;
      await this.printReceipt(updatedReservation);

      // Notification des composants parents
      this.$emit('reservation-updated', updatedReservation);

      // Réinitialiser l'état après impression
      setTimeout(() => {
        this.isProcessing = false;
      }, 3000);
    },

    handleBackendErrors(response) {
      if (Array.isArray(response.data.errors)) {
        response.data.errors.forEach((err) => {
          this.$toast.add({
            severity: 'warn',
            summary: 'Oups !',
            detail: err,
            life: 7000,
          });
        });
      } else {
        this.$toast.add({
          severity: 'warn',
          summary: 'Oups !',
          detail: 'Une erreur inconnue est survenue.',
          life: 7000,
        });
      }
      this.isProcessing = false;
    },

    handleError(error) {
      console.error('Erreur lors du traitement :', error);
      this.$toast.add({
        severity: 'error',
        summary: 'Problème de connexion',
        detail: "Une erreur s'est produite lors de la connexion au serveur !",
        life: 5000,
      });
      this.isProcessing = false;
    },


    printReceipt(updatedReservation) {
      // Incrémente la key pour recréer le composant TicketPrinter 
      this.printerKey += 1;

      // Au tick suivant, le composant enfant est recréé en DOM
      this.$nextTick(() => {
        // Vérifie que le composant enfant est bien présent
        if (this.$refs.ticketPrinter) {
          // Appelle la méthode d'impression interne
          this.$refs.ticketPrinter.printReceipt()
          // Notifier le parent (optionnel)
          this.$emit('reservation-updated', updatedReservation);
        }
      })
    },

    // Rafraîchit les réservations locales
    async refreshReservations() {
      try {
        const jsonData = await readJsonFromFile();
        if (jsonData && jsonData.reservations) {
          this.reservations = jsonData.reservations;
        } else {
          this.reservations = [];
        }
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de rafraîchir les réservations.",
          life: 5000,
        });
      }
    },

    // Vérifier s'il existe un billetage pour l'utilisateur actuel
    verifierBilletagesExistants() {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Formater l'heure actuelle en HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}:${seconds}`;

      this.axios.get('/api/billetages').then(response => {
        if (response.data && response.data.data) {
          this.billetages = response.data.data;

          // Vérifier si un billetage existe pour l'utilisateur actuel à la date et heure actuelles
          const userFullname = this.$store.getters.user.fullname;

          this.billetageExistePourUtilisateur = this.billetages.some(billetage => {
            // Vérifier si on est dans la période de date
            if (billetage.date_debut > today || billetage.date_fin < today) {
              return false; // En dehors de la période de date
            }

            // Si on est à la date de début, vérifier si l'heure actuelle est après l'heure de début
            if (billetage.date_debut === today && billetage.heure_debut > currentTime) {
              return false; // Avant l'heure de début
            }

            // Si on est à la date de fin, vérifier si l'heure actuelle est avant l'heure de fin
            if (billetage.date_fin === today && billetage.heure_fin < currentTime) {
              return false; // Après l'heure de fin
            }

            // Vérifier si le billetage est créé par l'utilisateur actuel
            if (billetage.created_by !== userFullname && billetage.ended_with !== userFullname) {
              return false; // Pas créé par cet utilisateur
            }

            // Si toutes les conditions sont remplies, on est dans la période du billetage
            return true;
          });
        }
      }).catch(error => {
        console.error('Erreur lors de la récupération des billetages:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: 'Impossible de vérifier les billetages existants',
          life: 5000
        });
      });
    },

    // À ajouter dans les méthodes existantes
    beforeDestroy() {
      // Nettoyer les timeouts si le composant est détruit
      if (this.paymentTimeout) {
        clearTimeout(this.paymentTimeout);
      }
    },
  },
});
</script>
