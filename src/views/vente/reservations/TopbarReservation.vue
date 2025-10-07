<template>
  <div class="d-flex mx-auto align-items-center">
    <!-- Affichage du numéro de réservation sélectionnée + bouton de création -->
    <div class="d-flex align-items-center">
      <div class="h2 btn btn-lg bg-primary text-white">
        N° <span v-if="selectedReservation">{{ selectedReservation.position }}</span>
      </div>
      <div class="mx-2 position-relative" :class="{ 'text-primary': !isLoading, 'text-secondary': isLoading }"
        @click="!isLoading && createReservation()" title="Nouvelle réservation" role="button"
        :style="isLoading ? 'cursor: not-allowed' : 'cursor: pointer'">
        <!-- Version non-loading: icône plus -->
        <i v-if="!isLoading" class="fa-solid fa-circle-plus bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>

        <!-- Version loading: spinner avec le même style visuel -->
        <div v-else class="bg-white p-2 rounded-circle d-flex align-items-center justify-content-center"
          style="font-size: 2rem; width: 48px; height: 48px;">
          <span class="spinner-border spinner-border-sm" role="status"></span>
        </div>
      </div>
    </div>

    <!-- Liste des réservations toujours affichée -->
    <div style="max-width: 65vw; overflow-x: auto;" class="reservations-container">
      <div class="d-flex justify-content-center px-3">
        <!-- Boucle sur toutes les réservations du jour (ou du parent) -->
        <div v-if="reservations.length === 0">
          <em>Aucune réservation pour l'instant</em>
        </div>

        <div v-else v-for="reservation in reservations" :key="reservation.id"
          class="rounded-pill reservation-circle mx-2" :class="{
            // Mise en surbrillance si sélectionné
            'border-primary text-dark': isSelected(reservation),

            // Statut = Annulé => Rouge
            'bg-danger border-danger text-white': reservation.status === 'Annule',

            // Statut = Brouillon => Orange
            // (bg-warning + border-warning + text-dark)
            'text-dark': reservation.status === 'Brouillon',

            // Statut = Terminé => Vert
            // (bg-success + border-success + text-white)
            'bg-success border-success text-white': reservation.status === 'Termine',

            // Statut = Devis => Bleu clair (par exemple)
            // (bg-info + border-info + text-white)
            'bg-info border-info text-white': reservation.status === 'Devis',
          }" @click="selectReservation(reservation)">
          <!-- Afficher la position, ou "N/A" s'il n'y en a pas -->
          <span>{{ reservation.position || 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Boutons d'actions à droite (annuler / rafraîchir) -->
    <div class="d-flex ml-auto">
      <div class="mx-2 text-danger" v-if="isTreatable()" @click="cancelReservation" title="Annuler la réservation"
        role="button">
        <i class="fas fa-minus-circle bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
      </div>
      <div class="mx-2 text-primary" @click="refreshReservations" title="Rafraîchir" role="button">
        <i class="fa-solid fa-rotate bg-white p-2 rounded-circle" style="font-size: 2rem;"></i>
      </div>
    </div>

  </div>

</template>

<script>
import { addReservationToJson,readJsonFromFile, 
  saveJsonToFile  } from "@/views/calculs/logUtils";

export default {
  name: "TopbarReservation",
  
  props: {
    /* Réservation actuellement sélectionnée (transmise par le parent) */
    selectedReservation: {
      type: Object,
      default: null,
    },
    /* Tableau de réservations (du jour) transmis depuis le parent */
    reservations: {
      type: Array,
      default: () => [],
    },
    productReservation: {
      type: Object,
      default: null,
    }
  },

  data() {
    return {
      isLoading: false,
      localReservation:{},
    };
  },

  methods: {
    /**
     * Rafraîchit la liste des réservations du jour.
     * Émet l'événement vers le parent pour qu'il appelle la méthode fetchReservations().
     */
    refreshReservations() {
      this.$emit('refresh-reservations');
    },

    /**
     * Crée une nouvelle réservation côté API, puis l'ajoute en localStorage.
     * Enfin, on rafraîchit la liste et on sélectionne la nouvelle réservation.
     */
     async createReservation() {
  this.isLoading = true;
  try {
    // Champs de base pour la création
    const form = {
      created_by: this.$store.getters.user.fullname,
      client_id: 1,
      libelle: "COMPTANT",
      status: "Brouillon",
      client: "COMPTANT",
      caisse: "Default",
      montant_taxe: 0,
      total: 0,
      montant: 0,
    };

    // Envoi de la requête POST
    const response = await this.axios.post(`/api/reservations`, form);
    

    if (response.data && response.data.success) {
      // Récupérer la réservation créée
      const createdReservation = response.data;
      

      // Définir la structure par défaut
      const defaultReservationFields = {
        id: createdReservation.id,
        code: null,
        numero: null,
        remise: 0,
        client: "COMPTANT",
        caisse: "Default",
        amount_reserved: "0",
        amount_gived: "0",
        switch_caisse_at: null,
        switch_finish_at: null,
        switch_devis_at: null,
        switch_dette_at: null,
        status: "Brouillon",
        created_by: this.$store.getters.user.fullname || "Pharmacie YDS",
        nom_assure: null,
        printed_at: null,
        identifiant_assure: "",
        numero_feuille_assure: "",
        secteur_assure: "",
        total: 0,
        montant: 0,
        montant_avant_remise: null,
        prise_en_charge: 0,
        total_prise_en_charge: 0,
        total_tva: 0,
        total_css: 0,
        total_ht: 0,
        total_garde: 0,
        montant_taxe: 0,
        deleted_at: null,
        client_id: 1,
        garde_id: null,
        caisse_id: null,
        avant_remise: null,
        credit_restant: 0.00,
        reservation_produits: []
      };

      // Fusionner les champs API et les champs par défaut
      const finalReservation = { 
        ...defaultReservationFields, 
        ...createdReservation,
        position: createdReservation.position,  // Assurez-vous que position est bien récupérée
        reservation_produits: createdReservation.reservation_produits || [] 
      };
      // S'assurer que les totaux critiques ne sont pas null
      finalReservation.total = finalReservation.total ?? 0;
      finalReservation.montant = finalReservation.montant ?? 0;
      finalReservation.prise_en_charge = finalReservation.prise_en_charge ?? 0;
      finalReservation.total_prise_en_charge = finalReservation.total_prise_en_charge ?? 0;
      finalReservation.total_tva = finalReservation.total_tva ?? 0;
      finalReservation.total_css = finalReservation.total_css ?? 0;
      finalReservation.total_ht = finalReservation.total_ht ?? 0;
      finalReservation.total_garde = finalReservation.total_garde ?? 0;
      finalReservation.montant_taxe = finalReservation.montant_taxe ?? 0;
      // Ajouter la réservation au localStorage
      await addReservationToJson(finalReservation);

      // Rafraîchir la liste depuis le parent
      await this.refreshReservations();

      // Sélectionner la nouvelle réservation
      await this.selectReservation(finalReservation);

      // Notification de succès
      this.$toast.add({
        severity: "success",
        summary: "Succès",
        detail: "Réservation créée avec succès.",
        life: 5000,
      });

    } else {
      console.warn("Création de la réservation échouée :", response.data);
      this.$toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "La création de la réservation a échoué.",
        life: 5000,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la réservation :", error);
    this.$toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Une erreur s'est produite lors de la création de la réservation.",
      life: 5000,
    });
  } finally {
    this.isLoading = false;
  }
},


    /**
     * Émet l'événement 'reservationSelected' vers le parent pour qu'il gère la sélection.
     * @param {Object} reservation - La réservation sélectionnée
     */
    selectReservation(reservation) {
      if (Array.isArray(reservation)) {
        console.error("Erreur : selectReservation a reçu un tableau au lieu d'un objet unique.", reservation);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Sélection invalide de la réservation.",
          life: 5000
        });
        return;
      }
      this.$emit('reservationSelected', reservation);
    },

    /**
     * Annule la réservation sélectionnée
     */
     async cancelReservation() {
      if (!this.selectedReservation) {
        console.error("Aucune réservation sélectionnée pour l'annulation.");
        return;
      }

      try {
        // 1) Mettre à jour le statut et l'horodatage
        this.selectedReservation.status = 'Annule';
        

        // 2) Envoyer la mise à jour de la réservation à la base de données
        await this.axios.post(`/api/reservations/${this.selectedReservation.id}/update`, {
          ...this.selectedReservation,
          status: 'Annule',
          reservation_produits:this.productReservation,
        });

        // 4) Notification de succès et rafraîchissement des réservations
        this.$toast.add({
          severity: "success",
          summary: "Succès",
          detail: "La réservation a été annulée ",
          life: 5000,
        });

        // Rafraîchir la liste des réservations
        this.refreshReservations();

      } catch (error) {
        console.error("Erreur lors de l'annulation de la réservation :", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: "Une erreur s'est produite lors de l'annulation de la réservation.",
          life: 5000,
        });
      }
    },

    /**
     * Indique si la réservation sélectionnée est traitable
     */
    isTreatable() {
      return this.selectedReservation &&
             this.selectedReservation.status !== 'Termine' &&
             this.selectedReservation.status !== 'Annule' &&
             this.selectedReservation.status !== 'Devis';
    },

    /**
     * Vérifie si une réservation donnée est la réservation actuellement sélectionnée
     */
    isSelected(reservation) {
      return (
        this.selectedReservation &&
        reservation.id === this.selectedReservation.id &&
        reservation.status !== 'Annule'
      );
    },
  },
};
</script>

<style scoped>
.reservations-container {
  max-height: 100px; /* ou la hauteur que vous souhaitez */
  white-space: nowrap; 
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: thin; 
  scrollbar-color: #ccc #f5f5f5; 
}

.reservation-circle {
  min-width: 40px;
  width: 40px;
  height: 40px;
  border: 2px solid lightgray;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  margin-right: 0.5rem;
}
.reservation-circle:hover {
  border-color: gray;
}

/* Exemple si vous voulez un style spécial pour la réservation sélectionnée */
.border-primary {
  border-color: #007bff !important;
}
.text-primary {
  color: #007bff !important;
}
</style>
