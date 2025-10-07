<template>
  <div class="container mt-4">
    <h3 class="text-center">Chiffre d'affaire par utilisateur</h3>
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
            <button class="btn btn-secondary" @click="fetchVentesData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Canvas pour Chart.js -->
            <canvas v-if="dataAvailable" ref="ventesDoughnutChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-else>
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchVentesData">
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
import Chart from "chart.js/auto";
import ExportStatistique from "../ExportStatistique.vue";
import SpinnerLoading from "@/components/SpinnerLoading.vue";

export default {
  name: "ChiffreAffaireUtilisateur",
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
      labels: [], // Labels pour le graphique
      data: [], // Données pour le graphique
      chart: null, // Instance Chart.js
      showButton: false,
      statData: [], // Données pour le tableau des statistiques
      columns: ["Utilisateur", "Total des ventes"],
      TitleStat: "Nombre de clients servis par Utilisateur",
      isLoading: false,
      error: null,
      observer: null,
      isDestroyed: false
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
      return this.labels.length > 0 && this.data.length > 0;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques - Chiffre d'affaire par utilisateur",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchVentesData() {
      this.isLoading = true;
      this.error = null;
      let url = `/api/statistiques/total-ventes-utilisateur`;

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
        // if (!response.ok) throw new Error("Erreur lors de la récupération des données.");

        const result = response.data;
        console.log("Données reçues:", result);

        if (Array.isArray(result) && result.length > 0) {
          this.labels = result.map((item) => item.user);
          this.data = result.map((item) => item.total_ventes);
          this.statData = result.map((item) => ({
            Utilisateur: item.user,
            "Total des ventes": item.total_ventes,
          }));
        } else {
          this.labels = ["Aucun utilisateur"];
          this.data = [0];
          this.statData = [{ Utilisateur: "Aucun utilisateur", "Total des ventes": 0 }];
        }

        this.isLoading = false;
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error("Erreur :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false;
      }
    },
    renderChart() {
      if (this.isDestroyed) return;
      
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      const canvas = this.$refs.ventesDoughnutChart;
      if (!canvas || !canvas.isConnected) {
        console.error("Le canvas n'est pas trouvé.");
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || typeof ctx.save !== "function") {
        console.error("Le contexte du canvas est introuvable ou invalide.");
        return;
      }
      this.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: this.labels,
          datasets: [{
            data: this.data,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" }
          }
        }
      });
    },
    updateChart() {
      if (this.isDestroyed || !this.dataAvailable) return;
      
      const canvas = this.$refs.ventesDoughnutChart;
      if (!canvas || !canvas.isConnected) return;
      
      if (this.chart && typeof this.chart.update === 'function') {
        try {
          this.chart.data.labels = this.labels;
          this.chart.data.datasets[0].data = this.data;
          this.chart.update();
        } catch (error) {
          console.warn("Erreur lors de la mise à jour du graphique:", error);
          this.renderChart();
        }
      } else {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
    observeCanvas() {
      const canvas = this.$refs.ventesDoughnutChart;
      if (canvas) {
        this.observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.updateChart();
            }
          });
        });
        this.observer.observe(canvas);
      }
    },
     //Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
     handleResize() {
      if (this.chart && !this.isDestroyed) {
        this.chart.resize();
      }
    }
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.fetchVentesData();
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchVentesData();
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
    this.isDestroyed = true;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}

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
  height: auto;
}
</style>
