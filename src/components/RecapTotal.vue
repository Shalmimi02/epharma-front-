<template>
  <div id="recapcomplet" style="display: none;">
    <table class="styled-table" style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <thead>
        <tr>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
        </tr>
      </thead>

      <!-- Section Fonds -->
      <thead class="section-fonds">
        <tr>
          <th style="border: none;"></th>
          <th style="border: none;"></th>
          <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 1</th>
          <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 2</th>
          <th class="with-border center-text bold" style="border: 1px solid black; padding: 5px;">Fonds 3</th>
        </tr>
      </thead>
      <tbody class="section-fonds">
        <tr>
          <td style="border: none;"></td>
          <td style="border: none;"></td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
            <!-- Fonds 1: Secteur Privé -->
            X
          </td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
            <!-- Fonds 2: Secteur Public -->
            X
          </td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">
            <!-- Fonds 3: GEF -->
            X
          </td>
        </tr>
        <tr>
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
        </tr>
        <tr>
          <td style="border: none; height: 20px;">Client: CNAMGS</td>
          <td style="border: none; height: 20px;">NATURE DE LA PRESTATION</td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
        </tr>

      </tbody>

      <!-- Section Nature de la Prestation -->
      <thead class="section-prestation">
        <tr>
          <th style="border: none;"></th>
          <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">
            Consultations</th>
          <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">Examens</th>
          <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">
            Hospitalisations</th>
          <th class="with-border center-text bold wrap-text" style="border: 1px solid black; padding: 5px;">Médicaments
          </th>
        </tr>
      </thead>
      <tbody class="section-prestation">
        <tr>
          <td style="border: none;"></td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"></td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"></td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px;"></td>
          <td class="with-border center-text" style="border: 1px solid black; padding: 5px; text-align: center;">X</td>
        </tr>
      </tbody>


      <tbody>
        <tr>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
        </tr>
      </tbody>

      <!-- Section Principale -->
      <thead>
        <tr>
          <th class="with-border center-text bold bg-light-gray wrap-text" style="width: 5%;">NBS</th>
          <th class="with-border center-text bold bg-light-gray wrap-text" style="width: 20%;">N° Facture</th>
          <th class="with-border center-text bold bg-light-gray wrap-text" style="width: 20%;">Date d'Émission</th>
          <th class="with-border center-text bold bg-light-gray wrap-text" style="width: 35%;">Remboursements</th>
        </tr>
      </thead>

      <!-- Corps du tableau -->
      <tbody>
        <!-- Affiche les 10 premières lignes et s'étend automatiquement si nécessaire -->
        <tr v-for="(row, index) in data" :key="index">
          <td class="with-border center-text" style="width: 5%;">{{ index + 1 }}</td>
          <td class="with-border center-text">{{ row.secteur || "..." }}</td>
          <td class="with-border center-text">{{ row.secteur && row.total ? getTodayDate() : "..." }}</td>
          <td class="with-border center-text">{{ formatCurrency(row.total || 0) }}</td>
        </tr>

        <!-- Ligne pour afficher le total global -->
        <tr style="font-weight: bold;">
          <td class="with-border text-align-left bold" colspan="3" style="text-align: right;">TOTAL GLOBAL</td>
          <td class="with-border center-text">{{ formatCurrency(globalTotal) }}</td>
        </tr>
      </tbody>


      <tfoot>
        <tr>
          <!-- <td style="border: none; height: 20px;" class="skip-export">
            <p class="text-align-left bold" v-if="globalTotal > 0"
              style="margin-top: 20px; font-weight: bold; white-space: nowrap; max-width: 200px;">
              Arrêtée la présente facture à la somme de : {{ globalTotal > 0 ? numberToWords(globalTotal) : "..." }}
            </p>
            <p class="text-align-left bold" v-else
              style="margin-top: 20px; font-weight: bold; color: red; white-space: nowrap; max-width: 300px;">
              Aucune somme disponible pour CNAMGS.
            </p>
          </td> -->
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
        </tr>
        <tr>
          <td style="border: none; height: 20px;"></td>
          <td style="border: none; height: 20px;"></td>
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

        </tr>
        <tr>
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
    <!-- Moved outside the table so it won't be included in export -->
    <div style="margin-top: 20px;">
      <p class="text-align-left bold" v-if="globalTotal > 0"
        style="font-weight: bold; white-space: nowrap; max-width: 200px;">
        Arrêtée la présente facture à la somme de : {{ globalTotal > 0 ? numberToWords(globalTotal) : "..." }}
      </p>
      <p class="text-align-left bold" v-else
        style="font-weight: bold; color: red; white-space: nowrap; max-width: 300px;">
        Aucune somme disponible pour CNAMGS.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array, // Vérifiez le type des données attendues
      required: true, // Indique que cette prop est obligatoire
    },
  },
  computed: {



    // Calculer le total global basé sur les données groupées
    globalTotal() {
      const total = this.data.reduce((sum, group) => sum + group.total, 0);
      return total;
    },





  },
  methods: {
    formatCurrency(value) {
      return value
        ? new Intl.NumberFormat("fr-FR", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
        : "0";
    },
    getTodayDate() {
      const today = new Date();
      return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    },
    numberToWords(number) {
      number = parseInt(number) || 0; // Convertir en nombre ou 0 si invalide

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

      return this.capitalize(convert(number).trim());
    },
    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  },
  mounted() {
    this.$emit("update-recap", this.formattedData);
    console.log("Données reçues dans le composant enfant :", this.data);


  },


};
</script>

<style scoped>
.styled-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;
  border: 1px solid black;
}

.styled-table th,
.styled-table td {
  padding: 8px;
  border: 1px solid black;
  text-align: center;
}
</style>