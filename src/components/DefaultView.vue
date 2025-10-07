<template>
    <div v-if="pharmacie == null" class="py-3 mx-auto">
        <div class="card card-body mx-auto" style="width: 18rem;">
            <p class="mb-3 text-center">Vous devez d'abord parametrer votre pharmacie</p>
            <router-link class="btn btn-primary" :to="{name: 'parametres'}">Parametrer maintenant</router-link>
        </div>
    </div>
    <div v-else class="py-3 mx-auto" style="max-width: 900px; min-width: 600px;">
        <p class="text-bleu h1 font-weight-bold d-flex justify-content-center mt-3"> {{ pharmacie.nom_pharmacie }}</p>
        <div class=" d-flex justify-content-center">
            <img v-if="this.$store.getters.pharmacie.logo" :src="this.$store.getters.pharmacie.logo" alt="logo_pharmacie" id="logo_pharmacie" class="rounded mb-3" style="width: 150px">
            <img v-else src="/img/epharma-sf.png" alt="logo_epharma" id="logo_epharma">
        </div>

        <div class="card mb-3 gradient-color">
            <div class="card-body p-4 row text-white">
                <div class="col-md-6 mb-2">
                    <span class="text-uppercase font-weight-light pb-2">Telephone</span><br>
                    <strong class="font-weight-bold">{{ pharmacie.telephone1 }}</strong>
                </div>
                <div class="col-md-6 mb-2">
                    <span class="text-uppercase font-weight-light pb-2">Email</span><br>
                    <strong class="font-weight-bold">{{ pharmacie.email }}</strong>
                </div>
                <div class="col-md-6 mb-2">
                    <span class="text-uppercase font-weight-light pb-2">Adresse</span><br>
                    <strong class="font-weight-bold">{{ pharmacie.adresse }}</strong>
                </div>
                <div class="col-md-6 mb-2">
                    <span class="text-uppercase font-weight-light pb-2">Boite Postale</span><br>
                    <strong class="font-weight-bold">{{ pharmacie.bp }}</strong>
                </div>
            </div>
        </div>
        <div class="bg-gris card card-body ">
            <p>Ce logiciel de gestion de pharmacie vous est fournis par E-pharma. Nous mettons à la disposition des
                pharmacies les outils numériques nécessaire pour augmenter leur éfficacité au quotidien. Pour toutes vos
                questions n'hésitez pas à nous contacter au numéro suivant:</p>
            <div class="text-primary pl-4" id="bordercontact">
                <span class="font-weight-bold">CONTACT</span><br>
                <strong>062 38 74 01</strong><br>
                <em>E-Pharma, Coworkging SING SA Bureau 2,Rue-Pecqueur, Centre-Ville, Libreville Gabon</em>
            </div>
        </div>
    </div>
    
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        pharmacie: {
            get() {
                return this.$store.getters.pharmacie;  // Accéder aux données via Vuex
            },
            set(value) {
                this.$store.commit('setPharmacieDatas', value);  // Mettre à jour Vuex quand on modifie les inputs
            },
        },
    }
})
</script>

<style scoped>
.gradient-color {
    width: 100%;
    background: linear-gradient(to bottom, #12a9d2 0%, #3050db 100%)
}

#logo_epharma {
    width: 150px;
}
</style>