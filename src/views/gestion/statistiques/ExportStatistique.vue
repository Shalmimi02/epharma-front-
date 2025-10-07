<template>
  <div>
    <!-- Skeleton Loader affiché tant que les données ne sont pas chargées -->
    <div v-if="!isDataLoaded">
      <SkeletonLoader />
    </div>

    <!-- Contenu réel affiché une fois les données chargées -->
    <div v-else>
      <h3 class="text-center">{{ datas.title }}</h3>
      <div class="ligneText text-right mb-2">
        Nombre de lignes : <strong>{{ datas.rows.length }}</strong>
      </div>
      <table class="table table-striped with-border" id="statTable">
        <thead>
          <tr>
            <th class="bg-light-gray text-center" colspan="2">{{ datas.title }}</th>
          </tr>
          <tr>
            <th class="bold with-border" v-for="col in datas.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in datas.rows" :key="index">
            <td class="with-border" v-for="col in datas.columns" :key="col">
              <!-- Vérifier si la valeur est numérique pour appliquer le formatage -->
              {{ isNaN(row[col]) ? row[col] : formatNumber(row[col]) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="bold center-text with-border">
              {{ datas.title === 'Quantité Ventes Annulées' ? 'QTE VENTE' : 'TOTAL' }}
            </td>
            <td class="bold center-text with-border">
              {{ datas.title === 'Quantité Ventes Annulées' ? datas.rows.length : formatNumber(totalSum) }}
            </td>
          </tr>
        </tfoot>
      </table>
      <div class="text-right mt-3">
        <button class="btn btn-primary d-flex align-items-center justify-content-center" @click="exportToExcel"
          :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
          <span>{{ isLoading ? "Chargement..." : "Exporter" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import * as XLSX from "xlsx-js-style";
import SkeletonLoader from "./SkeletonLoader.vue";
// Objet pour stocker les modals déjà chargés
const loadedModals = {};

export default {
  name: "ExportStatistique",
  components: {
    SkeletonLoader,
  },
  inject: ["dialogRef"],
  props: {
    dataTable: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      datas: this.dialogRef.data,
      isLoading: false,
      isDataLoaded: false,
    };
  },
  computed: {
    totalSum() {
      return this.datas.rows.reduce((sum, row) => {
        const value = parseFloat(row[this.datas.columns[1]]) || 0;
        return sum + value;
      }, 0);
    },
  },
  methods: {
    formatNumber(value) {
      if (this.isNumeric(value)) {
        // Convertir en nombre, arrondir et retirer les virgules
        const numValue = parseFloat(value.toString().replace(',', '.'));
        return Math.round(numValue);
      }
      return value; // Retourner la valeur d'origine si ce n'est pas un nombre
    },
    isNumeric(value) {
      // Vérifier si la valeur peut être convertie en nombre valide
      if (value === null || value === undefined || value === '') return false;
      const numValue = value.toString().replace(',', '.');
      return !isNaN(parseFloat(numValue)) && isFinite(numValue);
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async loadData() {
      // Vérifie si le modal a déjà été chargé
      if (loadedModals[this.datas.title]) {
        this.isDataLoaded = true;
        return;
      }

      // Simule le chargement des données
      await this.sleep(1500);

      // Marquer le modal comme chargé
      loadedModals[this.datas.title] = true;
      this.isDataLoaded = true;
    },
    async exportToExcel() {
      this.isLoading = true;

      try {
        await this.sleep(1500);

        const table = document.querySelector("#statTable");
        if (!table || table.querySelectorAll("tr").length === 0) {
          console.warn("Les données ne sont pas entièrement chargées.");
          this.isLoading = false;
          return;
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.table_to_sheet(table);

        worksheet["!cols"] = [
          { wpx: 200 },
          { wpx: 100 },
        ];

        table.querySelectorAll("tr").forEach((row, rowIndex) => {
          row.querySelectorAll("td, th").forEach((cell, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (!worksheet[cellRef]) worksheet[cellRef] = { v: "" };

            const isBold = cell.classList.contains("bold");
            const alignment = cell.classList.contains("center-text")
              ? "center"
              : cell.classList.contains("text-align-right")
                ? "right"
                : "left";
            const hasBorder = cell.classList.contains("with-border");
            const backgroundColor = cell.classList.contains("bg-light-gray")
              ? "F0F0F0"
              : undefined;

            worksheet[cellRef].s = {
              font: {
                name: "Arial",
                sz: 12,
                bold: isBold,
              },
              alignment: {
                horizontal: alignment,
                vertical: "center",
                wrapText: true,
              },
              fill: backgroundColor
                ? {
                  patternType: "solid",
                  fgColor: { rgb: backgroundColor },
                }
                : undefined,
              border: hasBorder
                ? {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } },
                }
                : undefined,
            };
          });
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, this.datas.title);
        const currentDate = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `${this.datas.title}_${currentDate}.xlsx`);
      } catch (error) {
        console.error("Erreur lors de l'exportation :", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.loadData();
  },
};

</script>

<style scoped>
.skeleton-loader {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}

.skeleton-header {
  height: 24px;
  width: 50%;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-row {
  height: 18px;
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 12px;
}

.spinner-border {
  margin-right: 10px;
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.btn {
  position: absolute;
  right: 44px;
  top: 9px;
  padding: 10px 25px;
  font-size: 16px;
  font-weight: bold;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.table th {
  background-color: #f4f4f4;
}

.bold {
  font-weight: bold;
}

.text-align-right {
  text-align: right;
}

.with-border {
  border: 1px solid #000;
}

.bg-light-gray {
  background-color: #f9f9f9;
}
</style>
