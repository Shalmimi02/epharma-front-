<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="equivalent-products-table">
        <thead>
          <tr>
            <th>NOM</th>
            <th>P.U.</th>
            <th>CIP</th>
            <th>QT.ACTU</th>
            <th>Rayon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in equivalentProducts" :key="product.id">
            <td>
              <button class="copy-btn" @click="copyLibelle(product.libelle)">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
              {{ product.libelle || 'Non disponible' }}</td>
            <td>{{ formatCurrency(product.prix_de_vente) }}</td>
            <td>{{ product.cip || 'Non disponible' }}</td>
            <td>{{ product.qte || 'Pas en stock' }}</td>
            <td>{{ product.rayon || 'Non disponible' }}</td>
          </tr>
        </tbody>
      </table>
      
    </div>
  </div>
</template>

<script>
import { searchMedicaments } from '@/services/vidalService';

export default {
  name: 'EquivalentMedicamentList',
  inject: ['dialogRef'],
  data() {
    return {
      equivalentProducts: [],
      loading: false,
      error: null,
      datas: this.dialogRef.data,
      cache: new Map(), // Utilisation d'un Map pour gérer le cache
      cacheLimit: 50, // Limite du nombre de DCIs stockés dans le cache
    };
  },
  methods: {
    async fetchEquivalentProducts() {
      this.loading = true;
      this.error = null;

      try {
        const query = (this.datas.dci || '').trim().toLowerCase(); // Normaliser le DCI
        if (!query || query.toLowerCase()=="vide") {
          // Si le DCI est vide, on ne fait pas d'appel à l'API Vidal.
          this.loading = false;
          return;
        }

        // Vérifier si le DCI est dans le cache
        const cachedData = this.getFromCache(query);
        if (cachedData) {
          console.log('Données récupérées depuis le cache.');
          this.equivalentProducts = cachedData;
          return;
        }

        // Étape 1 : Récupérer les produits depuis l'API Vidal
        const responseVidal = await searchMedicaments(query);

        // Extraire les CIPs des produits reçus
        const cips = responseVidal.products
          .map(product => product.cip?.toString()) // Convertir chaque CIP en chaîne de caractères
          .filter(cip => cip); // Filtrer pour éviter les valeurs nulles ou undefined

        if (cips.length === 0) {
          throw new Error('Aucun CIP trouvé dans la réponse de l\'API Vidal.');
        }

        // Étape 2 : Envoyer les CIPs à la route Laravel pour comparaison
        const responseLaravel = await this.axios.post('/api/produits/comparer', { cips });

        // Assigner les produits correspondants retournés par Laravel
        this.equivalentProducts = responseLaravel.data;

        // Ajouter au cache avec gestion de la limite
        this.addToCache(query, responseLaravel.data);

      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Erreur inconnue.';
      } finally {
        this.loading = false;
      }
    },
    addToCache(key, value) {
      if (this.cache.size >= this.cacheLimit) {
        // Supprimer l'entrée la plus ancienne (FIFO)
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      // Ajouter la nouvelle entrée au cache
      this.cache.set(key, value);

      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('cache', JSON.stringify(Array.from(this.cache.entries())));
    },
    getFromCache(key) {
      // Charger le cache depuis localStorage si nécessaire
      if (!this.cache.size && localStorage.getItem('cache')) {
        const storedCache = JSON.parse(localStorage.getItem('cache'));
        this.cache = new Map(storedCache);
      }
      return this.cache.get(key);
    },
    formatCurrency(value) {
      if (!value) return 'Non disponible';
      return `${parseFloat(value).toFixed(2)} FCFA`;
    },
    copyLibelle(libelle) {
      if (!libelle) return;
      navigator.clipboard.writeText(libelle)
        .then(() => {
          // Afficher une notification via toast
          // this.$toast.add({
          //   severity: "success",
          //   detail: "Nom du produit copié dans le presse-papier",
          //   life: 3000
          // });
          
         // Émettre l'événement avec la valeur copiée avant de fermer
          this.$emit('libelle-copied', libelle);
          
          if (this.dialogRef && typeof this.dialogRef.close === 'function') {
            // Envoyer directement la valeur sans encapsulation supplémentaire
            this.dialogRef.close(libelle);
          }
          })
        .catch(err => {
          console.error('Erreur lors de la copie du libellé :', err);
        });
    },
  },
  mounted() {
    this.fetchEquivalentProducts();
  },
};
</script>

<style scoped>
.equivalent-products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.equivalent-products-table th,
.equivalent-products-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.equivalent-products-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #007bff; /* Couleur de l'icône */
  margin-right: 5px;
}

.copy-btn:focus {
  outline: none;
}
</style>
