<template>
    <form @submit.prevent="updateLine()">
        <div>
            <p class="h5">Modifier les informations du produit</p>
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label>Libelle</label>
                    <input type="text" class="form-control border border-dark px-[4rem]"  required
                        v-model="form.libelle">
                </div>
                <div class="form-group col-md-3">
                    <label>Prix achat</label>
                    <input type="number" class="form-control px-[4rem]" step="any"  id="prix_achat" :class="getBorderClass('prix_achat')" min="0"
                        @change="validateAndCalculatePrix($event)" required v-model="form.prix_achat">
                </div>
                <div class="form-group col-md-3">
                    <label>Prix vente</label>
                    <input type="number" class="form-control px-[4rem]" step="any"  id="prix_de_vente" :class="getBorderClass('prix_de_vente')" min="0"
                        v-model="form.prix_de_vente" @change="validateAndCalculatePrix($event)">
                </div>
                <div class="form-group col-md-3">
                    <label>Coefficient</label>
                    <input type="number" id="coef_conversion_de_prix_vente_achat" class="form-control  px-[4rem]" :class="getBorderClass('coef_conversion_de_prix_vente_achat')" min="0" step="any" required
                        @change="validateAndCalculatePrix($event)" v-model="form.coef_conversion_de_prix_vente_achat" >
                </div>
                <div class="form-group col-md-3">
                    <label>Rayon</label>
                    <select class="form-control border border-dark px-[4rem]" v-model="form.rayon_id"
                        @change="onChangeRayon()">
                        <option v-for="rayon in rayons" :value="rayon.id">{{ rayon.libelle }}</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-sm btn-primary mb-4" :disabled="Object.values(coherenceStates).some(value => value === false)">
                <i class="fa-solid fa-floppy-disk"></i> Modifier
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
            <button v-if="Object.values(coherenceStates).some(value => value === false)" type="button" class="btn btn-sm btn-primary  mb-4 ml-2" @click="BouttonRecalculate":disabled="formLocked" >
                <i class="fa-solid fa-calculator"></i>Recalculer
                    
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </div>
    </form>

    <form @submit.prevent="CreateMouvement()" class="mb-3">
        <p class="h5">Modifier la quantite</p>
        <div class="form-row">
            <div class="form-group col-md-3">
                <label>Quantite</label>
                <input type="number" class="form-control border border-dark px-[4rem]" min="0" v-model="form2.qte"
                    required>
            </div>
            <div class="form-group col-md-6">
                <label>Motif</label>
                <select name="" class="form-control border border-dark px-[4rem]" id="exampleFormControlSelect1"
                    v-model="form2.motif" required>
                    <option v-for="motif in motifs" :key="motif" :value="motif.libelle">{{ motif.libelle }}</option>
                </select>
            </div>
            <div class="form-group col-md-3">
                <label>Type</label>
                <select name="" class="form-control border border-dark px-[4rem]" id="exampleFormControlSelect1"
                    v-model="form2.type" required>
                    <option value="Entree">Entree</option>
                    <option value="Sortie">Sortie</option>
                </select>
            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm" :disabled="createMouvementIsLoading == true">Enregistrer
            <span v-if="createMouvementIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
        </button>
    </form>

    <div>
        <form @submit.prevent="mouvementFilter">
            <h5 class="mb-3">Derniers mouvements</h5>
            <div class="card-body p-1 shadow mb-3">
                <div class="row">
                    <div class="form-group col-md-4">
                        <label>Rechercher par motif</label>
                        <select class="form-control form-control-sm border border-dark px-[4rem]"
                            v-model="filterForm.motif">
                            <option v-for="motif in motifs" :key="motif" :value="motif.libelle">{{ motif.libelle }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group col-md-4">
                        <label for="">Periode debut</label>
                        <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                            v-model="filterForm.debut">
                    </div>
                    <div class="form-group col-md-4">
                        <label for="">Periode fin</label>
                        <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                            v-model="filterForm.fin">
                    </div>

                    <div class="form-group col-md-3">
                        <label>Rechercher par type</label>
                        <select class="form-control form-control-sm border border-dark px-[4rem]"
                            v-model="filterForm.type">
                            <option value="Entree">Entree</option>
                            <option value="Sortie">Sortie</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">
                        <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                            title="Appliquer le filtrage"></i>
                    </button>
                    <button type="button" class="btn" @click="removeFilter">
                        <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                            title="Annuler le filtrage"></i>
                    </button>
                </div>
            </div>
        </form>
        <AsdecodeTable :key="key" :url="url" :columns="columns" table="mouvements"
            v-on:set-total-records="updateLines">
        </AsdecodeTable>
    </div>

    <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Fermer</button>
        <button type="button" class="btn btn-light mr-2" @click="openCommande()">Voir les commandes</button>
        <button type="button" class="btn btn-light" @click="addProduitToCommande()">Commander ce produit</button>
    </div>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
import $ from 'jquery';
const UpdateCommandeProduit = defineAsyncComponent(() => import('./UpdateCommandeProduit.vue'))
const TableShowCommande = defineAsyncComponent(() => import('../commandes/TableShowCommande.vue'))
import { recalculerPrix,remplirChampsManquants,verifierCoherencePourProduit } from '@/views/calculs/add-produits-commande.ts';
import { FormatService } from '@/services/FormatService';
export default defineComponent({
    name: 'EditProduit',
    inject: ['dialogRef'],
    data() {
        return {
            key: 1,
            table: 'produits',
            resIsLoading: false,
            isLoading: false,
            createMouvementIsLoading: false,
            defaultUrl: '/api/mouvements?produit_id=' + this.dialogRef.data.id,
            url: '/api/mouvements?produit_id=' + this.dialogRef.data.id,
            coherenceStates: {},
            columns: [
                {
                    key: 'qte',
                    label: 'QTE',
                    exportable: true
                },
                {
                    key: 'type',
                    label: 'TYPE',
                    exportable: true
                },
                {
                    key: 'motif',
                    label: 'MOTIF',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'DATE',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'UTILISATEUR',
                    exportable: true
                },
            ],
            form: {
                libelle: this.dialogRef.data.libelle,
                prix_achat: this.dialogRef.data.prix_achat,
                prix_de_vente: this.dialogRef.data.prix_de_vente,
                rayon_id: this.dialogRef.data.rayon_id,
                coef_conversion_de_prix_vente_achat: parseFloat(this.dialogRef.data.coef_conversion_de_prix_vente_achat)
            },
            form2: {
                produit_libelle: this.dialogRef.data.libelle,
                produit_id: this.dialogRef.data.id,
                created_by: this.$store.getters.user.fullname,
            },
            rayons: [],
            rayon: {},
            produits: [],
            filterForm: {},
            motifs: []
        }
    },

    mounted() {
        this.getRayons()
        this.getMotif()
        this.validateOnOpen()
    },
    methods: {
        onChangeRayon() {
            const rayon = this.rayons.filter(item => item.id == this.form.rayon_id)[0]
            if (rayon) {
                this.form.rayon = rayon.libelle
            }
        },
        //methode pour la verification de coherence lors de l'ouverture du modale
        async validateOnOpen() {
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
        //methode pour la verification et recalculation lors du change dans l'input
        async validateAndCalculatePrix(event = null) {
            
            const field = event ? event.target.id : null;
            const newValue = event ? parseFloat(event.target.value) || 0 : null;

            // Appeler la fonction de recalcul des prix
            const recalculatedValues = recalculerPrix(
                field,
                this.form.prix_achat,
                this.form.prix_de_vente,
                this.form.coef_conversion_de_prix_vente_achat,
                newValue
            );

            const { prixAchat, prixVente, coef } = remplirChampsManquants(
                recalculatedValues.prixAchat,
                recalculatedValues.prixVente,
                recalculatedValues.coef
            );

            // Mettre à jour les champs avec les nouvelles valeurs recalculées
            this.form.prix_achat = prixAchat;
            this.form.prix_de_vente = prixVente;
            this.form.coef_conversion_de_prix_vente_achat = coef.toFixed(2);

            // Vérifier la cohérence des données
            const { isCoherent, message } = verifierCoherencePourProduit(this.form);

            this.coherenceStates = {
                [`prix_achat-${this.dialogRef?.data?.id}`]: isCoherent,
                [`prix_de_vente-${this.dialogRef?.data?.id}`]: isCoherent,
                [`coef_conversion_de_prix_vente_achat-${this.dialogRef?.data?.id}`]: isCoherent,
            };

            if (!isCoherent) {
                // Afficher une notification si incohérence détectée
                this.$toast.add({
                    severity: 'error',
                    summary: 'Incohérence détectée',
                    detail: message,
                    life: 5000,
                });
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
        mouvementFilter() {
            let newUrl = this.defaultUrl

            if (this.filterForm.motif) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'motif=' + this.filterForm.motif
            }

            if (this.filterForm.type) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'type=' + this.filterForm.type
            }

            if (this.filterForm.debut) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'from_period_debut=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'from_period_fin=' + this.filterForm.fin
            }

            this.url = newUrl
            this.key++
        },
        removeFilter() {
            this.filterForm = {}
            this.url = this.defaultUrl
            this.key++
        },
        openCommande() {
            this.$dialog.open(TableShowCommande, {
                props: {
                    header: "Commandes avec le produit " + this.dialogRef.data.libelle,
                    style: {
                        width: '90vw',
                    },
                    modal: true
                },
                data: this.dialogRef.data
            });
        },
        getRayons() {
            this.resIsLoading = true
            this.axios.get( '/api/rayons').then(response => {
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
        getMotif() {
            this.resIsLoading = true
            this.axios.get( '/api/mouv_motifs').then(response => {
                this.motifs = response.data.data
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
        addProduitToCommande() {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.$dialog.open(UpdateCommandeProduit, {
                        props: {
                            style: {
                                header: "Produit N°",
                                width: '90vw',
                            },
                            modal: true
                        },
                        data: this.dialogRef.data
                    });
                }
            })
        },
        async updateLine() {
            
            // Si tout est valide, procéder à la mise à jour
            this.isLoading = true;

            this.axios.post( '/api/' + this.table + '/' + this.dialogRef.data.id + '/update', this.form)
                .then(response => {
                    this.isLoading = false;
                    if (response.data.success === true) {
                        $('#refresh' + this.table).click();
                        $('#refreshcounter').click();

                        this.$emit('line_updated');
                        this.$toast.add({
                            severity: 'success',
                            detail: response.data.message,
                            life: 3000,
                        });
                        this.dialogRef.close();
                    } else {
                        response.data.errors.forEach(element => {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Oups !',
                                detail: element,
                                life: 7000,
                            });
                        });
                    }
                })
                .catch(() => {
                    this.isLoading = false;
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Problème de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000,
                    });
                });
        },
        CreateMouvement() {
            this.createMouvementIsLoading = true;
            this.axios.post('/api/mouvements', this.form2)
                .then(response => {
                    this.createMouvementIsLoading = false;

                    if (response.data.success === true) {
                        // Si le motif est "Retour au fournisseur", on enregistre aussi dans retours
                        if (this.form2.motif === "RENVOI AU FOURNISSEUR") {
                            this.axios.post("/api/retours", {
                                produit_id: this.form2.produit_id,
                            qte: this.form2.qte,
                            motif: this.form2.motif,
                        }).then(() => {
                            // On ne bloque pas la suite
                            this.afterSuccess(response.data.message);
                        }).catch(() => {
                            this.$toast.add({
                                severity: 'warn',
                                summary: 'Attention',
                                detail: 'Le mouvement est enregistré, mais le retour n’a pas pu être ajouté.',
                                life: 5000
                            });
                            this.afterSuccess(response.data.message);
                        });
                    } else {
                        this.afterSuccess(response.data.message);
                    }
                } else {
                    // Gestion des erreurs de validation
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                }
            })
            .catch(() => {
            this.createMouvementIsLoading = false;
            this.$toast.add({
                severity: 'error',
                summary: 'Problème de connexion',
                detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                life: 5000
            });
        });
},
   afterSuccess(message) {
        $('#refreshretours' + this.table).click();
        $('#refreshmouvements').click();
        this.resetForm();
        this.$toast.add({
            severity: 'success',
            detail: message,
            life: 3000
        });
    },
        resetForm() {
            this.form2 = {
                produit_libelle: this.dialogRef.data.libelle,
                produit_id: this.dialogRef.data.id,
                created_by: this.$store.getters.user.fullname,
            }
        },
        getBorderClass(field) {
            const key = `${field}-${this.dialogRef?.data?.id}`;
            if (!this.coherenceStates || !(key in this.coherenceStates)) {
                return 'border-dark'; // Retourne une bordure par défaut si la clé n'existe pas
            }
            return this.coherenceStates[key] === false ? 'border-danger' : 'border-dark';
        }


    }
})

</script>