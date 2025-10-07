<template>
  <div class="container mt-4">
    <h3 class="text-center">Quantité Ventes Annulées</h3>
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
            <button class="btn btn-secondary" @click="fetchData">
              Réessayer <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- Contenu principal -->
          <div v-else>
            <!-- Canvas pour Chart.js -->
            <div v-if="dataAvailable" class="chart-container">
              <canvas ref="cancelledSalesChart" class="h-50rem"></canvas>
            </div>
            
            <!-- Message si aucune donnée disponible -->
            <div v-else>
              <p>Aucune donnée disponible pour afficher le graphique.</p>
              <button class="btn btn-secondary" @click="fetchData">
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
  name: "QteVentesAnnulees",
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
      libelles: [],
      quantites: [],
      chart: null, // Référence à l'instance Chart.js
      showButton: false,
      TitleStat: "Quantité Ventes Annulées",
      FormDataVente: {
        annuleVentes: [],
        soldeVentes: [],
        totalAmounts: { annule: 0, solde: 0 }
      },
      canceledSalesList: [],
      isLoading: false, // État de chargement
      error: null, // État d'erreur
      chartKey: 1,        // <--- Clé pour forcer la recréation du canvas
    };
  },
  computed: {
    dataTable() {
      return {
        columns: ["CAISSE", "VENDEUR(SE)", "CLIENTS", "RESERVATION", "TTC", "HT", "TVA", "CSS", "TOTAL CLIENT", "PRISE EN CHARGE", "MT RENDU"],
        rows: this.canceledSalesList.map(vente => ({
          "CAISSE": vente.caisse,
          "VENDEUR(SE)": vente.user,
          "CLIENTS": vente.client,
          "RESERVATION": vente.position,
          "TTC": vente.montantTotal,
          "HT": this.formatCurrency(vente._raw.ht),
          "TVA": this.formatCurrency(vente._raw.tva),
          "CSS": this.formatCurrency(vente._raw.css),
          "TOTAL CLIENT": vente.totalClient,
          "PRISE EN CHARGE": this.formatCurrency(vente._raw.total_prise_en_charge),
          "MT RENDU": vente.montant_recu - vente.total_client
        })),
        title: this.TitleStat,
      };
    },
    dataAvailable() {
      return this.FormDataVente.totalAmounts.annule > 0 
        || this.FormDataVente.totalAmounts.solde > 0;
    },
    venteCount() {
      return this.FormDataVente.annuleVentes.length;
    },
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
  methods: {
    openStatExportModal() {
      this.$dialog.open(ExportStatistique, {
        props: {
          header: "Statistiques",
          style: {
            width: "80vw",
          },
          modal: true,
        },
        data: this.dataTable,
      });
    },
    async fetchData() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await this.axios.get('/api/statistiques/ventes-annulees', {
          params: {
            period_from: this.filters.period_from || null,
            period_to: this.filters.period_to || null
          }
        });

        const allVentes = response.data?.data || [];

        // Filtrer et formater les données
        this.canceledSalesList = allVentes
          .filter(v => v.statut === 'Annulé')
          .map(vente => ({
            ...vente,
            _raw: { ...vente },
            totalClient: this.formatCurrency(vente.total_client),
            montantTotal: this.formatCurrency(vente.total),
            montantRendu: this.formatCurrency(vente.montant_rendu),
            positionDate: vente.position_and_date,
            dateReservation: this.formatDateTime(vente.date_reservation)
          }));

        const annuleVentes = allVentes.filter(v => v.statut === 'Annulé');
        const soldeVentes = allVentes.filter(v => v.statut === 'Soldé');

        const annuleTotal = annuleVentes.reduce((acc, v) => acc + parseFloat(v.total), 0);
        const soldeTotal = soldeVentes.reduce((acc, v) => acc + parseFloat(v.total), 0);

        this.FormDataVente = {
          annuleVentes,
          soldeVentes,
          totalAmounts: {
            annule: annuleTotal,
            solde: soldeTotal
          }
        };

        const totalCount = annuleVentes.length + soldeVentes.length;
        const annulePercent = totalCount ? (annuleVentes.length / totalCount * 100) : 0;
        const soldePercent = totalCount ? (soldeVentes.length / totalCount * 100) : 0;
        
        // Incrémenter la clé pour forcer la recréation du canvas
        this.chartKey++;
        
        // Attendre que le DOM soit mis à jour avant de rendre le graphique
        this.$nextTick(() => {
          // S'assurer que le graphique est détruit avant d'en créer un nouveau
          if (this.chart) {
            this.chart.destroy();
            this.chart = null;
          }
          
          // Rendre le graphique seulement si le canvas existe et les données sont disponibles
          if (this.$refs.cancelledSalesChart && this.dataAvailable) {
            this.renderChart(annulePercent, soldePercent, annuleTotal, soldeTotal);
          }
        });

      } catch (error) {
        console.error("Erreur :", error);
        this.error = "Impossible de charger les données. Veuillez réessayer.";
      } finally {
        this.isLoading = false;
      }
    },

    renderChart(annulePercent, soldePercent, annuleTotal, soldeTotal) {
      // Vérification de l'existence du canvas et des données
      if (!this.$refs.cancelledSalesChart) {
        console.warn("Canvas non disponible");
        return;
      }

      // Vérification des données
      if (annuleTotal + soldeTotal <= 0) {
        console.warn("Aucune donnée valide pour le graphique");
        return;
      }

      try {
        const ctx = this.$refs.cancelledSalesChart.getContext("2d");
        
        // S'assurer que l'ancien graphique est détruit
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        
        // Configuration optimisée du graphique
        this.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: [
              `Annulé (${annulePercent.toFixed(1)}%)`,
              `Soldé (${soldePercent.toFixed(1)}%)`
            ],
            datasets: [{
              data: [annuleTotal, soldeTotal],
              backgroundColor: ["#FF6384", "#36A2EB"],
              hoverOffset: 4,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label.split(' (')[0];
                    const value = context.parsed.toLocaleString('fr-FR');
                    const percent = context.dataset.data[context.dataIndex] === annuleTotal 
                      ? annulePercent.toFixed(1)
                      : soldePercent.toFixed(1);
                    return `${label} : ${value} FCFA (${percent}%)`;
                  }
                }
              }
            }
          }
        });
        
        console.log("Graphique créé avec succès");
      } catch (error) {
        console.error("Erreur lors de la création du graphique:", error);
      }
    },

    
    // Méthode publique pour mettre à jour/redessiner le graphique
    updateChart() {
      if (this.chart) {
        this.chart.update();
      } else if (this.$refs.cancelledSalesChart) {
        // Si le graphique n'est pas encore initialisé, le créer
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    },
     //Méthode pour redimensionner automatiquement le canvas lors du redimensionnement de la fenêtre
     handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    formatCurrency(value) {
      // Convertir en nombre, gérer les valeurs nulles ou undefined
      const numValue = parseFloat(value || 0);

      // Arrondir à l'entier le plus proche et retourner directement
      return Math.round(numValue);
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  },
  
  created() {
    // Initialiser les données au démarrage
    this.fetchData();
  },
  mounted() {
    // Ajout de l'écouteur d'événement resize pour redimensionner le canvas automatiquement
    window.addEventListener('resize', this.handleResize);
    
    // Lorsque le composant est monté, essayer de (re)créer le graphique si les données sont disponibles
    this.$nextTick(() => {
      if (this.dataAvailable && this.$refs.cancelledSalesChart) {
        const totalCount = this.FormDataVente.annuleVentes.length + this.FormDataVente.soldeVentes.length;
        const annulePercent = totalCount ? (this.FormDataVente.annuleVentes.length / totalCount * 100) : 0;
        const soldePercent = totalCount ? (this.FormDataVente.soldeVentes.length / totalCount * 100) : 0;
        
        this.renderChart(
          annulePercent, 
          soldePercent, 
          this.FormDataVente.totalAmounts.annule,
          this.FormDataVente.totalAmounts.solde
        );
      }
    });
  },
  updated() {
    // Lorsque le composant est mis à jour (après un changement de données)
    // vérifier si le graphique doit être mis à jour
    this.$nextTick(() => {
      if (this.dataAvailable && this.$refs.cancelledSalesChart && !this.chart) {
        const totalCount = this.FormDataVente.annuleVentes.length + this.FormDataVente.soldeVentes.length;
        const annulePercent = totalCount ? (this.FormDataVente.annuleVentes.length / totalCount * 100) : 0;
        const soldePercent = totalCount ? (this.FormDataVente.soldeVentes.length / totalCount * 100) : 0;
        
        this.renderChart(
          annulePercent, 
          soldePercent, 
          this.FormDataVente.totalAmounts.annule,
          this.FormDataVente.totalAmounts.solde
        );
      }
    });
  },
  beforeUnmount() {
    // Nettoyage avant la destruction du composant
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }
  
};
</script>

<style scoped>
.container {
  max-width: 800px;
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

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
}

canvas {
  max-width: 100%;
  height: auto !important;
}
</style>
