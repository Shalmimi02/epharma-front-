<template>
  <div class="container mt-4">
    <h3>Quantité Produits Vendus</h3>
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
            <!-- 
              MODIFICATION : Utilisation de v-show plutôt que v-if pour 
              s'assurer que le canvas est toujours présent dans le DOM.
            -->
            <canvas v-show="quantites.length > 0" ref="soldProductsChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-if="quantites.length === 0">
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
import ExportStatistique from "../ExportStatistique.vue"; // Composant modal pour les statistiques
import SpinnerLoading from "@/components/SpinnerLoading.vue"; // Composant de chargement

export default {
  name: "QteVenteProduit",
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
      libelles: [],
      quantites: [],
      prixV :[],
      chart: null, // Instance Chart.js
      showButton: false,
      TitleStat: "Quantité Produits Vendus",
      isLoading: false,
      error: null,
    };
  },
  computed: {
    dataTable() {
      return {
        columns: ["Produit", "Quantité vendue","Prix vente"],
        rows: this.libelles.map((libelle, index) => ({
          Produit: libelle,
          "Quantité vendue": this.quantites[index],
          "Prix vente": this.prixV[index],
        })),
        title: this.TitleStat,
      };
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
      let url = `/api/statistiques/sold-products`;

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
        // Appel à l'API avec Axios
        const response = await this.axios.get(url);
        const data = response.data;
        this.libelles = data.map((item) => item.libelle);
        this.quantites = data.map((item) => item.total_qte);
        this.prixV = data.map((item) => item.prix_de_vente);

        // MODIFICATION : Ajout d'un léger délai pour être sûr que le canvas est bien rendu
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart();
          }, 100);
        });

        this.isLoading = false;
      } catch (error) {
        console.error("Erreur :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false;
      }
    },
    renderChart() {
      // Si un graphique existe déjà, le détruire
      if (this.chart) {
        this.chart.destroy();
      }
      if (this.$refs.soldProductsChart) {
        const ctx = this.$refs.soldProductsChart.getContext("2d");
        // Créer une nouvelle instance de Chart.js
        this.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: this.libelles,
            datasets: [
              {
                data: this.quantites,
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                  "#FFCD56",
                  "#C9CBCF",
                  "#36A2EB",
                  "#FF6384",
                ],
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
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
          },
        });
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.soldProductsChart) {
        this.$nextTick(() => {
          this.renderChart();
        });
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
        this.fetchData();
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchData();
      },
    },
  },
  mounted() {
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

/* Ajout d'une hauteur explicite pour le canvas */
canvas {
  max-width: 100%;
  height: 300px;
}

/* Si vous souhaitez conserver la classe h-50rem, la définir également */
.h-50rem {
  height: 350px;
}
</style>
