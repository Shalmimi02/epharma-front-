<template>

  <div class="container-recap">


    <button @click="exportToExcel" :disabled="!hasSufficientInvoices || isExporting" :style="[
      {
        padding: '10px 30px',
        position: 'absolute',
        backgroundColor: 'rgb(41 41 41)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        marginLeft: '20px',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
        transition: 'all 0.3s ease',
        top: '8px',
        right: '60px',
      },
      !hasSufficientInvoices
        ? { opacity: '0.5', cursor: 'not-allowed', backgroundColor: '#666666', boxShadow: 'none' }
        : (isExporting ? { cursor: 'wait' } : { opacity: '1', cursor: 'pointer' })
    ]">
      <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status"></span>
      <span v-if="!isExporting">Exporter</span>
      <span v-else> Export...</span>
    </button>

    <div id="recap" style="padding: 20px; font-family: Arial, sans-serif;">
      <!-- Sélecteur de filtre -->
      <div style="margin-bottom: 20px; display: flex; position: relative; top: -7px;">
        <span v-for="filter in ['All', 'Secteur privé', 'Secteur public', 'GEF']" :key="filter"
          @click="changeFilter(filter)" :style="{
            cursor: 'pointer',
            padding: '5px 15px',
            border: selectedFilter === filter ? '1px solid rgb(209 209 209)' : '1px solid #ccc',
            backgroundColor: selectedFilter === filter ? 'rgb(11 80 139)' : '#fff',
            marginRight: '10px',
            color: selectedFilter === filter ? '#fff' : 'rgb(11 80 139)',
            borderRadius: '50px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
          }">
          {{ filter }}
        </span>
      </div>
      <table class="table-responsive table-bordered styled-table w-100"
        style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <!-- Section Facture et Client -->
        <thead>
          <tr>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
          </tr>
        </thead>


        <!-- Section Fonds -->
        <thead class="with-border center-text">
          <tr>
            <th style="border: none;"></th>
            <th style="border: none;"></th>
            <th style="border: none;"></th>
            <th style="border: none;"></th>
            <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 1</th>
            <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 2</th>
            <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 3</th>
          </tr>
        </thead>
        <tbody class="with-border center-text">
          <tr>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
              <!-- Fonds 1: Secteur Privé -->
              <span v-if="selectedFilter === 'All' || selectedFilter === 'Secteur privé'">X</span>
              <span v-else>&nbsp;</span>
            </td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
              <!-- Fonds 2: Secteur Public -->
              <span v-if="selectedFilter === 'All' || selectedFilter === 'Secteur public'">X</span>
              <span v-else>&nbsp;</span>
            </td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
              <!-- Fonds 3: GEF -->
              <span v-if="selectedFilter === 'All' || selectedFilter === 'GEF'">X</span>
              <span v-else>&nbsp;</span>
            </td>
          </tr>
          <tr>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td class="with-border center-text wrap-text" style="border: 1px solid black; padding: 5px;">Secteur Privé
            </td>
            <td class="with-border center-text wrap-text"
              style="border: 1px solid black; padding: 5px; text-align: center;">Agent Publics</td>
            <td class="with-border center-text wrap-text" style="border: 1px solid black; padding: 5px;">GEF</td>
          </tr>
        </tbody>


        <tbody>

          <tr>
            <td style="border: none; height: 20px;">Facture N°: 1</td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
          </tr>
          <tr>
            <td style="border: none; height: 20px;">Client: CNAMGS</td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td class="center-text wrap-text" style="border: none; height: 20px;">NATURE DE LA PRESTATION</td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
          </tr>

        </tbody>

        <!-- Section Nature de la Prestation -->
        <thead class="with-border center-text">
          <tr>
            <th style="border: none;"></th>
            <th style="border: none;"></th>
            <th style="border: none;"></th>
            <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">
              Consultations</th>
            <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">Examens
            </th>
            <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">
              Hospitalisations</th>
            <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">
              Médicaments</th>
          </tr>
        </thead>
        <tbody class="with-border center-text">
          <tr>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td style="border: none;"></td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"><span>&nbsp;</span></td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"><span>&nbsp;</span></td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"><span>&nbsp;</span></td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">X
            </td>
          </tr>
        </tbody>


        <tbody>
          <tr>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
          </tr>
        </tbody>

        <!-- Section Principale -->
        <thead class="with-border center-text">
          <tr style="background-color: #f0f0f0; font-weight: bold;">
            <th class="with-border center-text bold bg-light-gray"
              style="border: 1px solid black; padding: 5px; width: 2%;">NBS</th>
            <th class="with-border center-text bold bg-light-gray"
              style="border: 1px solid black; padding: 5px; width: 5%;">N° Feuilles</th>
            <th class="with-border center-text bold bg-light-gray"
              style="border: 1px solid black; padding: 5px; width: 20%;">Noms et Prénoms</th>
            <th class="with-border center-text bold bg-light-gray"
              style="border: 1px solid black; padding: 5px; width: 10%;">N° Assurés</th>
            <th class="with-border center-text bold bg-light-gray wrap-text"
              style="border: 1px solid black; padding: 5px; width: 10%;">Montant Total Ordonnance</th>
            <th class="with-border center-text bold bg-light-gray wrap-text"
              style="border: 1px solid black; padding: 5px; width: 10%;">Montant à Payer Patient</th>
            <th class="with-border center-text bold bg-light-gray wrap-text"
              style="border: 1px solid black; padding: 5px; width: 10%;">Montant à Payer CNAMGS</th>
          </tr>
        </thead>
        <tbody class="with-border center-text">
          <tr v-if="filteredData.length > 0" v-for="(row, index) in filteredData" :key="index">
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">{{
              index + 1 }}</td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">{{
              row.numero_feuille_assure || "Champ vide" }}</td>
            <td class="with-border text-align-left" style="border: 1px solid black; padding: 5px;">{{ row.nom_assure ||
              "Champ vide" }}</td>
            <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">{{
              row.identifiant_assure || "Champ vide" }}</td>
            <td class="with-border text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat((parseFloat(row.total_prise_en_charge) || 0) + (parseFloat(row.total_client) || 0)) }}</td>
            <td class="with-border text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat(parseFloat(row.total_client) || 0) }}</td>
            <td class="with-border text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat(parseFloat(row.total_prise_en_charge) || 0) }}</td>
          </tr>
          <tr v-else>
            <td class="with-border center-text" colspan="7"
              style="border: 1px solid black; padding: 10px; text-align: center; font-weight: bold; color: red;">
              Aucune vente dans ce secteur !
            </td>
          </tr>
          <tr>
            <td class="with-border text-align-left bold" colspan="4"
              style="border: 1px solid black; padding: 5px; font-weight: bold;">TOTAL</td>
            <td class="with-border  text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat(totalOrdonnance) }}</td>
            <td class="with-border text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat(totalPatient) }}</td>
            <td class="with-border text-align-right" style="border: 1px solid black; padding: 5px; text-align: right;">
              {{ moneyFormat(totalCNAMGS) }}</td>
          </tr>
        </tbody>


        <tfoot>
          <tr colspan="7"></tr>
          <tr>
            <td style="border: none; height: 20px;" class="skip-export" colspan="7">
              <p class="text-align-left bold" v-if="totalCNAMGS > 0"
                style="margin-top: 20px; font-weight: bold; white-space: nowrap; max-width: 200px;">
                Arrêtée la présente facture à la somme de : {{ numberToWords(parseFloat(totalCNAMGS)) }}
              </p>
              <p class="text-align-left bold" v-else
                style="margin-top: 20px; font-weight: bold; color: red; white-space: nowrap; max-width: 300px;">
                Aucune somme disponible pour CNAMGS.
              </p>
            </td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
          </tr>
          <tr>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"> </td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;">
              <p style="text-align: right; margin-top: 20px;">Fait le : {{ getTodayDate() }} </p>
            </td>
            <td style="border: none; height: 20px;"></td>
          </tr>
          <tr>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px;"></td>
            <td style="border: none; height: 20px; ">
              <p style="text-align: right;">Le Responsable</p>
            </td>
          </tr>
        </tfoot>


      </table>
      <!-- <div style="margin-top: 20px;">
        <p class="text-align-left bold" v-if="totalCNAMGS > 0"
          style="margin-top: 20px; font-weight: bold; white-space: nowrap; max-width: 200px;">
          Arrêtée la présente facture à la somme de : {{ numberToWords(parseFloat(totalCNAMGS)) }}
        </p>
        <p class="text-align-left bold" v-else
          style="margin-top: 20px; font-weight: bold; color: red; white-space: nowrap; max-width: 300px;">
          Aucune somme disponible pour CNAMGS.
        </p>
      </div> -->
    </div>
    <RecapTotal :data="allGroupedData" @update-recap="handleRecapDataUpdate" />
  </div>
</template>

<script>


import * as XLSX from "xlsx-js-style";
import RecapTotal from "./RecapTotal.vue";
import moment from "moment"
import "moment/locale/fr"

export default {
  inject: ['dialogRef'],
  components: { RecapTotal },
  data() {
    return {
      datas: this.dialogRef.data,
      totalOrdonnance: 0,
      totalPatient: 0,
      totalCNAMGS: 0,
      selectedFilter: "All", // Valeur par défaut pour afficher toutes les données
      isExporting: false, // Indicateur d'exportation en cours
    };
  },
  computed: {
    // Propriété calculée pour filtrer les données
    filteredData() {
      if (!Array.isArray(this.datas)) {
        return [];
      }
      const validSectors = ['Secteur privé', 'Secteur public', 'GEF'];
      // Ne garder que les ventes dont export_at est null
      const data = this.datas.filter(row => !row.export_at);
      if (this.selectedFilter === "All") {
        return data.filter((row) => validSectors.includes(row.secteur_assure));
      }
      return data.filter(
        (row) =>
          row.secteur_assure &&
          row.secteur_assure.trim().toLowerCase() === this.selectedFilter.trim().toLowerCase()
      );
    },
    // Propriété calculée pour les données groupées complètes (utilisées dans RecapTotal)
    allGroupedData() {
      const validSectors = ['Secteur privé', 'Secteur public', 'GEF'];
      // Ne prendre en compte que les ventes non exportées
      const grouped = this.datas.reduce((acc, row) => {
        if (!row.export_at && row.secteur_assure && validSectors.includes(row.secteur_assure)) {
          if (!acc[row.secteur_assure]) {
            acc[row.secteur_assure] = [];
          }
          acc[row.secteur_assure].push(row);
        }
        return acc;
      }, {});

      // Ne conserver que les secteurs ayant au moins 10 ventes
      const result = [];
      Object.entries(grouped).forEach(([secteur, ventes]) => {
        if (ventes.length >= 10) {
          // Pour chaque secteur, on ne forme que des blocs complets de 10 ventes
          const numChunks = Math.floor(ventes.length / 10);
          for (let i = 0; i < numChunks; i++) {
            const startIndex = ventes.length - (i + 1) * 10; // on prend les ventes les plus récentes
            const endIndex = ventes.length - i * 10;
            const chunk = ventes.slice(startIndex, endIndex);
            // Calcul d'un total (optionnel)
            const total = chunk.reduce((sum, row) => {
              return sum + (parseFloat(row.total_prise_en_charge) || 0);
            }, 0);
            result.push({
              secteur: `${secteur} ${i + 1}`,
              rows: chunk,
              total,
            });
          }
        }
      });
      return result;
    },

    //verification si y a 10 ventes dans un secteur  
    hasSufficientInvoices() {
      // const secteurs = ["Secteur privé", "Secteur public", "GEF"];
      // Ne vérifier que les ventes non exportées
      const nonExportedData = this.datas.filter(row => !row.export_at);

      // Vérifier si un des secteurs a au moins 10 factures
      // for (const secteur of secteurs) {
        const count = nonExportedData.filter(row =>
          row.secteur_assure &&
          row.secteur_assure.trim().toLowerCase() === this.selectedFilter.trim().toLowerCase()
        ).length;

        if (count >= 10) {
          return true;
        }
      // }

      return false;
    },



  },

  methods: {
    // Méthode pour changer la valeur du filtre
    changeFilter(value) {
      this.selectedFilter = value;
    },
    // Fonction pour calculer les totaux
    calculateTotals() {
      if (!Array.isArray(this.filteredData) || this.filteredData.length === 0) {
        this.totalOrdonnance = 0;
        this.totalPatient = 0;
        this.totalCNAMGS = 0;
        return;
      }

      this.totalOrdonnance = this.filteredData.reduce(
        (sum, row) =>
          sum +
          ((parseFloat(row.total_prise_en_charge) || 0) +
            (parseFloat(row.total_client) || 0)),
        0
      );

      this.totalPatient = this.filteredData.reduce(
        (sum, row) => sum + (parseFloat(row.total_client) || 0),
        0
      );

      this.totalCNAMGS = this.filteredData.reduce(
        (sum, row) => sum + (parseFloat(row.total_prise_en_charge) || 0),
        0
      );


    },


    moneyFormat(value) {
      if (value) {
        // Arrondir d'abord la valeur à l'entier le plus proche
        const roundedValue = Math.round(value);
        // Formater sans décimales
        return new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(roundedValue);
      }
      return '0';
    },

    async exportToExcel() {
      this.$confirm.require({
        group: 'headless',
        header: 'Etes-vous sûr?',
        message: 'Les ventes exportées ne seront plus visibles dans le tableau.',
        accept: async () => {
          try {
            this.isExporting = true; // Activer le spinner de chargement
            const workbook = XLSX.utils.book_new(); // Créer un nouveau classeur Excel
            const secteurs = ["Secteur privé", "Secteur public", "GEF"]; // Secteurs pour les feuilles

            // Vérification que tous les tableaux sont chargés
            const isTableLoaded = (selector) => {
              const table = document.querySelector(selector);
              return table && table.querySelectorAll("tr").length > 0;
            };

            if (!isTableLoaded("#recapcomplet") || !isTableLoaded("#recap")) {
              return;
            }

            // Fonction pour appliquer les styles aux cellules dans la feuille Excel
            const applyClassBasedStyles = (worksheet, tableRef) => {
              let table;
              if (typeof tableRef === "string") {
                table = document.querySelector(tableRef);
              } else {
                table = tableRef;
              }
              if (!table) {
                return;
              }

              let rowIndex = 0;
              worksheet["!rows"] = []; // Initialiser les hauteurs des lignes

              table.querySelectorAll("tr").forEach((row) => {
                let colIndex = 0;
                const containsWrapText = Array.from(row.querySelectorAll("td, th")).some((cell) =>
                  cell.textContent.includes("\n") || cell.className.includes("wrap-text")
                );
                worksheet["!rows"].push({ hpx: containsWrapText ? undefined : 22 });

                row.querySelectorAll("td, th").forEach((cell) => {
                  const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
                  const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });

                  // Check if the row should be skipped during export
                  const parentRow = cell.closest('td, th', 'p').parentNode;
                  if (parentRow && parentRow.className.includes('skip-export')) {
                    colIndex += colspan;
                    return;
                  }

                  if (cell.className.trim() === "") {
                    colIndex += colspan;
                    return;
                  }

                  const requiresWrapText = cell.textContent.includes("\n") || cell.className.includes("wrap-text");
                  const fontColor = cell.className.includes("red-text") ? "FF0000" : "000000";
                  const isBold = cell.className.includes("bold");
                  const alignment = cell.className.includes("center-text")
                    ? "center"
                    : cell.className.includes("text-align-right")
                      ? "right"
                      : cell.className.includes("text-align-left")
                        ? "left"
                        : "center";
                  const hasBorder = cell.className.includes("with-border");
                  const backgroundColor = cell.className.includes("bg-light-gray") ? "F0F0F0" : undefined;
                  for (let span = 0; span < colspan; span++) {
                    const currentCellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex + span });
                    const cleanContent = cell.textContent.trim().replace(/\u00A0/g, "");
                    worksheet[currentCellRef] = { v: cleanContent || "" };
                    worksheet[currentCellRef].s = {
                      font: { name: "Arial", color: { rgb: fontColor }, bold: isBold },
                      alignment: { horizontal: alignment, vertical: "center", wrapText: requiresWrapText },
                      fill: backgroundColor ? { patternType: "solid", fgColor: { rgb: backgroundColor } } : undefined,
                      border: hasBorder
                        ? {
                          top: { style: "thin", color: { rgb: "000000" } },
                          bottom: { style: "thin", color: { rgb: "000000" } },
                          left: { style: "thin", color: { rgb: "000000" } },
                          right: { style: "thin", color: { rgb: "000000" } },
                        }
                        : {},
                    };
                  }
                  colIndex += colspan;
                });
                rowIndex += parseInt(row.getAttribute("rowspan") || "1", 10);
              });
            };

            // Ajouter la table principale (Recap 1)
            // const recapTable = document.querySelector("#recapcomplet");
            // if (recapTable) {
            //   const recapWorksheet = XLSX.utils.table_to_sheet(recapTable);
            //   recapWorksheet["!cols"] = [
            //     { wpx: 50 },
            //     { wpx: 150 },
            //     { wpx: 200 },
            //     { wpx: 150 },
            //   ];
            //   applyClassBasedStyles(recapWorksheet, "#recapcomplet");
            //   XLSX.utils.book_append_sheet(workbook, recapWorksheet, "Recap 1");
            // } else {
            //   console.warn("Table Recap 1 non trouvée");
            // }

            // Initialiser un tableau pour accumuler les ventes exportées
            const exportedRows = [];

            // Pour chaque secteur, traiter les ventes par groupes de 10 (groupes complets uniquement)
            
              const secteur = this.selectedFilter
              await this.$nextTick();

              // Obtenir les ventes filtrées pour ce secteur (celles dont export_at est null)
              const sales = this.filteredData;
              // if (sales.length < 10) {
              //   continue;
              // }
              const totalSales = sales.length;
              // On souhaite exporter les ventes de la plus récente à la plus ancienne.
              const numberOfGroups = Math.floor(totalSales / 10);

              for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
                // Pour obtenir les ventes les plus récentes, on calcule le chunk depuis la fin
                const chunk = sales.slice(totalSales - (groupIndex + 1) * 10, totalSales - groupIndex * 10);

                // Créer une copie du tableau #recap pour travailler sur le groupe souhaité
                const table = document.querySelector("#recap");
                if (!table) {
                  continue;
                }
                const tableClone = table.cloneNode(true);

                // Dans le clone, localiser le tbody contenant les ventes.
                // On considère que le dernier <tbody class="with-border center-text"> correspond aux lignes générées par le v-for.
                const tbodies = tableClone.querySelectorAll("tbody.with-border.center-text");
                if (!tbodies || tbodies.length === 0) {
                  continue;
                }
                const dataTbody = tbodies[tbodies.length - 1];

                // Récupérer toutes les lignes du tbody
                const allRows = Array.from(dataTbody.querySelectorAll("tr"));
                if (allRows.length < 2) {
                  continue;
                }
                // La dernière ligne est la ligne TOTAL (on la clone pour la modifier)
                const totalRow = allRows[allRows.length - 1].cloneNode(true);
                // Les lignes de vente (sans la ligne TOTAL)
                const salesRows = allRows.slice(0, allRows.length - 1);
                // Inverser l'ordre pour obtenir les dernières ventes en premier
                const reversedSalesRows = salesRows.slice().reverse();

                // Vérifier que le tbody contient suffisamment de lignes pour ce groupe
                if (reversedSalesRows.length < (groupIndex * 10 + 10)) {
                  continue;
                }

                // Supprimer toutes les lignes du tbody dans le clone
                dataTbody.innerHTML = "";
                // Sélectionner les 10 lignes du groupe (du plus récent au moins récent)
                const chunkRows = reversedSalesRows.slice(groupIndex * 10, groupIndex * 10 + 10);
                chunkRows.forEach((row) => dataTbody.appendChild(row));

                // ** Mise à jour de la colonne NBS **  
                // On parcourt les lignes ajoutées (les 10 lignes) et on remplace la première cellule par le numéro de ligne (1 à 10)
                const dataRowsInClone = dataTbody.querySelectorAll("tr");
                for (let i = 0; i < dataRowsInClone.length; i++) {
                  const cell = dataRowsInClone[i].cells[0];
                  if (cell) {
                    cell.textContent = i + 1; // numérotation de 1 à 10
                  }
                }

                // Recalculer les totaux pour ce groupe en se basant sur le chunk (tableau de 10 ventes)
                let computedTotalOrdonnance = 0;
                let computedTotalPatient = 0;
                let computedTotalCNAMGS = 0;
                chunk.forEach((sale) => {
                  computedTotalOrdonnance += (parseFloat(sale.total_prise_en_charge) || 0) + (parseFloat(sale.total_client) || 0);
                  computedTotalPatient += parseFloat(sale.total_client) || 0;
                  computedTotalCNAMGS += parseFloat(sale.total_prise_en_charge) || 0;
                });

                // Mettre à jour la ligne TOTAL du clone avec les totaux recalculés.
                const totalCells = totalRow.cells;
                if (totalCells.length >= 4) {
                  totalCells[1].textContent = this.moneyFormat(computedTotalOrdonnance);
                  totalCells[2].textContent = this.moneyFormat(computedTotalPatient);
                  totalCells[3].textContent = this.moneyFormat(computedTotalCNAMGS);
                }
                // Réintégrer la ligne TOTAL à la fin
                dataTbody.appendChild(totalRow);

                // Définir le nom de la feuille (ajouter un suffixe si plusieurs groupes existent)
                const sheetName = numberOfGroups > 1 ? `${secteur} ${groupIndex + 1}` : secteur;

                // Créer la feuille Excel à partir du clone modifié
                const worksheet = XLSX.utils.table_to_sheet(tableClone);
                worksheet["!cols"] = [
                  { wpx: 50 },
                  { wpx: 150 },
                  { wpx: 200 },
                  { wpx: 150 },
                ];
                applyClassBasedStyles(worksheet, tableClone);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

                // Accumuler les ventes exportées pour ce groupe
                exportedRows.push(...chunk);
              }


            // Réinitialiser le filtre
            this.selectedFilter = "All";

            // Générer et télécharger le fichier Excel
            const today = new Date();
            const fileName = `factures_par_secteur_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            // Mettre à jour chaque vente exportée en affectant la date du jour à export_at
            const todayFormatted = today.toISOString().split("T")[0]; // format YYYY-MM-DD
            for (const row of exportedRows) {
              try {
                await this.axios.post(`/api/ventes/${row.id}/update`, { export_at: todayFormatted });
                row.export_at = todayFormatted;
              } catch (error) {
                console.error("Erreur lors de la mise à jour de la vente", row.id, error);
              }
            }
          } catch (error) {
            console.error("Erreur durant l'exportation:", error);
            // Gérer l'erreur si nécessaire (afficher un message à l'utilisateur, etc.)
          } finally {
            this.isExporting = false; // Désactiver le spinner quoi qu'il arrive
          }
        }
      });
    },




    numberToWords(number) {
      // Nettoyage des caractères non numériques (sauf . et -)
      let cleaned = String(number).replace(/[^0-9.-]/g, '');
      // Conversion en nombre et arrondi
      let num = Math.round(parseFloat(cleaned)) || 0;


      const units = [
        "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"
      ];
      const teens = [
        "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
        "dix-sept", "dix-huit", "dix-neuf"
      ];
      const tens = [
        "", "", "vingt", "trente", "quarante", "cinquante",
        "soixante", "soixante", "quatre-vingt", "quatre-vingt"
      ];

      const convert = (n) => {
        if (n === 0) return "zéro";
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
          let remainder = n % 10;
          let ten = Math.floor(n / 10);
          if (ten === 7 || ten === 9) {
            return tens[ten] + (remainder === 1 ? "-et-" : "-") + teens[remainder];
          } else {
            return tens[ten] + (remainder === 1 && ten > 1 ? "-et-" : "-") + units[remainder];
          }
        }
        if (n < 1000) {
          let remainder = n % 100;
          let hundred = Math.floor(n / 100);
          return (hundred === 1 ? "cent" : units[hundred] + " cent") +
            (remainder ? " " + convert(remainder) : "");
        }
        if (n < 1000000) {
          let remainder = n % 1000;
          let thousand = Math.floor(n / 1000);
          return (thousand === 1 ? "mille" : convert(thousand) + " mille") +
            (remainder ? " " + convert(remainder) : "");
        }
        return "nombre trop grand";
      };

      return this.capitalize(convert(num).trim());
    },

    // Obtenir la date du jour formatée
    getTodayDate() {
      return moment().locale("fr").format("DD/MM/YYYY")
      // const today = new Date();
      // return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    },
    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }















  },
  watch: {
    // Recalcul des totaux à chaque changement de filtre
    filteredData: {
      handler() {
        this.calculateTotals();
      },
      immediate: true,
    },
  },
  mounted() {

    this.calculateTotals();

  },
};


</script>

<style scoped>
#recap {
  background-color: white;
  width: 100%;
  padding: 20px 10px;
  border-radius: 20px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.container-recap {

  width: 100%;
  bottom: 40px;
  display: flex;
  justify-content: center;
}

th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
</style>
