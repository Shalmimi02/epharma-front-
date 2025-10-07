<template>
    <form @submit.prevent="saveLine()">
        <div>
            <p class="h5">Identification de base </p>

            <div class="form-row">
                <div class="col-md-3">
                    <label>Libelle *</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.libelle" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Rayon</label>
                    <select type="text"class="form-control border border-dark px-[4rem]"  v-model="form.rayon_id" :disabled="this.formLocked" @change="onChangeRayon()">
                        <option v-for="rayon in rayons" :key="rayon.id" :value="rayon.id">
                            {{ rayon.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>CIP *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.cip" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>CIP 2 *</label>
                    <input type="number" class="form-control border border-dark px-[4rem]" v-model="form.cip_deux" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Prix d'achat *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]"
                        @change="calculPrix()" required v-model="form.prix_achat" :disabled="this.formLocked"  :class="getBorderClass('prix_achat')">
                </div>
                
            </div>
            <div class="form-row" >
               
                <button v-if="Object.values(coherenceStates).some(value => value === false) && line" type="button" class="btn btn-sm btn-primary mb-4 ml-1" @click="BouttonRecalculate":disabled="formLocked" >
                    Recalculer
                    <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                </button>

                
            </div>

            <br>

            <p class="h5">Identification du produit </p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Code</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.code" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Description</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.description" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>EAN</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.ean" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>DCI</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.dci" :disabled="this.formLocked">
                </div>
                <!-- <div class="form-group col-md-3">
                    <label>Fournisseur</label>
                    <select type="text"class="form-control border border-dark px-[4rem]"  v-model="form.code_fournisseur" :disabled="this.formLocked">
                        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                            {{ fournisseur.libelle }}
                        </option>
                    </select>
                </div> -->
            </div><br>

            <p class="h5">Informations pour la vente</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>TVA</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"  :disabled="this.formLocked"
                        v-model="form.tva">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>CSS</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"  :disabled="this.formLocked"
                        v-model="form.css">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3" >
                    <label>Prix de vente</label>
                   <input step="any" type="number" class="form-control" :class="getBorderClass('prix_de_vente')" v-model="form.prix_de_vente" @change="calculPrix('prix_de_vente')" :disabled="formLocked">
                    <p class="class h6">TVA et CSS inclus dans ce montant</p>
                </div>
                <div class="form-group col-md-3">
                    <label>Coef. conversion de prix vente / achat *</label>
                    <input step="any" type="number" class="form-control"  :class="getBorderClass('coef_conversion_de_prix_vente_achat')" v-model="form.coef_conversion_de_prix_vente_achat"  @change="calculPrix('coef')" required :disabled="formLocked">
                </div>
            </div><br>

            <p class="h5">Stockage & Suivi</p>

            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Quantité minimale</label>
                    <input type="number" min="0" class="form-control border border-dark px-[4rem]" v-model="form.qte_min"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Quantité maximale</label>
                    <input type="number" min="0" class="form-control border border-dark px-[4rem]" v-model="form.qte_max"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3" v-if="line">
                    <label>Quantité en stock *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.qte" :disabled="this.formLocked">
                </div>
            </div><br>

            <p class="h5">Description du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Image (url)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.photo" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Posologie</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.posologie" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Homologation</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.homologation" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Forme</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.forme" :disabled="this.formLocked">
                        <option v-for="forme in formes" :key="forme" :value="forme.libelle">{{ forme.libelle }}</option>
                    </select>
                </div>

                <div class="form-group col-md-3">
                    <label>Familles</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.famille" :disabled="this.formLocked">
                        <option v-for="famille in familles" :key="famille" :value="famille.libelle">{{ famille.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Nature</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.nature" :disabled="this.formLocked">
                        <option v-for="nature in natures" :key="nature" :value="nature.libelle">{{ nature.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Classe therapeutique</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.classe_therapeutique" :disabled="this.formLocked">
                        <option v-for="classe in classes" :key="classe" :value="classe.libelle">{{ classe.libelle }}
                        </option>

                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Categorie</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.categorie" :disabled="this.formLocked">
                        <option v-for="categorie in categories" :key="categorie" :value="categorie.libelle">{{ categorie.libelle }}</option>
                    </select>
                </div>
            </div><br>

            <p class="h5">Dimensions du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Poids (g)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.poids" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Longueur (cm)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.longueur" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Hauteur (cm)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.hauteur" :disabled="this.formLocked">
                </div>
            </div><br>

            <p class="h5">Autres</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Code table</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.code_table" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Statut</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.statut" :disabled="this.formLocked">
                        <!-- <option v-for="statut in statutList" :key="index" :value="statut">{{ statut }}</option> -->
                        <option value="Attente">Attente</option>
                        <option value="Normal">Normal</option>
                        <option value="Supprime">Supprime</option>
                        <option value="Mise en place">Mise en place</option>
                        <option value="Elimine">Elimine</option>
                        <option value="C">C</option>
                        <option value="V">V</option>
                        <option value="P">P</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Fournisseur</label>
                    <select type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.code_fournisseur" :disabled="this.formLocked">
                        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                            {{ fournisseur.libelle }}</option>
                    </select>
                </div>
            </div>

        </div>

        <div class=" d-flex justify-content-end ">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
                    <button type="submit" class="btn btn-light" :disabled="Object.values(coherenceStates).some(value => value === false)">
                {{ buttonLabel }} <span v-if="isLoading == true"
                    class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </div>


    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';
import {recalculerPrix,remplirChampsManquants, verifierCoherencePourProduit } from '@/views/calculs/add-produits-commande.ts';

export default defineComponent({
    name: 'FormBaseDonnee',
    inject: ['dialogRef'],
    props: {
        datas: {
            type: Object,
            default: null,
        },
        formLocked: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            table: 'produits',
            isLoading: false,
            fournisseurs: [],
            rayons: [],
            natures: [],
            formes: [],
            familles: [],
            classes: [],
            categories: [],
            line: null,
            form: {},
            coherenceStates: {}
        }
    },
    created() {
        if (this.dialogRef.data) {
            this.line = this.dialogRef.data
        }
        else if (this.datas) {
            this.line = this.datas
        }
    },
    computed: {
        buttonLabel() {
            return this.line ? "Mettre à jour" : "Enregistrer";
        }
    },
    mounted() {
        this.getFournisseurs()
        this.getRayons()
        this.getFormes()
        this.getFamille()
        this.getNature()
        this.getClasses()
        this.getCategorie()
        if(this.line) {
            this.form = {
                libelle: this.line.libelle,
                cip: this.line.cip,
                prix_achat: this.line.prix_achat,
                coef_conversion_de_prix_vente_achat: this.line.coef_conversion_de_prix_vente_achat,
                code: this.line.code,
                qte: this.line.qte,
                description: this.line.description,
                rayon_id: this.line.rayon_id,
                ean: this.line.ean,
                dci: this.line.dci,
                tva: this.line.tva,
                css: this.line.css,
                qte_min: this.line.qte_min,
                qte_max: this.line.qte_max,
                cip_deux: this.line.cip_deux,
                fournisseurId: this.line.fournisseurId,
                prix_de_vente: this.line.prix_de_vente,
                posologie: this.line.posologie,
                homologation: this.line.homologation,
                forme: this.line.forme,
                famille: this.line.famille,
                nature: this.line.nature,
                classe_therapeutique: this.line.classe_therapeutique,
                categorie: this.line.categorie,
                poids: this.line.poids,
                longueur: this.line.longueur,
                hauteur: this.line.hauteur,
                code_table: this.line.code_table,
                statut: this.line.statut,
                code_fournisseur: this.line.code_fournisseur,
            }
        }
        this.validateOnOpen()
    },
    methods: {
        getRayons(){
            this.isLoading = true
            this.axios.get('/api/rayons').then(response => {
                this.rayons = response.data.data
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
        getFournisseurs() {
            this.isLoading = true
            this.axios.get('/api/fournisseurs').then(response => {
                this.fournisseurs = response.data.data
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
        getFormes() {
            this.isLoading = true
            this.axios.get('/api/prod_formes').then(response => {
                this.formes = response.data.data
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
        getFamille() {
            this.isLoading = true
            this.axios.get('/api/prod_familles').then(response => {
                this.familles = response.data.data
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
        getNature() {
            this.isLoading = true
            this.axios.get('/api/prod_natures').then(response => {
                this.natures = response.data.data
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
        getClasses() {
            this.isLoading = true
            this.axios.get('/api/prod_classe_theraps').then(response => {
                this.classes = response.data.data
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
        getCategorie() {
            this.isLoading = true
            this.axios.get('/api/prod_categories').then(response => {
                this.categories = response.data.data
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
        saveLine() {
            this.isLoading = true

            let url = '/api/' + this.table
            if (this.line) {
                url = '/api/' + this.table + '/' + this.line.id + '/update'
            }

            this.axios.post(url, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {

                    $('#refresh' + this.table).click()
                    if (this.line) {
                        this.$emit('line_updated')
                    }
                    else this.resetForm()

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
        resetForm() {
            this.form = {}
        },
        onChangeRayon() {
            const rayon = this.rayons.filter(item => item.id == this.form.rayon_id)[0]
            if (rayon) {
                this.form.rayon = rayon.libelle
            }
        },
        calculPrix(champModifie) {
            // Extraire les valeurs actuelles du formulaire
            const { prix_achat, prix_de_vente, coef_conversion_de_prix_vente_achat } = this.form;
            
            // Correction: mapper 'coef' à 'coef_conversion_de_prix_vente_achat'
            const champReel = champModifie === 'coef' ? 'coef_conversion_de_prix_vente_achat' : champModifie;
            const valeurChamp = champModifie === 'coef' ? this.form.coef_conversion_de_prix_vente_achat : this.form[champModifie];
            
            

            // Utiliser recalculerPrix pour mettre à jour les champs en fonction du champ modifié
            const { prixAchat, prixVente, coef } = recalculerPrix(
                champReel, // Utiliser le nom correct du champ
                prix_achat,
                prix_de_vente,
                coef_conversion_de_prix_vente_achat,
                valeurChamp // Utiliser la valeur correcte
            );
            
            

            // Mettre à jour le formulaire avec les nouvelles valeurs recalculées
            this.form.prix_achat = prixAchat;
            this.form.prix_de_vente = prixVente;
            this.form.coef_conversion_de_prix_vente_achat = coef.toFixed(2);
            
            // IMPORTANT: Ne pas appeler remplirChampsManquants si recalculerPrix a déjà calculé toutes les valeurs
            // Cette fonction ne doit être appelée que si certaines valeurs sont manquantes
            if ((prixAchat <= 0 && prixVente <= 0) || (prixAchat <= 0 && coef <= 0) || (prixVente <= 0 && coef <= 0)) {
                
                // Remplir les champs manquants si nécessaire
                const champsRemplis = remplirChampsManquants(
                    this.form.prix_achat,
                    this.form.prix_de_vente,
                    this.form.coef_conversion_de_prix_vente_achat
                );

                this.form.prix_achat = champsRemplis.prixAchat;
                this.form.prix_de_vente = champsRemplis.prixVente;
                this.form.coef_conversion_de_prix_vente_achat = champsRemplis.coef.toFixed(2);
            }
            
            

            // Appel de la fonction de vérification pour mettre à jour la cohérence
            const { isCoherent, message } = verifierCoherencePourProduit(this.form);

            this.coherenceStates = {
                [`prix_achat-${this.dialogRef?.data?.id}`]: isCoherent,
                [`prix_de_vente-${this.dialogRef?.data?.id}`]: isCoherent,
                [`coef_conversion_de_prix_vente_achat-${this.dialogRef?.data?.id}`]: isCoherent,
            };

            if (!isCoherent) {
                return false;
            }

            return true;
        },
        BouttonRecalculate() {
            // 1) Récupérer les valeurs actuelles
            this.isLoading = true
            const { prix_achat, prix_de_vente, coef_conversion_de_prix_vente_achat } = this.form;
            
            

            // 2) On considère que l'utilisateur veut forcer un recalcul en considérant
            //    "coef" comme champ pivot, ou "prix_de_vente" etc.
            //    Mais le plus simple est de recalculer dans l'ordre qui vous arrange.
            //    Ici on imagine recalculer en prenant "prix_achat" et "coef" comme base pour retrouver "prix_de_vente".

            // NB : Si vous préférez un autre ordre (ex.: PV et coef => PA), adaptez le code.
            let { prixAchat, prixVente, coef } = recalculerPrix(
                // L'argument `field` qu'on passe ici doit correspondre à l'un des 3 cas:
                //  'prix_achat' | 'prix_de_vente' | 'coef_conversion_de_prix_vente_achat'
                //  Supposons qu'on prenne 'coef_conversion_de_prix_vente_achat' comme pivot.
                'coef_conversion_de_prix_vente_achat',
                prix_achat,
                prix_de_vente,
                coef_conversion_de_prix_vente_achat,
                coef_conversion_de_prix_vente_achat // la "newValue" qu'on veut appliquer
            );
            
            

            // 3) Ne remplir les champs manquants que si nécessaire
            if ((prixAchat <= 0 && prixVente <= 0) || (prixAchat <= 0 && coef <= 0) || (prixVente <= 0 && coef <= 0)) {
                
                // Remplir les champs manquants si nécessaire
                ({ prixAchat, prixVente, coef } = remplirChampsManquants(prixAchat, prixVente, coef));
            }
            
            

            // 4) Mettre à jour le formulaire
            this.form.prix_achat = prixAchat;
            this.form.prix_de_vente = prixVente;
            this.form.coef_conversion_de_prix_vente_achat = coef.toFixed(2);

            // Appel de la fonction de vérification pour mettre à jour la cohérence
            const { isCoherent, message } = verifierCoherencePourProduit(this.form);

            this.coherenceStates = {
                [`prix_achat-${this.dialogRef?.data?.id}`]: isCoherent,
                [`prix_de_vente-${this.dialogRef?.data?.id}`]: isCoherent,
                [`coef_conversion_de_prix_vente_achat-${this.dialogRef?.data?.id}`]: isCoherent,
            };

            if (!isCoherent) {
                this.isLoading = false;
                return false;
            }
            this.isLoading = false;
            return true;
        },
        //methode pour la verification de coherence lors de l'ouverture du modale
        validateOnOpen() {
            const { isCoherent, message } = verifierCoherencePourProduit(this.form);

            this.coherenceStates = {
                [`prix_achat-${this.dialogRef?.data?.id}`]: isCoherent,
                [`prix_de_vente-${this.dialogRef?.data?.id}`]: isCoherent,
                [`coef_conversion_de_prix_vente_achat-${this.dialogRef?.data?.id}`]: isCoherent,
            };

            if (!isCoherent && this.line) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Incohérence détectée',
                    detail: message,
                    life: 5000,
                });
            }
        },
        getBorderClass(field) {
            const key = `${field}-${this.dialogRef?.data?.id}`;
            if (!this.coherenceStates || !(key in this.coherenceStates)) {
                return 'border-dark'; // Retourne une bordure par défaut si la clé n'existe pas
            }
            return this.coherenceStates[key] === false ? 'border-danger' : 'border-dark';
        },
    }
})
</script>
