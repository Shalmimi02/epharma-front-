<template>
  <!-- Container du ticket, masqué par défaut (pas besoin de v-show="false" ici) -->
  <div class="container" ref="ticket_caisse" style="display: none;">
    <!-- Première section : Logo et Infos de la Pharmacie -->
    <div class="info-client section center ">
      <img v-if="$store.getters.pharmacie.logo" :src="$store.getters.pharmacie.logo" alt="logo_pharmacie"
        id="logo_pharmacie" class="rounded mb-3" style="width: 100px" />
      <!-- <p class="center" style="padding: 20px;">
        {{ getInfoPharmacie }}
      </p> -->
      <div>
        <strong>{{ $store.getters.pharmacie.nom_pharmacie }}.</strong><br />
        <span v-if="$store.getters.pharmacie.adresse">| {{ $store.getters.pharmacie.adresse }}</span>
        <span v-if="$store.getters.pharmacie.bp">| {{ $store.getters.pharmacie.bp }}</span>
        <span v-if="$store.getters.pharmacie.telephone1">| {{ $store.getters.pharmacie.telephone1 }}</span>
        <span v-if="$store.getters.pharmacie.telephone2">| {{ $store.getters.pharmacie.telephone2 }}</span>
        <span v-if="$store.getters.pharmacie.email">| {{ $store.getters.pharmacie.email }} <br /></span>
        <span v-if="$store.getters.pharmacie.rccm">| {{ $store.getters.pharmacie.rccm }} </span>
        <span v-if="$store.getters.pharmacie.nif">| {{ $store.getters.pharmacie.nif }} </span>
      </div>
    </div>

    <!-- Deuxième section : Infos de l’Assuré -->
    <div class="section ticket-styled" v-if="reservation.client !== 'COMPTANT'">
      <h4>Informations du client</h4>
      <p>
        Nom : {{ reservation.client }}<br />
        <span v-if="reservation.identifiant_assure">
          Numéro Assuré : {{ reservation.identifiant_assure }}<br />
        </span>
        <span v-if="reservation.secteur_assure">
          Secteur : {{ reservation.secteur_assure }}<br />
        </span>
        <span v-if="reservation.numero_feuille_assure">
          N° feuille : {{ reservation.numero_feuille_assure }}<br />
        </span>
      </p>
    </div>

    <!-- Troisième section : Détails de la Caisse -->
    <div class="section ticket-styled">
      <h4>Détails de la Caisse</h4>
      <p>
        Numéro : {{ reservation.position }}<br />
        Date :
        {{ currentDate }}<br />
        Vendeur(se) : {{ reservation.created_by }}<br />
        <span v-if="caisse.libelle !== 'Default'">
          Caisse : {{ caisse.libelle }} ({{ $store.getters.user.fullname }})
        </span>
      </p>
    </div>

    <!-- Quatrième section : Liste des Médicaments -->
    <div class="section ticket-styled">
      <h4>Liste des Médicaments</h4>
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>P.U</th>
            <th>Coût</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in reservation_produits" :key="index">
          <tr>
            <td class="product-name">{{ item.libelle }}</td>
            <td >{{ item.qte }}</td>
            <td>{{ moneyFormat(item.prix_de_vente) }}</td>
            <td>{{ moneyFormat(item.prix_de_vente * item.qte)}}</td>
          </tr>
          <tr v-if="showPosologie && getPosologie(item)">
            <td colspan="4" class="posologie-text">
              Posologie : <small>{{ getPosologie(item) }}</small>
            </td>
          </tr>
        </template>
        </tbody>
      </table>

      <!-- Total Section -->
      <div class="total-section ticket-styled">
        <table>
          <thead>
            <tr>
              <th colspan="6">Total TTC</th>
              
              <td>
                {{ moneyFormat((parseFloat(reservation.total)).toFixed(2)) }}
              </td>
            </tr>
            <tr v-if="parseFloat(reservation.remise) > 1">
              <th colspan="6">Remise</th>
              
              <td>{{ (parseFloat(reservation.remise)).toFixed(2) }}</td>
            </tr>
            <tr v-if="reservation.client !== 'COMPTANT'
              && parseFloat(reservation.total_prise_en_charge) > 0">
              <th colspan="6">Prise en Charge</th>
              
              <td>{{ moneyFormat(reservation.total_prise_en_charge) }}</td>
            </tr>
            <tr v-if="parseFloat(reservation.remise) > 1
              || parseFloat(reservation.total_prise_en_charge) > 0">
              <th colspan="6">Ticket Modérateur</th>
              
              <td>
                {{ moneyFormat((parseFloat(reservation.montant)).toFixed(2)) }}
              </td>
            </tr>
            <tr v-if="reservation.amount_gived || amount_gived">
              <th colspan="6">Montant Reçu</th>
              <td>
                {{ moneyFormat(amount_gived || reservation.amount_gived ) }}
              </td>
            </tr>
            <tr v-if="reservation.amount_gived || amount_gived">
              <th colspan="6">Différence</th>
              
              <td>
                {{
                  amount_gived > 0
                    ? moneyFormat(difference)
                    : moneyFormat((parseFloat(reservation.amount_gived) - parseFloat(reservation.montant)).toFixed(2))
                }}
              </td>
            </tr>

          </thead>
          <div class="watermark" v-if="reservation.printed_at">
            DUPLICATA
          </div>
        </table>
      </div>
    </div>

    <!-- Cinquième section : Slogan de la Pharmacie -->
    <p class="section center slogan" v-if="$store.getters.pharmacie.slogan" style="margin-bottom: 20px;">
      "{{ $store.getters.pharmacie.slogan }}"
    </p>

    <div id="overlay" class="overlay "></div>
    <!-- Si la réservation a déjà une date de 'printed_at', on affiche le watermark DUPLICATA -->


    <!-- <div class="footer">
      <strong>{{ $store.getters.pharmacie.nom_pharmacie }}.</strong><br />
      {{ $store.getters.pharmacie.adresse }} | BP: <br />
      TEL: {{ $store.getters.pharmacie.telephone1 }} / {{ $store.getters.pharmacie.telephone2 }} |
      Email: {{ $store.getters.pharmacie.email }}<br />
      {{ $store.getters.pharmacie.rccm }}
      <span v-if="$store.getters.pharmacie.nif">| </span> {{ $store.getters.pharmacie.nif }}
    </div> -->
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TicketPrinter',
  props: {
    reservation: { type: Object, required: true },
    reservation_produits: { type: Array, required: true },
    amount_gived: { type: [Number, String] },
    difference: { type: String, default: 0 },
    caisse: { type: Object, default: () => ({ libelle: 'Default' }) },
    showPosologie: { type: Boolean, default: true },
  },
  computed: {
    currentDate() {
      return new Date().toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    getInfoPharmacie() {
      let infos = 'Pharmacie ';
      const pharm = this.$store.getters.pharmacie;
      if (pharm?.nom_pharmacie) {
        infos = pharm.nom_pharmacie + ' | ';
      }
      // Ajoutez d’autres champs si nécessaire
      return infos;
    },
  },
  methods: {
    // Nouvelle méthode pour récupérer la posologie de manière sécurisée
    getPosologie(item) {
      if (!item) return null;
      
      // Essayer différents chemins possibles pour la posologie
      try {
        // Chemin 1: item.reservation_produits?.produit?.posologie
        if (item.produit?.posologie) {
          return item.produit.posologie;
        }
        if (item.reservation_produits?.produit?.posologie){
          return item.reservation_produits?.produit?.posologie;
        }
        return null;
      } catch (error) {
        console.warn('Erreur lors de la récupération de la posologie:', error);
        return null;
      }
    },
    moneyFormat(value) {
      // Conversion robuste en nombre
      let numberValue = 0;
      
      if (value !== null && value !== undefined && value !== '') {
        numberValue = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : parseFloat(value);
      }
      
      if (isNaN(numberValue)) {
        numberValue = 0;
      }
      
      // Format avec séparateurs de milliers
      return Math.round(numberValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
    printReceipt() {
      // Vérifie que la référence existe
      if (!this.$refs.ticket_caisse) {
        console.warn('ticket_caisse introuvable, composant non monté');
        return;
      }

      // Ouvre la fenêtre d’impression
      const printWindow = window.open('', '', 'width=1000,height=900');
      if (!printWindow || !printWindow.document) {
        console.warn('Fenêtre d\'impression bloquée ou introuvable');
        return;
      }

      const receiptContent = this.$refs.ticket_caisse.innerHTML;

      // Charger le contenu et les styles dans la nouvelle fenêtre
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <title>Ticket de Caisse</title>
            <style>
              /* Styles optimisés pour l'impression - Meilleure visibilité */
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #fff;
                color: #000;
                font-weight: 500; /* Texte plus épais */
                -webkit-print-color-adjust: exact; /* Force l'impression des couleurs */
                print-color-adjust: exact;
              }
              
              /* Amélioration générale de la visibilité */
              * {
                color: #000 !important; /* Force le noir pour tous les textes */
                font-weight: 600 !important; /* Texte plus épais partout */
              }
              
              .container {
                width: 350px;
                background-color: #fff;
                margin: 0 auto;
                padding: 20px;
                
              }
              
              /* Style pour la posologie - Amélioré pour l'impression */
              .posologie-text {
                color: #333 !important; /* Plus foncé que #6c757d */
                font-style: italic;
                font-size: 0.85em !important;
                font-weight: 600 !important; /* Plus épais */
                padding: 4px 6px !important;
                border-bottom: none !important;
                background-color: #f0f0f0 !important; /* Plus visible */
                opacity: 1 !important; /* Opacité complète */
                line-height: 1.2;
              }
              
              .posologie-text small {
                font-size: 0.9em;
                line-height: 1.2;
                font-weight: 600 !important;
              }
              
              /* Style amélioré pour le contenu principal */
              .ticket-styled {
                font-size: 14px;
                line-height: 1.3;
                font-weight: 600 !important; /* Plus épais */
              }
              .ticket-styled h4 {
                font-size: 16px;
                margin: 8px 0;
                font-weight: 700 !important; /* Très épais pour les titres */
                color: #000 !important;
              }
              .ticket-styled p {
                margin: 6px 0;
                font-weight: 600 !important;
                font-size: 14px;
              }
              .ticket-styled table {
                font-size: 13px;
                font-weight: 600 !important;
              }
              .ticket-styled th, .ticket-styled td {
                padding: 6px 4px;
                font-weight: 600 !important;
              }
              
              .overlay {
                position: relative;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(20deg);
                color: #FF0000 !important;
                font-size: 2em;
                font-weight: 900 !important; /* Très épais pour le watermark */
                opacity: 0.4; /* Légèrement plus visible */
                pointer-events: none;
                z-index: 10;
              }
              
              .section {
                margin-bottom: 8px;
              }
              .info-client {
                margin-bottom: 25px;
                font-weight: 700 !important; /* Extra épais pour les infos importantes */
              }
              .center {
                text-align: center;
              }
              
              /* Tables améliorées */
              table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                border: 1px solid #000; /* Bordure noire */
              }
              
              .product-name {
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-right: 3px;
                font-weight: 600 !important;
              }
              
              th:nth-child(1), td:nth-child(1) { 
                width: 45%; 
                text-align: left;
              } 
              th:nth-child(2), td:nth-child(2) { 
                width: 15%; 
                text-align: center;
              } 
              th:nth-child(3), td:nth-child(3) { 
                width: 20%; 
                text-align: right;
              } 
              th:nth-child(4), td:nth-child(4) { 
                width: 20%; 
                text-align: right;
              } 

              th, td {
                padding: 6px 4px;
                border-bottom: 1px solid #000; /* Bordures noires */
                text-align: left;
                font-weight: 600 !important;
              }
              th {
                background-color: #e0e0e0 !important; /* Plus visible */
                color: #000 !important;
                font-weight: 700 !important; /* Très épais pour les en-têtes */
              }
              
              .total-section {
                margin-top: 8px;
                position: relative; /* Add positioning context for the watermark */
              }
              
              .total-section table th {
                text-align: left;
                background-color: transparent;
                font-weight: 700 !important; /* Plus épais pour les totaux */
                border-bottom: none;
              }

              .total-section table td {
                text-align: right;
                font-weight: 700 !important; /* Plus épais pour les totaux */
                border-bottom: none;
              }
              .slogan {
                font-style: italic;
                margin-top: 20px;
                font-size: 1.2em;
                font-weight: 600 !important;
              }
              .footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 10px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                width: 100%;
                position: fixed;
                bottom: 0;
                left: 0;
              }
              .footer strong {
                color: #333;
              }
              
              /* Optimisation pour l'impression */
              @media print {
                body { 
                  background: white !important;
                  font-weight: 600 !important;
                }
                * { 
                  color: black !important;
                  font-weight: 600 !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              ${receiptContent}
            </div>
          </body>
        </html>
      `);

      // Imprime et referme la fenêtre
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      console.log('reservation imprimé : ', this.reservation,
        'la difference en props :', this.difference,
        'montant reçu : ', this.amount_gived
      );
    },
  },
});
</script>
