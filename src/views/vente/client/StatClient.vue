<template>
    <h5>STATISTIQUE SUR LE CLIENT</h5>
    <StatCounter :key="keyCounter" :compteurs="compteurs" />
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
import StatCounter from "@/components/StatCounter.vue";


export default defineComponent({
    components: { StatCounter },
    name: 'StatClient',
    inject: ['dialogRef'],
    data (){
        return {
            key: 1,
            table: 'clients',
            keyCounter: 1,
            compteurs: []
        }
    },
    mounted() {
        this.CalculerCoutTotal()
  },
    methods: {

        CalculerCoutTotal() {
            this.isLoading = true
            this.axios.get( '/api/clients/'+ this.dialogRef.data.id+'/calc-compteur').then(response => {
                this.isLoading = false
                this.compteurs = []
                this.compteurs.push(
                    {
                        value: response.data.total_chiffre_affaire,
                        label: 'CHIFFRE D\'AFFAIRE'
                    },
                    {
                        value: response.data.total_nb_produit,
                        label: 'Nb DE PRODUITS'
                    },
                    {
                        value: response.data.total_nb_facture,
                        label: 'Nb DE FACTURES'
                    },
                    {
                        value: response.data.total_panier_moyen,
                        label: 'PANIER MOYEN'
                    },
                )
                this.keyCounter++
            }).catch(() => {
                this.isLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        }
    }
})
</script>