<template>
    <div v-if="commande">
        <!-- entete de la commande: numero,fournusseur, num facture -->
        <div class="container-fluid">
            <div class="row d-flex justify-content-center align-items-center">
                <div class="col-md-3 text-center">
                    <h6>{{ commande.numero }}</h6>
                    <span v-if="form.status == 'CREATED'" class="badge badge-primary rounded-pill py-2 px-3">{{ form.status }}</span>
                <span v-else-if="form.status == 'SUCCESS'" class="badge badge-success rounded-pill py-2 px-3">{{
                    form.status }}</span>
                <span v-else class="badge badge-secondary rounded-pill py-2 px-3">{{ form.status }}</span>
                </div>
                <div class="col-md-6">
                    <div class="form-row">
                        <div class="form-group col-md-5">
                            <label>Fournisseur</label>
                            <select class="form-control border border-dark px-[4rem]" v-model="form.fournisseur"
                                @change="setFournisseurName()" :disabled="this.form.status == 'SUCCESS'">
                                <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur">
                                    {{ fournisseur.libelle }}</option>
                            </select>
                        </div>
                        <div class="m-4" v-if="form.fournisseur">
                            <a :href="'http://'+fournisseur_siteurl" target="_blank" title="Site">
                                 <i class="fa-brands fa-internet-explorer" ></i></a>
                        </div>
                        <div class="form-group col-md-5" v-if="form.fournisseur">
                            <label>Numéro de facture réel</label>
                            <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.facture"
                                @change="updateLine()" :disabled="this.form.status == 'SUCCESS'">
                        </div>
                    </div>
                </div>
                
                <div v-if="this.form.status != 'SUCCESS'"  class="col-md-3 d-flex  justify-content-center">

                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button v-if="this.form.status != 'SUSPENDED'" type="button" class="btn btn-primary"
                            @click="suspendLine()">
                            <i class="fa-regular fa-circle-xmark mr-2"></i> Suspendre
                        </button>
                        <button v-if="lines > 0" type="button" class="btn btn-primary" @click="closeLine()" :disabled="countIncoherence > 0" >
                            <i class="fa-solid fa-check mr-2"></i> Terminer
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- compteurs qui affiche les totaux ttc, ht, css, tva, ca pot -->
        <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
        <span v-if="countIncoherence > 0 && form.status != 'SUCCESS'" class="badge alert-danger w-100 text-center h3">
                    <strong>{{ countIncoherence }}</strong> incohérence(s) détectée(s)
                    <!-- <span @click="BouttonRecalculate" class="ml-2 hover-color-gray" role="button">Voulez vous recalculer Tout</span> -->
        </span>    
        <!-- liste des produits de la commande -->
        <AsdecodeTable ExportCSV :key="key" useSearch :newKeyWord="keyWord"
            :url="'/api/' + table + '?commande_id=' + commande.id" :columns="columns" :table="table"
            v-on:set-total-records="updateLines" @update:items="onItemsUpdate" @set-extra_data="updateExtraDatas">

            <!-- boutons en entete du tableau de donnes -->
            <template #header_action_btns>

                <!-- ouvrir le modal de selection des produits -->
                <button type="button" class="btn btn-light mr-2" @click="openSelectCommandeProduit()" v-if="form.status != 'SUCCESS'">
                    <i class="fa-solid fa-plus"></i> Trouver des produits
                </button>

                <!-- importer des produit depuis le fichier excel -->
                <button class="btn btn-light mr-2" @click="importExcelCommande()" v-if="form.status != 'SUCCESS'">
                    <i class="fa-solid fa-file-excel mr-2"></i> Importer
                </button>
                
                <!-- composant qui genere les bons de commandes -->
                <div v-show="lines > 0" >
                    <BonCommande :key="key2" :commande="commande" :fournisseur="fournisseurSelected"></BonCommande>
                </div>
            </template>
            
            <!-- boutons d'action pour chaque lignes du tableau -->
            <template #action_btns=slotProps v-if="form.status != 'SUCCESS'">
                <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <button v-else type="button" class="btn btn-danger" @click="deleteCommandeProduit(slotProps.data.id)">
                    <i class="fa-solid fa-trash-alt"></i>
                </button>
            </template>

            <!-- slot pour afficher le champs lot -->
            <template #lot="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.lot }}</span>
                <span v-else>
                    <input type="text" class="form-control border border-dark px-[4rem]" name="lot"
                        :value="slotProps.data.lot" @change="updateCommandeProduit(slotProps.data, $event)"
                        style="width: 90px;" :disabled="isLoadingInput[slotProps.data.id] == true" >
                </span>
            </template>

            <!-- slot pour afficher le champs qte -->
            <template #qte="slotProps">
                <span v-if="form.status == 'SUCCESS'" class="badge badge-primary rounded-pill p-2 border border-dark">
                    {{ slotProps.data.qte }}
                </span>       
                <input v-else type="number" class="form-control border border-dark px-[4rem]" :id="slotProps.data.id" name="qte" min="1"
                        :value="slotProps.data.qte" @change="onChangeField(slotProps.data, $event)"
                        style="width: 80px;" :disabled="isLoadingInput[slotProps.data.id] == true">
            </template>

            <!-- slot pour afficher le champs prix_achat -->
            <template #prix_achat="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.prix_achat }}</span>
                <span v-else>
                    <input type="number" class="form-control border px-[4rem]" :class="getCoherenceClass(slotProps.data.id, 'prix_achat')" :id="`prix_achat-${slotProps.data.id}`"  name="prix_achat" min="0"
                        :value="slotProps.data.prix_achat" @change="onChangeField(slotProps.data, $event)"
                        style="width: 100px;" :disabled="isLoadingInput[slotProps.data.id] == true">
                </span>
            </template>

            <!-- slot pour afficher le champs prix_de_vente -->
            <template #prix_de_vente="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.prix_de_vente }}</span>
                <span v-else>
                    <input type="number" class="form-control border px-[4rem]" :class="getCoherenceClass(slotProps.data.id, 'prix_achat')" :id="`prix_de_vente-${slotProps.data.id}`" name="prix_de_vente" min="0"
                        :value="slotProps.data.prix_de_vente" @change="onChangeField(slotProps.data, $event)"
                        style="width: 100px;" :disabled="isLoadingInput[slotProps.data.id] == true">
                </span>
            </template>

            <!-- slot pour afficher la tva et css sur le libelle -->
            <template #produit_libelle=slotProps>
                <div style="min-width: 200px;">
                    {{ slotProps.data.produit_libelle }}
                    <span class="text-vert ml-2" v-if="slotProps.data.tva == '1'">TVA</span>
                    <span class="text-bleu3 ml-2" v-if="slotProps.data.css == '1'">CSS</span>
                </div>
            </template>

            <!-- slot pour afficher le champs date_expiration -->
            <template #date_expiration="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.date_expiration }}</span>
                <span v-else>
                    <input type="date" class="form-control border border-dark px-[4rem]" name="date_expiration"
                        :value="slotProps.data.date_expiration" @change="updateCommandeProduit(slotProps.data, $event)"
                        style="width: 150px;" :disabled="isLoadingInput[slotProps.data.id] == true">
                </span>
            </template>

            <!-- slot pour afficher le champs coef_conversion_de_prix_vente_achat -->
            <template #coef_conversion_de_prix_vente_achat="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.coef_conversion_de_prix_vente_achat }}</span>
                <div v-else>
                    <input type="number" class="form-control mr-1 border px-[4rem]"
                        name="coef_conversion_de_prix_vente_achat" :class="getCoherenceClass(slotProps.data.id, 'coef_conversion_de_prix_vente_achat')" :id="`coef_conversion_de_prix_vente_achat-${slotProps.data.id}`" min="0" step=".01" :max="100"
                        :value="parseFloat(slotProps.data.coef_conversion_de_prix_vente_achat).toFixed(3)"
                        @change="onChangeField(slotProps.data, $event)" style="width: 100px;"
                        :disabled="isLoadingInput[slotProps.data.id] == true">
                </div>
            </template>
            <template #ticket="slotProps" v-if="form.status == 'SUCCESS'"> 
                    <TicketExport
                        :productName="slotProps.data.produit_libelle"
                        :salePrice="slotProps.data.prix_de_vente"
                        barcode=123456789012
                        :quantity = "slotProps.data.qte"                        
                        :commande = "slotProps.data.commande_id"
                    />
                
            </template>
            <!-- slot pour afficher le champs rayon -->
            <template #rayon="slotProps">
                <span v-if="form.status == 'SUCCESS'">{{ slotProps.data.rayon }}</span>
                <span v-else>
                    <select class="form-control border border-dark px-[4rem]" name="rayon"
                        @change="updateCommandeProduit(slotProps.data, $event)" style="width: 150px;"
                        :disabled="isLoadingInput[slotProps.data.id] == true">
                        <option value="" selected>
                            vide
                        </option>
                        <option v-for="rayon in rayons" :key="rayon.id" :value="rayon.libelle"
                            :selected="initSelectedRayon(rayon.libelle, slotProps.data.rayon)">
                            {{ rayon.libelle }}
                        </option>
                    </select>
                </span>
            </template>

        </AsdecodeTable>

        <!-- bouton de suppression de la commande ouverte -->
        <div v-if="this.form.status != 'SUCCESS'" class="d-flex justify-content-center mt-4 mb-2">
            <button type="button" class="btn btn-lg text-danger" @click="deleteLine()">
                <i class="fa-solid fa-trash-alt"></i> Supprimer cette commande
            </button>
        </div>
    </div>
    <ProgressBar class="my-1" v-else-if="commande_created === false" mode="indeterminate" style="height: 6px"></ProgressBar>
</template>

<script>
import $ from 'jquery'
import { defineComponent, defineAsyncComponent } from 'vue';
import MoneyCounter from '@/components/MoneyCounter.vue';
import BonCommande from './BonCommande.vue';
import ImportCommandeProduit from './ImportCommandeProduit.vue';
const SelectCommandeProduit = defineAsyncComponent(() => import('./SelectCommandeProduit.vue'));
import { calculerProduit,recalculerPrix,remplirChampsManquants } from '@/views/calculs/add-produits-commande.ts';
import TicketExport from '@/components/TicketExportProduit.vue';

export default defineComponent({
    components: { MoneyCounter, BonCommande,TicketExport  },
    inject: ['dialogRef'],
    props: ['commande_ready'],
    data() {
        return {
            lines: 0,
            table: 'commande_produit',
            isLoading: false,
            isLoadingInput: [],
            resIsLoading: false,
            commande_created: false,
            commande: null, //on initalise la commande pour gerer les nouvelles creation
            fournisseurs: [],
            rayons: [],
            commande_produit: [],
            coherenceStates: {},
            columns: [
                {
                    key: 'lot',
                    label: 'LOT',
                    exportable: true,
                    format: 'slot'
                },
                {
                    key: 'produit_libelle',
                    label: 'NOM',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true,
                    toCSV: true
                },
                {
                    key: 'prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QT. COMM',
                    format: 'slot',
                    exportable: true,
                    toCSV: true
                },
                {
                    key: 'qte_initiale',
                    label: 'QT. AVANT',
                    format: 'state',
                    exportable: true
                },
                {
                    key: 'qte_finale',
                    label: 'QT. APRES',
                    format: 'state',
                    exportable: true
                },
                // {
                //     key: 'produit.qte',
                //     label: 'QT. ACTU',
                //     format: 'state',
                //     exportable: true
                // },
                {
                    key: 'rayon',
                    label: 'RAYON',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'date_expiration',
                    label: 'EXP',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'coef_conversion_de_prix_vente_achat',
                    label: 'COEF',
                    format: 'slot',
                    exportable: true
                },
                
            ],
            form: {
                status: 'CREATED',
                created_by: this.$store.getters.user.fullname,
            },
            fournisseurSelected: null,
            fournisseur_siteurl: null,
            key: 1,
            key2: 1,
            keyCounter: 1,
            keyWord: '',
            compteurs: [],
            countIncoherence: 0,
        }
    },
    created() {
        // si on commande le produit 
        if (this.commande_ready) {
            this.commande = this.commande_ready
            this.form = {
                numero: this.commande_ready.numero,
                facture: this.commande_ready.facture,
                fournisseur: this.commande_ready.fournisseur,
                fournisseur_libelle: this.commande_ready.fournisseur_libelle,
                status: this.commande_ready.status,
            }
        }
        // si on ouvre pour afficher on remplit les datas de la commande
        else if (this.dialogRef.data) {
            this.commande = this.dialogRef.data
            this.form = {
                numero: this.dialogRef.data.numero,
                facture: this.dialogRef.data.facture,
                fournisseur: this.dialogRef.data.fournisseur,
                fournisseur_libelle: this.dialogRef.data.fournisseur_libelle,
                status: this.dialogRef.data.status,
            }
        }
        // sinon si la commande est null on cree une nouvelle
        else if (this.commande == null) {
            this.createLine()
        }
    },
     mounted() {
        this.getFournisseurs() //charger les fournisseurs
        this.getRayons() //charger les rayons
        if(this.form.status == 'SUCCESS'){
            this.columns = [
                {
                    key: 'lot',
                    label: 'LOT',
                    exportable: true,
                    format: 'slot'
                },
                {
                    key: 'produit_libelle',
                    label: 'NOM',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true,
                    toCSV: true
                },
                {
                    key: 'prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QT. COMM',
                    format: 'slot',
                    exportable: true,
                    toCSV: true
                },
                {
                    key: 'qte_initiale',
                    label: 'QT. AVANT',
                    format: 'state',
                    exportable: true
                },
                {
                    key: 'qte_finale',
                    label: 'QT. APRES',
                    format: 'state',
                    exportable: true
                },
                // {
                //     key: 'produit.qte',
                //     label: 'QT. ACTU',
                //     format: 'state',
                //     exportable: true
                // },
                {
                    key: 'rayon',
                    label: 'RAYON',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'date_expiration',
                    label: 'EXP',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'coef_conversion_de_prix_vente_achat',
                    label: 'COEF',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'ticket',
                    label: 'TICKET',
                    format: 'slot',
                    exportable: true
                },
            ]
        }
    },
    methods: {
        // selectionner le rayon automatiquement dans l'input
        initSelectedRayon(line, selectedval) {
            if (line == selectedval) {
                return true
            }
        },
        
        onItemsUpdate(items) {
            // items représente toutes les lignes (produits) de la commande
            this.commande_produit = items;

            // Vérifier si la commande a un statut "succès"
            const statutCommande = this.form.status; 
            if (statutCommande === "SUCCESS") {
                return; 
            }

            
        },
        // BouttonRecalculate(){  
             
        //     this.axios.post( '/api/commandes-calc-produits/'+this.commande.id).then((response) => {
        //     $('#refreshcommandes').click()   
        //     }).catch(() => {
        //         this.resIsLoading = false
        //         this.$toast.add({
        //             severity: 'error',
        //             summary: 'Probleme de connexion',
        //             detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
        //             life: 5000
        //         });
        //     })
        // },
        // ouvrir le modal d'importation du fichier excel
        importExcelCommande() {
            this.$dialog.open(ImportCommandeProduit, {
                props: {
                    header: "Importer à partir d'un fichier excel",
                    style: {
                        width: '40vw',
                    },
                    modal: true
                },
                data: this.commande
            });
        },
      
        //recuperer la liste des rayons
        getRayons() {
            this.resIsLoading = true
            this.axios.get('/api/rayons').then((response) => {
                this.rayons = response.data.data
                this.resIsLoading = false
            }).catch(() => {
                this.resIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        //recuperer la liste des fournisseurs
        getFournisseurs() {
            this.isLoading = true
            this.axios.get('/api/fournisseurs').then(response => {
                this.fournisseurs = response.data.data
                this.setFournisseurName()
                this.isLoading = false
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
        // modale pour selectionner les produits
        openSelectCommandeProduit() {
            this.$dialog.open(SelectCommandeProduit, {
                props: {
                    header: "Ajouter des produits à la commande",
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    style: {
                        width: '90vw',
                    },
                    modal: true
                },
                data: this.commande
            });
        },
        // creer une nouvelle commande
        createLine() {
            this.isLoading = true
            this.axios.post('/api/commandes', this.form,).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.commande = response.data.data
                    this.commande_created = true
                    $('#refreshcommandes').click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
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
                }
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
        // supprimer un produit de la commande
        deleteCommandeProduit(id) {
            this.isLoading = true
            this.axios.post('/api/' + this.table + '/' + id + '/destroy').then((response) => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 20000
                        });
                    });
                }
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
        // supprimer une commande
        deleteLine() {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.isLoading = true
                    this.axios.post('/api/commandes/' + this.commande.id + '/destroy').then((response) => {
                        this.isLoading = false
                        if (response.data.success === true) {
                            $('#refreshcommandes').click()
                            this.dialogRef.close()
                            this.$toast.add({
                                severity: 'success',
                                detail: response.data.message,
                                life: 3000
                            });
                        }
                        else {
                            response.data.errors.forEach(element => {
                                this.$toast.add({
                                    severity: 'warn',
                                    summary: 'Oups !',
                                    detail: element,
                                    life: 20000
                                });
                            });
                        }
                    }).catch(() => {
                        this.isLoading = false
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Probleme de connexion',
                            detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                            life: 5000
                        });
                    });
                }
            })
        },
        setFournisseurName() {
            if (this.form.fournisseur && this.form.fournisseur.libelle) {
                let fournisseur = this.fournisseurs.filter(item => item.libelle == this.form.fournisseur.libelle)[0]
                this.form.fournisseur_libelle = this.form.fournisseur.libelle
                if (fournisseur.siteurl) {
                    this.fournisseur_siteurl = fournisseur.siteurl
                }

                this.fournisseurSelected = fournisseur
                this.key2++
                if (this.form.status !== 'SUCCESS'){
                    this.updateLine()
                }
                
            }
        },
        //changer le statut à suspendu
        suspendLine() {
            this.form.status = 'SUSPENDED'
            this.form.suspended_by = this.$store.getters.user.fullname,
            this.updateLine()
            this.dialogRef.close()
        },
        // fermer la commande et verifier si tout est correct
        closeLine() {
            
            if (!this.form.fournisseur) {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'Vous devez selectionner un fournisseur',
                    life: 7000
                });
                return
            }
            else if (!this.form.facture && this.form.facture != '') {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'Vous devez renseigner le numero de facture',
                    life: 7000
                });
                return
            }
            else if (!this.form.facture && this.form.facture != '') {
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'Vous devez renseigner le numero de facture',
                    life: 7000
                });
                return
            }
            else if (!this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.form.status = 'SUCCESS'
                    this.form.ended_with = this.$store.getters.user.fullname
                    this.updateLine()
                }
            }));
        },
        // mettre à jour les informations de la commande
        async updateLine() {
            this.isLoading = true
            await this.axios.post('/api/commandes/' + this.commande.id + '/update', this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refreshcommandes').click()
                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    if (this.form.status == 'SUCCESS') {
                        this.dialogRef.close()
                    }
                }
                else {
                    this.form.status = 'CREATED'
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
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
        // mettre a jour les produits du tableau
        async updateCommandeProduit(line, event) {
            this.isLoadingInput[line.id] = true;
            let result

            if (event.target.name == 'coef_conversion_de_prix_vente_achat') {
                result = calculerProduit(line, line.qte, line.prix_achat, line.prix_de_vente, event.target.value, line.qte_initiale);
            }

            else if (event.target.name == 'qte') {
                result = calculerProduit(line, event.target.value, line.prix_achat, line.prix_de_vente, line.coef_conversion_de_prix_vente_achat, line.qte_initiale);
            }

            else if (event.target.name == 'prix_achat') {
                result = calculerProduit(line, line.qte, event.target.value, line.prix_de_vente, line.coef_conversion_de_prix_vente_achat, line.qte_initiale);
            }

            else if (event.target.name == 'prix_de_vente') {
                result = calculerProduit(line, line.qte, line.prix_achat, event.target.value, line.coef_conversion_de_prix_vente_achat, line.qte_initiale);
            }

            else {
                result = calculerProduit(line, line.qte, null, null ,null ,  line.qte_initiale)
            }

            let form = {
                total_tva: result.totalTVA,
                total_css: result.totalCSS,
                total_ttc: result.totalPrixVente,
                total_ht: result.totalHorsTaxe,
                total_achat: result.total,
                prix_de_vente: result.prixVente,
                prix_achat: line.prix_achat,
                qte_finale: result.qteFinale,
                coef_conversion_de_prix_vente_achat: line.coef_conversion_de_prix_vente_achat
            }

            form[event.target.name] = event.target.value

            await this.axios.post('/api/' + this.table + '/' + line.id + '/update', form).then(response => {
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    $('#refreshcommandes').click()
                    $('#refreshcountercommande').click()
                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
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
                }
                this.isLoadingInput[line.id] = false;
            }).catch(() => {
                this.isLoadingInput[line.id] = false;
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        //mettre ajour localement les lignes du tableau
        async updateLines(nb_lines) {
            
            this.lines = nb_lines
            this.key2++
        },
      
        updateExtraDatas(extraDatas) {
            console.log("Données reçues dans updateExtraDatas :", extraDatas);
            
            if (!extraDatas || !extraDatas.compteurs) {
                console.warn("Données 'compteurs' manquantes ou incorrectes dans extraDatas.");
                return;
            }
            
            // Mise à jour des compteurs
            const compteur = extraDatas.compteurs;
            this.compteurs = [
                { value: compteur.cout_total_achat, label: 'TTC' },
                { value: compteur.cout_total_ht, label: 'HT' },
                { value: compteur.cout_total_css, label: 'CSS' },
                { value: compteur.cout_total_tva, label: 'TVA' },
                { value: compteur.cout_total_vente, label: 'CA POTENTIEL' },
            ];
            console.log("Compteurs mis à jour :", this.compteurs);
            
            // Réinitialiser les états de cohérence
            this.coherenceStates = {};
            console.log("coherenceStates réinitialisé :", this.coherenceStates);
            this.countIncoherence = extraDatas.incoherances.nb;
            // Traiter les incohérences
            if (extraDatas.incoherances && Array.isArray(extraDatas.incoherances.ids)) {
                extraDatas.incoherances.ids.forEach(id => {
                    console.log(`Marquer les champs incohérents pour l'ID : ${id}`);
                    // Supposons que les incohérences concernent les champs 'prix_achat', 'prix_de_vente', et 'coef_conversion_de_prix_vente_achat'
                    const fields = ['prix_achat', 'prix_de_vente', 'coef_conversion_de_prix_vente_achat'];
                    fields.forEach(field => {
                        const key = `${field}-${id}`;
                        // Vue 3 réactif : assignation directe
                        this.coherenceStates[key] = false; // Marque comme incohérent
                        console.log(`coherenceStates[${key}] = false`);
                    });
                     // Incrémenter le compteur d'incohérences (Option 2 : par produit)
                    
                });
                
            } else {
                console.warn("Données d'incohérence manquantes ou mal formatées.");
            }
            
            console.log("coherenceStates après traitement des incohérences :", this.coherenceStates);
            
            // Forcer le re-render des composants concernés
            this.keyCounter++;
        },

        // Méthode pour obtenir la classe CSS basée sur les états de cohérence
        getCoherenceClass(lineId, field) {
            const key = `${field}-${lineId}`;
            return this.coherenceStates[key] === false ? 'border-danger' : 'border-dark';
        },

        
        
        
        onChangeField(line, event) {
            // Récupération des valeurs actuelles
            let prixAchat = parseFloat(line.prix_achat) || 0;
            let prixVente = parseFloat(line.prix_de_vente) || 0;
            let coef = parseFloat(line.coef_conversion_de_prix_vente_achat) || 0;

            // Recalculer les valeurs
            let { prixAchat: newPrixAchat, prixVente: newPrixVente, coef: newCoef } = recalculerPrix(
                event.target.name,
                prixAchat,
                prixVente,
                coef,
                parseFloat(event.target.value) || 0
            );

            // Remplir les champs manquants
            ({ prixAchat: newPrixAchat, prixVente: newPrixVente, coef: newCoef } = remplirChampsManquants(
                newPrixAchat,
                newPrixVente,
                newCoef
            ));

            // Mettre à jour les valeurs dans la ligne
            line.prix_achat = newPrixAchat.toFixed(2);
            line.prix_de_vente = newPrixVente.toFixed(2);
            line.coef_conversion_de_prix_vente_achat = newCoef.toFixed(2);

           

         
            
            this.updateCommandeProduit(line, event);
           
        }



    },
})
</script>