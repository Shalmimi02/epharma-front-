<template>
  <div class="container mt-4">
    <h3 class="text-center">Marge nette</h3>
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
            <button class="btn btn-secondary" @click="fetchMargeNetteData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

                  <!-- Contenu principal -->
        <div v-else>
          <!-- Graphique en secteurs -->
            <canvas v-if="dataAvailable" ref="margeNetteChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-else>
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchMargeNetteData">
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
  name: "MargeNette",
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
      margeNetteData: null,
      chart: null,
      showButton: false,
      statData: [],
      columns: ["Indicateur", "Valeur"],
      TitleStat: "Marge nette après déduction des dépenses",
      isLoading: false,
      error: null,
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
      return this.margeNetteData !== null;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques - Marge nette",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchMargeNetteData() {
      this.isLoading = true;
      this.error = null;
      let url = `/api/statistiques/marge-nette`;

      const params = new URLSearchParams();
      if (this.filters.period_from && this.filters.period_to) {
        params.append('period_from', this.filters.period_from);
        params.append('period_to', this.filters.period_to);
      }

      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }

      try {
        const response = await this.axios.get(url);
        const data = response.data.data;

        this.margeNetteData = data;
        
        // Préparer les données pour le tableau
        this.statData = [
          {
            "Indicateur": "Marge nette totale",
            "Valeur": this.$moneyFormat(data.marge_nette_totale)
          },
          {
            "Indicateur": "Chiffre d'affaires total",
            "Valeur": this.$moneyFormat(data.chiffre_affaire_total)
          },
          {
            "Indicateur": "Total dépenses",
            "Valeur": this.$moneyFormat(data.total_depenses)
          },
          {
            "Indicateur": "Marge brute",
            "Valeur": this.$moneyFormat(data.marge_brute)
          },
          {
            "Indicateur": "Taux marge nette (%)",
            "Valeur": data.taux_marge_nette_pourcentage.toFixed(1) + '%'
          }
        ];

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
      
      const canvas = this.$refs.margeNetteChart;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const data = this.margeNetteData;
      
      this.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Marge nette", "Dépenses"],
          datasets: [{
            data: [data.marge_nette_totale, data.total_depenses],
            backgroundColor: ["#28a745", "#dc3545"],
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
      
      const canvas = this.$refs.margeNetteChart;
      if (!canvas || !canvas.isConnected) return;
      
      if (this.chart && typeof this.chart.update === 'function') {
        try {
          this.chart.update();
        } catch (error) {
          console.warn("Erreur lors de la mise à jour du graphique:", error);
          this.renderChart();
        }
      } else {
        this.renderChart();
      }
    },
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
        this.fetchMargeNetteData();
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchMargeNetteData();
      },
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.isDestroyed = true;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.container {
  max-width: 1000px;
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

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.error-container p {
  color: red;
  margin-bottom: 10px;
}

canvas {
  max-width: 100%;
  height: 400px;
}
</style>
