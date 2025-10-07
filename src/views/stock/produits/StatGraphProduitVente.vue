<template>
  <div class="dashboard-container">
    <div class="minimal-header">
      <h2 class="product-title">VUE D'ENSEMBLE</h2>
      <nav class="navbar">
        <ul class="nav-links">
          <li>VENTES</li>
        </ul>
      </nav>
    </div>

    <div class="card-container">
      <div class="main-content">
        <div class="left-panel">
          <h3 class="chart-title">Productivité des ventes</h3>
          <canvas ref="lineChart" class="line-canvas"></canvas>
        </div>

        <div class="right-panel">
          <h2>Moyenne sur la periode</h2>
          <div class="gauge-container">
            
            <canvas ref="gaugeChart" class="gauge-canvas"></canvas>
            
            <div class="gauge-center">
              <div class="gauge-value">{{ gaugeValue }}%</div>
              <div class="gauge-sub">POURCENT. MOY.</div>
            </div>
          </div>

         <!-- <button class="btn-primary-lower">DÉTAILS</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';


export default {
  name: 'TableauDeBordChart',
  inject: ['dialogRef'],
  props: {
    periodFrom: {
      type: String,
      default: ''
    },
    periodTo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      product: {
        id: this.dialogRef.data.id || null,
        libelle: this.dialogRef.data.libelle || "Produit Exemple",
        // Valeurs initiales (seront mises à jour via l'API)
        revenue: 0,
        quantitySold: 0,
        stock: this.dialogRef.data.qte || 15,
        photo: this.dialogRef.data.photo || null,
      },
      lineChartInstance: null,
      gaugeChartInstance: null,
      gaugeValue: 0
    };
  },
  methods: {
    createGradient(ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 300, 0);
      gradient.addColorStop(0, '#3c8dbc');
      gradient.addColorStop(0.5, '#66bb6a');
      gradient.addColorStop(1, '#ffc107');
      return gradient;
    },
    initLineChart(labels, data) {
      const lineCtx = this.$refs.lineChart.getContext('2d');
      if (this.lineChartInstance) {
        this.lineChartInstance.destroy();
      }
      this.lineChartInstance = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: labels, // par exemple ["Lun", "Mar", ...]
          datasets: [
            {
              label: 'Ventes',
              data: data,
              borderColor: this.createGradient(lineCtx),
              borderWidth: 2,
              fill: false,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 6, // agrandit le rayon au survol
              hitRadius: 10        // augmente la zone sensible pour le survol
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',      // affiche les tooltips pour l'ensemble des points de la même abscisse
            intersect: false    // le tooltip s'affiche même si le curseur n'est pas directement sur le point
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              padding: 10,               // ajustement du padding pour plus de lisibilité
              titleMarginBottom: 10      // espacement sous le titre du tooltip
            },
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: '#eee' },
              ticks: { color: '#666' }
            },
            y: {
              grid: { color: '#eee' },
              ticks: { color: '#666', beginAtZero: true }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: false
          },
          events: ['mousemove', 'mouseout', 'click']
        }
      });
    },
    initGaugeChart(value) {
      const gaugeCtx = this.$refs.gaugeChart.getContext('2d');
      if (this.gaugeChartInstance) {
        this.gaugeChartInstance.destroy();
      }
      this.gaugeChartInstance = new Chart(gaugeCtx, {
        type: 'doughnut',
        data: {
          labels: ['Valeur', 'Reste'],
          datasets: [
            {
              data: [value, 100 - value],
              backgroundColor: ['#4cae51', '#eeeeee'],
              cutout: '70%'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          rotation: 0,
          circumference: 360,
          plugins: {
            legend: { display: false }
          }
        }
      });
    },
    async loadSalesData() {
      try {
        let url = `api/sales-productivity/${this.product.id}`;
        if (this.periodFrom && this.periodTo) {
          url += `?period_from=${this.periodFrom}&period_to=${this.periodTo}`;
        }
        const response = await this.axios.get(url);
        const timeline = response.data.data.timeline || [];
        const averages = response.data.data.averages || {};

        // Modification du mapping des labels : utiliser "day" si défini, sinon "period"
        const labels = timeline.map(item => item.day ? item.day : item.period);
        const salesData = timeline.map(item => item.sales_count);

        const maxSales = salesData.length ? Math.max(...salesData) : 0;
        if (maxSales > 0 && averages.average_sales_count !== undefined) {
          this.gaugeValue = Math.round((averages.average_sales_count / maxSales) * 100);
        } else {
          this.gaugeValue = 0;
        }

        this.initLineChart(labels, salesData);
        this.initGaugeChart(this.gaugeValue);
      } catch (error) {
        console.error("Erreur lors de la récupération des données de productivité des ventes :", error);
        this.initLineChart(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], [50, 65, 40, 70, 55, 60, 80]);
        this.initGaugeChart(68);
      }
    }
  },
  mounted() {
    this.loadSalesData();
  }
};
</script>

<style scoped>
/* Conteneur global, fond clair */
.dashboard-container {
  background-color: #f8f9fa;
  min-height: 46vh;
  color: #333;
  font-family: 'Segoe UI', sans-serif;
  padding: 1rem;
}

/* En-tête minimaliste */
.minimal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.product-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}
/* Navbar */
.navbar {
  margin: 0;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
}
.nav-links li {
  cursor: pointer;
  font-weight: 500;
  color: #555;
  transition: color 0.3s;
}
.nav-links li:hover {
  color: #000;
}

/* Carte blanche */
.card-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Section principale */
.main-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}

/* Panneau gauche (graph) */
.left-panel {
  flex: 1;
  position: relative;
  min-width: 320px;
  padding: 1rem;
}
.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}
.line-canvas {
  width: 100%;
  height: 250px !important; /* Hauteur fixe */
  display: block;
  background: transparent;
}

/* Panneau droit (donut + boutons) */
.right-panel {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Donut */
.gauge-container {
  position: relative;
  top: 17px;
  width: 160px;
  height: 160px;
}
.gauge-canvas {
  width: 160px;
  height: 160px;
}
.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #333;
}
.gauge-value {
  font-size: 2.4rem;
  font-weight: 500;
}
.gauge-sub {
  font-size: 0.60rem;
  opacity: 0.7;
}
.btn-primary-lower {
  background-color: #0d6efd;
  border: none;
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-primary-lower:hover {
  background-color: #0b5ed7;
}

/* Adaptation responsive */
@media (max-width: 800px) {
  .main-content {
    flex-direction: column;
  }
  .left-panel, .right-panel {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
