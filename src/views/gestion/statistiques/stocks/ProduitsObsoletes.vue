<template>
    <div class="container mt-4">
      <h3 class="text-center">Produits obsolètes</h3>
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
              <button class="btn btn-secondary" @click="fetchObsoletesData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
  
                      <!-- Contenu principal -->
          <div v-else>
            <!-- Graphiques -->
              <div class="row" v-if="dataAvailable">
                <div class="col-md-6">
                  <canvas ref="expirationChart" class="h-50rem"></canvas>
                </div>
                <div class="col-md-6">
                  <canvas ref="stockCritiqueChart" class="h-50rem"></canvas>
                </div>
              </div>
              
              <!-- Message si aucune donnée disponible -->
              <div v-else>
                <p>Aucune donnée disponible pour afficher les alertes.</p>
                <button class="btn btn-secondary" @click="fetchObsoletesData">
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
    name: "ProduitsObsoletes",
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
        obsoletesData: null,
        chartExpiration: null,
        chartStockCritique: null,
        showButton: false,
        statData: [],
        columns: ["Type d'alerte", "Produit", "Détails", "Valeur à risque"],
        TitleStat: "Produits obsolètes et alertes",
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
        return this.obsoletesData !== null;
      },
    },
    methods: {
      openStatExportModal() {
        this.$dialog.open(ExportStatistique, {
          props: {
            header: "Statistiques - Produits obsolètes",
            style: {
              width: "70vw",
            },
            modal: true,
          },
          data: this.dataTable,
        });
      },
      async fetchObsoletesData() {
        this.isLoading = true;
        this.error = null;
        let url = `/api/statistiques/produits-obsoletes`;
  
        try {
          const response = await this.axios.get(url);
          const data = response.data.data;
  
          this.obsoletesData = data;
          
          // Préparer les données pour le tableau
          this.statData = [];
          
          // Ajouter les produits expirés
          data.produits_expires_ou_bientot_expires.forEach(item => {
            this.statData.push({
              "Type d'alerte": item.statut_expiration,
              "Produit": item.libelle,
              "Détails": `CIP: ${item.cip}, Lot: ${item.lot || 'N/A'}, Exp: ${item.date_expiration}`,
              "Valeur à risque": this.$moneyFormat(item.valeur_risque)
            });
          });
          
          // Ajouter les produits à stock critique
          data.produits_stock_critique.forEach(item => {
            this.statData.push({
              "Type d'alerte": "Stock critique",
              "Produit": item.libelle,
              "Détails": `Stock: ${item.qte}/${item.qte_min}, Rayon: ${item.rayon}`,
              "Valeur à risque": this.$moneyFormat(item.qte * item.prix_de_vente)
            });
          });
  
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
      this.renderExpirationChart();
      this.renderStockCritiqueChart();
    },
    renderExpirationChart() {
      if (this.isDestroyed) return;
      
      if (this.chartExpiration) {
        this.chartExpiration.destroy();
        this.chartExpiration = null;
      }
      
      const canvas = this.$refs.expirationChart;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
        const resume = this.obsoletesData.resume;
        
        this.chartExpiration = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Expirés", "Bientôt expirés"],
            datasets: [{
              data: [resume.nombre_produits_expires, resume.nombre_produits_bientot_expires],
              backgroundColor: ["#dc3545", "#ffc107"],
              borderWidth: 1
            }]
          },
                  options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Produits expirés/à expirer"
            },
            legend: { position: "bottom" }
          }
        }
        });
      },
          renderStockCritiqueChart() {
      if (this.isDestroyed) return;
      
      if (this.chartStockCritique) {
        this.chartStockCritique.destroy();
        this.chartStockCritique = null;
      }
      
      const canvas = this.$refs.stockCritiqueChart;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
        // Grouper par catégorie
        const categoriesStock = {};
        this.obsoletesData.produits_stock_critique.forEach(item => {
          const cat = item.categorie || 'Non classé';
          if (!categoriesStock[cat]) {
            categoriesStock[cat] = 0;
          }
          categoriesStock[cat]++;
        });
  
        const labels = Object.keys(categoriesStock);
        const data = Object.values(categoriesStock);
        
        this.chartStockCritique = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Produits en stock critique",
              data: data,
              backgroundColor: "#17a2b8",
              borderColor: "#17a2b8",
              borderWidth: 1
            }]
          },
                  options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Stock critique par catégorie"
            },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
        });
      },
          updateChart() {
      if (this.isDestroyed || !this.dataAvailable) return;
      
      if (this.chartExpiration && typeof this.chartExpiration.update === 'function') {
        try {
          this.chartExpiration.update();
        } catch (error) {
          console.warn("Erreur expiration chart:", error);
          this.renderExpirationChart();
        }
      }
      
      if (this.chartStockCritique && typeof this.chartStockCritique.update === 'function') {
        try {
          this.chartStockCritique.update();
        } catch (error) {
          console.warn("Erreur stock critique chart:", error);
          this.renderStockCritiqueChart();
        }
      }
    },
    handleResize() {
      if (this.isDestroyed) return;
      
      if (this.chartExpiration) {
        this.chartExpiration.resize();
      }
      if (this.chartStockCritique) {
        this.chartStockCritique.resize();
      }
    }
    },
    watch: {
      filters: {
        deep: true,
        handler() {
          this.fetchObsoletesData();
        },
      },
      period: {
        immediate: true,
        handler() {
          this.fetchObsoletesData();
        },
      },
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
      beforeUnmount() {
    this.isDestroyed = true;
    if (this.chartExpiration) {
      this.chartExpiration.destroy();
      this.chartExpiration = null;
    }
    if (this.chartStockCritique) {
      this.chartStockCritique.destroy();
      this.chartStockCritique = null;
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