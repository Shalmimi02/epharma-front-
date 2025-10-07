<template>
    <EpharmaTemplate :withHeader="false">
        <template #content v-if="isReady">
            <div class="bg-primary rounded" v-if="gardeActive">
                <p class="text-center text-white">Une garde est en cours, taxe : {{
                    $moneyFormat(gardeActive.montant_taxe) }}</p>
            </div>
            <div class="container py-3">
                <TopbarReservation 
                    @reservationSelected="handleReservationSelected" 
                    :selectedReservation="selectedReservation"  
                    :reservations="reservations"
                    @refresh-reservations="refreshReservations"
                    :key="refreshKey" 
                />
                
                <!-- Affichage des données de la réservation active -->
                <!-- <div v-if="activeReservation">
                    <p>Réservation Active :</p>
                    <pre>{{ activeReservation }}</pre>
                </div>
                
                <div v-if="reservation_produits.length > 0">
                    <p>Produits de la réservation :</p>
                    <pre>{{ reservation_produits }}</pre>
                    <pre>{{ produits_selected }}</pre>
                </div> -->

                <div class="row d-flex justify-content-center">
                    <div class="col-md-9 h-fixed">
                        <!-- Loader -->
                        <HourGlassLoader v-if="isLoading" :isOverlay="true"></HourGlassLoader>
                        <HourGlassLoader v-else-if="isSaving" :isAutoSave="true" message="Sauvegarde en cours..."></HourGlassLoader>

                        <!-- Formulaire de réservation -->
                        <div v-if="activeReservation && activeReservation.id">
                            <SectionVisibility :key="keyForm" libelleSection="La première étape" :isOpen="true">
                                <template #section_content>
                                    <div class="card card-body mb-3 position-relative">
                                        <!-- Overlay -->
                                        <div id="overlay" class="overlay"
                                            v-if="activeReservation.status === 'Annule' || activeReservation.status === 'Devis' || activeReservation.status === 'Termine'">
                                        </div>
                                        <!-- Filigrane -->
                                        <div v-if="activeReservation.status === 'Annule'" class="watermark border-danger px-5">
                                            Réservation annulée
                                        </div>
                                        <div v-else-if="activeReservation.status === 'Termine'" class="watermark border-danger px-5">
                                            Réservation fermée
                                        </div>
                                        <div v-else-if="activeReservation.status === 'Devis'" class="watermark border-danger px-5">
                                            Transformée en devis
                                        </div>

                                        <!-- Sélection de la caisse -->
                                        <div class="d-flex flex-wrap mb-3">
                                            <button 
                                                v-for="caisse in caisses" 
                                                :key="caisse.id"
                                                :class="{ 'border border-primary': activeReservation.caisse_id === caisse.id }"
                                                class="btn btn-light mr-2 mb-2 py-3 px-4 text-dark"
                                                @click="setCaisseId(caisse)"
                                            >
                                                <i class="fas fa-cash-register mr-1"></i>
                                                <span>{{ caisse.libelle }}</span>
                                            </button>
                                        </div>

                                        <!-- Formulaire principal -->
                                        <form>
                                            <div class="form-row">
                                                <!-- Client -->
                                                <div class="form-group col-md-5">
                                                    <label>Client</label>
                                                    <input 
                                                        v-if="nb_products > 0 || reservation_produits.length > 0" 
                                                        type="text" 
                                                        class="form-control" 
                                                        :value="activeReservation.client" 
                                                        disabled 
                                                    />
                                                    <select 
                                                        v-else 
                                                        class="form-control border border-dark px-[4rem]" 
                                                        v-model="activeReservation.client_id" 
                                                        @change="setClientLibelle"
                                                    >
                                                        <option 
                                                            v-for="client in clients" 
                                                            :key="client.id" 
                                                            :value="client.id"
                                                        >
                                                            {{ client.libelle || activeReservation.client }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <!-- Crédit -->   
                                                <div 
                                                    v-if="clientSelected && parseFloat(clientSelected.current_remboursement_amount) > 0 && activeReservation.status !== 'Termine'" 
                                                    class="form-group col-md-5"
                                                >
                                                    <label>Crédit</label>
                                                    <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        :class="creditClass" 
                                                        :value="activeReservation.creditRestant" 
                                                        disabled 
                                                    />
                                                </div>
                                            </div>

                                            <!-- Assurance -->
                                            <div 
                                                v-if="(clientSelected && clientSelected.libelle !== 'COMPTANT') || (activeReservation.client_id != 1)" 
                                                class="form-row"
                                            >
                                                <div class="form-group col-md-5">
                                                    <label>Identifiant de l'Assuré (NAG)</label>
                                                    <input 
                                                        type="text" 
                                                        v-model="activeReservation.identifiant_assure" 
                                                        class="form-control border border-dark px-[4rem]" 
                                                        @change="autoSave()" 
                                                    />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>Nom de l'Assuré</label>
                                                    <input 
                                                        type="text" 
                                                        v-model="activeReservation.nom_assure" 
                                                        class="form-control border border-dark px-[4rem]" 
                                                        @change="autoSave()" 
                                                    />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>N° Feuille Assuré</label>
                                                    <input 
                                                        type="text" 
                                                        v-model="activeReservation.numero_feuille_assure" 
                                                        class="form-control border border-dark px-[4rem]" 
                                                        @change="autoSave()" 
                                                    />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>Secteur</label>
                                                    <select 
                                                        v-model="activeReservation.secteur_assure" 
                                                        class="form-control border border-dark px-[4rem]" 
                                                        @change="autoSave()"
                                                    >
                                                        <option>Secteur public</option>
                                                        <option>Secteur privé</option>
                                                        <option>GEF</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </template>
                            </SectionVisibility>

                            <SectionVisibility 
                                :key="keySelection" 
                                libelleSection="la selection des produits" 
                                :isOpen="true" 
                                v-if="activeReservation.status != 'Termine'"
                            >
                                <template #section_content>
                                    <div class="mb-3 position-relative">
                                        <div class="form-group">
                                            <input 
                                                type="search" 
                                                class="form-control form-control-lg search-form"
                                                placeholder="Tapez le mot clé à rechercher" 
                                                v-model="keyWord"
                                                @input="keySelectionTable++"
                                            >
                                        </div>
                                        <AsdecodeTable 
                                            v-if="keyWord != ''" 
                                            :key="keySelectionTable" 
                                            noExport
                                            :url="$store.state.api_epharma_stock + '/api/produits?is_active=1'"
                                            :columns="columns" 
                                            :newKeyWord="keyWord" 
                                            table="produits"
                                        >
                                            <template #header_action_btns>
                                                <button 
                                                    v-if="produits_selected.length > 0"
                                                    class="btn btn-light text-secondary mr-2" 
                                                    disabled
                                                >
                                                    {{ produits_selected.length }} produits sélectionnés
                                                </button>
                                            </template>
                                            <template #action_btns="slotProps">
                                                <span 
                                                    v-if="isLoadingInput[slotProps.data.id]" 
                                                    class="spinner-border spinner-border-sm" 
                                                    role="status" 
                                                    aria-hidden="true"
                                                ></span>
                                                <div v-else>
                                                    <button 
                                                        v-if="produits_selected.includes(slotProps.data.id)" 
                                                        :id="slotProps.data.id" 
                                                        class="btn btn-danger btn-sm m-1"
                                                        @click="toggleProduitLocal(slotProps.data, 'remove')" 
                                                        title="Retirer"
                                                    >
                                                        <i class="fa-solid fa-trash-alt"></i>
                                                    </button>
                                                    
                                                    <button 
                                                        v-else-if="!produits_selected.includes(slotProps.data.id) && slotProps.data.qte > 0 && parseFloat(slotProps.data.prix_de_vente) > 0"
                                                        type="button" 
                                                        class="btn btn-success btn-sm m-1" 
                                                        @click="toggleProduitLocal(slotProps.data, 'add')"
                                                        title="Ajouter"
                                                    >
                                                        <i class="fa-solid fa-plus"></i>
                                                    </button>
                                                
                                                    <button 
                                                        type="button" 
                                                        class="btn btn-secondary btn-sm"
                                                        @click="commandProduit(slotProps.data.id)" 
                                                        title="Commander"
                                                    >
                                                        <i class="fa-solid fa-cart-arrow-down"></i>
                                                    </button>
                                                </div>
                                            </template>
                                            <template #libelle="slotProps">
                                                {{ slotProps.data.libelle }}
                                                <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
                                                <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
                                            </template>
                                        </AsdecodeTable>
                                    </div>
                                </template>
                            </SectionVisibility>

                            <SectionVisibility :key="keyShow" libelleSection="les produits selectionnés" :isOpen="true">
                                <template #section_content>
                                    <div class="card">
                                        <div class="card-header p-0">
                                            <button 
                                                type="button" 
                                                class="btn btn-light mr-2" 
                                                @click="transformToInvoice"
                                                v-if="(isTreatable() == true) && (reservation_produits.length > 0)"
                                            >
                                                <i class="fa-solid fa-file-pdf"></i> Transformer en devis
                                                <span v-if="devisIsLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            </button>
                                        </div>
                                        <div class="card-body p-0">
                                            <DataTable 
                                                :key="keyShow" 
                                                :value="reservation_produits" 
                                                paginator 
                                                :rows="5"
                                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                            >
                                                <!-- Bouton suppression -->
                                                <Column field="id" header=" " v-if="isTreatable()">
                                                    <template #body="slotProps">
                                                        <span 
                                                            v-if="isLoadingInput[slotProps.data.id]" 
                                                            class="spinner-border spinner-border-sm" 
                                                            role="status"
                                                        ></span>
                                                        <button 
                                                            v-else 
                                                            type="button" 
                                                            class="btn btn-sm text-danger"
                                                            @click="updateLineLocal(slotProps.data, 'remove')"
                                                        >
                                                            <i class="fa-solid fa-trash-alt"></i>
                                                        </button>
                                                    </template>
                                                </Column>

                                                <!-- Libellé -->
                                                <Column field="libelle" header="PRODUIT">
                                                    <template #body="slotProps">
                                                        {{ slotProps.data.libelle }}
                                                    </template>
                                                </Column>

                                                <!-- Quantité -->
                                                <Column field="qte" header="QUANTITE">
                                                    <template #body="slotProps">
                                                        <input 
                                                            type="number"
                                                            class="form-control border border-dark px-[4rem]"
                                                            name="qte"
                                                            :value="slotProps.data.qte"
                                                            :max="parseInt(slotProps.data.produit?.produit_qte || 1)"
                                                            min="1"
                                                            @change="updateLineLocal(slotProps.data, 'qte', $event.target.value)"
                                                            :disabled="isLoadingInput[slotProps.data.id] || !isTreatable()"
                                                        />
                                                    </template>
                                                </Column>

                                                <!-- Prix Unitaire -->
                                                <Column field="prix_de_vente" header="P.U.">
                                                    <template #body="slotProps">
                                                        {{ $moneyFormat(slotProps.data.prix_de_vente) }}
                                                    </template>
                                                </Column>

                                                <!-- Prise en charge -->
                                                <Column field="prise_en_charge" header="% TAUX">
                                                    <template #body="slotProps">
                                                        <input 
                                                            type="number"
                                                            class="form-control border border-dark px-[4rem]"
                                                            name="prise_en_charge"
                                                            :value="slotProps.data.prise_en_charge || 0"
                                                            min="0"
                                                            max="100"
                                                            @change="updateLineLocal(slotProps.data, 'prise_en_charge', $event.target.value)"
                                                            :disabled="isLoadingInput[slotProps.data.id] || !isTreatable()"
                                                        />
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </div>
                                    </div>
                                </template>
                            </SectionVisibility>
                        </div>
                    </div>
                    <div class="col-md-3" :key="keyTotals">
                        <div class="card card-body p-1 bg-primary text-white mb-2">
                            <h5>TTC CLIENT</h5>
                            <span class="text-center h4">{{ $moneyFormat(montant) }}</span>
                        </div>

                        <!-- Autres Totaux -->
                        <div class="card card-body p-1 bg-info text-white mb-2">
                            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                            <div v-else-if="produits_selected.length > 0 || reservation_produits.length > 0">
                                <!-- % TAUX -->
                                <div class="d-flex justify-content-between" v-if="totalPriseEnCharge !== null && totalPriseEnCharge !== undefined">
                                    <span>% TAUX: </span>
                                    <span>{{ $moneyFormat(totalPriseEnCharge) }}</span>
                                </div>

                                <!-- Montant TTC -->
                                <div class="d-flex justify-content-between" v-if="totalTTC !== null && totalTTC !== undefined">
                                    <span>MT TTC: </span>
                                    <span>{{ $moneyFormat(totalTTC) }}</span>
                                </div>

                                <!-- Montant HT -->
                                <div class="d-flex justify-content-between" v-if="totalHT !== null && totalHT !== undefined">
                                    <span>MT HT: </span>
                                    <span>{{ $moneyFormat(totalHT) }}</span>
                                </div>

                                <!-- Montant TVA -->
                                <div class="d-flex justify-content-between" v-if="totalTVA !== null && totalTVA !== undefined">
                                    <span>MT TVA: </span>
                                    <span>{{ $moneyFormat(totalTVA) }}</span>
                                </div>

                                <!-- Montant CSS -->
                                <div class="d-flex justify-content-between" v-if="totalCSS !== null && totalCSS !== undefined">
                                    <span>MT CSS: </span>
                                    <span>{{ $moneyFormat(totalCSS) }}</span>
                                </div>

                                <!-- Montant Garde -->
                                <div class="d-flex justify-content-between" v-if="totalGarde !== null && totalGarde !== undefined">
                                    <span>Garde: </span>
                                    <span>{{ $moneyFormat(totalGarde) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3" v-if="activeReservation && activeReservation.client_id && activeReservation.switch_caisse_at">
                            <p>Réservation envoyée à la caisse {{ activeReservation.caisse }}</p>
                        </div>
                        
                        <!-- Bouton pour passer à la caisse -->
                        <div class="mt-3" v-if="activeReservation && activeReservation.caisse_id && isTreatable() && produits_selected.length > 0">
                            <button 
                                type="button" 
                                class="btn btn-primary mx-auto mt-5 mb-1" 
                                @click="sendReservation()"
                            >
                                <i class="fa-solid fa-share mr-1"></i> Passer à la caisse
                            </button>
                        </div>

                        <BuyReservation
                            :key="keyReglement"
                            v-if="activeReservation && produits_selected.length > 0"
                            :reservation="activeReservation"       
                            :montantTTC="montant"                 
                            :remiseValue="clientRemisePercent"
                            :reservation_produits="reservation_produits"
                            :clientSelected="clientSelected"
                            @reservation-updated="handleReservationUpdated" 
                        />
                    </div>
                </div>
            </div>

        </template>
    </EpharmaTemplate>
</template>

<script>
import TopbarReservation from "./TopbarReservation.vue";
import ShowReservation from "./ShowReservation.vue";
import BuyReservation from "./BuyReservation.vue";
import { calculerProduit } from '@/views/calculs/add-produits-reservation.ts';
import {calculerTotalProduits} from '@/views/calculs/calcul-for-submit-db.ts'
import $ from 'jquery';
import { defineComponent } from 'vue';
import { 
  readJsonFromFile, 
  saveJsonToFile, 
  addReservationToJson, 
  updateReservationInJson, 
  addProductToReservation, 
  removeProductFromReservation, 
  removeReservationFromLocalStorage, 
  sanitizeReservationData, 
  sanitizeProduitData, 
  isDateToday, 
  calculateMinutesDifference, 
  loadAllReservationsFromApi 
} from "@/views/calculs/logUtils";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import _ from 'lodash';


export default defineComponent({
    name: "Reservations",
    components: { TopbarReservation, ShowReservation, BuyReservation, DataTable, Column },
    data() {
        return {
            isReady: false,
            table: 'reservation_produits',
            lines: 0,
            key: 1,
            keyForm: 1,
            keySelection: 1,
            keyTotals: 1,
            keySelectionTable: 1,
            loadedData: null,
            keyShow: 1,
            isLoading: false,
            isSaving: false,
            nb_products: 0,
            reservations: [], // Liste des réservations
            caisses: [],
            clients: [],
            currentReservation: null, // Réservation actuellement affichée
            reservation_produits: [], // liste des produits de la reservations
            selectedReservation: null, // la réservation sélectionnée
            globalReservation: null, // objet de la réservation sélectionnée qui va recevoir les modification
            baseUrl: this.$store.state.api_epharma_ventes,
            gardeActive: null,
            prise_en_charge:0,
            clientRemisePercent: 0,
            localReservation: {},
            clientSelected: null,
            debounceTimer: null,
            isLoadingInput: {},
            keyWord: '',
            refreshKey:1,
            produits_selected: [],
            devisIsLoading: false,
            isSavingJson: false, // Empêche les accès concurrents
            isLoadingReservation: false,
            columns: [
                {
                    key: 'libelle',
                    label: 'NOM',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'P.U.',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QT. ACTU',
                    exportable: true,

                },
                {
                    key: 'rayon',
                    label: 'RAYON',
                    exportable: 'true'

                }
            ]
        };
    },
    created() {
        this.checkGardeActive()
    },
    computed: {
        creditActuel() {
            const creditInitial = parseFloat(this.clientSelected?.current_remboursement_amount || 0);
            const totalPriseEnCharge = parseFloat(this.totalPriseEnCharge || 0);
            return (creditInitial - totalPriseEnCharge).toFixed(2);
        },
        creditClass() {
            const creditActuel = parseFloat(this.creditActuel || 0);
            const creditInitial = parseFloat(this.clientSelected?.current_remboursement_amount || 0);

            if (creditInitial > 0) {
                const creditPercentage = (creditActuel / creditInitial) * 100;
                if (creditPercentage <= 25) return "border-danger";
                if (creditPercentage <= 50) return "border-warning";
            }
            return "border-success";
        },
        activeReservation() {
            if (this.currentReservation && this.currentReservation.status !== 'Brouillon') {
                return this.currentReservation;
            } else if (this.localReservation && this.localReservation.status === 'Brouillon') {
                return this.localReservation;
            }
            return null;
        },
       // Calcul des Totaux Globaux
        totalHT() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.total_ht ?? 0);
        }, 0);
        },
        totalTTC() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.cout_total ?? 0);
        }, 0);
        },
        totalTVA() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.total_tva ?? 0);
        }, 0);
        },
        totalCSS() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.total_css ?? 0);
        }, 0);
        },
        totalGarde() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.total_garde ?? 0);
        }, 0);
        },
        totalPriseEnCharge() {
        return this.reservation_produits.reduce((sum, prod) => {
            return sum + Number(prod.total_prise_en_charge ?? 0);
        }, 0);
        },
        montant() {
            return this.reservation_produits.reduce((sum, prod) => {
                return sum + Number(prod.cout_total ?? 0);
            }, 0);
        },

    },
    methods: {
        /**
     * Fonction pour calculer le crédit restant.
     * Implémentez cette fonction selon vos besoins spécifiques.
     */
    calculateCredit() {
      if (this.currentReservation) {
        const montant = parseFloat(this.currentReservation.montant || '0');
        const montant_avant_remise = parseFloat(this.currentReservation.montant_avant_remise || '0');
        const credit = montant_avant_remise - montant;
        this.currentReservation.creditRestant = credit.toFixed(2);
        console.log("Crédit restant calculé :", this.currentReservation.creditRestant);
      }
    },

    /**
     * Fonction pour initialiser les réservations par défaut.
     */
    async initializeDefaultReservation() {
      try {
        // Nettoyer le LocalStorage des réservations non 'Brouillon'
        await this.cleanLocalStorage();

        // Initialiser le fichier JSON si nécessaire
        await this.initializeJsonFile();

        // Charger toutes les réservations depuis l'API (réservations du jour)
        const loadedReservations = await loadAllReservationsFromApi(this.baseUrl, axios);
        this.reservations = loadedReservations;

        if (loadedReservations.length > 0) {
          // Trier les réservations par date de création décroissante pour obtenir la dernière réservation
          loadedReservations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          // Sélectionner la dernière réservation
          const lastReservation = loadedReservations[0];

          if (lastReservation.status === 'Brouillon') {
            // Ajouter la réservation au LocalStorage car elle est en statut 'Brouillon'
            await addReservationToJson(lastReservation);
            console.log(`Réservation ID ${lastReservation.id} en statut 'Brouillon' ajoutée au LocalStorage.`);
          }

          // Sélectionner la dernière réservation par défaut
          this.selectedReservation = lastReservation.id;
          await this.handleReservationSelected(lastReservation);
          console.log(`Réservation ID ${lastReservation.id} sélectionnée par défaut.`);
        } else {
          console.warn("Aucune réservation disponible pour la sélection par défaut.");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la réservation par défaut :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible d'initialiser la réservation par défaut.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour initialiser le fichier JSON si nécessaire.
     * (Vous devez définir cette méthode selon vos besoins spécifiques.)
     */
    async initializeJsonFile() {
      try {
        const jsonData = await readJsonFromFile();
        if (!jsonData) {
          console.warn("LocalStorage vide. Initialisation avec des données vides.");
          await saveJsonToFile({ reservations: [], reservation_produits: [] });
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du fichier JSON :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible d'initialiser le fichier JSON.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour nettoyer le LocalStorage des réservations non 'Brouillon' ou non créées aujourd'hui.
     */
    async cleanLocalStorage() {
      try {
        let jsonData = await readJsonFromFile();
        if (jsonData && Array.isArray(jsonData.reservations)) {
          // Définir la date actuelle au format YYYY-MM-DD
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0]; // Exemple : '2023-08-25'

          // Filtrer les réservations à conserver :
          // - Statut 'Brouillon'
          // - Créées aujourd'hui
          const brouillonAndTodayReservations = jsonData.reservations.filter(res => {
            return res.status === 'Brouillon' && isDateToday(res.created_at);
          });

          // Filtrer les réservations à supprimer :
          // - Non 'Brouillon' OU non créées aujourd'hui
          const removedReservations = jsonData.reservations.filter(res => {
            return res.status !== 'Brouillon' || !isDateToday(res.created_at);
          });

          if (removedReservations.length > 0) {
            console.log(`Nettoyage du LocalStorage : Suppression de ${removedReservations.length} réservations (non 'Brouillon' ou non créées aujourd'hui).`);
          }

          // Mettre à jour les réservations dans jsonData
          jsonData.reservations = brouillonAndTodayReservations;

          // Supprimer les produits associés aux réservations supprimées
          const removedReservationIds = removedReservations.map(res => res.id);
          jsonData.reservation_produits = jsonData.reservation_produits.filter(prod => !removedReservationIds.includes(prod.reservation_id));

          // Sauvegarder les modifications dans le LocalStorage
          await saveJsonToFile(jsonData);
          console.log("LocalStorage nettoyé des réservations non 'Brouillon' ou non créées aujourd'hui.");
        }
      } catch (error) {
        console.error("Erreur lors du nettoyage du LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de nettoyer le LocalStorage.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour gérer la sélection d'une réservation.
     */
    async handleReservationSelected(reservation) {
      this.isLoading = true;
      this.key += 1; // Incrémenter la clé globale si nécessaire

      this.selectedReservation = reservation.id;
      console.log("Réservation sélectionnée dans le parent :", this.selectedReservation);
      this.currentReservation = reservation;

      // Charger les détails de la réservation
      await this.loadReservation(reservation);
      console.log("Produits sélectionnés (IDs) :", this.produits_selected);

      this.keyForm += 1; // Incrémenter la clé spécifique pour forcer le re-rendu du formulaire
      this.keyTotals += 1;
      this.isLoading = false;
    },

    /**
     * Fonction pour charger une réservation.
     */
    async loadReservation(reservation) {
      if (this.isLoadingReservation) {
        console.warn("Le chargement de la réservation est déjà en cours.");
        return;
      }

      this.isLoadingReservation = true;
      try {
        const reservationId = reservation.id;
        console.log(`ID de la réservation à charger : ${reservationId}`);

        if (!reservationId) {
          console.error("Erreur : reservationId est undefined ou null.");
          this.$toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "ID de réservation invalide.",
            life: 5000
          });
          return;
        }

        if (reservation.status === 'Brouillon') {
          // Charger depuis le LocalStorage
          const localData = await this.getReservationFromLocalStorage(reservationId);
          if (localData) {
            console.log(`Chargement de la réservation ID ${reservationId} depuis le LocalStorage.`);
            Object.assign(this.localReservation, localData);
            this.currentReservation = this.localReservation;

            // Charger les produits liés depuis le LocalStorage
            this.reservation_produits = await this.getReservationProduitsFromLocalStorage(reservationId);
            console.log("Produits chargés depuis le LocalStorage :", this.reservation_produits);

            if (this.reservation_produits.length > 0) {
              // Peupler produits_selected avec les IDs des produits
              this.produits_selected = this.reservation_produits
                .filter(prod => prod.produit_id !== undefined && prod.produit_id !== null)
                .map(prod => String(prod.produit_id).trim());
              console.log("Produits sélectionnés :", this.produits_selected);
            } else {
              console.warn(`Aucun produit associé trouvé pour la réservation ID ${reservationId}.`);
              this.produits_selected = [];
            }

            // Mettre à jour clientSelected
            this.clientSelected = this.clients.find(client => client.id === this.localReservation.client_id) || null;
            console.log("Client sélectionné :", this.clientSelected);

            // Calculer le crédit restant
            this.calculateCredit();

            // Vérifier si la réservation dans la base de données est plus récente et gérer le statut
            await this.compareAndUpdateReservation(reservationId, this.localReservation.updated_at);
            return;
          } else {
            console.warn(`Aucune donnée locale trouvée pour la réservation ID ${reservationId}.`);
          }
        }

        // Pour les statuts autres que 'Brouillon' ou si aucune donnée locale n'est trouvée, charger depuis l'API
        console.log(`Chargement de la réservation ID ${reservationId} depuis l'API.`);
        await this.loadReservationFromDatabase(reservationId);
      } catch (error) {
        console.error("Erreur lors du chargement de la réservation :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger la réservation.",
          life: 5000
        });
      } finally {
        this.isLoadingReservation = false;
        console.log("Chargement de la réservation terminé.");
      }
    },

    /**
     * Fonction pour charger une réservation depuis l'API.
     */
    async loadReservationFromDatabase(reservationId) {
      console.log(`Chargement de la réservation depuis la base de données avec ID : ${reservationId}`);
      try {
        // Requête pour obtenir les détails de la réservation
        const reservationResponse = await this.axios.get(`${this.baseUrl}/api/reservations/${reservationId}`);
        console.log("Réponse de l'API pour la réservation :", reservationResponse.data);

        if (reservationResponse.status === 200 && reservationResponse.data.data) {
          const reservation = reservationResponse.data.data;

          // Sanitiser la donnée de réservation
          const sanitizedReservation = sanitizeReservationData(reservation);
          console.log("Réservation sanitizée :", sanitizedReservation);

          this.globalReservation = sanitizedReservation;
          this.currentReservation = sanitizedReservation;

          // Mettre à jour clientSelected
          this.clientSelected = this.clients.find(client => client.id === sanitizedReservation.client_id) || null;
          console.log("Client sélectionné :", this.clientSelected);

          // Définir le libellé du client
          this.setClientLibelle();
          console.log("Réservation chargée et sanitizée depuis la base de données :", sanitizedReservation);

          // Gestion des produits
          if (sanitizedReservation.reservation_produits && Array.isArray(sanitizedReservation.reservation_produits) && sanitizedReservation.reservation_produits.length > 0) {
            this.reservation_produits = sanitizedReservation.reservation_produits.map(prod => ({
              ...prod,
              qte: Number(prod.qte) || 0,
              prix_de_vente: Number(prod.prix_de_vente) || 0,
              prix_achat: Number(prod.prix_achat) || 0,
              // ... convertir d'autres champs si nécessaire
            }));
            console.log("Produits de la réservation :", this.reservation_produits);

            // Peupler produits_selected avec les IDs des produits
            this.produits_selected = this.reservation_produits
              .filter(prod => prod.produit_id !== undefined && prod.produit_id !== null)
              .map(prod => String(prod.produit_id).trim());
            console.log("Produits sélectionnés :", this.produits_selected);

            // Mettre à jour le LocalStorage avec les produits si statut 'Brouillon'
            if (sanitizedReservation.status === 'Brouillon') {
              for (const produit of this.reservation_produits) {
                await addProductToReservation(reservationId, produit);
              }
            }
          } else {
            // Si les produits ne sont pas inclus dans la réponse ou sont vides, faire une deuxième requête
            console.warn("Aucun produit trouvé dans la réponse de la réservation. Tentative de chargement séparé des produits.");
            const produitsResponse = await this.axios.get(`${this.baseUrl}/api/reservation_produits?reservation_id=${reservationId}`);
            console.log("Réponse de l'API pour les produits :", produitsResponse.data);

            if (produitsResponse.status === 200 && Array.isArray(produitsResponse.data.data) && produitsResponse.data.data.length > 0) {
              this.reservation_produits = produitsResponse.data.data.map(prod => ({
                ...prod,
                qte: Number(prod.qte) || 0,
                prix_de_vente: Number(prod.prix_de_vente) || 0,
                prix_achat: Number(prod.prix_achat) || 0,
                // ... convertir d'autres champs si nécessaire
              }));
              console.log("Produits chargés séparément :", this.reservation_produits);

              // Peupler produits_selected avec les IDs des produits
              this.produits_selected = this.reservation_produits
                .filter(prod => prod.produit_id !== undefined && prod.produit_id !== null)
                .map(prod => String(prod.produit_id).trim());
              console.log("Produits sélectionnés :", this.produits_selected);

              // Mettre à jour le LocalStorage avec les produits si statut 'Brouillon'
              if (sanitizedReservation.status === 'Brouillon') {
                for (const produit of this.reservation_produits) {
                  await addProductToReservation(reservationId, produit);
                }
              }
            } else {
              // Gérer le cas où la réponse ne contient pas un tableau de produits
              console.warn("Échec du chargement des produits de la réservation :", produitsResponse.data);
              // Optionnel : Initialiser une liste vide ou d'autres actions nécessaires
              this.reservation_produits = [];
              this.produits_selected = [];
              console.log("Produits sélectionnés réinitialisés à vide.");
            }
          }

          // Enregistrer la réservation dans le LocalStorage pour un accès futur si statut 'Brouillon'
          if (sanitizedReservation.status === 'Brouillon') {
            await addReservationToJson(sanitizedReservation);
            console.log("Réservation enregistrée dans le LocalStorage.");
          }

          // Sélectionner la réservation par défaut si aucune n'est sélectionnée
          if (!this.selectedReservation) {
            console.log(`Aucune réservation sélectionnée. Définition de la réservation ID ${reservationId} comme sélectionnée par défaut.`);
            await this.handleReservationSelected(sanitizedReservation);
          }

        } else {
          console.warn(`La requête pour la réservation ID ${reservationId} a échoué :`, reservationResponse.statusText);
          this.$toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "La réservation n'a pas pu être chargée depuis l'API.",
            life: 5000
          });
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de la réservation depuis la base de données :`, error);
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error("Détails de la réponse d'erreur :", error.response.data);
            console.error("Statut de la réponse d'erreur :", error.response.status);
            console.error("Headers de la réponse d'erreur :", error.response.headers);
          } else if (error.request) {
            console.error("La requête a été faite mais aucune réponse n'a été reçue :", error.request);
          } else {
            console.error("Erreur lors de la configuration de la requête :", error.message);
          }
        }
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger la réservation depuis l'API.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour comparer et mettre à jour la réservation.
     */
    async compareAndUpdateReservation(reservationId, localUpdatedAt) {
      try {
        const response = await this.axios.get(`${this.baseUrl}/api/reservations/${reservationId}`);
        console.log(`Réponse de l'API pour la réservation ID ${reservationId} :`, response);

        if (response.status === 200 && response.data.data) {
          const apiReservation = response.data.data;
          const apiUpdatedAt = new Date(apiReservation.updated_at);
          const localDate = new Date(localUpdatedAt);
          const createdAt = new Date(apiReservation.created_at);

          const diffMinutes = calculateMinutesDifference(createdAt, apiUpdatedAt);
          console.log(`Différence de temps entre created_at et updated_at pour la réservation ID ${reservationId} : ${diffMinutes} minutes.`);

          if (diffMinutes >= 5 && apiUpdatedAt > localDate) {
            console.log(`La réservation ID ${reservationId} nécessite une mise à jour du LocalStorage (différence >= 5 minutes).`);

            if (apiReservation.status !== 'Brouillon') {
              console.log(`Le statut de la réservation ID ${reservationId} est '${apiReservation.status}' (non 'Brouillon'). Suppression du LocalStorage.`);

              // Supprimer la réservation et ses produits du LocalStorage
              await removeReservationFromLocalStorage(reservationId, this.$toast);

              // Charger et afficher les données depuis l'API
              await this.loadReservationFromDatabase(reservationId);
            } else {
              console.log(`Le statut de la réservation ID ${reservationId} est 'Brouillon'. Mise à jour du LocalStorage.`);

              // Sanitiser la donnée de réservation
              const sanitizedReservation = sanitizeReservationData(apiReservation);

              // Mettre à jour les produits liés
              if (sanitizedReservation.reservation_produits && Array.isArray(sanitizedReservation.reservation_produits) && sanitizedReservation.reservation_produits.length > 0) {
                this.reservation_produits = sanitizedReservation.reservation_produits.map(prod => ({
                  ...prod,
                  qte: Number(prod.qte) || 0,
                  prix_de_vente: Number(prod.prix_de_vente) || 0,
                  prix_achat: Number(prod.prix_achat) || 0,
                }));
                console.log("Produits de la réservation mis à jour :", this.reservation_produits);

                // Mettre à jour le LocalStorage avec les produits
                for (const produit of this.reservation_produits) {
                  await addProductToReservation(reservationId, produit);
                }
              }

              // Enregistrer la réservation mise à jour dans le LocalStorage
              await addReservationToJson(sanitizedReservation);
              Object.assign(this.localReservation, sanitizedReservation);
              this.currentReservation = sanitizedReservation;

              // Mettre à jour clientSelected
              this.clientSelected = this.clients.find(client => client.id === this.localReservation.client_id) || null;

              // Recalculer le crédit restant
              this.calculateCredit();
            }
          } else {
            console.log(`La réservation ID ${reservationId} ne nécessite pas de mise à jour du LocalStorage (différence < 5 minutes ou API updated_at <= local updated_at).`);
          }
        } else {
          console.warn(`La requête pour la réservation ID ${reservationId} a échoué :`, response.statusText);
          this.$toast.add({
            severity: 'warn',
            summary: 'Attention',
            detail: "La réservation n'a pas pu être mise à jour.",
            life: 5000
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la comparaison des dates pour la réservation ID ${reservationId} :`, error);
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: 'Impossible de comparer les dates de modification de la réservation.',
          life: 5000
        });
      }
    },

    /**
     * Fonction pour sanitiser les données de réservation (wrapper).
     */
    sanitizeData(reservation) {
      return sanitizeReservationData(reservation);
    },

    /**
     * Fonction pour obtenir une réservation depuis le LocalStorage.
     */
    async getReservationFromLocalStorage(reservationId) {
      try {
        const jsonData = await readJsonFromFile();
        if (jsonData && jsonData.reservations) {
          const reservation = jsonData.reservations.find(res => res.id === reservationId);
          console.log(`Réservation ID ${reservationId} trouvée dans le LocalStorage :`, reservation);
          return reservation || null;
        }
        return null;
      } catch (error) {
        console.error("Erreur lors de la lecture du LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de lire la réservation depuis le LocalStorage.",
          life: 5000
        });
        return null;
      }
    },

    /**
     * Fonction pour obtenir les produits d'une réservation depuis le LocalStorage.
     */
    async getReservationProduitsFromLocalStorage(reservationId){
      try {
        const jsonData = await readJsonFromFile();
        if (jsonData && jsonData.reservation_produits) {
          const produits = jsonData.reservation_produits.filter(prod => prod.reservation_id === reservationId);
          console.log(`Produits de la réservation ID ${reservationId} trouvés dans le LocalStorage :`, produits);
          return produits;
        }
        return [];
      } catch (error) {
        console.error("Erreur lors de la lecture des produits de réservation depuis le LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de lire les produits depuis le LocalStorage.",
          life: 5000
        });
        return [];
      }
    },

    /**
     * Fonction pour mettre à jour le libellé du client sélectionné.
     */
    setClientLibelle() { 
      const client = this.clients.find((item) => item.id === this.localReservation.client_id) || null;
      console.log("Client sélectionné :", client);

      if (client) {
        this.clientSelected = client;
        this.localReservation.client = client.libelle;
        console.log("LocalReservation.client mis à jour :", this.localReservation.client);

        if (client.prise_en_charge) {
          this.reservation_produits.forEach((product) => {
            product.prise_en_charge = client.prise_en_charge;
            product.cout_total = product.prix_de_vente * (1 - client.prise_en_charge / 100);
          });
          console.log("Produits mis à jour avec prise en charge :", this.reservation_produits);
        }
      } else {
        this.clientSelected = null;
        this.localReservation.client = "COMPTANT";
        console.log("Aucun client sélectionné. LocalReservation.client défini à 'COMPTANT'.");
      }

      // Calculer le crédit restant
      this.calculateCredit();

      // Appeler la méthode pour mettre à jour le client dans le LocalStorage
      this.updateClientInLocalStorage();
    },

    /**
     * Fonction pour mettre à jour le client dans le LocalStorage.
     */
    async updateClientInLocalStorage() {
      try {
        // Vérifier si la réservation est en statut 'Brouillon' avant de mettre à jour le LocalStorage
        if (this.localReservation.status !== 'Brouillon') {
          console.log(`Réservation ID ${this.localReservation.id} n'est pas en statut 'Brouillon'. Mise à jour du client dans le LocalStorage non nécessaire.`);
          return;
        }

        await addReservationToJson(this.localReservation);
        console.log("Client mis à jour dans le LocalStorage :", this.localReservation.client);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du client dans le LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de mettre à jour le client dans le LocalStorage.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour rafraîchir les réservations.
     */
    async refreshReservations() {
      try {
        this.isLoading = true;
        const loadedReservations = await loadAllReservationsFromApi(this.baseUrl, axios);
        this.reservations = loadedReservations;
        console.log("Réservations rafraîchies :", this.reservations);
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des réservations :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de rafraîchir les réservations.",
          life: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fonction pour gérer l'événement 'someEvent' de DropdownNavCard (exemple).
     */
    handleSomeEvent() {
      // Implémentez votre logique ici
      console.log("Événement 'someEvent' déclenché.");
    },

    /**
     * Fonction pour comparer et mettre à jour la réservation (wrapper).
     */
    compareAndUpdate(reservationId, localUpdatedAt) {
      return this.compareAndUpdateReservation(reservationId, localUpdatedAt);
    },

    /**
     * Fonction pour gérer les mises à jour des réservations.
     */
    async handleReservationUpdated(updatedReservation) {
      try {
        // Rafraîchir les réservations
        await this.refreshReservations();

        // Sélectionner la réservation mise à jour
        await this.handleReservationSelected(updatedReservation);

        console.log("Réservation mise à jour et sélectionnée dans le parent.");
      } catch (error) {
        console.error("Erreur lors de la gestion de la réservation mise à jour :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Une erreur s'est produite lors de la gestion de la réservation mise à jour.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour gérer la création d'une facture.
     */
    async createFacture() {
      this.devisIsLoading = true;
      let FactureForm = {
        client: this.localReservation.client,
        reservation_id: this.localReservation.id,
        net_a_payer: this.localReservation.montant,
        type: 'Devis',
        created_by: 'Utilisateur', // Remplacez par votre logique pour obtenir le nom de l'utilisateur
      };
      try {
        const response = await this.axios.post(`${this.baseUrl}/api/factures`, FactureForm);
        if (response.data.success === true) {
          await this.updateReservationInJson(this.localReservation.id, { status: 'Devis' }); // Exemple de mise à jour
          this.devisIsLoading = false;
          this.$toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: "Facture créée avec succès.",
            life: 5000
          });
        } else {
          response.data.errors.forEach((element) => {
            this.$toast.add({
              severity: 'warn',
              summary: 'Oups !',
              detail: element,
              life: 7000
            });
          });
          this.devisIsLoading = false;
        }
      } catch (error) {
        this.devisIsLoading = false;
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Une erreur s'est produite lors de la création de la facture.",
          life: 5000
        });
        console.error("Erreur lors de la création de la facture :", error);
      }
    },

    /**
     * Fonction pour transformer une réservation en devis.
     */
    async transformToInvoice() {
      this.localReservation.status = 'Devis';
      this.localReservation.switch_devis_at = new Date().toLocaleString('fr-FR');
      await this.createFacture();
    },

    /**
     * Fonction pour vérifier si une réservation est traitable.
     */
    isTreatable() {
      if (this.currentReservation && this.currentReservation.status !== 'Termine' && this.currentReservation.status !== 'Annule' && this.currentReservation.status !== 'Devis') {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Fonction pour commander un produit.
     */
    async commandProduit(id) {
      this.$set(this.isLoadingInput, id, true);
      try {
        const response = await this.axios.post(`${this.baseUrl}/api/commandes/ajouter-produit/${id}`);
        if (response.data.success === true) {
          this.$toast.add({
            severity: 'success',
            detail: response.data.message,
            life: 3000
          });
        }
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: "Une erreur s'est produite lors de la connexion au serveur !",
          life: 5000
        });
        console.error("Erreur lors de la commande du produit :", error);
      } finally {
        this.$set(this.isLoadingInput, id, false);
      }
    },

    /**
     * Fonction pour créer une facture et transformer en devis.
     */
    async transformAndCreateFacture() {
      await this.transformToInvoice();
    },

    /**
     * Fonction pour obtenir les gardes actives depuis l'API.
     */
    async checkGardeActive() {
      this.isLoading = true;
      try {
        const response = await this.axios.get(`${this.baseUrl}/api/gardes/actuelle`);
        if (response.data && response.data.data) {
          this.gardeActive = response.data.data;
        }
        this.isReady = true;
      } catch (error) {
        this.isLoading = false;
        this.$toast.add({
          severity: 'error',
          summary: 'Problème de connexion',
          detail: "Une erreur s'est produite lors de la connexion au serveur !",
          life: 5000
        });
        console.error("Erreur lors de la vérification de la garde active :", error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fonction pour gérer l'ajout ou la suppression d'un produit localement.
     */
    async toggleProduitLocal(line, action) {
      if (!line || !line.produit_id) {
        console.error("Erreur : Produit invalide");
        return;
      }

      try {
        const jsonData = await readJsonFromFile();
        this.isSaving = true;

        if (!jsonData) {
          console.error("LocalStorage vide ou introuvable.");
          return;
        }

        if (action === "add") {
          // Vérifie si le produit existe déjà dans LocalStorage
          const existingProductIndex = jsonData.reservation_produits.findIndex(
            (prod) => String(prod.produit_id).trim().toLowerCase() === String(line.produit_id).trim().toLowerCase() && prod.reservation_id === this.localReservation.id
          );

          if (existingProductIndex === -1) {
            // Produit non trouvé : Ajout d'un nouveau produit
            this.produits_selected.push(line.produit_id);

            const result = this.calculerTotalProduits(line, 1, this.gardeActive, this.clientSelected?.remise_percent || 0);

            const newItem = {
              produit_id: line.produit_id,
              libelle: line.libelle,
              qte: 1,
              prix_de_vente: line.prix_de_vente,
              prix_achat: line.prix_achat,
              cout_total: result.totalClient,
              cout_total_reel: result.totalClient,
              produit: { 
                ...line, 
                produit_qte: line.qte,
                qte:1,
              },
              produit_qte: line.qte,
              reservation_id: this.localReservation.id,
              remise_percent: this.clientSelected?.remise_percent || 0, // Ajout du champ remise_percent
              prise_en_charge: this.clientSelected?.remise_percent || 0, // Utilisation de remise_percent pour prise_en_charge
              total_ht: result.totalHorsTaxe,
              total_tva: result.totalTVA,
              total_css: result.totalCSS,
              total_garde: result.totalGarde,
              total_prise_en_charge: result.totalPriseEnCharge,
              is_sold: false,
              vente_id: null,
            };

            jsonData.reservation_produits.push(newItem);
            this.reservation_produits.push(newItem);
          } else {
            // Produit déjà existant : Mise à jour de la quantité
            jsonData.reservation_produits[existingProductIndex].qte += 1;
            this.reservation_produits[existingProductIndex].qte += 1;
          }
        } else if (action === "remove") {
          this.produits_selected = this.produits_selected.filter((pid) => pid !== line.produit_id);
          this.reservation_produits = this.reservation_produits.filter((prod) => prod.produit_id !== line.produit_id);
          jsonData.reservation_produits = jsonData.reservation_produits.filter(
            (prod) => prod.produit_id !== line.produit_id || prod.reservation_id !== this.localReservation.id
          );
        }

        // Utilisation du débounce pour sauvegarder les données dans LocalStorage
        this.debounceSaveJson(jsonData);

        // Afficher une notification de succès
        this.$toast.add({
          severity: "success",
          detail: action === "add" ? "Produit ajouté avec succès." : "Produit supprimé avec succès.",
          life: 3000,
        });
        
      } catch (error) {
        console.error("Erreur lors de la mise à jour de LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de mettre à jour le LocalStorage.",
          life: 5000
        });
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Méthode de sauvegarde avec débounce.
     */
    debounceSaveJson: _.debounce(async function(jsonData) {
      if (this.isSavingJson) {
        console.warn("Sauvegarde en cours, veuillez patienter...");
        return;
      }

      this.isSavingJson = true; // Verrouille la sauvegarde

      try {
        await saveJsonToFile(jsonData);
        console.log("LocalStorage sauvegardé avec succès via debounce.");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde dans LocalStorage :", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la sauvegarde dans LocalStorage.",
          life: 5000,
        });
      } finally {
        this.isSavingJson = false; // Libère le verrou
        this.isSaving = false;
      }
    }, 500),

    /**
     * Fonction pour mettre à jour une ligne localement.
     */
    async updateLineLocal(line, action, newValue) {
      if (action === 'remove') {
        this.reservation_produits = this.reservation_produits.filter(
          (p) => Number(p.produit_id) !== Number(line.produit_id)
        );
        this.produits_selected = this.produits_selected.filter(
          (pid) => pid !== Number(line.produit_id)
        );
      } else if (action === 'qte') {
        line.qte = Number(newValue) || 1;
      } else if (action === 'prise_en_charge') {
        line.prise_en_charge = Number(newValue) || 0;
      }

      // Recalculer les totaux
      if (action !== 'remove') {
        const result = this.calculerTotalProduits(line, line.qte, this.gardeActive, line.prise_en_charge);
        line.total_tva = result.totalTVA;
        line.total_css = result.totalCSS;
        line.total_ht = result.totalHorsTaxe;
        line.total_garde = result.totalGarde;
        line.total_prise_en_charge = result.totalPriseEnCharge;
        line.cout_total = result.totalClient;
        line.cout_total_reel = result.totalClient;
      }

      // Mettre à jour LocalStorage
      await this.saveToJsonFile();
    },

    /**
     * Fonction pour sauvegarder les données actuelles dans le LocalStorage.
     */
    async saveToJsonFile() {
      if (this.isSavingJson) {
        console.warn("Sauvegarde en cours, veuillez patienter...");
        return;
      }

      this.isSavingJson = true;
      this.isSaving = true;

      try {
        const jsonData = await readJsonFromFile();

        if (!jsonData) {
          console.warn("LocalStorage vide. Initialisation avec des données vides.");
          // Initialisez avec des données vides
          await saveJsonToFile({ reservations: [], reservation_produits: [] });
          return;
        }

        // Rechercher la réservation existante
        const existingReservationIndex = jsonData.reservations.findIndex(res => res.id === this.localReservation.id);
        
        if (existingReservationIndex !== -1) {
          // Mise à jour de la réservation existante
          jsonData.reservations[existingReservationIndex] = {
            ...jsonData.reservations[existingReservationIndex], // Préserver les données existantes
            ...this.localReservation, // Mettre à jour avec les nouvelles données
          };
        } else {
          // Ajouter une nouvelle réservation si elle n'existe pas
          jsonData.reservations.push(this.localReservation);
        }

        // Mettre à jour la liste des produits
        jsonData.reservation_produits = jsonData.reservation_produits.filter(
          prod => prod.reservation_id !== this.localReservation.id
        ).concat(this.reservation_produits);

        // Sauvegarder dans LocalStorage
        await saveJsonToFile(jsonData);

        console.log("LocalStorage mis à jour avec succès.");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde dans LocalStorage :", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: "Échec de la sauvegarde dans LocalStorage.",
          life: 5000,
        });
      } finally {
        this.isSavingJson = false;
        this.isSaving = false;
      }
    },

    /**
     * Fonction pour obtenir les clients depuis l'API.
     */
    async getClients() {
      this.isLoading = true;
      try {
        const response = await this.axios.get(`${this.baseUrl}/api/clients`);
        if (response.status === 200 && Array.isArray(response.data.data)) {
          this.clients = response.data.data;
          console.log("Liste des clients chargée :", this.clients);
          
          // Vérifier si tous les clients référencés existent
          const clientIds = this.reservations.map(res => res.client_id);
          clientIds.forEach(id => {
            if (!this.clients.find(client => client.id === id)) {
              console.warn(`Client avec ID ${id} référencé dans une réservation n'existe pas dans la liste des clients.`);
            }
          });

          this.setClientLibelle();
        } else {
          console.warn("La réponse de l'API pour les clients n'est pas valide.");
          this.$toast.add({
            severity: 'warn',
            summary: 'Attention',
            detail: "La réponse du serveur pour les clients n'est pas valide.",
            life: 5000
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des clients :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger les clients.",
          life: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Méthode pour supprimer une réservation du LocalStorage.
     * (Vous devez définir cette méthode selon vos besoins spécifiques.)
     */
    async removeReservationFromLocalStorage(reservationId, toastInstance) {
      try {
        // Implémentez la logique pour supprimer une réservation du LocalStorage
        // Par exemple :
        let jsonData = await readJsonFromFile();
        if (jsonData) {
          jsonData.reservations = jsonData.reservations.filter(res => res.id !== reservationId);
          jsonData.reservation_produits = jsonData.reservation_produits.filter(prod => prod.reservation_id !== reservationId);
          await saveJsonToFile(jsonData);
          console.log(`Réservation ID ${reservationId} supprimée du LocalStorage.`);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la réservation du LocalStorage :", error);
        toastInstance.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de supprimer la réservation du LocalStorage.",
          life: 5000
        });
      }
    },

    /**
     * Fonction pour mettre à jour la réservation dans le JSON (wrapper).
     */
    async updateReservationInJson(reservationId, updateData) {
      try {
        const jsonData = await readJsonFromFile();
        if (jsonData) {
          const reservationIndex = jsonData.reservations.findIndex(res => res.id === reservationId);
          if (reservationIndex !== -1) {
            jsonData.reservations[reservationIndex] = {
              ...jsonData.reservations[reservationIndex],
              ...updateData,
            };
            await saveJsonToFile(jsonData);
            console.log(`Réservation ID ${reservationId} mise à jour dans le LocalStorage.`);
          } else {
            console.warn(`Réservation ID ${reservationId} non trouvée dans le LocalStorage.`);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la réservation dans le LocalStorage :", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de mettre à jour la réservation dans le LocalStorage.",
          life: 5000
        });
      }
    },
        
    },
    async mounted() {
        this.getCaisses()
        this.getClients()
        this.initializeDefaultReservation();
        this.cleanLocalStorage();
       
    },
    watch: {
    totalPriseEnCharge: {
        handler() {
            this.calculateCredit();
        },
        immediate: true
    }
}


});
</script>
<style scoped>
.card .position-relative {
    position: relative;
}

.overlay {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.2);
    /* Grise l'arrière-plan */
    z-index: 1050;
    pointer-events: all;
    /* Désactive les interactions sur les éléments sous l'overlay */
}

.watermark {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(30deg);
    border-style: dashed;
    color: #ff0022;
    font-size: 2.1em;
    font-weight: bold;
    opacity: 0.5;
    z-index: 1060;
    /* z-index: 1; */
    pointer-events: none;
    /* Désactive les clics sur le filigrane */
}

.border-primary {
    border-color: #007bff !important;
}

.text-primary {
    color: #007bff !important;
}

.bg-danger {
    background-color: #dc3545 !important;
}

.border-danger {
    border-color: #dc3545 !important;
}

.text-white {
    color: #fff !important;
}

.h-fixed {
    height: 70vh;
    overflow-y: auto;
}

.search-form {
    font-size: 1.2rem;
    padding: 0.75rem;
}
</style>