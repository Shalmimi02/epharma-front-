<template>
    <EpharmaTemplate :withHeader="false">
        <template #content v-if="isReady">
            <!-- pour afficher la garde -->
            <div class="bg-primary rounded" v-if="gardeActive">
                <p class="text-center text-white">Une garde est en cours, taxe : {{
                    $moneyFormat(gardeActive.montant_taxe) }}</p>
            </div>
            
            <div class="container py-3">
                <TopbarReservation
                 @reservationSelected="handleReservationSelected"
                    :selectedReservation="activeReservation" :productReservation="activeReservationProduits"
                    :reservations="reservations" @refresh-reservations="refreshReservations" :key="refreshKey" />
                   
                   
                    
                <div class="row d-flex justify-content-center">
                    <div class="col-md-9 h-fixed">
                        <!-- Loader -->
                        <HourGlassLoader v-if="isLoading" :isOverlay="true"></HourGlassLoader>
                        <HourGlassLoader v-else-if="isSaving" :isAutoSave="true" message="Sauvegarde en cours...">
                        </HourGlassLoader>

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
                                        <div v-if="activeReservation.status === 'Annule'"
                                            class="watermark border-danger px-5">
                                            Réservation annulée
                                        </div>
                                        <div v-else-if="activeReservation.status === 'Termine'"
                                            class="watermark border-danger px-5">
                                            Réservation fermée
                                        </div>
                                        <div v-else-if="activeReservation.status === 'Devis'"
                                            class="watermark border-danger px-5">
                                            Transformée en devis
                                        </div>

                                        <!-- Sélection de la caisse -->
                                        <div class="d-flex flex-wrap mb-3">
                                            <button v-for="caisse in caisses" 
                                                :class="{ 'border border-primary': activeReservation.caisse_id === caisse.id }"
                                                class="btn btn-light mr-2 mb-2 py-3 px-4 text-dark"
                                                @click="setCaisseId(caisse)">
                                                <i class="fas fa-cash-register mr-1"></i>
                                                <span>{{ caisse.libelle }}</span>
                                            </button>
                                        </div>

                                        <!-- Formulaire principal -->
                                        <form>
                                            <div class="form-row">
                                                <!-- Client -->
                                                <div
                                                    v-if="(clientSelected && clientSelected.libelle) || (activeReservation && activeReservation.client)"
                                                    class="form-group col-md-5"
                                                >
                                                <label>Client</label>

                                                <!-- Si des produits ont déjà été ajoutés, on affiche un champ en lecture seule -->
                                                <input
                                                    v-if="(activeReservationProduits || []).length > 0"
                                                    type="text"
                                                    class="form-control"
                                                    :value="clientDisplayName"
                                                    disabled
                                                />

                                                <!-- Sinon, on propose un <select> pour choisir le client -->
                                                <select
                                                    v-else
                                                    class="form-control border border-dark px-[4rem]"
                                                    v-model="currentReservation.client_id"
                                                    @change="setClientLibelle"
                                                >
                                                    <option
                                                    v-for="client in clients"
                                                    
                                                    :value="client.id"
                                                    >
                                                    <!-- Affiche "nom (libelle)" si client.nom existe, sinon "libelle" -->
                                                    <template v-if="client.nom">
                                                        {{ client.nom }} ({{ client.libelle }})
                                                    </template>
                                                    <template v-else>
                                                        {{ client.libelle }}
                                                    </template>
                                                    </option>
                                                </select>
                                                </div>
                                                <!-- Crédit -->
                                                <div v-show="clientSelected && parseFloat(clientSelected.plafond_dette) > 0"
                                                    class="form-group col-md-5">
                                                    <label>Crédit</label>
                                                    <input type="text" class="form-control" :class="creditClass"
                                                        :value="creditToDisplay" disabled />
                                                </div>
                                            </div>

                                            <!-- Assurance -->
                                            <div
                                                v-show="clientSelected && clientSelected.libelle && clientSelected.libelle.toUpperCase() !== 'COMPTANT'"
                                                
                                                class="form-row"
                                            >
                                                <div class="form-group col-md-5">
                                                    <label>Identifiant de l'Assuré (NAG)</label>
                                                    <input type="text" v-model="currentReservation.identifiant_assure"
                                                        class="form-control border border-dark px-[4rem]"
                                                        @change="autoSave()" />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>Nom de l'Assuré</label>
                                                    <input type="text" v-model="currentReservation.nom_assure"
                                                        class="form-control border border-dark px-[4rem]"
                                                        @change="autoSave()" />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>N° Feuille Assuré</label>
                                                    <input type="text" v-model="currentReservation.numero_feuille_assure"
                                                        class="form-control border border-dark px-[4rem]"
                                                        @change="autoSave()" />
                                                </div>
                                                <div class="form-group col-md-5">
                                                    <label>Secteur</label>
                                                    <select v-model="currentReservation.secteur_assure"
                                                        class="form-control border border-dark px-[4rem]"
                                                        @change="autoSave()">
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

                            <SectionVisibility libelleSection="la selection des produits"
                                :isOpen="true" v-if="activeReservation && activeReservation.status == 'Brouillon'">
                                <template #section_content>
                                    <div class="mb-3 position-relative">
                                        <div class="form-group">
                                            <input type="search" ref="searchInput" class="form-control form-control-lg search-form"
                                                placeholder="Tapez le mot clé à rechercher" v-model="keyWord"
                                                @input="keySelectionTable++">
                                        </div>
                                        <AsdecodeTable v-if="keyWord != ''" :key="keySelectionTable"  noExport
                                            :url=" '/api/produits?is_active=1'"
                                            :columns="columns" :newKeyWord="keyWord" table="produits">
                                            <template #header_action_btns>
                                                <button v-if="produits_selected.length > 0"
                                                    class="btn btn-light text-secondary mr-2" disabled>
                                                    {{ produits_selected.length }} produits sélectionnés
                                                </button>
                                                
                                                <button 
                                                    class="btn btn-primary mr-2" 
                                                    @click="openPrescriptionAssistant"
                                                    title="Aide à la prescription">
                                                    <i class="fas fa-stethoscope mr-1"></i>
                                                    Aide prescription
                                                </button>
                                                <div class="d-flex align-items-center">
                                                    <!-- Checkbox stylisé avec icône FontAwesome -->
                                                    <div class="custom-checkbox-container mr-3" 
                                                         data-toggle="tooltip" 
                                                         data-placement="top" 
                                                         title="Afficher la posologie sur le ticket de caisse">
                                                        <label class="custom-checkbox-label" for="showPosologieCheck">
                                                            <input 
                                                                type="checkbox" 
                                                                v-model="showPosologie" 
                                                                id="showPosologieCheck"
                                                                class="custom-checkbox-input"
                                                            >
                                                            <span class="custom-checkbox-icon">
                                                                <i v-if="showPosologie" class="fas fa-prescription-bottle-alt text-success"></i>
                                                                <i v-else class="far fa-square text-muted"></i>
                                                            </span>
                                                            <span class="custom-checkbox-text ml-2">
                                                                Posologie sur ticket
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </template>
                                            <template #action_btns="slotProps">
                                                <span v-if="isLoadingInput[slotProps.data.id]"
                                                    class="spinner-border spinner-border-sm" role="status"
                                                    aria-hidden="true"></span>
                                                <div v-else>
                                                    <button
                                                        v-if="produits_selected.some(pid => pid == slotProps.data.id)"
                                                        :id="slotProps.data.id" class="btn btn-danger btn-sm m-1"
                                                        @click="toggleProduitLocal(slotProps.data, 'remove')"
                                                        title="Retirer">
                                                        <i class="fa-solid fa-trash-alt"></i>
                                                    </button>

                                                    <button
                                                        v-else-if="!produits_selected.some(pid => pid == slotProps.data.id) && slotProps.data.qte > 0 && parseFloat(slotProps.data.prix_de_vente) > 0"
                                                        type="button" class="btn btn-success btn-sm m-1"
                                                        @click="toggleProduitLocal(slotProps.data, 'add')"
                                                        title="Ajouter">
                                                        <i class="fa-solid fa-plus"></i>
                                                    </button>

                                                    <button type="button" class="btn btn-secondary btn-sm"
                                                        @click="commandProduit(slotProps.data.id)" title="Commander">
                                                        <i class="fa-solid fa-cart-arrow-down"></i>
                                                    </button>
                                                </div>
                                            </template>
                                            <template #photoproduit="slotProps">
                                                <div class="photo-container" @mouseenter="showEnlargedImage(slotProps.data.photo)"
                                                    @mouseleave="hideEnlargedImage">
                                                    <img :src="slotProps.data.photo || '/landscape-photo-svgrepo-com.svg'" alt="Photo" class="thumb" />
                                                </div>
                                            </template>
                                            <template #libelle="slotProps">
                                                {{ slotProps.data.libelle }}
                                                <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
                                                <span class="text-bleu3 ml-2"
                                                    v-if="slotProps.data.css == '1'">CSS</span>
                                            </template>
                                            <template #equivalent="slotProps">
                                                <button class="btn  btn-primary btn-sm m-1" @click="openEquivalenceProducts(slotProps.data)">
                                                    <i class="fa-solid fa-notes-medical"></i>
                                                </button>
                                            </template>
                                        </AsdecodeTable>
                                    </div>
                                </template>
                            </SectionVisibility>

                            <SectionVisibility  libelleSection="les produits selectionnés" :isOpen="true" v-show="clientSelected || activeReservation.client">
                                <template #section_content>
                                    <div class="card">
                                        <div class="card-header p-0">
                                            <button type="button" class="btn btn-light mr-2" @click="transformToInvoice"
                                                v-show="(isTreatable() == true) && (activeReservationProduits.length > 0)">
                                                <i class="fa-solid fa-file-pdf"></i> Transformer en devis
                                                <span v-if="devisIsLoading" class="spinner-border spinner-border-sm"
                                                    role="status" aria-hidden="true"></span>
                                            </button>
                                        </div>
                                        <div class="card-body p-0">
                                            <DataTable :value="activeReservationProduits" paginator
                                                :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]">
                                                <!-- Bouton suppression -->
                                                <Column field="id" header=" " :style="{ display: isTreatable() ? 'block' : 'none' }">
                                                    <template #body="slotProps">                                                       
                                                        <span v-if="isLoadingInput[slotProps.data.id]"
                                                            class="spinner-border spinner-border-sm"
                                                            role="status"></span>
                                                        <button v-else type="button" class="btn btn-sm text-danger"
                                                            @click="updateLineLocal(slotProps.data, 'remove')">
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
                                                        :value="parseInt(slotProps.data.qte)"
                                                        :max="parseInt(slotProps.data.produit.qte)"
                                                        min="1"
                                                        @change="updateLineLocal(slotProps.data, 'qte', slotProps.data.qte ,$event)"
                                                        :disabled="isLoadingInput[slotProps.data.id] || !isTreatable() || isRemiseAppliquee"
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

                                                        <input type="number"
                                                            class="form-control border border-dark px-[4rem]"
                                                            name="prise_en_charge"
                                                            :value="slotProps.data.prise_en_charge"
                                                            min="0" max="100"
                                                            @change="updateLineLocal(slotProps.data, 'prise_en_charge', $event.target.value)"
                                                            :disabled="isLoadingInput[slotProps.data.id] || !isTreatable() || (clientSelected && clientSelected.libelle.toLowerCase() == 'comptant') || isRemiseAppliquee"/>
                                                    </template>
                                                </Column>
                                            </DataTable>
                                        </div>
                                    </div>
                                </template>
                            </SectionVisibility>
                        </div>
                    </div>
                    <div class="col-md-3" >
                        <div v-if="activeReservation" class="card card-body p-2 bg-primary text-white mb-2">
                            <h5>TTC CLIENT</h5>
                             <!-- Badge Remise -->
                            <transition name="fade">
                                <span v-if="appliedRemise > 0" class="remisebadge badge bg-warning text-dark m-2">
                                    MT avant remise : {{ $moneyFormat((montantComputed + appliedRemise) ) }}
                                </span>
                            </transition>
                            <span :class="['text-center', 'h4', { 'text-danger': montantComputed < 0 }]">{{
                                $moneyFormat(montantComputed)
                            }}</span>
                        </div>

                        <!-- Autres Totaux -->
                        <div v-if="activeReservation" class="card card-body p-2 bg-info text-white mb-2">
                            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                            <div v-else-if="produits_selected.length > 0 || activeReservationProduits.length > 0">
                                <!-- % TAUX -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalPriseEnCharge !== null && totalPriseEnCharge !== undefined">
                                    <span>% TAUX: </span>
                                    <span>{{ $moneyFormat(totalPriseEnCharge) }}</span>
                                </div>

                                <!-- Montant TTC -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalTTC !== null && totalTTC !== undefined">
                                    <span>MT TTC: </span>
                                    <span>{{ $moneyFormat(totalTTC) }}</span>
                                </div>

                                <!-- Montant HT -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalHT !== null && totalHT !== undefined">
                                    <span>MT HT: </span>
                                    <span>{{ $moneyFormat(totalHT) }}</span>
                                </div>

                                <!-- Montant TVA -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalTVA !== null && totalTVA !== undefined">
                                    <span>MT TVA: </span>
                                    <span>{{ $moneyFormat(totalTVA) }}</span>
                                </div>

                                <!-- Montant CSS -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalCSS !== null && totalCSS !== undefined">
                                    <span>MT CSS: </span>
                                    <span>{{ $moneyFormat(totalCSS) }}</span>
                                </div>

                                <!-- Montant Garde -->
                                <div class="d-flex justify-content-between"
                                    v-if="totalGarde !== null && totalGarde !== undefined">
                                    <span>Garde: </span>
                                    <span>{{ $moneyFormat(totalGarde) }}</span>
                                </div>
                            </div>
                        </div>

                       
                        <!-- Section Remise -->
                        <div v-if="activeReservation && activeReservation.status == 'Brouillon' && montantComputed !== 0"
                        class="card card-body p-2 bg-secondary text-white mb-2">

                            <div class="form-group">
                                <label for="remise">Valeur de la Remise</label>
                                <input type="number" id="remise" class="form-control" v-model.number="remise" min="0"
                                    :max="montantOriginalComputed" placeholder="0.00"
                                    :disabled="produits_selected.length <= 0 || activeReservationProduits.length <= 0 || isRemiseAppliquee" />
                            </div>
                            <!-- Bouton Appliquer / Retirer -->
                            <button 
                                type="button" 
                                class="btn mt-2" 
                                :class="isRemiseAppliquee ? 'btn-danger' : 'btn-primary'"
                                @click="toggleRemise"
                                :disabled="(!isRemiseAppliquee && (!isRemiseValide ||  produits_selected.length <= 0 || activeReservationProduits.length <= 0))">
                                {{ isRemiseAppliquee ? 'Retirer' : 'Appliquer' }}
                            </button>
                        </div>

                        <div class="mt-3" v-if="reservationSent">
                            <p v-if="updatedMessage">
                                La caisse {{ activeReservation.caisse }} a été mise à jour
                            </p>
                            <p v-else>
                                Réservation envoyée à la caisse {{ activeReservation.caisse }}
                            </p>
                        </div>

                        <!-- Bouton pour passer à la caisse -->
                        <div class="mt-3"
                        v-if="showButton">
                            <button
                                type="button"
                                :class="buttonClass"
                                class="mx-auto mt-5 mb-1"
                                :disabled="isButtonDisabled"
                                @click="sendReservation"
                                >
                                <i class="fa-solid fa-share mr-1"></i>
                                {{ buttonLabel }}
                            </button>
                        </div>

                        <BuyReservation v-if="activeReservation && produits_selected.length > 0"
                            :reservation="activeReservation" :montantTTC="montantComputed" :remiseValue="remise"
                            :reservation_produits="activeReservationProduits" :clientSelected="clientSelected" :showPosologie="showPosologie"
                            @reservation-updated="handleReservationUpdated" />

                        
                    </div>
                    <!-- Image agrandie (hors de SectionVisibility) -->
                    <teleport to="body">
                        <div v-show="enlargedImage" class="enlarged-image-container">
                            <img :src="enlargedImage" alt="Photo agrandie" class="enlarged-img" />
                        </div>
                    </teleport>
                </div>
                 
            </div>

        </template>
    </EpharmaTemplate>
</template>

<script>
import TopbarReservation from "./TopbarReservation.vue";

import BuyReservation from "./BuyReservation.vue";


import $ from 'jquery';
import { defineComponent } from 'vue';
import {
    readJsonFromFile,
    saveJsonToFile,
    updateReservationInJson
} from "@/views/calculs/logUtils";
import { calculerProduit } from "@/views/calculs/add-produits-reservation.ts"
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import _ from 'lodash';
import EquivalentMedicamentModal from "@/components/EquivalentMedicamentModal"
import PrescriptionModal from "@/components/PrescriptionModal"


export default defineComponent({
    name: "Reservations",
    components: { TopbarReservation, BuyReservation, DataTable, Column },
    data() {
        return {
            isReady: false,
            table: 'reservation_produits',
            lines: 0,
            key: 1,
            keyForm: 1,
            keySelectionTable: 1,
            loadedData: null,
            keyShow: 1,
            isLoading: false,
            isSaving: false,
            nb_products: 0,
            reservations: [], // Liste des réservations
            caisses: [],
            clients: [],
            currentReservation: {
                id: '',                        // Par défaut vide ou 'N/A' selon vos besoins
                client: '',           // Valeur par défaut
                client_id: null,
                identifiant_assure: '',
                position: '',
                status: 'Brouillon',
                created_by: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                code: null,
                numero: null,
                remise: 0,
                caisse: 'Default',
                amount_reserved: 0,
                amount_gived: 0,
                switch_caisse_at: null,
                switch_finish_at: null,
                switch_devis_at: null,
                switch_dette_at: null,
                total: 0,
                montant: 0,
                montant_avant_remise: 0,
                prise_en_charge: 0,
                total_prise_en_charge: 0,
                total_tva: 0,
                total_css: 0,
                total_ht: 0,
                total_garde: 0,
                montant_taxe: 0,
                deleted_at: null,
                garde_id: null,
                caisse_id: null,
                avant_remise: null,
                credit_restant: 0,
                reservation_produits: []
            },
            gardeActive: null,
            intervalId: null,           // Pour stocker l'ID du setInterval
            prise_en_charge: 0,
            clientSelected: null,
            debounceTimer: null,
            isLoadingInput: {},
            keyWord: '',
            refreshKey: 1,
            appliedRemise: 0, // Nouvelle propriété pour la remise appliquée
            produits_selected: [],
            devisIsLoading: false,
            isSavingJson: false, // Empêche les accès concurrents
            isLoadingReservation: false,
            remise: 0,
            montantOriginal: 0, // Ajoutez cette propriété pour stocker le montant initial
            montant: 0,          // Conversion de la propriété calculée en propriété de données
            hasChanges: false, // Permet de suivre si on a fait un changement
            reservationSent: false, // Permet de contrôler l’affichage du message
            reservationSentBD:false,
            updatedMessage: false, // Passe à true lorsque la caisse a été mise à jour via le bouton "Mettre à jour la caisse"
            labelState: '', 
            initialReservationProducts: null,
            enlargedImage: null,
            showPosologie: true,
            columns: [
                {
                    key: 'photoproduit',
                    format: 'slot',
                    exportable: 'true'

                },
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

                },
                {
                    key: 'equivalent',
                    label: 'Equivalent',
                    format: 'slot',
                    exportable: 'true'

                },
                
            ]
        };
    },
    created() {
        this.checkGardeActive();
        this.appliedRemise = parseFloat(this.activeReservation.remise) || 0;
        this.remise =  parseFloat(this.activeReservation.remise) || 0;// Initialiser la remise appliquée
       
    },
    computed: {
        activeReservation: {
            get() {
            return this.currentReservation;
            },
            set(value) {
            this.currentReservation = value;
            }
        },
        activeReservationProduits() {
            return this.activeReservation?.reservation_produits || [];
        },
        // Validation de la remise
        isRemiseValide() {
            return this.remise > 0 && this.remise <= this.montantComputed;
        },
         // Vérifie si une remise a été appliquée
         isRemiseAppliquee() {
            return this.appliedRemise > 0;
        },

        totalHT() {
            return this.activeReservationProduits.reduce((sum, prod) => sum + Number(prod.total_ht), 0);
        },
        totalTVA() {
            return this.activeReservationProduits.reduce((sum, prod) => sum + Number(prod.total_tva), 0);
        },
        totalCSS() {
            return this.activeReservationProduits.reduce((sum, prod) => sum + Number(prod.total_css), 0);
        },
        totalGarde() {
            return this.activeReservationProduits.reduce((sum, prod) => sum + Number(prod.total_garde), 0);
        },
        totalPriseEnCharge() {
            return this.activeReservationProduits.reduce((sum, prod) => sum + Number(prod.total_prise_en_charge), 0);
        },
        montantOriginalComputed() {
            return this.totalTTC;
        },
        montantComputed() {
            const totalTTC = parseFloat(this.totalTTC) || 0;
            const totalPriseEnCharge = parseFloat(this.totalPriseEnCharge) || 0;
            
            const appliedRemise = parseFloat(this.appliedRemise) || 0;

            // Calculer le montant
            let montant = totalTTC - totalPriseEnCharge - appliedRemise;

            // Arrondir à deux décimales pour éviter les imprécisions flottantes
            montant = Math.round(montant * 100) / 100;

            // Empêcher le montant de devenir négatif
            return montant < 0 ? 0 : montant;
        },
        totalTTC() {
            const montantNum = parseFloat(this.totalHT) || 0;
            const totalGARDE = parseFloat(this.totalGarde) || 0;
            const taxeValue = parseFloat(this.totalTVA) + parseFloat(this.totalCSS);
            return montantNum + taxeValue + totalGARDE;
        },
        creditClass() {
            // Récupérer le plafond de dette et le crédit restant du client
            const plafondDette = parseFloat(this.clientSelected?.plafond_dette || '0');
            const currentRemboursement = parseFloat(this.clientSelected?.current_remboursement_amount || '0');

            // Si le client dispose d'un plafond défini (> 0)
            if (plafondDette > 0) {
                // Calculer le pourcentage de crédit disponible par rapport au plafond
                const creditPercentage = (currentRemboursement / plafondDette) * 100;

                // Définir la classe en fonction du pourcentage :
                // - 25% ou moins : danger (crédit très faible)
                // - 50% ou moins : warning (crédit moyen)
                // - Plus de 50% : succès (crédit suffisant)
                if (creditPercentage <= 25) {
                return "border-danger";
                }
                if (creditPercentage <= 50) {
                return "border-warning";
                }
                return "border-success";
            }
            // Si aucun plafond n'est défini, on peut retourner une classe neutre ou vide
            return "";
        },
        clientDisplayName() {
            if (this.clientSelected && this.activeReservation && this.activeReservation.status === "Brouillon") {
                return this.clientSelected.nom || this.clientSelected.libelle;
            }
            return this.activeReservation ? (this.activeReservation.client || '') : '';
        },


        // Retourne true si la caisse sélectionnée est "Default"
        isDefaultCaisse() {
        return (
            this.activeReservation &&
            this.activeReservation.caisse === "Default"
        );
        },
        // Conditions d’affichage globales du bouton
        showButton() {
        return (
            this.activeReservation &&
            this.activeReservation.caisse_id &&
            !this.isDefaultCaisse &&
            this.isTreatable() &&
            this.produits_selected.length > 0
        );
        },
        // Le libellé du bouton reste "Passer à la caisse" tant que la réservation n’est pas envoyée en base
        buttonLabel() {
        if (!this.reservationSentBD) {
            return "Passer à la caisse";
        }
        switch (this.labelState) {
            case "modifyCaisse":
            return "Modifier la caisse";
            case "updateCaisse":
            return "Mettre à jour la caisse";
            case "firstSelection":
            return "Passer à la caisse";
            default:
            return "Passer à la caisse";
        }
        },
        buttonClass() {
        if (!this.reservationSentBD) {
            return "btn btn-primary";
        }
        if (
            this.labelState === "modifyCaisse" ||
            this.labelState === "updateCaisse"
        ) {
            return "btn btn-dark";
        }
        return "btn btn-secondary";
        },
        creditToDisplay() {
        if (this.activeReservation) {
            // Si credit_restant est défini (même pour un brouillon), on l'affiche ;
            // sinon, on revient au crédit initial du client
            const credit = this.activeReservation.credit_restant ?? this.clientSelected?.current_remboursement_amount ?? 0;
            return parseFloat(credit).toFixed(2);
        }
        return "0.00";
        },
        // Désactive le bouton si la réservation a été envoyée et qu'aucun changement n'est intervenu
        isButtonDisabled() {
            
            // On désactive le bouton soit si la réservation a déjà été envoyée et aucun changement n'est détecté,
            
            return this.reservationSentBD && !this.hasChanges;
        },

    }, watch: {
        // --- Surveille le changement de caisse ---
       "activeReservation.caisse": {
            handler(newVal, oldVal) {
            // Pour l'exécution immédiate, oldVal sera undefined.
            // On vérifie ici si la réservation a déjà été envoyée dans la base.
            if (
                this.activeReservation &&
                (this.activeReservation.switch_caisse_at != null && this.activeReservation.caisse != "Default" && oldVal==undefined && oldVal!=newVal)
            ) {
                this.reservationSentBD = true;
                this.hasChanges = false;
                this.labelState = "modifyCaisse";
               
                return;
            }
            
            
            // Réinitialise le flag pour le message de mise à jour
            this.updatedMessage = false;
            
            if (newVal == "Default") {
                this.reservationSent = false;
                // Si l'ancienne valeur n'était pas "Default" et qu'une réservation avait été envoyée,
                // on appelle éventuellement sendReservation()
                if (oldVal != "Default" && this.reservationSentBD) {
                this.sendReservation();
                }
                return;
            }
            
            // Ne modifier labelState qu'après un envoi (reservationSentBD true)
            if (this.reservationSentBD) {
                if (oldVal == "Default" && newVal != "Default") {
                this.labelState = "firstSelection";
                } else if (oldVal != "Default" && newVal != oldVal) {
                this.labelState = "modifyCaisse";
                }
                this.reservationSent = false;
                this.hasChanges = true;
            }
            },
            immediate: true
        },
        
        // --- Surveille l’ajout ou la suppression de produits ---
        "produits_selected.length"(newVal, oldVal) {
            this.updatedMessage = false;
            // Si la longueur devient zéro, cela signifie que l'utilisateur a supprimé tous les produits
            if (newVal === 0 && oldVal > 0) {
                this.resetRemise();
                this.updateReservationTotals();
            }
            else if  (newVal !== oldVal && this.reservationSentBD) {
                this.labelState = "updateCaisse";
                this.hasChanges = true;
                this.reservationSent = false;
            }
        },
        // --- Surveille la remise globale ---
        remise(newVal, oldVal) {
            this.updatedMessage = false;
            if (newVal !== oldVal && this.reservationSentBD) {
                this.labelState = "updateCaisse";
                this.hasChanges = true;
                this.reservationSent = false;
            }
        },
        // --- Surveille la prise en charge globale ---
        prise_en_charge(newVal, oldVal) {
            if (!this.activeReservation) {
                    return;
            }
            this.updatedMessage = false;
            if (newVal !== oldVal && this.reservationSentBD) {
                this.labelState = "updateCaisse";
                this.hasChanges = true;
                this.reservationSent = false;
            }
        },
        // --- Surveille les modifications dans les produits de la réservation ---
        activeReservationProduits: {
            handler(newVal, oldVal) {
                 // a) Vérifier que ce n'est pas un premier chargement ou un rafraîchissement
                if (!oldVal || !this.activeReservation) {
                    return;
                }
                this.updatedMessage = false;
                // Si la réservation a déjà été envoyée (flag reservationSentBD à true),
                // comparer les produits pour voir s'il y a un changement au niveau de la quantité (qte),
                // de la remise ou du total de prise en charge
                if (this.reservationSentBD) {
                    const changed = newVal.some((newProd, index) => {
                    const oldProd = oldVal[index] || {};
                    return (
                        newProd.qte !== oldProd.qte ||
                        newProd.remise !== oldProd.remise ||
                        newProd.total_prise_en_charge !== oldProd.total_prise_en_charge
                    );
                    });
                    if (changed) {
                    this.labelState = "updateCaisse";
                    this.hasChanges = true;
                    this.reservationSent = false;
                    }
                }
                
            },
            deep: true,
            immediate: false,
        },
        
        
        
    },
    methods: {
        openPrescriptionAssistant() {
            this.$dialog.open(PrescriptionModal, {
                props: {
                    header: "Aide à la Prescription",
                    style: {
                        width: '80vw',
                        maxWidth: '1200px',
                    },
                    modal: true
                },
                onClose: (event) => {
                    if (event.data && typeof event.data === 'object') {
                        // La prescription a été sélectionnée, mettre à jour le champ de recherche
                        this.keyWord = event.data.libelle || event.data.dci || '';
                        this.keySelectionTable++;
                        
                        // Optionnel: afficher un toast de confirmation
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Prescription sélectionnée',
                            detail: `"${event.data.libelle}" ajouté à la recherche`,
                            life: 3000
                        });
                        
                        this.$nextTick(() => {
                            this.$refs.searchInput?.focus();
                        });
                    }
                }
            });
        },
        openEquivalenceProducts (objData) {
            this.$dialog.open(EquivalentMedicamentModal, {
                props: {
                    header: "Les Produits Equivalents",
                    style: {
                        width: '70vw',
                    },
                    modal: true
                },
                data: objData,
                onClose: (event) => { // Modification clé ici
                    if (typeof event.data === 'string') {
                        this.keyWord = event.data;
                        this.keySelectionTable++;
                        this.$nextTick(() => {
                        this.$refs.searchInput?.focus();
                        });
                    }

                }
            });
        },
        showEnlargedImage(image) {
             this.enlargedImage = image || '/landscape-photo-svgrepo-com.svg';
            },
        hideEnlargedImage() {
            this.enlargedImage = null;
        },
        /**
         * Met à jour les totaux de la réservation active et les sauvegarde.
         */
        updateReservationTotals() {
            if (!this.activeReservation) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Aucune réservation active pour mettre à jour les totaux.",
                    life: 5000
                });
                return;
            }
            if (this.activeReservation.status != "Brouillon"){
                return;
            }

            // Calcul des totaux globaux
            const totals = {
                total_ht: this.totalHT.toFixed(2),
                total_tva: this.totalTVA.toFixed(2),
                total_css: this.totalCSS.toFixed(2),
                total_garde: this.totalGarde.toFixed(2),
                total_prise_en_charge: this.totalPriseEnCharge.toFixed(2),
                montant: this.montantComputed.toFixed(2),
                total: this.totalTTC.toFixed(2),
                avant_remise: this.montantComputed + this.appliedRemise,
                montant_avant_remise: this.montantComputed + this.appliedRemise,
            };

            // Mise à jour de activeReservation avec les nouveaux totaux
            Object.assign(this.activeReservation, totals);
            this.calculateCredit();
            // Sauvegarde dans le JSON / LocalStorage
            this.saveTolocalStorage();
        },


        /**
        * Calculer le crédit actuel basé sur le crédit initial et la prise en charge.
        */
        calculateCredit() {
            if (!this.currentReservation) return;
            if (this.currentReservation.status !== 'Brouillon') {
                    return;
            }
            else if (this.clientSelected) {
                const creditInitial = parseFloat(this.clientSelected.current_remboursement_amount || 0);
                const creditRestant = creditInitial - this.totalPriseEnCharge;
                this.currentReservation.credit_restant = creditRestant > 0 ? creditRestant.toFixed(2) : "0.00";
            }
        },

        /**
         * Vérifie si une réservation est en statut 'Brouillon'.
         * @param {Object} reservation - La réservation à vérifier.
         * @returns {boolean} - Vrai si le statut est 'Brouillon', sinon faux.
         */
        isBrouillon(reservation) {
            return reservation && reservation.status === 'Brouillon';
        },

        
       

        /**
         * Applique ou retire la remise en fonction de l'état actuel.
        */
        toggleRemise() {
            if (this.appliedRemise > 0) {
                // Retirer la remise
                this.appliedRemise = 0;
                this.remise = 0; // Réinitialiser l'input remise
                this.activeReservation.remise = 0;
                this.activeReservation.montant = this.montantOriginalComputed.toFixed(2)
                this.updateReservationTotals(); // Recalculer les totaux sans remise
                this.$toast.add({
                    severity: "success",
                    detail: "Remise retirée avec succès.",
                    life: 3000
                });
            } else {
                // Appliquer la remise
                if (this.isRemiseValide) {
                    this.appliedRemise = Number(this.remise); // Assure que c'est un nombre
                    this.activeReservation.remise = this.appliedRemise.toFixed(2);
                    this.activeReservation.montant = this.montantComputed.toFixed(2) - this.appliedRemise.toFixed(2);
                    // Réinitialiser la remise temporaire si nécessaire
                    this.updateReservationTotals(); // Mettre à jour les totaux
                    this.$toast.add({
                        severity: "success",
                        detail: "Remise appliquée avec succès.",
                        life: 3000
                    });
                } else {
                    this.$toast.add({
                        severity: "warn",
                        detail: "Remise invalide.",
                        life: 3000
                    });
                }
            }
        },
        /**
         * Réinitialise la remise appliquée.
        */
        resetRemise() {
            if (this.activeReservation) {
                
                this.appliedRemise = 0;
                this.remise = 0;
                this.activeReservation.remise = 0;
                this.updateReservationTotals();
            }
           
            
        },

        checkGardeActive() {
            this.isSaving = true
            this.axios.get( '/api/gardes/actuelle').then((response) => {
                if (response.data && response.data.data) {
                    this.gardeActive = response.data.data
                }
                this.isReady = true
                this.isSaving = false
            }).catch(() => {
                this.isSaving = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },

        getCaisses() {
            this.isLoading = true
            this.axios.get( '/api/caisses?statut=Ouvert').then(response => {
                this.isLoading = false
                this.caisses = response.data.data
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        async getClients() {
            if (!this.activeReservation) {
               
                return;
            }
            this.isLoading = true;
            try {
                const response = await this.axios.get(`/api/clients`);
                this.isLoading = false;
                if (response.status === 200 && Array.isArray(response.data.data)) {
                    this.clients = response.data.data;
                   

                    // Vérifier si tous les clients référencés existent
                    const clientIds = this.reservations.map(res => res.client_id);
                    clientIds.forEach(id => {
                        if (!this.clients.find(client => client.id === id)) {
                            console.warn(`Client avec ID ${id} référencé dans une réservation n'existe pas dans la liste des clients.`);
                        }
                    });

                    this.setClientLibelle(false);
                } else {
                    
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Attention',
                        detail: "La réponse du serveur pour les clients n'est pas valide.",
                        life: 5000
                    });
                }
            } catch (error) {
                this.isLoading = false;
                
                if (error.response?.status === 404) { // Cas "Aucun client trouvé"
                this.clients = []; // Liste vide silencieuse
                } else { // Véritable erreur technique
                // this.$toast.add({
                //     severity: 'error',
                //     summary: 'Erreur',
                //     detail: "Impossible de charger les clients.",
                //     life: 5000
                // });
                }
            }
        },

        setCaisseId(caisse) {
            this.currentReservation.caisse_id = caisse.id
            this.currentReservation.caisse = caisse.libelle
            
            this.autoSave();
        },

        setClientLibelle() {
            const client = this.clients.find((item) => item.id === this.currentReservation.client_id) || null;

            if (client || this.clientSelected) {
                this.clientSelected = client;
                // Déterminer si le client est comptant ou non et formater la valeur pour la colonne 'client'
                this.currentReservation.client = client.nom 
                    ? `${client.nom}(${client.libelle})` 
                    : client.libelle;

                // Stocker uniquement 'client.libelle' pour le localStorage
                // this.currentReservation.client_libelle = client.libelle;

                if (client.prise_en_charge) {
                    this.activeReservationProduits.forEach((product) => {
                        product.prise_en_charge = client.prise_en_charge;
                        product.cout_total = product.prix_de_vente * (1 - client.prise_en_charge / 100);
                    });
                }
            } else {
                this.clientSelected = null;
                this.currentReservation.client = "COMPTANT";
                this.currentReservation.client_libelle = "COMPTANT";
            }

            // Recalculer le crédit
            this.calculateCredit();
           // Reporter la mise à jour du LocalStorage après le prochain cycle DOM
            this.$nextTick(() => {
                this.updateClientInLocalStorage();
            });
        },



        /**
          * Nouvelle méthode pour mettre à jour le client dans le LocalStorage
          */
          async updateClientInLocalStorage() {
            try {
                // Vérifier que la réservation est bien en statut 'Brouillon'
                if (this.currentReservation.status !== 'Brouillon') {
                return;
                }

                await updateReservationInJson(this.currentReservation.id, {
                client_id: this.currentReservation.client_id,
                client: this.currentReservation.client,
                credit_restant: this.clientSelected?.current_remboursement_amount || 0,
                });
                
            } catch (error) {
                console.error("Erreur lors de la mise à jour du client dans le LocalStorage :", error);
            }
        },

        /**
         * Supprime une réservation du LocalStorage.
         * @param {number|string} reservationId - L'ID de la réservation à supprimer.
         */
        async removeReservationFromLocalStorage(reservationId) {
            try {
                const jsonData = await readJsonFromFile();
                if (!jsonData || !jsonData.reservations) {
                    
                    return;
                }

                jsonData.reservations = jsonData.reservations.filter((res) => res.id !== reservationId);
                await saveJsonToFile(jsonData);
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Échec de la suppression de la réservation du LocalStorage.",
                    life: 5000
                });
            }
        },
        /**
         * Gère la sélection d'une réservation émise par le composant enfant.
         * @param {Reservation} reservation - La réservation sélectionnée.
         */
        async handleReservationSelected(reservation) {
            
            
            this.isLoading = true; // Début du chargement
            this.key++; // Incrémenter la clé globale si nécessaire
            this.keyWord = '';
            this.currentReservation = reservation; // Mise à jour d'un autre état

            // Charger les détails de la réservation
            await this.loadReservation(reservation);

            // Initialiser montantOriginal, montant et appliedRemise
            this.montantOriginal = this.activeReservationProduits.reduce((sum, prod) => {
                return sum + Number(prod.cout_total ?? 0);
            }, 0);

            // Utiliser l'optional chaining pour éviter les erreurs
            this.appliedRemise = parseFloat(this.activeReservation?.remise) || 0;
            this.montant = this.montantOriginal - this.appliedRemise;
            
            this.getClients();
          
            this.keyForm++; // Incrémenter la clé spécifique pour forcer le re-rendu du formulaire
            
            this.isLoading = false; // Fin du chargement
        },


        /**
          * Charge les détails d'une réservation depuis le LocalStorage ou l'API.
          * @param {Object} reservation - La réservation à charger (doit contenir un id).
          */
        async loadReservation(reservation) {
            // Vérifier si un chargement est déjà en cours
            if (this.isLoadingReservation) {
                
                return;
            }
            this.isLoadingReservation = true;  // Début du chargement spécifique à la réservation
            this.isLoading = true;            // Indicateur global de chargement

            try {
                const reservationId = reservation.id;
                if (!reservationId) {                   
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: "ID de réservation invalide.",
                        life: 5000
                    });
                    return;
                }

                // 1) Si la réservation est brouillon, on tente le localStorage d'abord
                if (this.isBrouillon(reservation)) {
                    const localData = await this.getReservationFromLocalStorage(reservationId);
                    if (localData) {
                        // On affecte directement la réservation locale à currentReservation
                        this.currentReservation = localData;

                        // On extrait les produits
                        this.activeReservationProduits = localData.reservation_produits || [];
                                            
                        // Mettre à jour produits_selected
                        if (this.activeReservationProduits.length > 0) {
                            this.produits_selected = this.activeReservationProduits
                                .filter(prod => prod.produit_id != null)
                                .map(prod => String(prod.produit_id).trim());
                        } else {                          
                            this.produits_selected = [];
                        }

                        // Mettre à jour clientSelected
                        this.clientSelected = this.clients.find(client => client.id === localData.client_id) || null;

                        // Calculer le crédit
                        this.calculateCredit();
                        // Une fois que tout est chargé, on marque la réservation comme chargée
                       
                        return; // Ne pas appeler l'API puisque la version locale est disponible
                    } else {
                        // console.warn(`Aucune donnée locale trouvée pour la réservation ID ${reservationId}. On va appeler l'API...`);
                        // On poursuit le chargement depuis l'API
                    }
                }

                // 2) Sinon (non brouillon ou localData introuvable), on charge depuis l'API          
                await this.loadReservationFromDatabase(reservationId);

            } catch (error) {
                console.error("Erreur lors du chargement de la réservation :", error);
                // Les notifications d'erreur sont déjà gérées dans les méthodes appelées
            } finally {
                // Fin du chargement
                this.isLoading = false;
                this.isLoadingReservation = false;                
            }
        },


        /**
         * Récupère une réservation spécifique depuis le LocalStorage.
         * @param {number|string} reservationId - L'ID de la réservation à récupérer.
         * @returns {Promise<any>} - La réservation trouvée ou null.
         */
        async getReservationFromLocalStorage(reservationId) {
            const jsonData = await readJsonFromFile();
            if (!jsonData || !jsonData.reservations) return null;

            const reservation = jsonData.reservations.find((res) => res.id === reservationId);
            return reservation || null;
        },



        /**
         * Récupère les produits d'une réservation depuis le localStorage.
         * @param {number|string} reservationId - L'ID de la réservation.
         * @returns {Array} - La liste des produits.
         */
        async getReservationProduitsFromLocalStorage(reservationId) {
            try {
                const jsonData = await readJsonFromFile();
                if (jsonData && jsonData.reservation_produits) {
                    const produits = jsonData.reservation_produits.filter(prod => prod.reservation_id === reservationId);                   
                    return produits;
                }
                return [];
            } catch (error) {               
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Impossible de lire les produits de réservation locale.",
                    life: 5000,
                });
                return [];
            }
        },

        /**
         * Charge les détails d'une réservation depuis la base de données (API).
         * @param {number|string} reservationId - L'ID de la réservation.
         */
        async loadReservationFromDatabase(reservationId) {           
            try {
                // 1) Récupérer la réservation depuis l’API
                const reservationResponse = await this.axios.get(`/api/reservations/${reservationId}`);

                if (reservationResponse.status === 200 && reservationResponse.data.data) {
                    // 2) Récupérer l’objet "reservation" tel que l'API le renvoie
                    let apiReservation = reservationResponse.data.data;

                    // 3) Vérifier le statut de la réservation
                    const isBrouillon = this.isBrouillon(apiReservation);

                    // 4) Récupérer les produits de la réservation
                    let reservationProduits = apiReservation.reservation_produits;
                    if (!Array.isArray(reservationProduits) || reservationProduits.length === 0) {
                        // Pas de produits ? On les cherche via /api/reservation_produits                      
                        const produitsResponse = await this.axios.get(
                            `/api/reservation_produits?reservation_id=${reservationId}`
                        );                                             
                        if (produitsResponse.status === 200 && Array.isArray(produitsResponse.data.data)) {
                            reservationProduits = produitsResponse.data.data;
                        } else {
                            console.warn("Échec du chargement des produits de la réservation :", produitsResponse.data);
                            reservationProduits = [];
                        }
                    }

                    // 5) Fusionner la réservation complète et son tableau `reservation_produits`
                    const mergedReservation = {
                        // On met toutes les clés renvoyées par l'API
                        ...apiReservation,

                        // Éventuellement forcer certains champs par défaut si nécessaires
                        id: apiReservation.id || '',
                        client: apiReservation.client || '',
                        client_id: apiReservation.client_id || null,
                        identifiant_assure: apiReservation.identifiant_assure || '',
                        position: apiReservation.position  ,
                        status: apiReservation.status || '',
                        created_by: apiReservation.created_by || 'Inconnu',
                        created_at: apiReservation.created_at || new Date().toISOString(),
                        updated_at: apiReservation.updated_at || new Date().toISOString(),
                        code: apiReservation.code || 'N/A',
                        numero: apiReservation.numero || 'N/A',
                        remise: apiReservation.remise != null ? Number(apiReservation.remise) : 0,
                        caisse: apiReservation.caisse || 'Default',
                        amount_reserved: apiReservation.amount_reserved || 0,
                        amount_gived: apiReservation.amount_gived || 0,
                        switch_caisse_at: apiReservation.switch_caisse_at || null,
                        switch_finish_at: apiReservation.switch_finish_at || null,
                        switch_devis_at: apiReservation.switch_devis_at || null,
                        switch_dette_at: apiReservation.switch_dette_at || null,
                        total: apiReservation.total || 0,
                        montant: apiReservation.montant || 0,
                        montant_avant_remise: apiReservation.montant_avant_remise || null,
                        prise_en_charge: apiReservation.prise_en_charge || 0,
                        total_prise_en_charge: apiReservation.total_prise_en_charge || 0,
                        total_tva: apiReservation.total_tva || 0,
                        total_css: apiReservation.total_css || 0,
                        total_ht: apiReservation.total_ht || 0,
                        total_garde: apiReservation.total_garde || 0,
                        montant_taxe: apiReservation.montant_taxe || 0,
                        deleted_at: apiReservation.deleted_at || null,
                        garde_id: apiReservation.garde_id || null,
                        caisse_id: apiReservation.caisse_id || null,
                        avant_remise: apiReservation.avant_remise || null,
                        credit_restant: apiReservation.credit_restant || 0,

                        // IMPORTANT : l'objet/array `reservation_produits`
                        reservation_produits: reservationProduits
                    };

                    if (isBrouillon) {
                        const localData = await this.getReservationFromLocalStorage(reservationId);

                        if (localData) {
                            // -- CAS 1 : Une version locale existe déjà --
                            // On préfère donc charger la version locale et on ignore
                            // la version potentiellement incomplète de l'API
                            this.activeReservation = localData;
                            this.currentReservation = localData;
                        } else {
                            // -- CAS 2 : Pas de version locale, on stocke celle de l'API --
                            this.activeReservation = mergedReservation; 
                            this.currentReservation = mergedReservation;
                            await this.saveTolocalStorage(mergedReservation);
                        }

                    } else {
                        // Statut != Brouillon
                        this.activeReservation = mergedReservation; 
                        this.currentReservation = mergedReservation;
                        await this.removeReservationFromLocalStorage(reservationId);
                    }

                    // 7) Mettre à jour le client sélectionné
                    this.clientSelected = this.clients.find(c => c.id === mergedReservation.client_id) || null;

                    // 8) Mettre à jour le libellé du client (si nécessaire)
                    this.setClientLibelle();

                    // 9) Mettre à jour la liste produits_selected (IDs) pour l'affichage
                    this.produits_selected = mergedReservation.reservation_produits
                        .filter(prod => prod.produit_id != null)
                        .map(prod => String(prod.produit_id).trim());

                    // 10) Calculer le crédit restant après avoir chargé la réservation
                    this.calculateCredit();

                } else {
                    this.$toast.add({
                        severity: 'warn',
                        summary: 'Attention',
                        detail: "La réservation n'a pas pu être chargée.",
                        life: 5000,
                    });
                }
            } catch (error) {
                console.error(`Erreur lors du chargement de la réservation depuis la base de données :`, error);
                if (error.response) {
                    console.error("Détails de la réponse d'erreur :", error.response.data);
                } else if (error.request) {
                    console.error("La requête a été faite mais aucune réponse n'a été reçue :", error.request);
                } else {
                    console.error("Erreur lors de la configuration de la requête :", error.message);
                }
                this.$toast.add({
                    severity: 'error',
                    summary: 'Problème de connexion',
                    detail: "Impossible de charger la réservation depuis la base de données.",
                    life: 5000,
                });
            }
        },

        /**
          * Ajoute une réservation à la liste des réservations dans le LocalStorage.
          * @param {any} newReservation - La réservation à ajouter.
          */
        async addReservationToJson(newReservation) {
            try {
                const jsonData = await readJsonFromFile();
                if (!jsonData) {
                    // Initialiser les données si elles n'existent pas
                    await saveJsonToFile({ reservations: [] });
                }
                // Ajouter une nouvelle réservation avec un tableau reservation_produits vide si non défini
                const reservationToAdd = {
                    ...newReservation,
                    reservation_produits: newReservation.reservation_produits || []
                };

                jsonData.reservations.push(reservationToAdd);

                await this.saveTolocalStorage();
            } catch (error) {
               
            }
        },

        autoSave() {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.saveTolocalStorage();
            }, 500); // Sauvegarde après 500ms de pause
        },

        async saveTolocalStorage() {
            if (this.isSavingJson) {
                return;
            }

            // Vérifier le statut de la réservation avant de sauvegarder
            if (this.activeReservation.status !== 'Brouillon') {
                await this.removeReservationFromLocalStorage(this.activeReservation.id);
                return;
            }

            this.isSavingJson = true; // Verrou pour éviter les sauvegardes concurrentes
            this.isSaving = true;

            try {
                let jsonData = await readJsonFromFile();

                // Si le LocalStorage est vide ou retourné nul, on initialise
                if (!jsonData) {
                    jsonData = { reservations: [] };
                } else if (!Array.isArray(jsonData.reservations)) {
                    // Si la structure ne contient pas un tableau reservations, on le crée
                    jsonData.reservations = [];
                }

                // Vérifier si la réservation est déjà stockée en local
                const existingReservationIndex = jsonData.reservations.findIndex(
                    (res) => res.id === this.activeReservation.id
                );

                if (existingReservationIndex !== -1) {
                    // -- Mise à jour de la réservation existante (modification) --
                    jsonData.reservations[existingReservationIndex] = {
                        ...jsonData.reservations[existingReservationIndex], // on garde d'éventuels champs
                        ...this.activeReservation,                         // on écrase avec les nouvelles données
                        reservation_produits: this.activeReservation.reservation_produits
                    };

                    // Sauvegarder immédiatement les modifications, sans toast
                    await saveJsonToFile(jsonData);
                } else {
                    // -- Ajout d’une nouvelle réservation en brouillon --
                    jsonData.reservations.push({
                        ...this.activeReservation,
                        reservation_produits: this.activeReservation.reservation_produits
                    });

                    await saveJsonToFile(jsonData);

                    // Afficher un toast seulement pour un ajout
                    // this.$toast.add({
                    //     severity: 'success',
                    //     summary: 'Succès',
                    //     detail: "Réservation brouillon sauvegardée avec succès.",
                    //     life: 3000
                    // });
                }
            } catch (error) {
                this.$toast.add({
                    severity: "error",
                    summary: "Erreur",
                    detail: "Échec de la sauvegarde dans LocalStorage.",
                    life: 5000
                });
            } finally {
                this.isSavingJson = false; // Libérer le verrou
                this.isSaving = false;
            }
        },


        /**
         * Méthode pour ajouter ou supprimer un produit localement.
         * @param {Object} line - Le produit à ajouter ou supprimer.
         * @param {string} action - 'add' ou 'remove'.
         */
         async toggleProduitLocal(line, action) {
            this.isSaving = true;
            try {
                // Vérifier que activeReservation et reservation_produits existent
                if (!this.activeReservation) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "La réservation active n'est pas définie ou ne contient pas de produits.",
                    life: 5000
                });
                return;
                }
                // Trouver si le produit existe déjà dans la réservation active
                const existingProductIndex = this.activeReservation.reservation_produits.findIndex(
                    (prod) => prod.produit_id === line.id
                );

                // Calcul initial avec le remise_percent
                const initialResult = calculerProduit(line, 1, this.gardeActive, this.clientSelected.remise_percent);
                const newPriseEnCharge = initialResult.totalPriseEnCharge;

                // --- Vérification du plafond ---
                const plafondDette = parseFloat(this.clientSelected.plafond_dette || '0');
                const currentRemboursement = parseFloat(this.clientSelected.current_remboursement_amount || '0');
                const creditRestant = parseFloat(this.activeReservation.credit_restant || '0');
               

                if (action === "add" && existingProductIndex === -1) {
                    let priseEnChargeToUse = this.clientSelected.remise_percent;
                    let plafondDepasse = false;

                    // Condition de dépassement du plafond_dette
                    const totalPriseEnChargeAfterAdd = this.totalPriseEnCharge + newPriseEnCharge;
                   
                    if (
                        plafondDette > 0 &&
                        (
                            totalPriseEnChargeAfterAdd > currentRemboursement ||
                            creditRestant + this.totalPriseEnCharge - totalPriseEnChargeAfterAdd < 0
                        )
                    ) {
                        // Si le plafond est dépassé, régler prise_en_charge à 0
                        priseEnChargeToUse = 0;
                        plafondDepasse = true;
                       
                        // Afficher l'avertissement
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Alerte',
                            detail: "Le plafond est dépassé, la prise en charge du produit sera annulée.",
                            life: 5000
                        });
                    }
                    
                    // Vérifier le stock
                    const stockDisponible = Number(line.qte);
                    if (stockDisponible < 1) {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Stock insuffisant',
                            detail: `Impossible d'ajouter le produit "${line.libelle}". Stock : ${stockDisponible}.`,
                            life: 5000
                        });
                        return;
                    }

                    // Si le plafond est dépassé, recalculer les totaux avec priseEnChargeToUse = 0
                    let finalResult = initialResult;
                    if (plafondDepasse) {
                        // Recalculer les totaux avec remise_percent = 0 pour obtenir prise_en_charge = 0
                        finalResult = calculerProduit(line, 1, this.gardeActive, 0);
                    }

                    // Le produit n'existe pas encore, l'ajouter avec la prise_en_charge ajustée
                    const newItem = {
                        id: line.id,
                        libelle: line.libelle,
                        qte: "1", // Quantité ajoutée = 1
                        prix_de_vente: line.prix_de_vente,
                        prix_achat: line.prix_achat,
                        produit: line,
                        reservation_id: this.activeReservation.id,
                        prise_en_charge: priseEnChargeToUse, // Ajustement ici
                        produit_id: line.id,
                        total_ht: priseEnChargeToUse > 0 ? initialResult.totalHorsTaxe : finalResult.totalHorsTaxe, // Ajustement si prise_en_charge est 0
                        total_tva: priseEnChargeToUse > 0 ? initialResult.totalTVA : finalResult.totalTVA,
                        total_css: priseEnChargeToUse > 0 ? initialResult.totalCSS : finalResult.totalCSS,
                        total_prise_en_charge: priseEnChargeToUse > 0 ? initialResult.totalPriseEnCharge : finalResult.totalPriseEnCharge,
                        total_garde: priseEnChargeToUse > 0 ? initialResult.totalGarde : finalResult.totalGarde,
                        cout_total: priseEnChargeToUse > 0 ? initialResult.totalClient : finalResult.totalClient,
                        cout_total_reel: priseEnChargeToUse > 0 ? initialResult.total : finalResult.total,
                    };

                    // Ajout côté Local
                    this.activeReservation.reservation_produits.push(newItem);
                    this.produits_selected.push(line.id);
                }

                if (action === "remove" && existingProductIndex !== -1) {
                    // Si la réservation a déjà été envoyée en base, supprimer le produit via l'API
                    // if (this.reservationSentBD) {
                    //     const produitId = line.id;
                    //     let form = {
                    //         reservation_id: this.activeReservation.id  // Utiliser l'ID de la réservation active
                    //     };
                    //     // Appel API en mode fire-and-forget
                    //     this.axios.post('/api/' + this.table + '/' + produitId + '/destroy2', form);

                    //     this.sendReservation();
                    // }
                    // Retirer le produit de reservation_produits
                    this.activeReservation.reservation_produits.splice(existingProductIndex, 1);
                    this.produits_selected = this.produits_selected.filter(pid => pid != line.id);
                }

                

                
                this.updateReservationTotals();
                // Mise à jour du LocalStorage
                // await this.saveTolocalStorage();

                // Toast final
                this.$toast.add({
                    severity: "success",
                    detail:
                        action === "remove"
                            ? "Produit supprimé avec succès."
                            : "Produit ajouté avec succès.",
                    life: 3000
                });

            } catch (error) {
                console.error("Erreur dans toggleProduitLocal:", error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Une erreur s'est produite lors de la mise à jour des produits.",
                    life: 5000
                });
            } finally {
                this.isSaving = false;
            }
        },



        /**
          * Méthode pour mettre à jour une ligne de réservation localement.
          * Gère uniquement la modification de quantité, la prise en charge et la suppression.
          * @param {Object} line - La ligne de réservation à mettre à jour.
          * @param {string} action - Action à effectuer : 'remove', 'qte', 'prise_en_charge'.
          * @param {any} newValue - Nouvelle valeur pour l'action (par exemple, nouvelle quantité).
        */
        async updateLineLocal(line, action, newValue,event=null) {
            
            try {
                this.isSaving = true;
                let previousQte = null;
                let previousPriseEnCharge = null;
                // === Trouver l'index du produit dans la réservation active (en mémoire)
                const productIndex = this.activeReservation.reservation_produits.findIndex(
                    (prod) => prod.produit_id === line.produit_id
                );

                // -------------------------------------------------
                // 1) CAS : SUPPRESSION
                // -------------------------------------------------
                if (action === 'remove') {
                    if (productIndex === -1) {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Produit non trouvé',
                            detail: `Le produit "${line.libelle}" n'est pas dans la réservation.`,
                            life: 5000
                        });
                        return;
                    }
                    // Si la réservation a déjà été envoyée en base, supprimer le produit via l'API
                    // if (this.reservationSentBD) {
                    //     const produitId = line.id;
                    //     let form = {
                    //         reservation_id: this.activeReservation.id  // Utiliser l'ID de la réservation active
                    //     };
                    //     // Appel API en mode fire-and-forget
                    //     this.axios.post('/api/' + this.table + '/' + produitId + '/destroy2', form);

                    //     this.sendReservation();
                    // }
                    // Retirer le produit de la réservation active (mémoire)
                    this.activeReservation.reservation_produits.splice(productIndex, 1);
                    // Retirer du tableau produits_selected
                    this.produits_selected = this.produits_selected.filter(
                        (pid) => pid != line.produit_id
                    );

                    this.$toast.add({
                        severity: "success",
                        detail: "Produit supprimé avec succès.",
                        life: 3000
                    });
                    
                }
                // -------------------------------------------------
                // 2) CAS : CHANGER QUANTITÉ
                // -------------------------------------------------
               
                if (action === 'qte') {
                    let desiredQte = parseInt(event.target.value) || null;
                    const stockDisponible = parseInt(line.produit.qte);
                    previousQte = this.activeReservation.reservation_produits[productIndex].qte;

                    //verification du plafond pour la quantité 
                    const priseEnChargeLocalstorage = this.activeReservation.reservation_produits[productIndex].prise_en_charge;
                    previousPriseEnCharge = this.activeReservation.reservation_produits[productIndex].total_prise_en_charge;
                    const result = calculerProduit(
                        line.produit,
                        desiredQte,
                        this.gardeActive,
                        priseEnChargeLocalstorage
                    );
                    const totalPriseEnChargeQTE = result.totalPriseEnCharge;
                    const realPriseEnChargePRISECHARGE = this.totalPriseEnCharge - previousPriseEnCharge + totalPriseEnChargeQTE;
                    
                    if (
                            parseFloat(this.clientSelected.plafond_dette || '0') > 0 &&
                            (
                                realPriseEnChargePRISECHARGE > parseFloat(this.clientSelected?.current_remboursement_amount || '0') ||
                                this.totalPriseEnCharge +  parseFloat(this.activeReservation?.credit_restant || '0') - realPriseEnChargePRISECHARGE < 0
                            )
                        ) {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Alerte',
                                detail: "Le plafond est dépassé, veuillez ajuster la quantité.",
                                life: 5000
                            });
                            
                            return;
                    }
                    if (desiredQte > stockDisponible) {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Stock insuffisant',
                            detail: `La quantité demandée (${desiredQte}) dépasse le stock disponible (${stockDisponible}).`,
                            life: 5000
                        });
                        return;
                    }

                    // Mettre à jour les champs
                    this.activeReservation.reservation_produits[productIndex].qte = desiredQte;
                    this.activeReservation.reservation_produits[productIndex].prise_en_charge = result.priseEnCharge;
                    this.activeReservation.reservation_produits[productIndex].total_ht = result.totalHorsTaxe;
                    this.activeReservation.reservation_produits[productIndex].total_tva = result.totalTVA;
                    this.activeReservation.reservation_produits[productIndex].total_css = result.totalCSS;
                    this.activeReservation.reservation_produits[productIndex].total_prise_en_charge = result.totalPriseEnCharge;
                    this.activeReservation.reservation_produits[productIndex].total_garde = result.totalGarde;
                    this.activeReservation.reservation_produits[productIndex].cout_total = result.totalClient;
                    this.activeReservation.reservation_produits[productIndex].cout_total_reel = result.total;
                   
                    this.$toast.add({
                        severity: "success",
                        detail: "Quantité mise à jour avec succès.",
                        life: 3000
                    });
                }

                // -------------------------------------------------
                // 3) CAS : CHANGER PRISE EN CHARGE
                // -------------------------------------------------
                if (action === 'prise_en_charge') {
                    const newPriseEnCharge = Number(newValue) || 0;
                    if (newPriseEnCharge > 100) {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Valeur invalide',
                            detail: "La prise en charge ne peut pas dépasser 100%.",
                            life: 5000
                        });
                        return;
                    }
                    previousPriseEnCharge = this.activeReservation.reservation_produits[productIndex].total_prise_en_charge;
                    previousQte = this.activeReservation.reservation_produits[productIndex].qte;
                    const result = calculerProduit(
                        line.produit,
                        previousQte,
                        this.gardeActive,
                        newPriseEnCharge
                    );
                    const totalPriseEnChargePRISECHARGE = result.totalPriseEnCharge;
                    const realPriseEnChargePRISECHARGE = this.totalPriseEnCharge - previousPriseEnCharge + totalPriseEnChargePRISECHARGE;
                   
                    
                    if (
                            parseFloat(this.clientSelected.plafond_dette || '0') > 0 &&
                            (
                                realPriseEnChargePRISECHARGE > parseFloat(this.clientSelected?.current_remboursement_amount || '0') ||
                                this.totalPriseEnCharge +  parseFloat(this.activeReservation?.credit_restant || '0') - realPriseEnChargePRISECHARGE  < 0
                            )
                           
                        ) {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Alerte',
                                detail: "Le plafond est dépassé, veuillez ajuster la prise en charge ou la quantité.",
                                life: 5000
                            });
                            
                            return;
                            
                    }
                   
                   // Mettre à jour les  champs
                   this.activeReservation.reservation_produits[productIndex].prise_en_charge = result.priseEnCharge;
                    this.activeReservation.reservation_produits[productIndex].total_ht = result.totalHorsTaxe;
                    this.activeReservation.reservation_produits[productIndex].total_tva = result.totalTVA;
                    this.activeReservation.reservation_produits[productIndex].total_css = result.totalCSS;
                    this.activeReservation.reservation_produits[productIndex].total_prise_en_charge = result.totalPriseEnCharge;
                    this.activeReservation.reservation_produits[productIndex].total_garde = result.totalGarde;
                    this.activeReservation.reservation_produits[productIndex].cout_total = result.totalClient;
                    this.activeReservation.reservation_produits[productIndex].cout_total_reel = result.total;
                   
                    this.$toast.add({
                        severity: "success",
                        detail: "Prise en charge mise à jour avec succès.",
                        life: 3000
                    });
                 
                }
               
                this.updateReservationTotals();
                // this.saveTolocalStorage();
               
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Une erreur s'est produite lors de la mise à jour de la ligne.",
                    life: 5000
                });
            } finally {
                this.isSaving = false;
            }
        },

        async handleReservationUpdated(updatedReservation) {
            try {
                // Rafraîchir les réservations
                await this.refreshReservations();

                // Sélectionner la réservation mise à jour
                await this.handleReservationSelected(updatedReservation);
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Une erreur s'est produite lors de la gestion de la réservation mise à jour.",
                    life: 5000
                });
            }
        },
        /**
         * Méthode de rafraîchissement des réservations déclenchée par l'événement émis par l'enfant.
         */
        async refreshReservations() {
            
            this.refreshKey += 1;
            this.keyForm++;
            
            await this.fetchReservations();
        },


        async fetchReservations() {
            this.isLoading = true;
            try {
                const response = await this.axios.get(`/api/reservations/jour?created_by=`+this.$store.getters.user.fullname);

                if (response.status === 200 && Array.isArray(response.data.data)) {
                    const reservationsData = response.data.data;
                    // 1) Assigner toutes les réservations du jour,
                    this.reservations = reservationsData;

                    // 2) Gérer la synchronisation locale pour les brouillons
                    for (const reservation of this.reservations) {
                        // Vérifier si c’est un Brouillon
                        if (this.isBrouillon(reservation)) {
                            // Chercher la même réservation dans le localStorage
                            const localData = await this.getReservationFromLocalStorage(reservation.id);

                            // S'il n'existe pas encore localement, on l'ajoute
                            if (!localData) {
                                await this.addReservationToJson(reservation);
                            } 
                            // Sinon, on ne fait rien (on préserve la version locale)
                        }
                    }
                     // 2 bis) Nettoyer le LocalStorage des réservations obsolètes ou non 'Brouillon'
                     await this.cleanLocalStorage(reservationsData);
                    // (Optionnel) Recalculer le crédit, si nécessaire
                    this.calculateCredit();
                    
                    // 3) Sélectionner la dernière réservation du jour (facultatif)
                    if (this.reservations.length > 0) {
                        // Tri par 'position' décroissant
                        this.reservations.sort((a, b) => parseInt(b.position) - parseInt(a.position));

                        const lastReservation = this.reservations[0];
                        this.currentReservation = lastReservation;
                        await this.handleReservationSelected(lastReservation);
                    } else {
                        this.currentReservation = null;
                    }

                } else {
                    // Si l'API retourne un tableau vide
                    this.reservations = [];
                    // (Optionnel) Vider le localStorage ou pas
                    await this.cleanLocalStorage([]);
                }
            } catch (error) {
                console.error(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Problème de connexion',
                    detail: "Une erreur s'est produite lors de la connexion au serveur !",
                    life: 5000
                });
            } finally {
                this.isLoading = false;
            }
        },



        createFacture() {
            this.devisIsLoading = true
            let FactureForm = {
                client: this.currentReservation.client,
                reservation_id: this.currentReservation.id,
                net_a_payer: this.currentReservation.montant,
                type: 'Devis',
                created_by: this.$store.getters.user.fullname
            }
            this.axios.post( '/api/factures', FactureForm).then((response) => {
                if (response.data.success == true) {

                    this.devisIsLoading = false
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                    this.devisIsLoading = false
                }
            })
        },
        async transformToInvoice() {
        try {
            // 1) Mettre à jour en local
            const devisTime = new Date().toLocaleString('fr-FR');
            this.currentReservation.status = 'Devis';
            this.currentReservation.switch_devis_at = devisTime;

            // 2) Mettre à jour dans le localStorage (réservation)
            await updateReservationInJson(this.currentReservation.id, {
            status: 'Devis',
            switch_devis_at: devisTime
            });

            // 3) Enregistrer la réservation dans la base de données
            const reservationResponse = await this.axios.post(
            `/api/reservations/${this.currentReservation.id}/update`,
            {
                ...this.activeReservation, // Inclut le montant corrigé
                reservation_produits: this.activeReservationProduits, // Produits associés
            }
            );

            // Vérifier que l'API a renvoyé un succès
            if (reservationResponse.data.success) {
            // Incrémente la clé pour forcer le re-rendu du formulaire
            this.key++; // Incrémenter la clé globale si nécessaire
            this.keyForm++;
            }

            // 5) Appeler la méthode qui crée la facture
            this.createFacture();
        } catch (error) {
            this.$toast.add({
            severity: 'error',
            summary: 'Problème de connexion',
            detail: 'Une erreur s\'est produite lors de la mise à jour du statut de la réservation !',
            life: 5000
            });
        }
        },

        isTreatable() {
            if (this.activeReservation && this.activeReservation.status != 'Termine' && this.activeReservation.status != 'Annule' && this.activeReservation.status != 'Devis') {
                return true;
            } else {
                return false;
            }
        },

        commandProduit(id) {
            this.isLoadingInput[id] = true;
            this.axios.post( '/api/commandes/ajouter-produit/' + id).then(response => {
                if (response.data.success === true) {
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                this.isLoadingInput[id] = false;
            }).catch(() => {
                this.isLoadingInput[id] = false;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },

        /**
         * Nettoie le LocalStorage en supprimant :
         *   - Tout si l'API ne renvoie aucune réservation.
         *   - Les réservations locales dont l'ID n'est pas présent dans la réponse de l'API.
         *   - Les réservations locales dont le statut dans l'API est différent de 'Brouillon'.
         * 
         * @param {Array} reservationsFromAPI - Tableau de réservations récupérées depuis l'API.
         */
        async cleanLocalStorage(reservationsFromAPI = []) {
            try {
                // 1) Lire le contenu actuel du LocalStorage
                let jsonData = await readJsonFromFile();

                if (!jsonData || !Array.isArray(jsonData.reservations)) {
                    // Si le LocalStorage est vide ou mal formé, rien à nettoyer
                    return;
                }

                // 2) Si l'API ne renvoie aucune réservation, vider tout le LocalStorage
                if (reservationsFromAPI.length === 0) {
                    jsonData.reservations = [];
                    await saveJsonToFile(jsonData);
                    return;
                }

                // 3) Construire un Map des réservations de l'API (pour accès rapide par ID)
                const apiReservationsMap = new Map(
                    reservationsFromAPI.map(res => [res.id, res])
                );

                // 4) Filtrer les réservations locales pour ne garder que celles
                //    présentes dans l'API ET dont le statut est 'Brouillon'
                const keptReservations = jsonData.reservations.filter(localRes => {
                    const apiRes = apiReservationsMap.get(localRes.id);
                    // On conserve UNIQUEMENT si la réservation est toujours "Brouillon" dans l'API.
                    return apiRes && apiRes.status === 'Brouillon';
                });

                // 5) S'il y a des différences (on en a supprimé), sauvegarder le résultat filtré
                if (keptReservations.length !== jsonData.reservations.length) {
                    jsonData.reservations = keptReservations;
                    await saveJsonToFile(jsonData);
                }

            } catch (error) {
                console.error("Erreur lors du nettoyage du LocalStorage :", error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Une erreur s'est produite lors du nettoyage du LocalStorage.",
                    life: 5000
                });
            }
        },



        async sendReservation() {
            try {
                // 1) Mettre à jour la réservation active en localStorage (switch_caisse_at)
                const switchTime = new Date().toLocaleString('fr-FR');
                this.activeReservation.switch_caisse_at = switchTime;

                // MàJ dans le localStorage (réservation)
                await updateReservationInJson(this.activeReservation.id, {
                    switch_caisse_at: switchTime,
                   
                });

               

                // 2) Envoyer la réservation mise à jour au backend
                this.isLoading = true;
                const response = await this.axios.post(
                    `/api/reservations/${this.activeReservation.id}/update`,
                    {
                        ...this.activeReservation, // Inclut le montant corrigé
                        reservation_produits: this.activeReservationProduits, // Produits associés
                    }
                );
                
                if (!response.data.success) {
                    // Gestion d'erreurs renvoyées par l'API
                    if (Array.isArray(response.data.errors)) {
                        response.data.errors.forEach((err) => {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Oups !',
                                detail: err,
                                life: 7000
                            });
                        });
                    }
                    throw new Error("Échec de la mise à jour de la réservation");
                }

                // // 5) Succès final : informer l’utilisateur
                // this.$toast.add({
                //     severity: 'success',
                //     summary: 'Succès',
                //     detail: 'Réservation et produits enregistrés avec succès !',
                //     life: 5000
                // });
                
                // 3) Mise à jour de l'état après un envoi réussi
                if (this.activeReservation.caisse != "Default") {
                    this.reservationSent = true;
                    this.reservationSentBD = true;
                } else {
                    this.reservationSent = false;
                    this.reservationSentBD = false;
                }
                // Si le bouton était en mode "Mettre à jour la caisse"
                if (this.labelState === "updateCaisse") {
                this.updatedMessage = true;
                this.labelState = "";
                } else {
                this.updatedMessage = false;
                }
                // Aucune modification en attente et la réservation a été envoyée en base
                this.hasChanges = false;
               

            } catch (error) {
                // Message d'erreur générique
                this.$toast.add({
                    severity: 'error',
                    summary: 'Problème de connexion',
                    detail: "Une erreur s'est produite lors de la connexion au serveur !",
                    life: 5000
                });
            } finally {
                this.isLoading = false;
            
            }
        },


    },
    async mounted() {
        this.getCaisses()
        this.getClients();
        this.fetchReservations();
        this.checkGardeActive();
        
        // Mettre en place un polling (par ex. toutes les 60s)
        this.intervalId = setInterval(() => {
        this.checkGardeActive();
        }, 60000); // 1 minute
         
       
    },
     
    beforeUnmount() {
        // Nettoyer l’intervalle quand on quitte le composant
        clearInterval(this.intervalId);
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
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
.fade-enter-to, .fade-leave-from {
    opacity: 1;
}
.photo-container {
  position: relative;
  display: inline-block;
}

/* Image miniature */
.thumb {
  width: 35px; /* ajustez la taille selon vos besoins */
  height: auto;
  cursor: pointer;
}

.enlarged-image-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}



/* Afficher l'image agrandie lors du survol */
.photo-container:hover .enlarged {
  display: block;
}

/* Image agrandie */
.enlarged-img {
  width: 250px; /* ajustez la taille agrandie */
  height: auto;
}

/* Styles pour le checkbox personnalisé avec FontAwesome */
.custom-checkbox-container {
    margin-left: 15px;
}

.custom-checkbox-label {
    cursor: pointer;
    user-select: none;
    margin-bottom: 0;
    font-weight: 500;
    color: #495057;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.custom-checkbox-label:hover {
    color: #007bff;
}

.custom-checkbox-label:hover .custom-checkbox-icon i {
    transform: scale(1.1);
    transition: transform 0.2s ease;
}

.custom-checkbox-input {
    display: none; /* Masquer le checkbox natif */
}

.custom-checkbox-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: all 0.2s ease;
    margin-right: 8px;
}

.custom-checkbox-icon i {
    font-size: 18px;
    transition: all 0.2s ease;
}

.custom-checkbox-text {
    font-size: 14px;
    font-weight: 500;
}

/* Effet hover sur l'ensemble du container */
.custom-checkbox-container:hover .custom-checkbox-label {
    color: #007bff;
}

/* Animation pour l'icône checked */
.custom-checkbox-label input:checked + .custom-checkbox-icon i {
    animation: checkBounce 0.3s ease;
}

@keyframes checkBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

/* Styles pour le tooltip personnalisé */
.custom-checkbox-container[data-toggle="tooltip"] {
    position: relative;
}

/* Amélioration visuelle pour l'état actif */
.custom-checkbox-input:checked + .custom-checkbox-icon i.text-success {
    color: #28a745 !important;
    text-shadow: 0 0 3px rgba(40, 167, 69, 0.3);
}
</style>