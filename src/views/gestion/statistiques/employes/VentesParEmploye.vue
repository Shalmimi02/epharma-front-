<template>
    <div class="container mt-4">
      <h3 class="text-center">Performances des employés</h3>
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
              <button class="btn btn-secondary" @click="fetchPerformancesData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
  
                      <!-- Contenu principal -->
          <div v-else>
            <!-- Graphiques -->
              <div class="row" v-if="dataAvailable">
                <div class="col-md-6">
                  <canvas ref="ventesEmployeChart" class="h-50rem"></canvas>
                </div>
                <div class="col-md-6">
                  <canvas ref="chiffreAffaireChart" class="h-50rem"></canvas>
                </div>
              </div>
              
              <!-- Message si aucune donnée disponible -->
              <div v-else>
                <p>Aucune donnée disponible pour afficher les performances.</p>
                <button class="btn btn-secondary" @click="fetchPerformancesData">
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
    name: "VentesParEmploye",
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
        performancesData: null,
        chartVentes: null,
        chartCA: null,
        showButton: false,
        statData: [],
        columns: ["Employé", "Nb ventes", "Chiffre d'affaires", "Panier moyen", "Ventes annulées"],
        TitleStat: "Performances des employés",
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
        return this.performancesData !== null && this.performancesData.performances_individuelles.length > 0;
      },
    },
    methods: {
      openStatExportModal() {
        this.$dialog.open(ExportStatistique, {
          props: {
            header: "Statistiques - Performances des employés",
            style: {
              width: "70vw",
            },
            modal: true,
          },
          data: this.dataTable,
        });
      },
      async fetchPerformancesData() {
        this.isLoading = true;
        this.error = null;
        let url = `/api/statistiques/ventes-par-employe`;
  
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
  
          this.performancesData = data;
          
          // Préparer les données pour le tableau
          this.statData = data.performances_individuelles.map(item => ({
            "Employé": item.employe,
            "Nb ventes": item.nombre_ventes,
            "Chiffre d'affaires": this.$moneyFormat(item.chiffre_affaire_total),
            "Panier moyen": this.$moneyFormat(item.panier_moyen),
            "Ventes annulées": item.ventes_annulees
          }));
  
          this.isLoading = false;
          this.$nextTick(() => {
            this.renderCharts();
          });
        } catch (error) {
          console.error("Erreur :", error);
          this.error = "Impossible de charger les données. Veuillez réessayer.";
          this.isLoading = false;
        }
      },
          renderCharts() {
      if (this.isDestroyed) return;
      this.renderVentesChart();
      this.renderChiffreAffaireChart();
    },
    renderVentesChart() {
      if (this.isDestroyed) return;
      
      if (this.chartVentes) {
        this.chartVentes.destroy();
        this.chartVentes = null;
      }
      
      const canvas = this.$refs.ventesEmployeChart;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
        const labels = this.performancesData.performances_individuelles.map(item => item.employe);
        const ventes = this.performancesData.performances_individuelles.map(item => item.nombre_ventes);
        
        this.chartVentes = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Nombre de ventes",
              data: ventes,
              backgroundColor: "#007bff",
              borderColor: "#007bff",
              borderWidth: 1
            }]
          },
                  options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Nombre de ventes par employé"
            },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
        });
      },
          renderChiffreAffaireChart() {
      if (this.isDestroyed) return;
      
      if (this.chartCA) {
        this.chartCA.destroy();
        this.chartCA = null;
      }
      
      const canvas = this.$refs.chiffreAffaireChart;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
        const labels = this.performancesData.performances_individuelles.map(item => item.employe);
        const chiffresAffaires = this.performancesData.performances_individuelles.map(item => item.chiffre_affaire_total);
        
        this.chartCA = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [{
              data: chiffresAffaires,
              backgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
                "#9966FF", "#FF9F40", "#FF6B6B", "#4ECDC4"
              ],
              borderWidth: 1
            }]
          },
                  options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Répartition du CA par employé"
            },
            legend: { position: "bottom" }
          }
        }
        });
      },
          updateChart() {
      if (this.isDestroyed || !this.dataAvailable) return;
      
      if (this.chartVentes && typeof this.chartVentes.update === 'function') {
        try {
          this.chartVentes.update();
        } catch (error) {
          console.warn("Erreur ventes chart:", error);
          this.renderVentesChart();
        }
      }
      
      if (this.chartCA && typeof this.chartCA.update === 'function') {
        try {
          this.chartCA.update();
        } catch (error) {
          console.warn("Erreur CA chart:", error);
          this.renderChiffreAffaireChart();
        }
      }
    },
    handleResize() {
      if (this.isDestroyed) return;
      
      if (this.chartVentes) {
        this.chartVentes.resize();
      }
      if (this.chartCA) {
        this.chartCA.resize();
      }
    }
    },
    watch: {
      filters: {
        deep: true,
        handler() {
          this.fetchPerformancesData();
        },
      },
      period: {
        immediate: true,
        handler() {
          this.fetchPerformancesData();
        },
      },
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
      beforeUnmount() {
    this.isDestroyed = true;
    if (this.chartVentes) {
      this.chartVentes.destroy();
      this.chartVentes = null;
    }
    if (this.chartCA) {
      this.chartCA.destroy();
      this.chartCA = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
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
  height: 300px;
}
  </style>