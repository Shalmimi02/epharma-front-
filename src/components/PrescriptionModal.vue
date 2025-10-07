<template>
  <div>
    <!-- Formulaire de recherche -->
    <div class="prescription-form mb-4">
      <div class="row">
        <div class="col-md-6">
          <label for="pathology">Maladie / Pathologie</label>
          <input
            id="pathology"
            type="text"
            v-model="searchForm.pathology"
            class="form-control"
            placeholder="Ex: hypertension, diabète, etc."
            @input="handleSearch"
          />
        </div>
        <div class="col-md-3">
          <label for="age">Âge du patient</label>
          <input
            id="age"
            type="number"
            v-model="searchForm.age"
            class="form-control"
            placeholder="Ex: 45"
            min="0"
            max="120"
            @input="handleSearch"
          />
        </div>
        <div class="col-md-3">
          <label for="weight">Poids (kg) - Optionnel</label>
          <input
            id="weight"
            type="number"
            v-model="searchForm.weight"
            class="form-control"
            placeholder="Ex: 70"
            min="1"
            max="300"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-md-4">
          <label for="allergie">Allergies connues</label>
          <input
            id="allergie"
            type="text"
            v-model="searchForm.allergies"
            class="form-control"
            placeholder="Ex: pénicilline, aspirine"
            @input="handleSearch"
          />
        </div>
        <div class="col-md-4">
          <label for="contraindications">Contre-indications</label>
          <input
            id="contraindications"
            type="text"
            v-model="searchForm.contraindications"
            class="form-control"
            placeholder="Ex: grossesse, insuffisance rénale"
            @input="handleSearch"
          />
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button 
            class="btn btn-primary w-100" 
            @click="searchPrescriptions"
            :disabled="!searchForm.pathology.trim() || loading"
          >
            <i class="fa-solid fa-search"></i> Rechercher
          </button>
        </div>
      </div>
      
      <!-- Options et pagination -->
      <div class="row mt-3">
        <div class="col-md-6">
          <div class="stock-filter-container">
            <button 
              class="btn stock-filter-btn"
              :class="showOnlyInStock ? 'btn-success' : 'btn-outline-secondary'"
              @click="toggleStockFilter"
            >
              <i class="fa-solid" :class="showOnlyInStock ? 'fa-boxes-stacked' : 'fa-eye'"></i>
              <span class="filter-text">
                {{ showOnlyInStock ? 'En stock uniquement' : 'Tous les produits' }}
              </span>
              <span class="badge badge-count ms-2" v-if="hasSearched">
                {{ showOnlyInStock ? inStockCount : totalCount }}
              </span>
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="pagination-selector">
            <label for="resultsPerPage" class="form-label">
              <i class="fa-solid fa-list-ol"></i> Résultats par page
            </label>
            <select 
              id="resultsPerPage" 
              v-model="pagination.itemsPerPage" 
              class="form-select pagination-select"
              @change="handlePaginationChange"
            >
              <option value="5">5 résultats</option>
              <option value="10">10 résultats</option>
              <option value="15">15 résultats</option>
              <option value="20">20 résultats</option>
              <option value="50">50 résultats</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="text-center loading-container">
      <div class="text-primary" role="status">
        <span class="spinner-border "></span>
        Chargement...
      </div>
      <p class="mt-3 loading-text">
        <strong>Recherche des médicaments Vidal...</strong>
        <br>
        <small class="text-muted">Consultation de la base de données en cours</small>
      </p>
    </div>

    <!-- Gestion des erreurs -->
    <div v-else-if="error" class="alert alert-danger error-alert">
      <i class="fa-solid fa-exclamation-triangle"></i>
      <strong>Erreur de recherche</strong>
      <p class="mb-0 mt-2">{{ error }}</p>
    </div>

    <!-- Résultats de prescription -->
    <div v-else-if="prescriptionResults && prescriptionResults.length > 0">
      <div class="results-header mb-4">
        <h5 class="results-title">
          <i class="fa-solid fa-prescription-bottle-medical text-primary"></i>
          Médicaments pour "{{ searchForm.pathology }}"
          <span v-if="searchForm.age" class="age-info">(Patient de {{ searchForm.age }} ans)</span>
        </h5>
        
        <div class="results-stats">
          <div class="stat-item">
            <i class="fa-solid fa-pills text-info"></i>
            <span>{{ filteredResults.length }} affichés</span>
          </div>
          <div class="stat-item" v-if="inStockCount > 0">
            <i class="fa-solid fa-check-circle text-success"></i>
            <span>{{ inStockCount }} en stock</span>
          </div>
          <div class="stat-item" v-if="onOrderCount > 0">
            <i class="fa-solid fa-shopping-cart text-warning"></i>
            <span>{{ onOrderCount }} sur commande</span>
          </div>
          <div class="stat-item" v-if="vidalOnlyCount > 0">
            <i class="fa-solid fa-database text-info"></i>
            <span>{{ vidalOnlyCount }} Vidal uniquement</span>
          </div>
        </div>
      </div>
      
      <div class="prescription-results">
        <div 
          v-for="(prescription, index) in paginatedResults" 
          :key="prescription.id || index"
          class="prescription-card mb-3"
        >
          <div class="card modern-card" :class="getCardClass(prescription)">
            <div class="card-header">
              <div class="card-header-left">
                <div class="medication-info">
                  <h6 class="medication-name">
                    <i class="fa-solid fa-pills text-primary"></i>
                    {{ prescription.libelle || 'Produit sans nom' }}
                  </h6>
                  <div class="medication-badges">
                    <!-- Badge principal de statut -->
                    <span class="badge status-badge" :class="getStatusBadgeClass(prescription)">
                      <i class="fa-solid" :class="getStatusIcon(prescription)"></i>
                      {{ getStatusText(prescription) }}
                    </span>
                    
                    <!-- Badge stock quantité pour les produits en stock -->
                    <span 
                      v-if="prescription.status !== 'vidal_only'"
                      class="badge stock-badge"
                      :class="getStockBadgeClass(prescription.qte)"
                    >
                      <i class="fa-solid fa-boxes-stacked"></i>
                      Stock: {{ prescription.qte || '0' }}
                    </span>
                    
                    <!-- Badge CIP -->
                    <span v-if="prescription.cip" class="badge cip-badge">
                      CIP: {{ prescription.cip }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="card-header-right">
                <button 
                  class="btn btn-sm btn-outline-info me-2" 
                  @click="toggleDetails(index)"
                >
                  <i class="fa-solid" :class="prescription.showDetails ? 'fa-eye-slash' : 'fa-eye'"></i>
                  {{ prescription.showDetails ? 'Masquer' : 'Détails' }}
                </button>
                <button v-show="inStockCount"
                  class="btn btn-sm action-btn"
                  :class="getActionButtonClass(prescription)"
                  @click="selectPrescription(prescription.cip_local || prescription.cip)"
                >
                  <i class="fa-solid" :class="getActionIcon(prescription)"></i>
                  {{ getActionText(prescription) }}
                </button>
              </div>
            </div>
            
            <!-- Détails de la prescription -->
            <div v-show="prescription.showDetails" class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-section">
                    <h6 class="section-title">
                      <i class="fa-solid fa-stethoscope"></i> Informations médicales
                    </h6>
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>DCI:</strong>
                        <span>{{ prescription.dci || 'Non renseigné' }}</span>
                      </div>
                      <div class="info-item">
                        <strong>Forme:</strong>
                        <span>{{ prescription.forme || 'Non renseigné' }}</span>
                      </div>
                      <div class="info-item">
                        <strong>Dosage:</strong>
                        <span>{{ prescription.dosage || 'Voir notice' }}</span>
                      </div>
                      <div class="info-item" v-if="prescription.cip_local">
                        <strong>CIP Local:</strong>
                        <span>{{ prescription.cip_local }}</span>
                      </div>
                    </div>
                    
                    <!-- Indications thérapeutiques -->
                    <div v-if="prescription.indications && Array.isArray(prescription.indications) && prescription.indications.length > 0" class="mt-3">
                      <strong class="text-primary">Indications:</strong>
                      <ul class="indication-list">
                        <li v-for="(indication, idx) in prescription.indications" :key="idx">
                          {{ indication }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="info-section">
                    <h6 class="section-title">
                      <i class="fa-solid fa-prescription"></i> Posologie et administration
                    </h6>
                    <div class="posology-container">
                      <div class="posology-text">
                        {{ prescription.posologie || 'Consulter la notice du médicament' }}
                      </div>
                      <div class="info-item mt-2">
                        <strong>Durée:</strong>
                        <span>{{ prescription.duree || 'Selon prescription médicale' }}</span>
                      </div>
                    </div>
                    
                    <!-- Contre-indications -->
                    <div v-if="prescription.contrindications && Array.isArray(prescription.contrindications) && prescription.contrindications.length > 0" class="mt-3">
                      <strong class="text-danger">Contre-indications:</strong>
                      <ul class="contraindication-list">
                        <li v-for="(contraindication, idx) in prescription.contrindications" :key="idx">
                          {{ contraindication }}
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Informations de disponibilité -->
                    <div class="availability-info mt-3" :class="getAvailabilityClass(prescription)">
                      <h6 class="availability-title">
                        <i class="fa-solid" :class="getAvailabilityTitleIcon(prescription)"></i>
                        {{ getAvailabilityTitle(prescription) }}
                      </h6>
                      
                      <div v-if="prescription.status !== 'vidal_only'" class="stock-details">
                        <div class="info-item">
                          <strong>Prix:</strong>
                          <span>{{ formatCurrency(prescription.prix_de_vente) }}</span>
                        </div>
                        <div class="info-item">
                          <strong>Quantité:</strong>
                          <span>{{ prescription.qte || '0' }} unités</span>
                        </div>
                        <div class="info-item" v-if="prescription.rayon">
                          <strong>Rayon:</strong>
                          <span>{{ prescription.rayon }}</span>
                        </div>
                      </div>
                      
                      <div v-else class="vidal-only-info">
                        <p class="mb-2">
                          <i class="fa-solid fa-info-circle"></i>
                          <strong>Produit Vidal non référencé</strong>
                        </p>
                        <small class="text-muted">
                          Ce médicament est disponible dans la base Vidal mais n'est pas encore référencé dans notre pharmacie.
                         
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Alertes spécifiques -->
              <div v-if="prescription.alertes && Array.isArray(prescription.alertes) && prescription.alertes.length > 0" class="alerts-section mt-3">
                <h6 class="alerts-title">
                  <i class="fa-solid fa-exclamation-triangle"></i>
                  Alertes importantes
                </h6>
                <div class="alerts-list">
                  <div 
                    v-for="(alerte, alerteIndex) in prescription.alertes" 
                    :key="alerteIndex" 
                    class="alert-item"
                  >
                    <i class="fa-solid fa-chevron-right"></i>
                    {{ alerte }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination moderne -->
      <div v-if="totalPages > 1" class="modern-pagination">
        <div class="pagination-info">
          <span class="pagination-summary">
            Affichage de <strong>{{ startItem }}</strong> à <strong>{{ endItem }}</strong> 
            sur <strong>{{ pagination.totalItems }}</strong> médicaments
          </span>
        </div>
        
        <nav class="pagination-controls" aria-label="Navigation des résultats">
          <ul class="pagination-list">
            <li class="pagination-item">
              <button 
                class="pagination-btn pagination-prev" 
                @click="previousPage"
                :disabled="pagination.currentPage === 1"
                aria-label="Page précédente"
              >
                <i class="fa-solid fa-chevron-left"></i>
                <span class="btn-text">Précédent</span>
              </button>
            </li>
            
            <li v-if="visiblePages[0] > 1" class="pagination-item">
              <button class="pagination-btn" @click="goToPage(1)">1</button>
            </li>
            <li v-if="visiblePages[0] > 2" class="pagination-item pagination-ellipsis">
              <span class="pagination-dots">...</span>
            </li>
            
            <li 
              v-for="page in visiblePages" 
              :key="page"
              class="pagination-item"
            >
              <button 
                class="pagination-btn" 
                :class="{ active: page === pagination.currentPage }"
                @click="goToPage(page)"
                :aria-label="`Aller à la page ${page}`"
                :aria-current="page === pagination.currentPage ? 'page' : null"
              >
                {{ page }}
              </button>
            </li>
            
            <li v-if="visiblePages[visiblePages.length - 1] < totalPages - 1" class="pagination-item pagination-ellipsis">
              <span class="pagination-dots">...</span>
            </li>
            <li v-if="visiblePages[visiblePages.length - 1] < totalPages" class="pagination-item">
              <button class="pagination-btn" @click="goToPage(totalPages)">{{ totalPages }}</button>
            </li>
            
            <li class="pagination-item">
              <button 
                class="pagination-btn pagination-next" 
                @click="nextPage"
                :disabled="pagination.currentPage === totalPages"
                aria-label="Page suivante"
              >
                <span class="btn-text">Suivant</span>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Message si aucun résultat -->
    <div v-else-if="hasSearched && (!prescriptionResults || prescriptionResults.length === 0)" class="empty-state">
      <div class="empty-state-icon">
        <i class="fa-solid fa-capsules"></i>
      </div>
      <h5>Aucun médicament trouvé</h5>
      <p>
        Aucun médicament n'a été trouvé dans la base Vidal pour 
        "<strong>{{ searchForm.pathology }}</strong>".
      </p>
      <div class="empty-state-suggestions">
        <p><strong>Suggestions :</strong></p>
        <ul>
          <li>Vérifiez l'orthographe du terme recherché</li>
          <li>Essayez avec des termes plus généraux</li>
          <li>Utilisez des synonymes médicaux</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { searchMedicamentsDetailed, searchByIndicationDetailed } from '@/services/vidalService';
import _ from 'lodash';

export default {
  name: 'PrescriptionModal',
  inject: ['dialogRef'],
  
  data() {
    return {
      searchForm: {
        pathology: '',
        age: null,
        weight: null,
        allergies: '',
        contraindications: ''
      },
      prescriptionResults: [],
      loading: false,
      error: null,
      hasSearched: false,
      showOnlyInStock: false, // Changé la logique
      cache: new Map(),
      cacheLimit: 30,
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
      }
    };
  },

  computed: {
    // Filtrer les résultats selon l'option showOnlyInStock
    filteredResults() {
      if (this.showOnlyInStock) {
        return this.prescriptionResults.filter(prescription => 
          prescription.status === 'in_stock' && parseInt(prescription.qte || 0) > 0
        );
      }
      return this.prescriptionResults;
    },
    
    // Pagination - résultats de la page courante
    paginatedResults() {
      const filtered = this.filteredResults;
      this.pagination.totalItems = filtered.length;
      
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + parseInt(this.pagination.itemsPerPage);
      
      return filtered.slice(start, end);
    },
    
    // Calcul du nombre total de pages
    totalPages() {
      return Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
    },
    
    // Pages à afficher dans la pagination
    visiblePages() {
      const total = this.totalPages;
      const current = this.pagination.currentPage;
      const delta = 2;
      
      let start = Math.max(1, current - delta);
      let end = Math.min(total, current + delta);
      
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else if (end === total) {
          start = Math.max(1, end - 4);
        }
      }
      
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    },
    
    // Statistiques pour l'affichage
    totalCount() {
      return this.prescriptionResults.length;
    },
    
    inStockCount() {
      return this.prescriptionResults.filter(p => p.status === 'in_stock').length;
    },
    
    onOrderCount() {
      return this.prescriptionResults.filter(p => p.status === 'on_order').length;
    },
    
    vidalOnlyCount() {
      return this.prescriptionResults.filter(p => p.status === 'vidal_only').length;
    },
    
    // Calculs pour la pagination
    startItem() {
      return (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
    },
    
    endItem() {
      return Math.min(this.pagination.currentPage * this.pagination.itemsPerPage, this.pagination.totalItems);
    }
  },

  methods: {
    // Recherche avec debounce
    handleSearch: _.debounce(function() {
      if (this.searchForm.pathology.trim().length > 2) {
        this.searchPrescriptions();
      }
    }, 800),

    async searchPrescriptions() {
      if (!this.searchForm.pathology.trim()) {
        this.error = "Veuillez saisir une pathologie.";
        return;
      }

      this.loading = true;
      this.error = null;
      this.hasSearched = true;

      try {
        const query = this.searchForm.pathology.trim().toLowerCase();
        
        // Vérifier le cache
        const cacheKey = this.generateCacheKey();
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          this.prescriptionResults = cachedData.results || [];
          this.loading = false;
          return;
        }

        // Rechercher via l'API Vidal
        const results = await this.searchVidalPrescriptions(query);
        
        this.prescriptionResults = results || [];
        
        // Mettre en cache
        this.addToCache(cacheKey, { results: this.prescriptionResults });

      } catch (err) {
        console.error('Erreur dans searchPrescriptions:', err);
        this.error = `Erreur lors de la recherche: ${err.message || 'Erreur inconnue'}`;
      } finally {
        this.loading = false;
      }
    },

    async searchVidalPrescriptions(query) {
      try {
        // Préparer les contre-indications
        const contraindications = this.searchForm.contraindications 
          ? this.searchForm.contraindications.split(',').map(item => item.trim()).filter(item => item)
          : [];

        let vidalResponse;
        
        // Essayer d'abord searchByIndicationDetailed si on a des paramètres supplémentaires
        if (this.searchForm.age || this.searchForm.weight || contraindications.length > 0) {
          try {
            vidalResponse = await searchByIndicationDetailed(
              query, 
              this.searchForm.age,
              this.searchForm.weight,
              contraindications.length > 0 ? contraindications : undefined
            );
          } catch (indicationError) {
            console.warn('searchByIndicationDetailed a échoué, fallback vers searchMedicamentsDetailed:', indicationError);
          }
        }

        // Fallback vers searchMedicamentsDetailed
        if (!vidalResponse || !vidalResponse.products || vidalResponse.products.length === 0) {
          vidalResponse = await searchMedicamentsDetailed(query);
        }

        if (!vidalResponse || !vidalResponse.products || vidalResponse.products.length === 0) {
          return [];
        }

        // Récupérer tous les CIPs des produits Vidal
        const allCips = vidalResponse.products
          .filter(product => product.cip && product.cip.toString().trim() !== '')
          .map(product => product.cip.toString().trim());

        // Comparer avec la base de données locale si on a des CIPs
        let localProducts = [];
        if (allCips.length > 0) {
          localProducts = await this.compareWithLocalDatabase(allCips);
        }

        // Traiter TOUS les produits Vidal
        const allProducts = this.processAllVidalProducts(vidalResponse.products, localProducts);
        
        return this.formatPrescriptionResults(allProducts);

      } catch (error) {
        console.error('Erreur dans searchVidalPrescriptions:', error);
        throw error;
      }
    },

    async compareWithLocalDatabase(cips) {
      try {
        const response = await this.axios.post('/api/produits/comparer', { 
          cips: cips 
        });

        return Array.isArray(response.data) ? response.data : [];

      } catch (error) {
        console.error('Erreur lors de la comparaison avec la base locale:', error);
        return [];
      }
    },

    // Traiter TOUS les produits Vidal (nouvelle approche)
    processAllVidalProducts(vidalProducts, localProducts) {
      const processedProducts = [];

      // Fonction utilitaire pour normaliser les CIP
      const normalizeCip = (cip) => {
        if (cip === null || cip === undefined) return null;
        return cip.toString().trim().replace(/\s+/g, '');
      };

      vidalProducts.forEach(vidalProduct => {
        const vidalCipNormalized = normalizeCip(vidalProduct.cip);
        
        // Chercher une correspondance locale
        let localProduct = null;
        let status = 'vidal_only';

        if (vidalCipNormalized && localProducts.length > 0) {
          localProduct = localProducts.find(local => {
            const localCips = [
              normalizeCip(local.cip),
              normalizeCip(local.cip_1), 
              normalizeCip(local.cip_2),
              normalizeCip(local.cip_deux)
            ].filter(cip => cip !== null);

            return localCips.includes(vidalCipNormalized);
          });

          if (localProduct) {
            const qte = parseInt(localProduct.qte) || 0;
            status = qte > 0 ? 'in_stock' : 'on_order';
          }
        }

        const processedProduct = {
          // Données Vidal (toujours présentes)
          libelle: vidalProduct.libelle || 'Produit sans nom',
          cip: vidalProduct.cip,
          dci: vidalProduct.dci || 'Non renseigné',
          forme: vidalProduct.forme || 'Non renseigné',
          dosage: vidalProduct.dosage || 'Voir notice',
          posologie: vidalProduct.posologie || 'Consulter la notice du médicament',
          duree: vidalProduct.duree || 'Selon prescription médicale',
          indications: Array.isArray(vidalProduct.indications) ? vidalProduct.indications : [],
          contrindications: Array.isArray(vidalProduct.contrindications) ? vidalProduct.contrindications : [],
          
          // Données locales (si disponibles)
          prix_de_vente: localProduct?.prix_de_vente || null,
          qte: localProduct?.qte || 0,
          rayon: localProduct?.rayon || null,
          libelle_local: localProduct?.libelle || null,
          cip_local: localProduct?.cip || localProduct?.cip_deux || null,
          
          // Statut et métadonnées
          status: status,
          source: 'vidal',
          produit_local: localProduct
        };

        processedProducts.push(processedProduct);
      });

      // Trier par statut (en stock, sur commande, vidal uniquement)
      return processedProducts.sort((a, b) => {
        const statusOrder = { 'in_stock': 0, 'on_order': 1, 'vidal_only': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    },

    formatPrescriptionResults(processedProducts) {
      if (!Array.isArray(processedProducts)) {
        console.warn('processedProducts n\'est pas un tableau:', processedProducts);
        return [];
      }

      return processedProducts.map((product, index) => ({
        id: `product_${index}`,
        // Informations médicales de Vidal
        libelle: product.libelle,
        cip: product.cip,
        cip_local: product.cip_local,
        dci: product.dci,
        forme: product.forme,
        dosage: product.dosage,
        posologie: product.posologie,
        duree: product.duree,
        indications: product.indications,
        contrindications: product.contrindications,
        
        // Informations de stock local
        prix_de_vente: product.prix_de_vente,
        qte: product.qte,
        rayon: product.rayon,
        libelle_local: product.libelle_local,
        
        // Statut et métadonnées
        status: product.status,
        source: product.source,
        showDetails: false,
        alertes: this.generateAlerts(product)
      }));
    },

    generateAlerts(product) {
      const alerts = [];
      
      if (!product) return alerts;
      
      // Alerte selon le statut
      if (product.status === 'on_order') {
        alerts.push('🛒 Produit référencé - Commande nécessaire');
      } else if (product.status === 'in_stock' && parseInt(product.qte || 0) < 5) {
        alerts.push('📉 Stock faible - Vérifier la disponibilité');
      } else if (product.status === 'vidal_only') {
        alerts.push('ℹ️ Produit Vidal - Non référencé localement');
      }
      
      // Alertes basées sur les contre-indications
      if (Array.isArray(product.contrindications) && product.contrindications.length > 0) {
        if (this.searchForm.age) {
          const age = parseInt(this.searchForm.age);
          
          product.contrindications.forEach(contraindication => {
            if (typeof contraindication === 'string') {
              if (contraindication.toLowerCase().includes('enfant') && age < 18) {
                alerts.push('⚠️ Contre-indiqué chez l\'enfant');
              }
              if (contraindication.toLowerCase().includes('grossesse') && 
                  this.searchForm.contraindications?.toLowerCase().includes('grossesse')) {
                alerts.push('⚠️ Contre-indiqué pendant la grossesse');
              }
            }
          });
        }
      }
      
      return alerts;
    },

    toggleDetails(index) {
      if (this.paginatedResults[index]) {
        this.paginatedResults[index].showDetails = !this.paginatedResults[index].showDetails;
      }
    },

    selectPrescription(prescription) {
      this.$emit('prescription-selected', prescription);
      
      if (this.dialogRef && typeof this.dialogRef.close === 'function') {
        this.dialogRef.close(prescription);
      }
    },

    // Méthodes utilitaires pour l'affichage des badges et styles
    getCardClass(prescription) {
      const classes = [];
      if (prescription.status === 'vidal_only') classes.push('vidal-only-card');
      if (prescription.status === 'on_order') classes.push('on-order-card');
      return classes.join(' ');
    },

    getStatusBadgeClass(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'badge-success';
        case 'on_order':
          return 'badge-warning';
        case 'vidal_only':
          return 'badge-info';
        default:
          return 'badge-secondary';
      }
    },

    getStatusIcon(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'fa-check-circle';
        case 'on_order':
          return 'fa-shopping-cart';
        case 'vidal_only':
          return 'fa-database';
        default:
          return 'fa-question';
      }
    },

    getStatusText(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'En stock';
        case 'on_order':
          return 'Sur commande';
        case 'vidal_only':
          return 'Vidal';
        default:
          return 'Inconnu';
      }
    },

    getStockBadgeClass(quantity) {
      const qty = parseInt(quantity) || 0;
      if (qty >= 10) return 'badge-success';
      if (qty >= 5) return 'badge-warning';
      if (qty > 0) return 'badge-danger';
      return 'badge-secondary';
    },

    getActionButtonClass(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'btn-success';
        case 'on_order':
          return 'btn-warning';
        case 'vidal_only':
          return 'btn-info';
        default:
          return 'btn-secondary';
      }
    },

    getActionIcon(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'fa-check';
        case 'on_order':
          return 'fa-shopping-cart';
        case 'vidal_only':
          return 'fa-info-circle';
        default:
          return 'fa-question';
      }
    },

    getActionText(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'Sélectionner';
        case 'on_order':
          return 'Commander';
        case 'vidal_only':
          return 'Infos';
        default:
          return 'Voir';
      }
    },

    getAvailabilityClass(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'availability-success';
        case 'on_order':
          return 'availability-warning';
        case 'vidal_only':
          return 'availability-info';
        default:
          return 'availability-secondary';
      }
    },

    getAvailabilityTitleIcon(prescription) {
      return this.getStatusIcon(prescription);
    },

    getAvailabilityTitle(prescription) {
      switch (prescription.status) {
        case 'in_stock':
          return 'Disponible en pharmacie';
        case 'on_order':
          return 'Disponible sur commande';
        case 'vidal_only':
          return 'Informations Vidal';
        default:
          return 'Statut inconnu';
      }
    },

    formatCurrency(amount) {
      if (!amount) return 'Non renseigné';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF'
      }).format(amount);
    },

    // Nouvelle méthode pour basculer le filtre stock
    toggleStockFilter() {
      this.showOnlyInStock = !this.showOnlyInStock;
      this.pagination.currentPage = 1; // Reset à la première page
    },

    // Méthodes de cache
    generateCacheKey() {
      return JSON.stringify({
        pathology: (this.searchForm.pathology || '').toLowerCase(),
        age: this.searchForm.age,
        weight: this.searchForm.weight,
        allergies: (this.searchForm.allergies || '').toLowerCase(),
        contraindications: (this.searchForm.contraindications || '').toLowerCase(),
        showOnlyInStock: this.showOnlyInStock
      });
    },

    addToCache(key, value) {
      if (this.cache.size >= this.cacheLimit) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      this.cache.set(key, value);
      
      try {
        localStorage.setItem('prescriptionCache', JSON.stringify(Array.from(this.cache.entries())));
      } catch (error) {
        console.warn('Impossible de sauvegarder le cache:', error);
      }
    },

    getFromCache(key) {
      if (!this.cache.size && localStorage.getItem('prescriptionCache')) {
        try {
          const storedCache = JSON.parse(localStorage.getItem('prescriptionCache'));
          this.cache = new Map(storedCache);
        } catch (error) {
          console.warn('Erreur lors du chargement du cache:', error);
        }
      }
      return this.cache.get(key);
    },

    // Méthodes de pagination
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.currentPage = page;
      }
    },
    
    previousPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--;
      }
    },
    
    nextPage() {
      if (this.pagination.currentPage < this.totalPages) {
        this.pagination.currentPage++;
      }
    },
    
    handlePaginationChange() {
      this.pagination.currentPage = 1;
    }
  },

  mounted() {
    if (localStorage.getItem('prescriptionCache')) {
      try {
        const storedCache = JSON.parse(localStorage.getItem('prescriptionCache'));
        this.cache = new Map(storedCache);
      } catch (error) {
        console.error('Erreur lors du chargement du cache:', error);
      }
    }
  }
};
</script>

<style scoped>
/* STYLES GÉNÉRAUX */
.prescription-form {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* FILTRE STOCK AMÉLIORÉ */
.stock-filter-container {
  display: flex;
  align-items: center;
}

.stock-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid;
}

.stock-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stock-filter-btn.btn-success {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.stock-filter-btn.btn-outline-secondary {
  background: white;
  border-color: #6c757d;
  color: #6c757d;
}

.filter-text {
  font-size: 0.9rem;
}

.badge-count {
  background: rgba(255,255,255,0.2);
  color: inherit;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
}

/* SÉLECTEUR PAGINATION MODERNE */
.pagination-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pagination-selector .form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-select {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.pagination-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

/* LOADING AMÉLIORÉ */
.loading-container {
  padding: 60px 20px;
}

.loading-text {
  color: #495057;
  font-size: 1rem;
}

.error-alert {
  border-radius: 10px;
  border-left: 4px solid #dc3545;
}

/* HEADER RÉSULTATS */
.results-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.results-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.age-info {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: normal;
}

.results-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* CARTES MODERNES */
.modern-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.vidal-only-card {
  border-left: 4px solid #17a2b8;
}

.on-order-card {
  border-left: 4px solid #ffc107;
}

.card-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #dee2e6;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-left {
  flex: 1;
}

.medication-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.medication-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.medication-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-badge {
  font-weight: 600;
}

.badge-success { background: #28a745; color: white; }
.badge-warning { background: #ffc107; color: #212529; }
.badge-info { background: #17a2b8; color: white; }
.badge-secondary { background: #6c757d; color: white; }
.badge-danger { background: #dc3545; color: white; }

.cip-badge {
  background: #e9ecef;
  color: #495057;
}

.stock-badge {
  border: 1px solid rgba(255,255,255,0.3);
}

.card-header-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-weight: 500;
}

/* SECTIONS INFO */
.info-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  height: 100%;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 6px 0;
  border-bottom: 1px solid #dee2e6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #495057;
  min-width: 80px;
}

.info-item span {
  color: #6c757d;
  text-align: right;
  flex: 1;
}

.indication-list, .contraindication-list {
  margin: 8px 0 0 0;
  padding-left: 16px;
}

.indication-list li, .contraindication-list li {
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.contraindication-list li {
  color: #dc3545;
}

/* POSOLOGIE */
.posology-container {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.posology-text {
  font-style: italic;
  color: #495057;
  line-height: 1.4;
}

/* DISPONIBILITÉ */
.availability-info {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid;
}

.availability-success {
  background: #d4edda;
  border-color: #28a745;
}

.availability-warning {
  background: #fff3cd;
  border-color: #ffc107;
}

.availability-info {
  background: #d1ecf1;
  border-color: #17a2b8;
}

.availability-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vidal-only-info {
  text-align: center;
}

/* ALERTES */
.alerts-section {
  background: #fff3cd;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.alerts-title {
  font-size: 1rem;
  font-weight: 600;
  color: #856404;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-item {
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

/* PAGINATION MODERNE */
.modern-pagination {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 24px;
  margin-top: 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.pagination-info {
  text-align: center;
  margin-bottom: 20px;
}

.pagination-summary {
  color: #495057;
  font-size: 1rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  justify-content: center;
}

.pagination-list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.pagination-item {
  display: flex;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 10px 16px;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
  gap: 6px;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  border-color: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.3);
}

.pagination-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.pagination-btn:disabled {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.pagination-dots {
  color: #6c757d;
  font-weight: bold;
  padding: 0 8px;
}

.pagination-prev, .pagination-next {
  padding: 10px 20px;
  font-weight: 600;
}

.btn-text {
  font-size: 0.85rem;
}

/* ÉTAT VIDE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.empty-state-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 16px;
}

.empty-state h5 {
  color: #495057;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.empty-state-suggestions {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: left;
  display: inline-block;
}

.empty-state-suggestions ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.empty-state-suggestions li {
  margin-bottom: 4px;
  color: #6c757d;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .prescription-form {
    padding: 16px;
  }
  
  .results-stats {
    gap: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .card-header-right {
    justify-content: center;
  }
  
  .medication-badges {
    justify-content: center;
  }
  
  .modern-pagination {
    padding: 16px;
  }
  
  .pagination-btn {
    min-width: 40px;
    height: 40px;
    padding: 8px 12px;
  }
  
  .btn-text {
    display: none;
  }
  
  .pagination-prev, .pagination-next {
    padding: 8px 16px;
  }
  
  .stock-filter-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modern-pagination {
    padding: 12px;
  }
  
  .pagination-list {
    gap: 4px;
  }
  
  .pagination-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}
</style>

