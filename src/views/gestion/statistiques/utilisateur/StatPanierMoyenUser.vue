<template>
  <div class="container mt-4">
    <h3 class="text-center" style="margin-bottom: 2.6rem;">Panier Moyen par Utilisateur</h3>
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
            <button class="btn btn-secondary" @click="fetchPanierMoyen">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Canvas pour Chart.js -->
            <canvas v-if="dataAvailable" ref="panierMoyenChart" class="h-50rem"></canvas>
            
            <!-- Message si aucune donnée disponible -->
            <div v-else>
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchPanierMoyen">
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
  name: "PanierMoyen",
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
      users: [], // Labels pour le graphique
      paniersMoyens: [], // Données pour le graphique
      chartInstance: null, // Instance Chart.js
      showButton: false, // Contrôle de l'affichage du bouton d'exportation
      statData: [], // Données pour le tableau des statistiques
      columns: ["Utilisateur", "Panier Moyen (FCFA)"], // Colonnes pour le tableau
      TitleStat: "Panier Moyen par Utilisateur",
      isLoading: false, // État de chargement
      error: null, // État d'erreur
      observer: null // Pour l’IntersectionObserver
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
      return this.users.length > 0 && this.paniersMoyens.length > 0;
    },
  },
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques - Panier Moyen par Utilisateur",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchPanierMoyen() {
      this.isLoading = true; // Début du chargement
      this.error = null; // Réinitialisation de l'erreur
      let url = `/api/statistiques/panier-moyen`;

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
        // Note : Ici on utilise this.axios.get(url) ; assurez-vous que "axios" est bien injecté dans le contexte de votre composant
        const response = await this.axios.get(url);
        const data = response.data;

        if (data && data.length > 0) {
          this.users = data.map((item) => item.user);
          this.paniersMoyens = data.map((item) => item.panier_moyen);
          this.statData = data.map((item) => ({
            Utilisateur: item.user,
            "Panier Moyen (FCFA)": item.panier_moyen,
          }));
        } else {
          this.users = ["Aucun utilisateur"];
          this.paniersMoyens = [0];
          this.statData = [{ Utilisateur: "Aucun utilisateur", "Panier Moyen (FCFA)": 0 }];
        }

        this.isLoading = false; // Fin du chargement

        // Initialiser ou mettre à jour le graphique après le rendu du DOM
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
        this.isLoading = false;
      }
    },
    renderChart() {
      // Détruire l'ancienne instance du graphique si elle existe
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Vérifier que le canvas est référencé et que le contexte est valide
      const canvas = this.$refs.panierMoyenChart;
      if (!canvas || !canvas.isConnected) {
        console.error("Le canvas n'est pas trouvé.");
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || typeof ctx.save !== "function") {
        console.error("Le contexte du canvas est introuvable ou invalide.");
        return;
      }

      // Créer une nouvelle instance de Chart.js
      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.users,
          datasets: [
            {
              label: "Panier Moyen (FCFA)",
              data: this.paniersMoyens,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
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
    },
    updateChart() {
      const canvas = this.$refs.panierMoyenChart;
      if (!canvas || !canvas.isConnected) {
        console.warn("updateChart(): Le ref du canvas est introuvable.");
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || typeof ctx.save !== "function") {
        console.warn("updateChart(): Le contexte du canvas est invalide.");
        return;
      }
      if (this.chartInstance) {
        // Mettre à jour les données et les labels
        this.chartInstance.data.labels = this.users;
        this.chartInstance.data.datasets[0].data = this.paniersMoyens;
        this.chartInstance.update();
      } else {
        this.$nextTick(() => { this.renderChart(); });
      }
    },
    observeCanvas() {
      const canvas = this.$refs.panierMoyenChart;
      if (canvas) {
        // Stocker l'observer dans this.observer pour pouvoir le déconnecter plus tard
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
      if (this.chart) {
        this.chart.resize();
      }
    }
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.fetchPanierMoyen();
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchPanierMoyen();
      },
    },
  },
  mounted() {
    this.$nextTick(() => { this.observeCanvas(); });
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // Détruire l'instance du graphique
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    // Déconnecter l'observer s'il existe
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    };
    // Suppression de l'écouteur d'événement resize
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
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
