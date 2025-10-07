<template>
    <div class="container mt-4">
      <h3 class="text-center">Valeur des stocks</h3>
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
              <button class="btn btn-secondary" @click="fetchStocksData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
  
            <!-- Contenu principal -->
            <div v-else>
              <!-- Graphique -->
              <canvas v-if="dataAvailable" ref="stocksChart" class="h-50rem"></canvas>
              
              <!-- Message si aucune donnée disponible -->
              <div v-else>
                <p>Aucune donnée disponible pour afficher le graphique.</p>
                <button class="btn btn-secondary" @click="fetchStocksData">
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
    name: "ValeurStocks",
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
        stocksData: null,
        chart: null,
        showButton: false,
        statData: [],
        columns: ["Catégorie", "Rayon", "Valeur stock achat", "Valeur stock vente", "Quantité", "Nb produits"],
        TitleStat: "Valeur des stocks par catégorie et rayon",
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
        return this.stocksData !== null && this.stocksData.detail_par_categorie.length > 0;
      },
    },
    methods: {
      openStatExportModal() {
        this.$dialog.open(ExportStatistique, {
          props: {
            header: "Statistiques - Valeur des stocks",
            style: {
              width: "70vw",
            },
            modal: true,
          },
          data: this.dataTable,
        });
      },
      async fetchStocksData() {
        this.isLoading = true;
        this.error = null;
        let url = `/api/statistiques/valeur-stocks`;
  
        try {
          const response = await this.axios.get(url);
          const data = response.data.data;
  
          this.stocksData = data;
          
          // Préparer les données pour le tableau
          this.statData = data.detail_par_categorie.map(item => ({
            "Catégorie": item.categorie || 'Non classé',
            "Rayon": item.rayon || 'Non assigné',
            "Valeur stock achat": this.$moneyFormat(item.valeur_stock_achat),
            "Valeur stock vente": this.$moneyFormat(item.valeur_stock_vente),
            "Quantité": item.quantite_totale,
            "Nb produits": item.nombre_produits
          }));
  
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
        
        const canvas = this.$refs.stocksChart;
        if (!canvas || !canvas.isConnected) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
  
        const labels = this.stocksData.detail_par_categorie.map(item => 
          `${item.categorie || 'Non classé'} - ${item.rayon || 'Non assigné'}`
        );
        const valeursAchat = this.stocksData.detail_par_categorie.map(item => item.valeur_stock_achat);
        const valeursVente = this.stocksData.detail_par_categorie.map(item => item.valeur_stock_vente);
        
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Valeur stock achat",
                data: valeursAchat,
                backgroundColor: "#007bff",
                borderColor: "#007bff",
                borderWidth: 1
              },
              {
                label: "Valeur stock vente",
                data: valeursVente,
                backgroundColor: "#28a745",
                borderColor: "#28a745",
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      },
      updateChart() {
        if (this.isDestroyed || !this.dataAvailable) return;
        
        const canvas = this.$refs.stocksChart;
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
          this.fetchStocksData();
        },
      },
      period: {
        immediate: true,
        handler() {
          this.fetchStocksData();
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
    height: 400px;
  }
  </style>