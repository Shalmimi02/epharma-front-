<template>
    <EpharmaTemplate :withHeader="false">
        <template #content>
            <div class="bg-white">
                <TabView>
                    <TabPanel header="GENERAL">
                        <InfosPharmacie></InfosPharmacie>
                    </TabPanel>
                    <TabPanel header="INFORMATIONS SUR LES PRODUITS">
                        <InfosProduit></InfosProduit>
                    </TabPanel>
                </TabView>
            </div>
        </template>
    </EpharmaTemplate>
</template>

<script>
import { defineComponent } from 'vue'
import InfosPharmacie from './InfosPharmacie.vue'
import InfosProduit from './InfosProduit.vue'


export default defineComponent({
    components: { InfosPharmacie, InfosProduit },
    data() {
        return {
            isLoading: false,
        }
    },
    computed: {
        formData: {
            get() {
                return this.$store.getters.pharmacie;  // Accéder aux données via Vuex
            },
            set(value) {
                this.$store.commit('setPharmacieDatas', value);  // Mettre à jour Vuex quand on modifie les inputs
            },
        },
    },
    methods: {
        async saveCompanyInfo() {
            this.isLoading = true
            this.axios.post('/api/pharmacie-info', this.formData).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
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


    },

})
</script>