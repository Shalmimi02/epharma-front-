<template>
    <div class="container mt-4">
      <h3 class="text-center">Planification des réapprovisionnements</h3>
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
              <button class="btn btn-secondary" @click="fetchReapproData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
  
            <!-- Contenu principal -->
            <div v-else>
              <!-- Graphiques -->
              <div class="row" v-if="dataAvailable">
                <div class="col-md-6">
                  <canvas ref="prioriteChart" class="h-50rem"></canvas>
                </div>
                <div class="col-md-6">
                  <canvas ref="categorieChart" class="h-50rem"></canvas>
                </div>
              </div>
              
              <!-- Message si aucune donnée disponible -->
              <div v-else>
                <p>Aucun produit à réapprovisionner actuellement.</p>
                <button class="btn btn-secondary" @click="fetchReapproData">
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
    name: "PlanificationReapprovisionnement",
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
        reapproData: null,
        chartPriorite: null,
        chartCategorie: null,
        showButton: false,
        statData: [],
        columns: ["Produit", "Stock actuel", "À commander", "Coût", "Priorité", "Estimation stock (jours)"],
        TitleStat: "Planification des réapprovisionnements",
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
        return this.reapproData !== null && this.reapproData.produits_a_reapprovisionner.length > 0;
      },
    },
    methods: {
      openStatExportModal() {
        this.$dialog.open(ExportStatistique, {
          props: {
            header: "Statistiques - Planification réapprovisionnement",
            style: {
              width: "70vw",
            },
            modal: true,
          },
          data: this.dataTable,
        });
      },
      async fetchReapproData() {
        this.isLoading = true;
        this.error = null;
        let url = `/api/statistiques/planification-reapprovisionnement`;
  
        try {
          const response = await this.axios.get(url);
          const data = response.data.data;
  
          this.reapproData = data;
          
          // Préparer les données pour le tableau
          this.statData = data.produits_a_reapprovisionner.map(item => ({
            "Produit": item.produit.libelle,
            "Stock actuel": item.produit.stock_actuel,
            "À commander": item.produit.quantite_a_commander,
            "Coût": this.$moneyFormat(item.produit.cout_reapprovisionnement),
            "Priorité": item.priorite,
            "Estimation stock (jours)": item.estimation_jours_stock ? Math.round(item.estimation_jours_stock) : 'N/A'
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
        this.renderPrioriteChart();
        this.renderCategorieChart();
      },
      renderPrioriteChart() {
        if (this.isDestroyed) return;
        
        if (this.chartPriorite) {
          this.chartPriorite.destroy();
          this.chartPriorite = null;
        }
        
        const canvas = this.$refs.prioriteChart;
        if (!canvas || !canvas.isConnected) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
  
        // Compter par priorité
        const priorites = {};
        this.reapproData.produits_a_reapprovisionner.forEach(item => {
          const prio = item.priorite;
          if (!priorites[prio]) {
            priorites[prio] = 0;
          }
          priorites[prio]++;
        });
  
        const labels = Object.keys(priorites);
        const data = Object.values(priorites);
        const colors = {
          'Critique': '#dc3545',
          'Haute': '#ffc107',
          'Normale': '#28a745'
        };
        
        this.chartPriorite = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: labels.map(label => colors[label] || '#6c757d'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Répartition par priorité"
              },
              legend: { position: "bottom" }
            }
          }
        });
      },
      renderCategorieChart() {
        if (this.isDestroyed) return;
        
        if (this.chartCategorie) {
          this.chartCategorie.destroy();
          this.chartCategorie = null;
        }
        
        const canvas = this.$refs.categorieChart;
        if (!canvas || !canvas.isConnected) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
  
        // Grouper par catégorie
        const categories = {};
        this.reapproData.produits_a_reapprovisionner.forEach(item => {
          const cat = item.produit.categorie || 'Non classé';
          if (!categories[cat]) {
            categories[cat] = {
              count: 0,
              cout: 0
            };
          }
          categories[cat].count++;
          categories[cat].cout += parseFloat(item.produit.cout_reapprovisionnement || 0);
        });
  
        const labels = Object.keys(categories);
        const counts = labels.map(label => categories[label].count);
        
        this.chartCategorie = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Nombre de produits",
                data: counts,
                backgroundColor: "#007bff",
                borderColor: "#007bff",
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Réapprovisionnement par catégorie"
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
        
        if (this.chartPriorite && typeof this.chartPriorite.update === 'function') {
          try {
            this.chartPriorite.update();
          } catch (error) {
            console.warn("Erreur priorité chart:", error);
            this.renderPrioriteChart();
          }
        }
        
        if (this.chartCategorie && typeof this.chartCategorie.update === 'function') {
          try {
            this.chartCategorie.update();
          } catch (error) {
            console.warn("Erreur catégorie chart:", error);
            this.renderCategorieChart();
          }
        }
      },
      handleResize() {
        if (this.isDestroyed) return;
        
        if (this.chartPriorite) {
          this.chartPriorite.resize();
        }
        if (this.chartCategorie) {
          this.chartCategorie.resize();
        }
      }
    },
    watch: {
      filters: {
        deep: true,
        handler() {
          this.fetchReapproData();
        },
      },
      period: {
        immediate: true,
        handler() {
          this.fetchReapproData();
        },
      },
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      this.isDestroyed = true;
      if (this.chartPriorite) {
        this.chartPriorite.destroy();
        this.chartPriorite = null;
      }
      if (this.chartCategorie) {
        this.chartCategorie.destroy();
        this.chartCategorie = null;
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