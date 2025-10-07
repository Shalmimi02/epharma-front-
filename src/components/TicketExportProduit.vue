<template>
  <div>
    <button @click="printTicket" class="export-button">
      <span v-if="!isLoading">
        <i class="fa-solid fa-print mr-1"></i>
        Imprimer L'etiquette
      </span>
      <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';

export default {
  name: 'TicketExportProduit',
  props: {
    productName: { type: String, required: true },
    salePrice:   { type: Number, required: true },
    barcode:     { type: String, required: true },
    quantity:    { type: Number, default: 1 },
    commande:    { type: Number, default: 1 }
  },
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    formattedSalePrice() {
      // Format prix en FCFA
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(this.salePrice);
    }
  },
  methods: {
    getTicketHTML(index) {
      let barcodeDataURL = '';
      try {
        console.log('barcode => ', this.barcode);
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, String(this.barcode), {
          format: 'CODE128',
          displayValue: false,
          width: 2,
          height: 40
        });
        barcodeDataURL = canvas.toDataURL('image/png');
       
      } catch (err) {
        console.error('Erreur génération code-barres : ', err);
      }

      // Date du jour (format dd/mm/yy)
      const today = new Date();
      const formattedDate = today.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });

      return `
        <div class="ticket-container">
          <div class="ticket-body">
            <p class="product-name">${this.productName}</p>
            <p class="extra-info">EFFV B16</p>
            
            <span class="price">${this.formattedSalePrice}</span>
            <div class="barcode-img">
              <img src="${barcodeDataURL}" alt="barcode" />
            </div>
            <div class="barcode-value">${this.barcode}</div>
            <span class="date">${formattedDate}</span>
          </div>
        </div>
      `;
    },

    printTicket() {
      this.isLoading = true;

      // Concatène le HTML de toutes les étiquettes
      let ticketsHTML = '';
      for (let i = 0; i < this.quantity; i++) {
        ticketsHTML += this.getTicketHTML(i);
      }

      const printWindow = window.open('', '', 'width=1000,height=900');
      if (!printWindow || !printWindow.document) {
        console.warn("Fenêtre d'impression bloquée ou introuvable");
        this.isLoading = false;
        return;
      }
      // Définir dynamiquement le titre de la page pour le PDF
      const pageTitle = `Ticket N° ${this.commande} - ${this.productName}`;
      // On déclenche l'impression après un petit délai pour laisser le temps de charger l'image en DataURL
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <title>${pageTitle}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 10px;
                background-color: #fff;
              }
              .tickets-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: flex-start;
              }
              .ticket-container {
                width: 30%;
                min-width: 200px;
                box-sizing: border-box;
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                font-size: 12px;
              }
              .ticket-header {
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
                margin-bottom: 5px;
              }
              .header-line {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
              }
              .ticket-body {
                text-align: left;
              }
              .product-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 2px;
              }
              .extra-info {
                margin-bottom: 2px;
              }
              
              .price {
                font-weight: bold;
                font-size: 24px;
                text-align: center;
                display: block;
                margin: 5px auto;
              }
              .date {
                font-weight: normal;
                float: right;
              }
              /* Empêche l'image du code-barres de déborder */
              .barcode-img img {
                max-width: 100%;
                height: auto;
              }
              .barcode-value {
                font-weight: bold;
                text-align: center;
              }
            </style>
          </head>
          <!-- On attend un court délai avant l'impression -->
          <body onload="setTimeout(() => { window.print(); window.close(); }, 600)">
            <div class="tickets-grid">
              ${ticketsHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.export-button {
  background-color: #0B508C;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: block;
  margin-bottom: 10px;
}

.export-button:hover {
  background-color: #2980b9;
}
</style>
