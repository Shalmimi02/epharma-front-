<template>
  <EpharmaTemplate>
    <template #page_title>STATISTIQUES</template>
    <template #page_counter>
      <i class="fa-solid fa-chart-simple" style="font-size: 25px;"></i>
    </template>
    <template #content>
      <div class="container">
        <!-- Filtre Périodique -->
        <div class="d-flex justify-content-center my-3">
          <div class="btn-group" role="group" aria-label="Filter Period">
            <button type="button" class="btn"
              :class="{ 'btn-primary': pendingTypePeriode === 'JOURNALIERE', 'btn-light': pendingTypePeriode !== 'JOURNALIERE' }"
              @click="changePeriod('JOURNALIERE')">
              Journalière
            </button>
            <button type="button" class="btn"
              :class="{ 'btn-primary': pendingTypePeriode === 'HEBDOMADAIRE', 'btn-light': pendingTypePeriode !== 'HEBDOMADAIRE' }"
              @click="changePeriod('HEBDOMADAIRE')">
              Hebdomadaire
            </button>
            <button type="button" class="btn"
              :class="{ 'btn-primary': pendingTypePeriode === 'MENSUEL', 'btn-light': pendingTypePeriode !== 'MENSUEL' }"
              @click="changePeriod('MENSUEL')">
              Mensuel
            </button>
          </div>
        </div>
        <!-- Sélection de la période et Limite -->
        <div class="card mb-4">
          <div class="card-body">
            <!-- Sélection de la période selon TypePeriode -->
            <div v-if="pendingTypePeriode === 'JOURNALIERE'" class="row">
              <div class="col-md-6 mb-3">
                <label for="debut">Date de début</label>
                <input type="date" id="debut" v-model="filterForm.debut" class="form-control" placeholder="à définir" />
              </div>
              <div class="col-md-6 mb-3">
                <label for="fin">Date de fin</label>
                <input type="date" id="fin" v-model="filterForm.fin" class="form-control" placeholder="à définir" />
              </div>
            </div>

            <div v-else-if="pendingTypePeriode === 'HEBDOMADAIRE'" class="row">
              <div class="col-md-6 mb-3">
                <label for="week">Semaine</label>
                <input type="week" id="week" v-model="filterForm.week" class="form-control" placeholder="à définir" />
              </div>
            </div>

            <div v-else-if="pendingTypePeriode === 'MENSUEL'" class="row">
              <div class="col-md-6 mb-3">
                <label for="month">Mois</label>
                <input type="month" id="month" v-model="filterForm.month" class="form-control"
                  placeholder="à définir" />
              </div>
            </div>

            <!-- Sélecteur de Limite -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="limit">Nombre de produits à afficher</label>
                <select id="limit" v-model.number="filterForm.limit" class="form-control">
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
              <!-- Bouton Réinitialiser -->
              <div class="col-md-6 mb-3 d-flex align-items-end">
                <button class="btn btn-secondary w-100" @click="resetFilters">
                  Réinitialiser <i class="fas fa-undo"></i>
                </button>
              </div>
            </div>

            <!-- Bouton Valider -->
            <div class="text-center mt-3">
              <button class="btn btn-primary" @click="applyFilters">Valider</button>
            </div>
          </div>
        </div>

        <div class="card">
          <TabView v-model:activeIndex="activeIndex" @tab-change="onTabChange">
            <!-- Onglet Produits -->
            <TabPanel header="Produits">
              <div v-if="loadedTabs[0]">
                <div class="d-flex mb-3 row">
                  <div class="col-md-6">
                    <h3>Produits les plus vendus</h3>
                    <ProduitVendus ref="produitVendusChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                  <div class="col-md-6">
                    <h3>Produits les moins vendus</h3>
                    <ProduitMoinsVendus ref="produitMoinsVendusChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                </div>
                <div class="d-flex mb-3">
                  <div class="col-md-6">
                    <QteVenteProduit ref="qteVenteProduitChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                  <div class="col-md-6">
                    <QteVentesAnnulees ref="qteVentesAnnuleesChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Inventaire -->
            <TabPanel header="Inventaire">
              <div v-if="loadedTabs[1]">
                <div class="mt-3">
                  <QteDernierInventaire ref="qteDernierInventaireChart" :filters="currentFilters"
                    :period="TypePeriode" />
                </div>
                <div class="mt-3">
                  <DiffDernierInventaire ref="diffDernierInventaireChart" :filters="currentFilters"
                    :period="TypePeriode" />
                </div>
                <div class="mt-3">
                  <StatistiqueAchat ref="statistiqueAchatChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
                <div class="mt-3">
                  <MargeAchat ref="margeAchatChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Utilisateurs -->
            <TabPanel header="Utilisateurs">
              <div v-if="loadedTabs[2]">
                <div class="row mt-3">
                  <div class="col-md-4">
                    <ChiffreAffaireUtilisateur ref="chiffreAffaireUtilisateurChart" :filters="currentFilters"
                      :period="TypePeriode" />
                  </div>
                  <div class="col-md-8">
                    <StatPanierMoyenUser ref="statPanierMoyenUserChart" :filters="currentFilters"
                      :period="TypePeriode" />
                  </div>
                </div>
                <div class="mt-4">
                  <StatClientServis ref="statClientServisChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Chiffre d'Affaire -->
            <TabPanel header="Chiffre d'Affaires">
              <div v-if="loadedTabs[3]">
                <h3 class="text-center my-3">Évolution du chiffre d'affaires</h3>
                <div class="d-flex justify-content-center mb-3">
                  <ChiffreAffaire ref="chiffreAffaireChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
              </div>
            </TabPanel>

            <!-- NOUVEAUX ONGLETS -->

            <!-- Onglet Analyse des ventes -->
            <TabPanel header="Analyse des ventes">
              <div v-if="loadedTabs[4]">
                <div class="row mt-3">
                  <div class="col-md-6">
                    <EvolutionVentes ref="evolutionVentesChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                  <div class="col-md-6">
                    <VentesParCategorie ref="ventesParCategorieChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Gestion des stocks -->
            <TabPanel header="Gestion des stocks">
              <div v-if="loadedTabs[5]">
                <div class="row mt-3">
                  <div class="col-md-6">
                    <ValeurStocks ref="valeurStocksChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                  <div class="col-md-6">
                    <ProduitsObsoletes ref="produitsObsoletesChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                </div>
                <div class="mt-4">
                  <PlanificationReapprovisionnement ref="planificationReapproChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Analyse financière -->
            <TabPanel header="Analyse financière">
              <div v-if="loadedTabs[6]">
                <div class="row mt-3">
                  <div class="col-md-6">
                    <MargeBruteMensuelle ref="margeBruteChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                  <div class="col-md-6">
                    <MargeNette ref="margeNetteChart" :filters="currentFilters" :period="TypePeriode" />
                  </div>
                </div>
              </div>
            </TabPanel>

            <!-- Onglet Performances employés -->
            <TabPanel header="Performances employés">
              <div v-if="loadedTabs[7]">
                <div class="mt-3">
                  <VentesParEmploye ref="ventesParEmployeChart" :filters="currentFilters" :period="TypePeriode" />
                </div>
              </div>
            </TabPanel>

          </TabView>
        </div>
      </div>
    </template>
  </EpharmaTemplate>
</template>

<script>
import Chart from "chart.js/auto";
Chart.defaults.animation = false; // Désactivation globale des animations

// IMPORTS DES COMPOSANTS (statistiques, graphiques, etc.)
import ChiffreAffaire from "./chiffrAffaire/ChiffreAffaire.vue";
import ProduitVendus from "./produits/ProduitVendus.vue";
import ProduitMoinsVendus from "./produits/ProduitMoinsVendus.vue";
import QteVenteProduit from "./produits/QteVenteProduit.vue";
import QteVentesAnnulees from "./produits/QteVentesAnnulees.vue";
import QteDernierInventaire from "./inventaire/QteDernierInventaire.vue";
import DiffDernierInventaire from "./inventaire/DiffDernierInventaire.vue";
import StatistiqueAchat from "./inventaire/StatistiqueAchat.vue";
import MargeAchat from "./inventaire/MargeAchat.vue";
import ChiffreAffaireUtilisateur from "./utilisateur/ChiffreAffaireUtilisateur.vue";
import StatPanierMoyenUser from "./utilisateur/StatPanierMoyenUser.vue";
import StatClientServis from "./utilisateur/StatClientServis.vue";

// NOUVEAUX COMPOSANTS STATISTIQUES
import EvolutionVentes from "./ventes/EvolutionVentes.vue";
import VentesParCategorie from "./ventes/VentesParCategorie.vue";
import ValeurStocks from "./ventes/ValeurStocks.vue";
import ProduitsObsoletes from "./stocks/ProduitsObsoletes.vue";
import MargeBruteMensuelle from "./financier/MargeBruteMensuelle.vue";
import MargeNette from "./financier/MargeNette.vue";
import VentesParEmploye from "./employes/VentesParEmploye.vue";
import PlanificationReapprovisionnement from "./stocks/PlanificationReapprovisionnement.vue";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

export default {
  components: {
    ChiffreAffaire,
    ProduitVendus,
    ProduitMoinsVendus,
    QteDernierInventaire,
    DiffDernierInventaire,
    QteVenteProduit,
    QteVentesAnnulees,
    StatistiqueAchat,
    MargeAchat,
    ChiffreAffaireUtilisateur,
    StatPanierMoyenUser,
    StatClientServis,
    // Nouveaux composants
    EvolutionVentes,
    VentesParCategorie,
    ValeurStocks,
    ProduitsObsoletes,
    MargeBruteMensuelle,
    MargeNette,
    VentesParEmploye,
    PlanificationReapprovisionnement,
    TabView,
    TabPanel
  },
  data() {
    return {
      chartData: null,
      chartOptions: null,
      TypePeriode: "JOURNALIERE", // Période effective utilisée par les composants enfants
      // Période en cours de sélection (qui changera dès qu'on clique sur un bouton)
      pendingTypePeriode: "JOURNALIERE",
      filterForm: {
        debut: "",
        fin: "",
        week: "",
        month: "",
        limit: 20 // Limite par défaut
      },
      currentFilters: {}, // Initialement vide, pour n'appliquer les filtres qu'après validation
      lastFilters: null,
      dataLoaded: true, // On passe à true pour autoriser l'update initiale des graphiques
      activeIndex: 0, // Onglet actif initialement
      loadedTabs: [true, false, false, false, false, false, false, false] // 8 onglets au total
    };
  },
  mounted() {
    this.chartData = this.setChartData();
    this.chartOptions = this.setChartOptions();
    this.lastFilters = { ...this.filterForm };
  },
  watch: {
    activeIndex(newVal) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.dataLoaded) {
            this.updateChartsForTab(newVal);
          }
        }, 200);
      });
    }
  },
  methods: {
    updateChartsForTab(tabIndex) {
      switch(tabIndex) {
        case 0: // Produits
          this.updateChart(this.$refs.produitVendusChart);
          this.updateChart(this.$refs.produitMoinsVendusChart);
          this.updateChart(this.$refs.qteVenteProduitChart);
          this.updateChart(this.$refs.qteVentesAnnuleesChart);
          break;
        case 1: // Inventaire
          this.updateChart(this.$refs.qteDernierInventaireChart);
          this.updateChart(this.$refs.diffDernierInventaireChart);
          this.updateChart(this.$refs.statistiqueAchatChart);
          this.updateChart(this.$refs.margeAchatChart);
          break;
        case 2: // Utilisateurs
          this.updateChart(this.$refs.chiffreAffaireUtilisateurChart);
          this.updateChart(this.$refs.statPanierMoyenUserChart);
          this.updateChart(this.$refs.statClientServisChart);
          break;
        case 3: // Chiffre d'affaires
          this.updateChart(this.$refs.chiffreAffaireChart);
          break;
        case 4: // Analyse des ventes
          this.updateChart(this.$refs.evolutionVentesChart);
          this.updateChart(this.$refs.ventesParCategorieChart);
          break;
        case 5: // Gestion des stocks
          this.updateChart(this.$refs.valeurStocksChart);
          this.updateChart(this.$refs.produitsObsoletesChart);
          this.updateChart(this.$refs.planificationReapproChart);
          break;
        case 6: // Analyse financière
          this.updateChart(this.$refs.margeBruteChart);
          this.updateChart(this.$refs.margeNetteChart);
          break;
        case 7: // Performances employés
          this.updateChart(this.$refs.ventesParEmployeChart);
          break;
      }
    },
    updateChart(chartRef) {
      if (chartRef && !chartRef.error && typeof chartRef.updateChart === "function") {
        chartRef.updateChart();
      }
    },
    checkUrlFormat(link) {
      if (link !== undefined && link.includes("?")) link = link + "&";
      else link = link + "?";
      return link;
    },
    changePeriod(newPeriod) {
      if (this.pendingTypePeriode !== newPeriod) {
        // Réinitialiser le filtre à des valeurs vides (toutes les dates sont vidées)
        this.filterForm = {
          debut: "",
          fin: "",
          week: "",
          month: "",
          limit: 20
        };
        this.lastFilters = { ...this.filterForm };
        this.dataLoaded = false;
        this.pendingTypePeriode = newPeriod;
      }
    },
    applyFilters() {
      // Vérifier que le formulaire a changé par rapport aux derniers filtres validés.
      if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.filterForm))
        return;

      // Conversion et application des filtres en fonction du formulaire et de la période en cours de sélection
      this.currentFilters = this.convertFilters(this.filterForm, this.pendingTypePeriode);
      this.lastFilters = { ...this.filterForm };

      // Mettre à jour la période effective (utilisée par les composants enfants)
      this.TypePeriode = this.pendingTypePeriode;

      this.dataLoaded = true;
    },

    resetFilters() {
      // Réinitialiser le filtre à des valeurs vides en fonction de la période sélectionnée
      this.filterForm = {
        debut: "",
        fin: "",
        week: "",
        month: "",
        limit: 20
      };
      this.currentFilters = this.convertFilters(this.filterForm, this.TypePeriode);
      this.lastFilters = { ...this.filterForm };
      this.dataLoaded = false;
    },
    // Convertit les filtres en ajoutant period_from et period_to selon le type de période
    convertFilters(filterForm, periodType) {
      let period_from = "";
      let period_to = "";
      if (periodType === 'JOURNALIERE') {
        period_from = filterForm.debut ? filterForm.debut : "";
        period_to = filterForm.fin ? filterForm.fin : "";
      } else if (periodType === 'HEBDOMADAIRE') {
        if (filterForm.week) {
          const week = filterForm.week;
          const startDate = this.getDateOfISOWeek(week, 1); // Lundi
          const endDate = this.getDateOfISOWeek(week, 7);   // Dimanche
          period_from = startDate.toISOString().slice(0, 10);
          period_to = endDate.toISOString().slice(0, 10);
        }
      } else if (periodType === 'MENSUEL') {
        if (filterForm.month) {
          const [year, month] = filterForm.month.split('-');
          period_from = `${year}-${month}-01`;
          const lastDay = new Date(year, parseInt(month), 0);
          period_to = lastDay.toISOString().slice(0, 10);
        }
      }
      let updatedFilters = { ...filterForm, period_from, period_to };
      if (periodType !== 'JOURNALIERE') {
        updatedFilters.debut = period_from;
        updatedFilters.fin = period_to;
      }
      return updatedFilters;
    },
    // Retourne la date ISO d'un jour spécifique d'une semaine donnée
    getDateOfISOWeek(isoWeekString, dayOfWeek) {
      const parts = isoWeekString.split('-W');
      if (parts.length < 2) return new Date();
      const [yearPart, weekPart] = parts;
      const year = parseInt(yearPart);
      const week = parseInt(weekPart);
      const jan4 = new Date(year, 0, 4);
      let dayOfWeekJan4 = jan4.getDay();
      if (dayOfWeekJan4 === 0) dayOfWeekJan4 = 7;
      const mondayOfWeek1 = new Date(jan4);
      mondayOfWeek1.setDate(jan4.getDate() - dayOfWeekJan4 + 1);
      const mondayOfWeek = new Date(mondayOfWeek1);
      mondayOfWeek.setDate(mondayOfWeek.getDate() + (week - 1) * 7);
      const result = new Date(mondayOfWeek);
      result.setDate(mondayOfWeek.getDate() + (dayOfWeek - 1));
      return result;
    },
    onTabChange(e) {
      this.activeIndex = e.index;
      this.loadedTabs[e.index] = true;
    },
    setChartData() {
      const documentStyle = getComputedStyle(document.documentElement);
      return {
        labels: ["TVA", "CSS", "Achat", "Benefice"],
        datasets: [
          {
            label: "Premier chiffre d'affaire",
            data: [540, 325, 702, 500],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue("--cyan-400"),
              documentStyle.getPropertyValue("--orange-400"),
              documentStyle.getPropertyValue("--gray-400")
            ],
            backgroundColor: documentStyle.getPropertyValue("--cyan-500"),
            borderColor: documentStyle.getPropertyValue("--cyan-500"),
            borderWidth: 1
          },
          {
            label: "Second chiffre d'affaire",
            backgroundColor: documentStyle.getPropertyValue("--gray-500"),
            borderColor: documentStyle.getPropertyValue("--gray-500"),
            data: [28, 48, 40, 19],
            borderWidth: 1
          }
        ]
      };
    },
    setChartOptions() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue("--text-color-secondary");
      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");
      return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              usePointStyle: true
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      };
    }
  }
};
</script>

<style scoped>
.container {
  margin: 0 auto;
}

.btn {
  border-radius: 20px;
  border: solid 1px #e4e4e4;
  padding: 10px 20px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
}

.btn-primary {
  background-color: rgb(11, 80, 140);
  color: white;
}

.btn-light {
  background-color: #f8f9fa;
  color: #6c757d;
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

.error-container p {
  color: red;
  margin-bottom: 10px;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
