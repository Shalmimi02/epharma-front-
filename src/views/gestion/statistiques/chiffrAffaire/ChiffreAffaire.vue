<template>
  <div class="container mt-4">
    <div class="card-wrapper">
      <div class="card" style="width: 100%;" @mouseover="showButton = true" @mouseleave="showButton = false">
        <div class="card-body">
          <div v-if="isLoading" class="loading-container">
            <SpinnerLoading />
          </div>

          <div v-else-if="error" class="error-container">
            <p>Une erreur est survenue lors du chargement des données.</p>
            <button class="btn btn-secondary" @click="fetchData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <div v-else>
            <!-- Remplacer ChartJS par un canvas avec une référence -->
            <canvas v-show="chartData.labels.length > 0" ref="chartCanvas" class="h-50rem"></canvas>
            <!-- Message si aucune donnée disponible -->
            <div v-show="chartData.labels.length == 0">
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchData">
                Réessayer <i class="fas fa-redo"></i>
              </button>
            </div>
            <button v-if="showButton" class="btn btn-primary export-btn" @click="openStatExportModal">
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
import Statistiques from "../ExportStatistique.vue";
import SpinnerLoading from "@/components/SpinnerLoading.vue";

export default {
  name: "ChiffreAffaireMensuelLineChart",
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
      months: [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
      ],
      chartData: {
        labels: [],
        datasets: [
          {
            label: `Chiffre d'affaires (${this.period}) (FCFA)`,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: true,
            data: [],
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Mois", // Cette valeur sera remplacée par la réponse "labelName"
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Montant (FCFA)",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
      },
      showButton: false,
      statData: [],
      columns: ["Période", "Total Chiffre d'Affaires (FCFA)"],
      TitleStat: "Chiffre d'Affaires Mensuel",
      isLoading: false,
      error: null,
      chart: null, // Référence à l'instance Chart.js
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
  },
  methods: {
    openStatExportModal() {
      const uniqueID = `12`;
      this.$dialog.open(Statistiques, {
        props: {
          header: "Statistiques - Chiffre d'Affaires Mensuel",
          style: {
            width: "70vw",
          },
          modal: true,
        },
        data: this.dataTable,
        uniqueID: uniqueID, // Passer l'ID unique au composant enfant
      });
    },
    fetchData() {
      this.isLoading = true;
      this.error = null;
      let url = `api/stat/chiffre-affaire`;

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

      this.axios
        .get(url)
        .then((response) => {
          const { xLabel, data, labelName } = response.data;

          // Mise à jour des labels et des données du graphique
          this.chartData.labels = data.map((item) => item.period);
          this.chartData.datasets[0].data = data.map((item) => item.total);
          this.chartData.datasets[0].label = `Chiffre d'affaires (${xLabel}) (FCFA)`;

          // Mise à jour du titre de l'axe X avec labelName récupéré de la réponse
          this.chartOptions.scales.x.title.text = labelName;

          // Préparation des données pour le tableau stat
          this.statData = data.map((item) => ({
            Période: item.period,
            "Total Chiffre d'Affaires (FCFA)": item.total,
          }));

          this.isLoading = false;
          this.$nextTick(() => {
            this.renderChart();
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données :", error);
          this.error = "Impossible de charger les données. Veuillez réessayer.";
          this.isLoading = false;
        });
    },
    renderChart() {
      if (this.isDestroyed) return;
      
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const canvas = this.$refs.chartCanvas;
      if (!canvas || !canvas.isConnected) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: "line",
        data: this.chartData,
        options: this.chartOptions,
      });
    },
    // Méthode publique pour mettre à jour/redessiner le graphique
    updateChart() {
      if (this.isDestroyed) return;
      
      const canvas = this.$refs.chartCanvas;
      if (!canvas || !canvas.isConnected) return;
      
      if (this.chart && typeof this.chart.update === 'function') {
        try {
          this.chart.update();
        } catch (error) {
          console.warn("Erreur lors de la mise à jour du graphique:", error);
          this.renderChart();
        }
      } else {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
    // Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
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
        this.fetchData(); // Recharger les données si les filtres changent
      },
    },
    period: {
      immediate: true,
      handler() {
        this.fetchData(); // Recharger les données si la période change
      },
    },
  },
  mounted() {
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
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
.card-wrapper {
  position: relative;
}

.export-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
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
  height: 300px;
  /* Ajustez selon vos besoins */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container p {
  color: red;
  margin-bottom: 10px;
}
</style>
