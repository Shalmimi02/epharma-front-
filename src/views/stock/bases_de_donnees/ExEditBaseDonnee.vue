<template>
    <form @submit.prevent="updateLine()">
        <div>
            <p class="h5">Identification du produit</p>

            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Libelle</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.libelle" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Code</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.code" :disabled="this.formLocked">
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
                    <label>CIP</label>
                    <input type="number" class="form-control border border-dark px-[4rem]" required v-model="form.cip" :disabled="this.formLocked">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>CIP 2 *</label>
                    <input type="number" class="form-control border border-dark px-[4rem]"  v-model="form.cip_deux"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>EAN</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.ean" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>DCI</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.dci" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Fournisseur</label>
                    <select type="text"class="form-control border border-dark px-[4rem]"  v-model="form.code_fournisseur" :disabled="this.formLocked">
                        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                            {{ fournisseur.libelle }}
                        </option>
                    </select>

                </div>
            </div><br>
            <p class="h5">Informations pour la vente</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>TVA</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.tva" :disabled="this.formLocked">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>CSS</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.css" :disabled="this.formLocked">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Prix d'achat</label>
                   <input step="any" type="number" class="form-control" :class="getBorderClass('prix_achat')" v-model="form.prix_achat" @input="calculPrix('prix_achat')" required :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Prix de vente</label>
                   <input step="any" type="number" class="form-control" :class="getBorderClass('prix_de_vente')" v-model="form.prix_de_vente" @input="calculPrix('prix_de_vente')" :disabled="formLocked">
                    <p class="class h6">TVA et CSS inclus dans ce montant</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Coef. conversion de prix vente / achat</label>
                    <input step="any" type="number" class="form-control"  :class="getBorderClass('coef_conversion_de_prix_vente_achat')" v-model="form.coef_conversion_de_prix_vente_achat"  @input="calculPrix('coef')" required :disabled="formLocked">
                </div>
                <button v-if="Object.values(coherenceStates).some(value => value === false)" type="button" class="btn btn-sm btn-primary mb-4" @click="BouttonRecalculate":disabled="formLocked" >
                    Recalculer
                    <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                </button>
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
                <div class="form-group col-md-4">
                    <label>Quantité en stock *</label>
                    <input type="number" min="0" class="form-control border border-dark px-[4rem]" required v-model="form.qte"
                        :disabled="this.formLocked">
                </div>
            </div><br>

            <p class="h5">Description du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Posologie</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.posologie" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Homologation</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.homologation" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Forme</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.forme" :disabled="this.formLocked">
                        <option v-for="forme,  in formes" :key="forme" :value="forme.libelle">{{ forme.libelle }}</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Famille</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.famille" :disabled="this.formLocked">
                        <option v-for="famille in familles" :key="familles" :value="famille.libelle">{{ famille.libelle }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Nature</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.nature" :disabled="this.formLocked">
                        <option v-for="nature, in natures" :key="nature" :value="nature.libelle">{{ nature.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Classe therapeutique</label>
                    <select class="form-control border border-dark px-[4rem]" v-model="form.classe_therapeutique" :disabled="this.formLocked">
                        <option v-for="classe, in classes" :key="classe" :value="classe.libelle">{{ classe.libelle }}
                        </option>

                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Categorie</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.categorie" :disabled="this.formLocked">
                        <option v-for="categorie in categories" :key="categorie" :value="categorie.libelle">{{ categorie.libelle }}</option>
                    </select>
                </div>
            </div><br>

            <p class="h5">Dimensions du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Poids (g)</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.poids" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Longueur (cm)</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.longueur" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Hauteur (cm)</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.hauteur" :disabled="this.formLocked">
                </div>
            </div><br>

            <p class="h5">Autres</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Code table</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.code_table" :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-3">
                    <label>Statut</label>
                    <select name="" id="" class="form-control border border-dark px-[4rem]" v-model="form.statut" :disabled="this.formLocked">
                        <option v-for="(statut, index )  in statutList" :key="index" :value="statut">{{ statut }}</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Laboratoire</label>
                    <select type="text"class="form-control border border-dark px-[4rem]"  v-model="form.code_fournisseur" :disabled="this.formLocked">
                        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                            {{ fournisseur.libelle }}
                        </option>
                    </select>

                </div>
            </div>

            <div class=" d-flex justify-content-end" v-if="this.formLocked == false">
                <button type="button" class="btn btn-light mr-2" @click="this.$emit('line_updated')">Annuler</button>
                <button type="submit" class="btn btn-light" :disabled="Object.values(coherenceStates).some(value => value === false)">
                    Mettre à jour
                    <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                </button>
            </div>
        </div>
    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';
import {recalculerPrix,remplirChampsManquants, verifierCoherencePourProduit } from '@/views/calculs/add-produits-commande.ts';

export default defineComponent({
    name: 'EditBaseDonnee',
    inject: ['dialogRef'],
    props: ['formLocked', 'datas'],

    data() {
        return {
            table: 'produits',
            form: {},
            isLoading: false,
            natures: [],
            formes: [],
            familles: [],
            categories: [],
            classes: [],
            fournisseurs: [],
            rayons: [],
            GoodCheck: true, // Variable pour indiquer la cohérence
            coherenceStates: {},
            form: {
                libelle: this.datas.libelle,
                cip: this.datas.cip,
                prix_achat: this.datas.prix_achat,
                coef_conversion_de_prix_vente_achat: this.datas.coef_conversion_de_prix_vente_achat,
                code: this.datas.code,
                qte: this.datas.qte,
                description: this.datas.description,
                rayon_id: this.datas.rayon_id,
                ean: this.datas.ean,
                dci: this.datas.dci,
                tva: this.datas.tva,
                css: this.datas.css,
                qte_min: this.datas.qte_min,
                qte_max: this.datas.qte_max,
                cip_deux: this.datas.cip_deux,
                fournisseurId: this.datas.fournisseurId,
                prix_de_vente: this.datas.prix_de_vente,
                posologie: this.datas.posologie,
                homologation: this.datas.homologation,
                forme: this.datas.forme,
                famille: this.datas.famille,
                nature: this.datas.nature,
                classe_therapeutique: this.datas.classe_therapeutique,
                categorie: this.datas.categorie,
                poids: this.datas.poids,
                longueur: this.datas.longueur,
                hauteur: this.datas.hauteur,
                code_table: this.datas.code_table,
                statut: this.datas.statut,
                code_fournisseur: this.datas.code_fournisseur,
            }
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
        this.validateOnOpen()
    },
    methods: {
        onChangeRayon() {
            const rayon = this.rayons.filter(item => item.id == this.form.rayon_id)[0]
            if (rayon) {
                this.form.rayon = rayon.libelle
            }
        },
        calculPrix(champModifie) {
            // Extraire les valeurs actuelles du formulaire
            const { prix_achat, prix_de_vente, coef_conversion_de_prix_vente_achat } = this.form;

            // Utiliser recalculerPrix pour mettre à jour les champs en fonction du champ modifié
            const { prixAchat, prixVente, coef } = recalculerPrix(
                champModifie,
                prix_achat,
                prix_de_vente,
                coef_conversion_de_prix_vente_achat,
                this.form[champModifie]
            );

            // Mettre à jour le formulaire avec les nouvelles valeurs recalculées
            this.form.prix_achat = prixAchat;
            this.form.prix_de_vente = prixVente;
            this.form.coef_conversion_de_prix_vente_achat = coef.toFixed(2);

            // Remplir les champs manquants si nécessaire
            const champsRemplis = remplirChampsManquants(
                this.form.prix_achat,
                this.form.prix_de_vente,
                this.form.coef_conversion_de_prix_vente_achat
            );

            this.form.prix_achat = champsRemplis.prixAchat;
            this.form.prix_de_vente = champsRemplis.prixVente;
            this.form.coef_conversion_de_prix_vente_achat = champsRemplis.coef.toFixed(2);

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

            // 3) Ensuite, remplir les champs manquants
            //    (au cas où l’un des champs serait 0)
            ({ prixAchat, prixVente, coef } = remplirChampsManquants(prixAchat, prixVente, coef));

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

            if (!isCoherent) {
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
       

        getRayons(){
            this.isLoading = true
            this.axios.get( '/api/rayons').then(response => {
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
            this.axios.get( '/api/fournisseurs').then(response => {
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
        updateLine() {
           
            this.isLoading = true
            this.axios.post( '/api/' + this.table + '/' + this.datas.id + '/update', this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    this.dialogRef.close()
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
        getFormes() {
            this.isLoading = true
            this.axios.get( '/api/prod_formes').then(response => {
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
            this.axios.get( '/api/prod_familles').then(response => {
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
            this.axios.get( '/api/prod_natures').then(response => {
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
            this.axios.get( '/api/prod_classe_theraps').then(response => {
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
            this.axios.get( '/api/prod_categories').then(response => {
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
    }
})
</script>