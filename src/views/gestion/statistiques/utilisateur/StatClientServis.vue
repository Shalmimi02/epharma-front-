<template>
  <div class="container mt-5">
    <h3 class="text-center">Nombre de clients servis par Utilisateur</h3>
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
            <!-- Canvas pour Chart.js -->
            <canvas v-if="dataAvailable" ref="ventesUtilisateurChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-else>
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
import Chart from "chart.js/auto";
import ExportStatistique from "../ExportStatistique.vue";
import SpinnerLoading from "@/components/SpinnerLoading.vue";

export default {
  name: "StatClientServis",
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
      ventesData: [],     // Données pour le graphique
      ventesLabels: [],   // Labels pour le graphique
      chartInstance: null, // Instance Chart.js
      showButton: false,
      statData: [],        // Données pour le tableau
      columns: ["Utilisateur", "Nombre de clients servis"],
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
      return this.ventesLabels.length > 0 && this.ventesData.length > 0;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques - Nombre de clients servis par Utilisateur",
          style: { width: "70vw" },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      let url = `/api/statistiques/clients-utilisateur`;

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
        const data = response.data;
        console.log("Données reçues:", data);

        if (Array.isArray(data) && data.length > 0) {
          this.ventesLabels = data.map(item => item.user);
          this.ventesData = data.map(item => item.nombre_ventes);
          this.statData = data.map(item => ({
            Utilisateur: item.user,
            "Nombre de clients servis": item.nombre_ventes,
          }));
        } else {
          this.ventesLabels = ["Aucun utilisateur"];
          this.ventesData = [0];
          this.statData = [{ Utilisateur: "Aucun utilisateur", "Nombre de clients servis": 0 }];
        }
        this.isLoading = false;
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false;
      }
    },
    renderChart() {
      if (this.isDestroyed) return;
      
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      
      const canvas = this.$refs.ventesUtilisateurChart;
      if (!canvas || !canvas.isConnected) {
        console.error("Le canvas n'est pas trouvé.");
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || typeof ctx.save !== "function") {
        console.error("Le contexte du canvas est introuvable ou invalide.");
        return;
      }
      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.ventesLabels,
          datasets: [{
            label: "Nombre de clients servis",
            data: this.ventesData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: "top" }
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    },
    updateChart() {
      if (this.isDestroyed || !this.dataAvailable) return;
      
      const canvas = this.$refs.ventesUtilisateurChart;
      if (!canvas || !canvas.isConnected) return;
      
      if (this.chartInstance && typeof this.chartInstance.update === 'function') {
        try {
          this.chartInstance.data.labels = this.ventesLabels;
          this.chartInstance.data.datasets[0].data = this.ventesData;
          this.chartInstance.update();
        } catch (error) {
          console.warn("Erreur lors de la mise à jour du graphique:", error);
          this.renderChart();
        }
      } else {
        this.$nextTick(() => { this.renderChart(); });
      }
    },
    observeCanvas() {
      const canvas = this.$refs.ventesUtilisateurChart;
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
      if (this.chartInstance && !this.isDestroyed) {
        this.chartInstance.resize();
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
   
    this.$nextTick(() => { this.observeCanvas(); });
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.isDestroyed = true;
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
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
  margin: auto;
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
