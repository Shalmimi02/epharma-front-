<template>
    <form @submit.prevent="createLine()">
        <div>
            <p>Identification de base </p>

            <div class="form-row">
                <div class="col-md-3">
                    <label>Libelle *</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.libelle">
                </div>
                <div class="form-group col-md-3">
                    <label>Rayon</label>
                    <select type="text"class="form-control border border-dark px-[4rem]"  v-model="form.rayon_id" :disabled="this.formLocked">
                        <option v-for="rayon in rayons" :key="rayon.id" :value="rayon.id">
                            {{ rayon.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>CIP *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.cip">
                </div>
                <div class="form-group col-md-3">
                    <label>CIP 2 *</label>
                    <input type="number" class="form-control border border-dark px-[4rem]" v-model="form.cip_deux">
                </div>
                <div class="form-group col-md-3">
                    <label>Prix d'achat *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]"
                        @change="calculPrix()" required v-model="form.prix_achat">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Coef. conversion de prix vente / achat *</label>
                    <input type="number" min="0" step=".01" class="form-control bg-bg-input border border-dark px-[4rem]"
                        @change="calculPrix()" required v-model="form.coef_conversion_de_prix_vente_achat">
                </div>
                <div class="form-group col-md-3">
                    <label>Quantité en stock *</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" required
                        v-model="form.qte">
                </div>
            </div><br>

            <p>Identification du produit </p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Code</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.code">
                </div>
                <div class="form-group col-md-3">
                    <label>Description</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.description">
                </div>
                <div class="form-group col-md-3">
                    <label>EAN</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.ean">
                </div>
                <div class="form-group col-md-3">
                    <label>DCI</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.dci">
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

            <p>Informations pour la vente</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>TVA</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"  name="" id=""
                        v-model="form.tva">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>CSS</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"  name="" id=""
                        v-model="form.css">
                        <option value="1">Oui</option>
                        <option value="0">Non</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Prix de vente</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.prix_vente">
                </div>
            </div><br>

            <p>Description du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Posologie</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.posologie">
                </div>
                <div class="form-group col-md-3">
                    <label>Homologation</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.homologation">
                </div>
                <div class="form-group col-md-3">
                    <label>Forme</label>
                    <select name="" id="" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.forme">
                        <option v-for="forme in formes" :key="forme" :value="forme.libelle">{{ forme.libelle }}</option>
                    </select>
                </div>

                <div class="form-group col-md-3">
                    <label>Familles</label>
                    <select name="" id="" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.famille">
                        <option v-for="famille in familles" :key="famille" :value="famille.libelle">{{ famille.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Nature</label>
                    <select name="" id="" class="form-control bg-bg-input border border-dark px-[4rem]" 
                        v-model="form.nature">
                        <option v-for="nature in natures" :key="nature" :value="nature.libelle">{{ nature.libelle }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Classe therapeutique</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.classe_therapeutique">
                        <option v-for="classe in classes" :key="classe" :value="classe.libelle">{{ classe.libelle }}
                        </option>

                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Categorie</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.categorie">
                        <option v-for="categorie in categories" :key="categorie" :value="categorie.libelle">{{ categorie.libelle }}</option>
                    </select>
                </div>
            </div><br>

            <p>Dimensions du produit</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Poids (g)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.poids">
                </div>
                <div class="form-group col-md-3">
                    <label>Longueur (cm)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.longueur">
                </div>
                <div class="form-group col-md-3">
                    <label>Hauteur (cm)</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.hauteur">
                </div>
            </div><br>

            <p>Autres</p>
            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Code table</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.code_table">
                </div>
                <div class="form-group col-md-3">
                    <label>Statut</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.statut">
                        <option v-for="(statut in statutList" :key="index" :value="statut">{{ statut }}</option>
                    </select>
                </div>
                <div class="form-group col-md-3">
                    <label>Laboratoire</label>
                    <select type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.code_fournisseur">
                        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                            {{ fournisseur.libelle }}</option>
                    </select>
                </div>
            </div>

        </div>

        <div class=" d-flex justify-content-end ">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">Enregistrer <span v-if="isLoading == true"
                    class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></button>
        </div>


    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CreateBaseDonnee',
    inject: ['dialogRef'],
    data() {
        return {
            table: 'produits',
            isLoading: false,
            form: {},
            fournisseurs: [],
            rayons: [],
            natures: [],
            formes: [],
            familles: [],
            classes: [],
            categories: []
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
    },
    methods: {
        calculPrix() {

            if ((this.form.prix_de_vente == null || this.form.prix_de_vente == 0) && this.form.prix_achat != null && this.form.coef_conversion_de_prix_vente_achat != null) {
                this.form.prix_de_vente = this.form.prix_achat *this.form.coef_conversion_de_prix_vente_achat
            }
        },
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
        createLine() {
            this.isLoading = true
            this.axios.post('/api/' + this.table, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.resetForm()
                    $('#refresh' + this.table).click()
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
        }
    }
})
</script>
