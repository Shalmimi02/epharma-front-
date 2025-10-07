<template>
  <div class="container mt-4">
    <h3 class="text-center">Marge sur les achats</h3>
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
            <button class="btn btn-secondary" @click="fetchMargeData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Canvas pour Chart.js -->
            <canvas v-show="dataAvailable" ref="margeChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-show="!dataAvailable">
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchMargeData">
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
import ExportStatistique from "../ExportStatistique.vue"; // Import du composant modal pour les statistiques
import SpinnerLoading from "@/components/SpinnerLoading.vue"; // Import du composant de chargement

export default {
  name: "MargeAchat",
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
      showButton: false, // Contrôle de l'affichage du bouton d'exportation
      statData: [], // Données pour le tableau des statistiques
      columns: ["Produit", "Marge (Bénéfice)"], // Colonnes pour le tableau
      TitleStat: "Marge sur les achats",
      isLoading: false, // État de chargement
      error: null, // État d'erreur
      observer: null
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
          header: "Statistiques - Marge sur les achats",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchMargeData() {
      this.isLoading = true; // Début du chargement
      this.error = null; // Réinitialisation de l'erreur
      let url = `/api/marge-benefice`;

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
        // if (!response.ok) throw new Error("Erreur lors du chargement des données.");

        const result = response.data;

        if (Array.isArray(result) && result.length > 0) {
          this.labels = result.map((item) => item.produit_libelle);
          this.data = result.map((item) => item.marge);
          this.statData = result.map((item) => ({
            Produit: item.produit_libelle,
            "Marge (Bénéfice)": item.marge,
          }));
        } else {
          this.labels = ["Aucun produit"];
          this.data = [0];
          this.statData = [{ Produit: "Aucun produit", "Marge (Bénéfice)": 0 }];
        }

        this.isLoading = false; // Fin du chargement

        // Initialiser ou mettre à jour le graphique après le rendu du DOM
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart();
          }, 100);
        });
      } catch (error) {
        console.error("Erreur :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false; // Fin du chargement même en cas d'erreur
      }
    },
    renderChart() {
      // Détruire l'ancienne instance du graphique si elle existe
      if (this.chart) {
        this.chart.destroy();
      }

      // Vérifier que le canvas est bien référencé
      if (this.$refs.margeChart) {
        const ctx = this.$refs.margeChart.getContext("2d");
        if (!ctx || typeof ctx.save !== "function") {
          console.error("Le contexte du canvas est introuvable ou invalide.");
          return;
        }
        // Créer une nouvelle instance de Chart.js
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: this.labels,
            datasets: [
              {
                label: "Marge sur les achats (Bénéfice)",
                data: this.data,
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false, // Masquer la légende
              },
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
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    },
    // Méthode publique pour mettre à jour/redessiner le graphique
    updateChart() {
      if (this.$refs.margeChart) {
        const ctx = this.$refs.margeChart.getContext("2d");
        if (!ctx || typeof ctx.save !== "function") { console.warn("updateChart(): le contexte du canvas est introuvable."); return; }
      }
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.margeChart) {
        this.$nextTick(() => { this.renderChart(); });
      }
    },
     // Configuration d'un IntersectionObserver pour détecter la visibilité
     observeCanvas() {
      if (this.$refs.margeChart) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Lorsque le canvas devient visible, on met à jour le graphique
              this.updateChart();
            }
          });
        });
        observer.observe(this.$refs.margeChart);
      }
    },
     // MODIFICATION : Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
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
        this.fetchMargeData(); // Recharger les données si les filtres changent
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchMargeData(); // Recharger les données si la période change
      },
    },
  },
  mounted() {
    // Observer le canvas pour déclencher la mise à jour dès qu'il est visible
    this.$nextTick(() => {
      this.observeCanvas();
    });
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

.export-btn i {
  margin-left: 5px;
}

/* Styles pour le loading et les erreurs */
.loading-container,
.error-container {
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

canvas {
  max-width: 100%;
  height: auto;
}
</style>
