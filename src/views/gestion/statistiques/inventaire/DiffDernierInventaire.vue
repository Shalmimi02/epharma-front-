<template>
  <div class="container mt-4">
    <h3 class="text-center">Difference du Dernier Inventaire</h3>
    <div class="card-wrapper">
      <div 
        class="card" 
        @mouseover="showButton = true" 
        @mouseleave="showButton = false"
      >
        <div class="card-body">
          <!-- État de chargement -->
          <div v-if="isLoading" class="loading-container">
            <SpinnerLoading/>
          </div>

          <!-- État d'erreur -->
          <div v-else-if="error" class="error-container">
            <p>{{ error }}</p>
            <button class="btn btn-secondary" @click="fetchData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Le canvas est toujours présent dans le DOM grâce à v-show -->
            <canvas v-show="dataAvailable" ref="inventaireChart" class="h-50rem"></canvas>
            <!-- Le message est affiché quand aucune donnée n'est disponible -->
            <div v-show="!dataAvailable">
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>

            <!-- Bouton d'exportation -->
            <button
              v-if="showButton"
              class="btn btn-primary export-btn"
              @click="openStatExportModal"
            >
              Exporter <i class="fas fa-file-export"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import Chart from "chart.js/auto"; // Importation par défaut de Chart.js
import ExportStatistique from "../ExportStatistique.vue"; // Import du composant modal pour les statistiques
import SpinnerLoading from "@/components/SpinnerLoading.vue"; // Import du composant de chargement

export default {
  name: "DiffDernierInventaire",
  components: { ExportStatistique, SpinnerLoading },
  props: {
    filters: {
      type: Object,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      produits: [], // Liste des produits
      ecarts: [], // Écarts pour le graphique
      chart: null, // Instance Chart.js
      showButton: false, // Contrôle de l'affichage du bouton d'exportation
      statData: [], // Données pour le tableau des statistiques
      columns: ["Produit", "Écart"], // Colonnes pour le tableau
      TitleStat: "Difference du Dernier Inventaire",
      isLoading: false, // État de chargement
      error: null, // État d'erreur
      observer: null
    };
  },
  computed: {
    dataTable() {
      return {
        columns: this.columns,
        rows: this.statData,
        title: this.TitleStat,
      };
    },
    dataAvailable() {
      return this.produits.length > 0 && this.ecarts.length > 0;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques - Difference du Dernier Inventaire",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchData() {
      this.isLoading = true; // Début du chargement
      this.error = null; // Réinitialisation de l'erreur
      let url = `/api/statistiques/diff-dernier-inventaire`;

      // Utilisation de URLSearchParams pour construire la query string
      const params = new URLSearchParams();

      // Ajout des paramètres de période si présents
      if (this.filters.period_from && this.filters.period_to) {
        params.append('period_from', this.filters.period_from);
        params.append('period_to', this.filters.period_to);
      }

      // Concaténation de la query string à l'URL si des paramètres ont été ajoutés
      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }

      try {
        const response = await this.axios.get(url);
        const data = response.data;

        if (data && data.length > 0) {
          this.produits = data.map((item) => item.produit_libelle);
          this.ecarts = data.map((item) => item.ecart);
          this.statData = data.map((item) => ({
            Produit: item.produit_libelle,
            Écart: item.ecart,
          }));
        } else {
          this.produits = ["Aucun produit"];
          this.ecarts = [0];
          this.statData = [{ Produit: "Aucun produit", Écart: 0 }];
        }

        this.isLoading = false; // Fin du chargement

        // Initialiser ou mettre à jour le graphique après le rendu du DOM
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false; // Fin du chargement même en cas d'erreur
      }
    },
    renderChart() {
      // Détruire l'ancienne instance du graphique si elle existe
      if (this.chart) {
        this.chart.destroy();
      }

      // Vérifier que le canvas est bien référencé
      if (this.$refs.inventaireChart) {
        const ctx = this.$refs.inventaireChart.getContext("2d");
        if (!ctx || typeof ctx.save !== "function") {
          console.error("Le contexte du canvas est introuvable ou invalide.");
          return;
        }
        // Créer une nouvelle instance de Chart.js
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: this.produits,
            datasets: [
              {
                label: "Écart",
                data: this.ecarts,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false, // Masquer la légende
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    return `${label}: ${value}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    },
    // Méthode publique pour mettre à jour/redessiner le graphique
    updateChart() {
      if (this.$refs.inventaireChart) {
        const ctx = this.$refs.inventaireChart.getContext("2d");
        if (!ctx || typeof ctx.save !== "function") { console.warn("updateChart(): le contexte du canvas est introuvable."); return; }
      }
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.inventaireChart) {
        this.$nextTick(() => { this.renderChart(); });
      }
    },
     // Configuration d'un IntersectionObserver pour détecter la visibilité
     observeCanvas() {
      if (this.$refs.inventaireChart) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Lorsque le canvas devient visible, on met à jour le graphique
              this.updateChart();
            }
          });
        });
        observer.observe(this.$refs.inventaireChart);
      }
    },
     // MODIFICATION : Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
     handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    }
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.fetchData(); // Recharger les données si les filtres changent
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchData(); // Recharger les données si la période change
      },
    },
  },
  mounted() {
    // Observer le canvas pour déclencher la mise à jour dès qu'il est visible
    this.$nextTick(() => {
      this.observeCanvas();
    });
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // Détruire l'instance du graphique lors du démontage du composant
    if (this.chart) {
      this.chart.destroy();
    }
    // Suppression de l'écouteur d'événement resize
    window.removeEventListener('resize', this.handleResize);

  },
};
</script>

<style scoped>


.card-wrapper {
  position: relative;
}

.export-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.card:hover .export-btn {
  opacity: 1;
}

.export-btn i {
  margin-left: 5px;
}

/* Styles pour le loading et les erreurs */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px; /* Ajustez selon vos besoins */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container p {
  color: red;
  margin-bottom: 10px;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
