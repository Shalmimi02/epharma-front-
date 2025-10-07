<template>
  <div class="container mt-4">
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
            <button class="btn btn-secondary" @click="fetchTopProduits">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Canvas pour Chart.js -->
            <canvas v-show="chartData.labels.length > 0" ref="chartCanvas" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-show="chartData.labels.length == 0">
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchTopProduits">
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
import Statistiques from "../ExportStatistique.vue"; // Import du composant modal pour les statistiques
import SpinnerLoading from "@/components/SpinnerLoading.vue"; // Import du composant de chargement

export default {
  name: "TopProduitsChart",
  components: { Statistiques, SpinnerLoading },
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
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Quantité vendue",
            backgroundColor: "#42A5F5",
            borderColor: "#1E88E5",
            borderWidth: 1,
            data: [],
          },
        ],
      },
      chartOptions: {
        responsive: true,
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Quantité vendue",
            },
          },
          y: {
            title: {
              display: true,
              text: "Produits",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
      },
      showButton: false,
      statData: [], // Données pour le tableau
      columns: ["Produit", "Quantité vendue"], // Colonnes du tableau
      TitleStat: "Produits les plus vendus",
      isLoading: false,
      error: null,
      chart: null, // Référence à l'instance Chart.js
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
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(Statistiques, {
        props: {
          header: "Statistiques",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    fetchTopProduits() {
      this.isLoading = true; // Début du chargement
      this.error = null; // Réinitialisation de l'erreur
      // URL de base
      let url = `/api/stat/top20-produits-vendus`;

      // Utilisation de URLSearchParams pour construire la query string
      const params = new URLSearchParams();

      // Ajout des paramètres de période si présents
      if (this.filters.period_from && this.filters.period_to) {
        params.append('period_from', this.filters.period_from);
        params.append('period_to', this.filters.period_to);
      }

      // Ajout du paramètre top_limit (Nombre de produits à afficher)
      if (this.filters.limit) {
        params.append('top_limit', this.filters.limit);
      }

      // Concaténation de la query string à l'URL si des paramètres ont été ajoutés
      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }

      // Requête Axios pour récupérer les données
      this.axios
        .get(url)
        .then((response) => {
          const data = response.data;

          // Mise à jour des données du graphique
          this.chartData.labels = data.map((item) => item.libelle);
          this.chartData.datasets[0].data = data.map((item) => item.total_vendu);

          // Mise à jour des données du tableau
          this.statData = data.map((item) => ({
            Produit: item.libelle,
            "Quantité vendue": item.total_vendu,
          }));

          this.isLoading = false; // Fin du chargement

          // Initialiser ou mettre à jour le graphique après le rendu du DOM
          this.$nextTick(() => {
            this.renderChart();
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données des produits :", error);
          this.error = "Impossible de charger les données. Veuillez réessayer.";
          this.isLoading = false; // Fin du chargement même en cas d'erreur
        });
    },
    renderChart() {
      // Détruire l'ancienne instance du graphique si elle existe
      if (this.chart) {
        this.chart.destroy();
      }

      // Vérifier que le canvas est bien référencé
      if (this.$refs.chartCanvas) {
        const ctx = this.$refs.chartCanvas.getContext("2d");

        // Créer une nouvelle instance de Chart.js
        this.chart = new Chart(ctx, {
          type: "bar",
          data: this.chartData,
          options: this.chartOptions,
        });
      }
    },
    // Méthode publique pour mettre à jour/redessiner le graphique
     updateChart() {
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.chartCanvas) {
        // Si le graphique n'est pas encore initialisé, le créer
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
     // MODIFICATION : Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
     handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    }
  },
  
  mounted() {
    
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // Détruire l'instance du graphique lors du démontage du composant
    if (this.chart) {
      this.chart.destroy();
    };
    // Suppression de l'écouteur d'événement resize
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    filters: {
      handler(newVal, oldVal) {
        this.fetchTopProduits();
      },
      deep: true,
    },
    period: {
      immediate: true, // Appel dès le montage pour lancer fetchTopProduits()
      handler(newVal, oldVal) {
        this.fetchTopProduits();
      },
    },
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

/* Styles pour le loading et les erreurs */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px; /* Ajustez selon vos besoins */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container p {
  color: red;
  margin-bottom: 10px;
}
</style>
