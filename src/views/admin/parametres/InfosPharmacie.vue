<template>
    <div class="container">
        <div class=" d-flex justify-content-center">
            <div :key="photokey" class="col-md-3 text-center" style="background-color: antiquewhite; cursor: pointer;"
                @click.prevent="selectPhoto">
                <img v-if="this.$store.getters.pharmacie && this.$store.getters.pharmacie.logo"
                    :src="this.$store.getters.pharmacie.logo" alt="logo" id="logo" class="rounded mb-3 border"
                    style="width: 200px; height: 200px;">
                <p>Votre logo (500x500)</p>
            </div>
        </div>
        <form @submit.prevent="saveCompanyInfo">
            <p class="h5">Enregistrer les informations de la pharmacie.</p>

            <div class="form-row">
                <div class="form-group col-md-4" hidden>
                    <label for="photo">Select Photo:</label>
                    <input id="mylogo" name='mylogo' type="file" class="form-control" @change="handleFileUpload"
                        accept="image/*">
                </div>
                <div class="form-group col-md-4">
                    <label>Nom:</label>
                    <input type="text" class="form-control" v-model="formData.nom_pharmacie" required>
                </div>
                <div class="form-group col-md-4">
                    <label>Adresse:</label>
                    <input type="text" class="form-control" v-model="formData.adresse" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="">Boite Postale:</label>
                    <input type="text" class="form-control" v-model="formData.bp">
                </div>
                <div class="form-group col-md-4">
                    <label for="">Capital:</label>
                    <input type="number" class="form-control" v-model="formData.capital">
                </div>
                <div class="form-group col-md-4">
                    <label>Statut juridique:</label>
                    <input type="text" class="form-control" v-model="formData.statut_juridique">
                </div>
                <div class="form-group col-md-4">
                    <label for="">RCCM:</label>
                    <input type="text" class="form-control " v-model="formData.rccm">
                </div>
                <div class="form-group col-md-4">
                    <label for="">NIF:</label>
                    <input type="text" class="form-control " v-model="formData.nif">
                </div>
                <div class="form-group col-md-4">
                    <label for="">Tel 1:</label>
                    <input type="number" class="form-control" v-model="formData.telephone1" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="">Tel 2:</label>
                    <input type="number" class="form-control" v-model="formData.telephone2">
                </div>
                <div class="form-group col-md-4">
                    <label>Email:</label>
                    <input type="text" class="form-control" v-model="formData.email">
                </div>
                <div class="form-group col-md-4">
                    <label for="">Site web:</label>
                    <input type="text" class="form-control" v-model="formData.site_web">
                </div>

                <!-- <div class="form-group col-md-4">
                            <label for="">Devise:</label>
                            <div>
                                <select type="t" v-model="formData.devise">
                                    <option value="">FCFA</option>
                                    <option value="">$</option>
                                    <option value="">£</option>
                                </select>
                            </div>
                        </div> -->
            </div>
            <div class="form-group ">
                <label for="slogan">Slogan</label>
                <input id="slogan" type="text" class="form-control" v-model="formData.slogan">
                <small>Affichage sous les tickets de caisse</small>
            </div>
            <!-- <p class="h5 my-3">Enregistrer les informations de votre environnement.</p>
                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label>TVA:</label>
                        <input type="number" step="any" placeholder="exp= 0.18" class="form-control" v-model="formData.tva" required>
                    </div>
                    <div class="form-group col-md-4">
                        <label>CSS:</label>
                        <input type="number" step="any" placeholder="exp= 0.1" class="form-control" v-model="formData.tva" required>
                    </div>
                </div> -->
            <button type="submit" class="btn btn-bleu2 text-right">
                Enregistrer
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </form>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import $ from 'jquery'

export default defineComponent({
    data() {
        return {
            isLoading: false,
            logo: null,
            photokey: 1
        }
    },
    computed: {
        formData: {
            get() {
                return this.$store.getters.pharmacie || {};  // Accéder aux données via Vuex
            },
            set(value) {
                this.$store.commit('setPharmacieDatas', value);  // Mettre à jour Vuex quand on modifie les inputs
            },
        },
    },
    methods: {
        selectPhoto() {
            $('#mylogo').click()
        },
        handleFileUpload(event) {
            this.logo = event.target.files[0];
        },
        async saveCompanyInfo() {
            this.isLoading = true
            let form = {
                nom_pharmacie: this.formData.nom_pharmacie,
                adresse: this.formData.adresse,
                bp: this.formData.bp,
                capital: this.formData.capital,
                statut_juridique: this.formData.statut_juridique,
                rccm: this.formData.rccm,
                nif: this.formData.nif,
                telephone1: this.formData.telephone1,
                telephone2: this.formData.telephone2,
                email: this.formData.email,
                site_web: this.formData.site_web,
                slogan: this.formData.slogan
            }
            if (this.logo != null) {
                form.logo = this.logo
            }
            if (this.formData.logo != null) {
                form.logo_url = this.formData.logo
            }
            this.axios.post('/api/pharmacie-info', form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    // this.photokey++
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                    this.$router.go({ name: 'home' })
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


    },

})
</script>