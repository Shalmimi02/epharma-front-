<template>
    <ProgressBar class="my-1" v-if="commandeIsReady == false" mode="indeterminate" style="height: 6px"></ProgressBar>
    <FormCommande v-else :commande_ready="commande"></FormCommande>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import FormCommande from '../commandes/FormCommande.vue';

  export default defineComponent ({
    inject: ['dialogRef'],
    components: { FormCommande },
    data() {
      return {
        isLoading: false,
        commandeIsReady: false,
        commande: null
      }
    },
    mounted() {
      this.getCommande()
    },
    methods: {
      getCommande() {
        this.isLoading = true
        this.axios.post('/api/commandes/ajouter-produit/'+this.dialogRef.data.id).then(response => {
            this.commande = response.data.data
            this.commandeIsReady = true
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
    },
  });
  </script>
  