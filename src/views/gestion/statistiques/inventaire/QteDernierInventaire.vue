<template>
  <div class="container mt-4">
    <h3 class="text-center">Produits du Dernier Inventaire</h3>
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

          <!-- État d'erreur de connexion -->
          <div v-else-if="error" class="error-container">
            <p>{{ error }}</p>
            <button class="btn btn-secondary" @click="fetchData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Si des données sont disponibles, afficher le canvas -->
            <canvas v-if="dataAvailable" ref="barChart" class="h-50rem"></canvas>
            
            <!-- Si aucune donnée n'est disponible, afficher le message de l'API -->
            <div v-else-if="emptyMessage" class="error-container">
              <p>{{ emptyMessage }}</p>
              <!-- MODIFICATION : Bouton renommé en "Actualiser" -->
              <button class="btn btn-secondary" @click="fetchData">
                Actualiser <i class="fas fa-redo"></i>
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
import ExportStatistique from "../ExportStatistique.vue"; // Composant modal pour les statistiques
import SpinnerLoading from "@/components/SpinnerLoading.vue"; // Composant de chargement

export default {
  name: "BarChart",
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
      produits: [], // Liste des inventaires retournés par l'API
      labels: [],   // Labels pour le graphique
      data: [],     // Données pour le graphique
      chart: null,  // Instance Chart.js
      showButton: false,
      statData: [], // Données pour le tableau des statistiques
      columns: ["Produit", "Quantité Réelle"],
      TitleStat: "Produits du Dernier Inventaire",
      isLoading: false, // État de chargement
      error: null,      // Erreur de connexion
      emptyMessage: null // Message à afficher si aucun inventaire n'est trouvé
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
    // Les données sont considérées disponibles si labels et data sont non vides
    dataAvailable() {
      return this.labels.length > 0 && this.data.length > 0;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques",
          style: { width: "70vw" },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      this.emptyMessage = null; // Réinitialiser le message vide
      let url = `/api/statistiques/dernier-inventaire`;

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
        // Si l'API renvoie des données d'inventaire
        if (data.data && data.data.length > 0) {
          this.produits = data.data;
          this.labels = this.produits.map(produit => produit.produit_libelle);
          this.data = this.produits.map(produit => produit.qte_reelle);
          this.statData = this.produits.map(produit => ({
            Produit: produit.produit_libelle,
            "Quantité Réelle": produit.qte_reelle,
          }));
        } else {
          // S'il n'y a aucun inventaire, utilisez le message renvoyé par l'API (ou un message par défaut)
          this.emptyMessage = data.message || "Aucun inventaire trouvé.";
          this.labels = [];
          this.data = [];
          this.statData = [];
        }
        this.isLoading = false;
        // MODIFICATION : Attendre un léger délai pour être sûr que le canvas est rendu
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart();
          }, 100);
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        // Ce message n'apparaîtra qu'en cas d'erreur de connexion
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false;
      }
    },
    renderChart() {
      // Détruire l'ancienne instance du graphique si elle existe
      if (this.chart) {
        this.chart.destroy();
      }
      if (this.$refs.barChart) {
        const ctx = this.$refs.barChart.getContext("2d");
        if (!ctx || typeof ctx.save !== "function") {
          console.error("Le contexte du canvas est introuvable ou invalide.");
          return;
        }
        // Créer une nouvelle instance de Chart.js
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: this.labels,
            datasets: [
              {
                label: "Quantité Réelle",
                data: this.data,
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
                display: false,
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
    updateChart() {
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.barChart) {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
    observeCanvas() {
      if (this.$refs.barChart) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.updateChart();
            }
          });
        });
        observer.observe(this.$refs.barChart);
      }
    },
     // Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
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
    this.$nextTick(() => {
      this.observeCanvas();
    });
     // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
     window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    };
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
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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
  /* Définir explicitement une hauteur pour le canvas */
  height: 300px;
}
/* Si vous souhaitez conserver la classe h-50rem */
.h-50rem {
  height: 300px;
}
</style>
