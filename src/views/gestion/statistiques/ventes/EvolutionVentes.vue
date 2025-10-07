<template>
    <div class="container mt-4">
      <h3 class="text-center">Évolution des ventes</h3>
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
              <button class="btn btn-secondary" @click="fetchEvolutionData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
  
            <!-- Contenu principal -->
            <div v-else>
              <!-- Graphique de comparaison -->
              <canvas v-if="dataAvailable" ref="evolutionChart" class="h-50rem"></canvas>
              
              <!-- Message si aucune donnée disponible -->
              <div v-else>
                <p>Aucune donnée disponible pour afficher l'évolution.</p>
                <button class="btn btn-secondary" @click="fetchEvolutionData">
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
    name: "EvolutionVentes",
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
        evolutionData: null,
        chart: null,
        showButton: false,
        statData: [],
        columns: ["Métrique", "Période actuelle", "Période précédente", "Année précédente", "Évol. précédente", "Évol. année"],
        TitleStat: "Évolution des ventes",
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
        return this.evolutionData !== null;
      },
    },
    methods: {
      openStatExportModal() {
        this.$dialog.open(ExportStatistique, {
          props: {
            header: "Statistiques - Évolution des ventes",
            style: {
              width: "70vw",
            },
            modal: true,
          },
          data: this.dataTable,
        });
      },
      async fetchEvolutionData() {
        this.isLoading = true;
        this.error = null;
        let url = `/api/statistiques/evolution-ventes`;
  
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
          
          this.evolutionData = data;
          
          // Préparer les données pour le tableau
          this.statData = [
            {
              "Métrique": "Chiffre d'affaires",
              "Période actuelle": this.$moneyFormat(data.periode_actuelle.chiffre_affaire),
              "Période précédente": this.$moneyFormat(data.periode_precedente.chiffre_affaire),
              "Année précédente": this.$moneyFormat(data.annee_precedente.chiffre_affaire),
              "Évol. précédente": data.evolution_periode_precedente.chiffre_affaire !== null 
                ? this.formatEvolution(data.evolution_periode_precedente.chiffre_affaire) + '%' 
                : 'N/A',
              "Évol. année": data.evolution_annee_precedente.chiffre_affaire !== null 
                ? this.formatEvolution(data.evolution_annee_precedente.chiffre_affaire) + '%' 
                : 'N/A'
            },
            {
              "Métrique": "Nombre de ventes",
              "Période actuelle": data.periode_actuelle.nombre_ventes,
              "Période précédente": data.periode_precedente.nombre_ventes,
              "Année précédente": data.annee_precedente.nombre_ventes,
              "Évol. précédente": data.evolution_periode_precedente.nombre_ventes !== null 
                ? this.formatEvolution(data.evolution_periode_precedente.nombre_ventes) + '%' 
                : 'N/A',
              "Évol. année": data.evolution_annee_precedente.nombre_ventes !== null 
                ? this.formatEvolution(data.evolution_annee_precedente.nombre_ventes) + '%' 
                : 'N/A'
            },
            {
              "Métrique": "Quantité",
              "Période actuelle": data.periode_actuelle.quantite,
              "Période précédente": data.periode_precedente.quantite,
              "Année précédente": data.annee_precedente.quantite,
              "Évol. précédente": data.evolution_periode_precedente.quantite !== null 
                ? this.formatEvolution(data.evolution_periode_precedente.quantite) + '%' 
                : 'N/A',
              "Évol. année": data.evolution_annee_precedente.quantite !== null 
                ? this.formatEvolution(data.evolution_annee_precedente.quantite) + '%' 
                : 'N/A'
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
        
        const canvas = this.$refs.evolutionChart;
        if (!canvas || !canvas.isConnected) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
  
        const data = this.evolutionData;
        
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Chiffre d'affaires", "Nombre de ventes", "Quantité"],
            datasets: [
              {
                label: "Période actuelle",
                data: [
                  data.periode_actuelle.chiffre_affaire,
                  data.periode_actuelle.nombre_ventes,
                  data.periode_actuelle.quantite
                ],
                backgroundColor: "#007bff",
                borderColor: "#007bff",
                borderWidth: 1
              },
              {
                label: "Période précédente",
                data: [
                  data.periode_precedente.chiffre_affaire,
                  data.periode_precedente.nombre_ventes,
                  data.periode_precedente.quantite
                ],
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                borderWidth: 1
              },
              {
                label: "Année précédente",
                data: [
                  data.annee_precedente.chiffre_affaire,
                  data.annee_precedente.nombre_ventes,
                  data.annee_precedente.quantite
                ],
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
        
        const canvas = this.$refs.evolutionChart;
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
      formatEvolution(value) {
        if (value === null) return 'N/A';
        return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
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
          this.fetchEvolutionData();
        },
      },
      period: {
        immediate: true,
        handler() {
          this.fetchEvolutionData();
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