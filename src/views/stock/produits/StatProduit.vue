<template>
  <div class="container py-4">
    <div class="card p-5 border-0 shadow-sm" style="max-width: 1110px; margin: 0 auto;">
      <div class="row g-4">
        <!-- PARTIE GAUCHE : Cadre d'image -->
        <div
          class="image-present col-md-4 d-flex flex-column align-items-center justify-content-center bg-light rounded">
          <!-- Image du produit -->
          <img :src="photoUrl" :alt="product.libelle || 'Nom du Produit'" class="img-fluid object-contain p-2"
            style="max-height: 180px; width: 220px;" :key="keyimage" />
        </div>

        <!-- PARTIE DROITE : Informations + Statistiques -->
        <div class="col-md-8">
          <!-- Ligne titre et filtres -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <!-- <h2 class="h5 fw-bold m-0">{{ product.libelle }}</h2> -->
            <!-- Filtres de dates stylisés (inchangés) -->
            <div class="date-filters toggle">
              <div class="date-filter">
                <label for="filterDebut" class="filter-label">Début</label>
                <input type="date" id="filterDebut" name="filterDebut" v-model="filters.debut"
                  class="form-control form-control-sm" :max="filters.fin || null" />
              </div>
              <div class="date-filter">
                <label for="filterFin" class="filter-label">Fin</label>
                <input type="date" id="filterFin" name="filterFin" v-model="filters.fin"
                  class="form-control form-control-sm" :min="filters.debut || null" />
              </div>
              <button class="btn btn-sm btn-primary filter-button" @click="applyFilter" :disabled="isLoading">
                Valider
              </button>
            </div>
          </div>

          <!-- Exemple : Chiffre d'affaire -->
          <div class="mb-4">
            <small class="text-muted d-block">Chiffre d'affaire</small>
            <div class="d-flex align-items-baseline gap-2">
              <span class="h1 bold">
                {{ displayedRevenue }} FCFA
              </span>
              <!-- <span
                :class="{
                  'text-success': caVariation > 0,
                  'text-danger': caVariation < 0,
                  'text-secondary': caVariation === 0
                }"
                class="fw-semibold"
              >
                <i
                  :class="caVariation > 0
                          ? 'fa-solid fa-arrow-up me-1'
                          : caVariation < 0
                            ? 'fa-solid fa-arrow-down me-1'
                            : ''"
                ></i>
                {{ Math.abs(caVariation).toFixed(2) }}%
              </span> -->
            </div>
          </div>

          <!-- Exemples de stats : Quantité Vendue / Stock -->
          <div class="row g-3">
            <div class="col-6">
              <div class="bg-light p-3 rounded">
                <div class="text-muted mb-1">Quantité Vendue</div>
                <div class="d-flex align-items-baseline gap-2">
                  <span class="h3 fw-bold">
                    {{ displayedQtySold }}
                  </span>
                  <!-- <span
                    :class="{
                      'text-success': quantitySoldVar > 0,
                      'text-danger': quantitySoldVar < 0
                    }"
                    class="fw-semibold"
                  >
                    <i
                      :class="quantitySoldVar > 0
                              ? 'fa-solid fa-arrow-up me-1'
                              : quantitySoldVar < 0
                                ? 'fa-solid fa-arrow-down me-1'
                                : ''"
                    ></i>
                    {{ quantitySoldVar }}
                  </span> -->
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-light p-3 rounded">
                <div class="text-muted mb-1">Quantité actuelle</div>
                <div class="d-flex align-items-baseline gap-2">
                  <span class="h3 fw-bold">
                    {{ displayedStock }}
                  </span>
                  <!-- <span
                    :class="{
                      'text-success': stockVar > 0,
                      'text-danger': stockVar < 0
                    }"
                    class="fw-semibold"
                  >
                    <i
                      :class="stockVar > 0
                              ? 'fa-solid fa-arrow-up me-1'
                              : stockVar < 0
                                ? 'fa-solid fa-arrow-down me-1'
                                : ''"
                    ></i>
                    {{ stockVar }}
                  </span> -->
                </div>
              </div>
            </div>
          </div>
        </div><!-- fin col-md-8 -->
      </div><!-- fin row card -->
    </div><!-- fin card -->
    <!-- Passage des props au composant enfant -->
    <StatGraphProduitVente :key="statsKey" :revenue="displayedRevenue" :quantitySold="displayedQtySold"
      :periodFrom="filters.debut" :periodTo="filters.fin" />
    <!-- Boutons Toggle pour choisir Vente ou Achat -->

    <ToogleButtonHistorique v-model="currentMode" @setMode="setMode" />


    <AsdecodeTable :url="historyUrl" :columns="columns" :table="tableName" :key="keyTable">
      <!-- Slot pour afficher le statut selon le mode -->
      <template v-if="currentMode === 'vente'" #sale_status="slotProps">
        <span :class="[slotProps.data.sale_status === 'Soldé' ? 'termine' : 'encours']">
          {{ slotProps.data.sale_status }}
        </span>
      </template>
      <template v-else #purchase_status="slotProps">
        <span :class="[slotProps.data.purchase_status === 'Validé' ? 'termine' : 'encours']">
          {{ slotProps.data.purchase_status }}
        </span>
      </template>
    </AsdecodeTable>
  </div>
</template>

<script>
import StatGraphProduitVente from "./StatGraphProduitVente.vue";
import ToogleButtonHistorique from "./ToogleButtonHistorique.vue";
export default {
  name: "StatProduit",

  inject: ["dialogRef"],
  components: {
    StatGraphProduitVente,
    ToogleButtonHistorique
  },

  data() {
    return {
      product: {
        id: this.dialogRef.data.id || null,
        libelle: this.dialogRef.data.libelle || "Produit Exemple",
        // Valeurs initiales (seront mises à jour via l'API)
        revenue: 0,
        quantitySold: 0,
        stock: this.dialogRef.data.qte || 0,
        photo: this.dialogRef.data.photo || null,
      },
      currentMode: 'vente',  // Mode initial : "vente"
      table: "Historique des ventes",
      keyimage: 1,
      caVariation: 0,
      statsKey: 0,
      quantitySoldVar: 0,
      stockVar: 0,
      keyTable: 1,
      filters: {
        debut: "",
        fin: ""
      },
      periodFrom: '',
      periodTo: '',
      displayedRevenue: 0,
      displayedQtySold: 0,
      displayedStock: 0,

      defaultImage: "/landscape-photo-svgrepo-com.svg",
      photoUrl: "",

      // Filtres de dates (non utilisés dans cet appel, mais conservés)
      filters: {
        debut: "",
        fin: ""
      },

      isLoading: false
    };
  },

  computed: {

    // Construit l'URL finale pour l'image depuis l'API
    finalPhoto() {
      return this.product.photo ? `${this.product.photo}` : this.defaultImage;
    },
    // URL dynamique en fonction du mode choisi
    historyUrl() {
      let url = (this.currentMode === 'vente')
        ? '/api/sales-history/' + this.product.id
        : '/api/purchase-history/' + this.product.id;

      // Si les deux filtres sont définis, on les ajoute en query params
      if (this.filters.debut && this.filters.fin) {
        url += `?period_from=${this.filters.debut}&period_to=${this.filters.fin}`;
      }
      return url;
    },
    // Colonnes dynamiques en fonction du mode choisi
    columns() {
      if (this.currentMode === 'vente') {
        return [
          { key: 'sale_date', label: 'Date de Vente', exportable: true },
          { key: 'client_name', label: 'Nom du Client', exportable: true },
          { key: 'quantity_sold', label: 'Quantité Vendue', exportable: true },
          { key: 'total_amount', label: 'Montant Total', format: 'money', exportable: true },
          { key: 'sale_status', label: 'Statut de la Vente', exportable: true, format: 'slot' }
        ];
      } else {
        return [
          { key: 'purchase_date', label: 'Date d\'Achat', exportable: true },
          { key: 'supplier_name', label: 'Fournisseur', exportable: true },
          { key: 'quantity_purchased', label: 'Quantité Achetée', exportable: true },
          { key: 'total_purchase_amount', label: 'Montant Total d\'Achat', format: 'money', exportable: true }
        ];
      }
    },
    tableName() {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('fr-FR') + '-' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      if (this.currentMode === 'vente') {
        return [`Historique des ventes ${formattedDate}`];
      } else {
        return [`Historique des achats ${formattedDate}`];
      }
    }


  },

  watch: {
    "product.photo": {
      immediate: true,
      handler(newVal) {
        this.photoUrl = newVal ? this.finalPhoto : this.defaultImage;
      },
    },
    // Animation pour le chiffre d'affaires
    "product.revenue": {
      immediate: true,
      handler(newVal, oldVal) {
        this.animateValue("displayedRevenue", oldVal || 0, newVal || 0, 500);
        this.caVariation = this.calculatePercentageVariation(oldVal, newVal);
      },
    },
    // Animation pour la quantité vendue
    "product.quantitySold": {
      immediate: true,
      handler(newVal, oldVal) {
        this.animateValue("displayedQtySold", oldVal || 0, newVal || 0, 500);
        this.quantitySoldVar = newVal - (oldVal || 0);
      },
    },
    // Animation pour le stock
    "product.stock": {
      immediate: true,
      handler(newVal, oldVal) {
        this.animateValue("displayedStock", oldVal || 0, newVal || 0, 500);
        this.stockVar = newVal - (oldVal || 0);
      },
    },
  },
  created() {
    // Définir les filtres par défaut avant le montage de l'enfant
    this.setDefaultWeekFilter();

  },
  mounted() {
    this.photoUrl = this.product.photo ? this.finalPhoto : this.defaultImage;
    // Appel à la nouvelle route pour récupérer les statistiques du produit

    this.fetchStats(false); // Désactive le toast au chargement
  },

  methods: {
    // Cette méthode est appelée à chaque changement de mode (via l'événement "change" du toggle enfant)
    setMode(newMode) {
      if (this.currentMode != newMode) {
        this.currentMode = newMode;
        // forcer le rechargement du tableau
        this.keyTable += 1;
      }

    },
    // Calcul de la variation en pourcentage
    calculatePercentageVariation(oldVal, newVal) {
      if (!oldVal) return 0;
      return ((newVal - oldVal) / oldVal) * 100;
    },

    // Petite animation de comptage
    animateValue(refVar, startValue, endValue, duration) {
      const startTime = performance.now();
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        const currentVal = Math.floor(startValue + (endValue - startValue) * fraction);
        this[refVar] = currentVal;
        if (fraction < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    },

    // Appel de la nouvelle route pour récupérer les statistiques du produit
    async fetchStats(showToast = false) {
      this.isLoading = true;
      try {
        let url = `/api/produits/${this.product.id}/stats`;
        if (this.periodFrom && this.periodTo) {
          url += `?period_from=${this.periodFrom}&period_to=${this.periodTo}`;
        }
        // Utilisation de la route avec l'id du produit
        const response = await this.axios.get(url);
        if (response.data.data) {
          const stats = response.data.data;
          // Mise à jour des statistiques avec les données de la période "actuel"
          this.product.revenue = stats.actuel.chiffre_affaire;
          this.product.quantitySold = stats.actuel.quantite_vendue;
          if (showToast) {
            this.$toast.add({
              severity: "success",
              detail: "Statistiques mises à jour.",
              life: 3000,
            });
          }
        } else {
          this.$toast.add({
            severity: "warn",
            summary: "Oups !",
            detail: response.data.message || "Erreur lors de la récupération des stats.",
            life: 7000,
          });
        }
      } catch (error) {
        console.error(error);
        this.$toast.add({
          severity: "error",
          summary: "Problème de connexion",
          detail: "Une erreur s'est produite lors de la récupération des statistiques.",
          life: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
    setDefaultWeekFilter() {
      const today = new Date();
      let day = today.getDay();
      if (day === 0) day = 7; // Traiter dimanche comme le 7ème jour
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day - 1));
      const sunday = new Date(today);
      sunday.setDate(today.getDate() + (7 - day));
      const formatDate = (d) => d.toISOString().split("T")[0];
      this.filters.debut = formatDate(monday);
      this.filters.fin = formatDate(sunday);
      this.periodFrom = formatDate(monday);
      this.periodTo = formatDate(sunday);
    },
    // Méthode existante pour appliquer un filtre (peut rester inchangée si vous l'utilisez ailleurs)
    async applyFilter() {
      if (!this.filters.debut || !this.filters.fin) {
        this.$toast.add({
          severity: "warn",
          summary: "Filtres manquants",
          detail: "Veuillez sélectionner une date de début et une date de fin.",
          life: 5000,
        });
        return;
      }

      // Met à jour les propriétés periodFrom et periodTo avec les valeurs actuelles du filtre
      this.periodFrom = this.filters.debut;
      this.periodTo = this.filters.fin;
      this.keyTable += 1;
      // Incrémente la clé pour forcer le rechargement du composant enfant
      this.statsKey++;

      // Appel de fetchStats pour appliquer le filtre immédiatement
      await this.fetchStats(true);
    }
  },
};
</script>

<style scoped>
.card {
  border-radius: 10px;
}

/* Style pour les filtres de dates stylisés */
.date-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filter {
  display: flex;
  flex-direction: column;
}

.filter-label {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.filter-button {
  padding: 0.45rem 1rem;
  position: relative;
  top: 12px;
  border: 1px solid #4b9dea;
  background-color: #4b9dea;
  color: #fff;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.15s ease-out,
    border-color 0.15s ease-out,
    box-shadow 0.15s ease-out;
}

.filter-button:hover {
  background-color: #3a8bd1;
  border-color: #3a8bd1;
}

.filter-button:disabled {
  background-color: #c0c0c0;
  border-color: #c0c0c0;
  cursor: not-allowed;
}

.toggle-buttons {
  margin-bottom: 1rem;
}

.toggle-buttons button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #0d6efd;
  background-color: #fff;
  color: #0d6efd;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.toggle-buttons button.active,
.toggle-buttons button:hover {
  background-color: #0d6efd;
  color: #fff;
}

/* Adaptation responsive */
@media (max-width: 800px) {
  .image-present {
    margin-bottom: 10px;
  }

  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .date-filter {
    width: 100%;
  }

  .filter-button {
    border-radius: 50px;
    width: 100%;
    text-align: center;
  }
}
</style>
