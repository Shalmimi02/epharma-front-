<template>
  <div>
    <h5>Sélectionner un client</h5>

    <select v-model="selectedClient" class="form-control">
      <option value="">-- Choisir un client --</option>
      <option v-for="client in clients" :key="client.id" :value="client.id">
        {{ client.libelle }} {{ client.nom }}
      </option>
    </select>

    <div class="mt-3 d-flex justify-content-end">
      <button class="btn btn-success mr-2" @click="sendDevis" :disabled="isLoading">
        {{ isLoading ? 'Envoi...' : 'Envoyer' }}
      </button>
      <button class="btn btn-secondary" @click="dialogRef.close()">
        Annuler
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  inject: ['dialogRef'],
  data() {
    return {
      clients: [],
      selectedClient: '',
      devis: null,
      isLoading: false
    }
  },
  created() {
    // On récupère le devis depuis le parent
    if (this.dialogRef && this.dialogRef.data) {
      this.devis = this.dialogRef.data.devis
      console.log('Devis reçu :', this.devis)

    }
  },
  mounted() {
    this.fetchClients();
  
  },
  methods: {
    async fetchClients() {
      try {
        const response = await axios.get('/api/clients')
        this.clients = response.data.data
      } catch (error) {
        console.error('Erreur récupération clients', error)
      }
    },

    async sendDevis() {
      if (!this.selectedClient) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Veuillez sélectionner un client',
          life: 3000
        })
        return
      }

      this.$confirm.require({
        group: 'headless',
        header: 'Êtes-vous sûr ?',
        message: 'Cette action est irréversible!',
        accept: async () => {
          this.isLoading = true
          try {
            if (!this.devis || !this.devis.id) {
              this.$toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Aucun devis trouvé',
                life: 4000
              })
              return
            }

            const response = await axios.post(`/api/devis/${this.devis.id}/envoyer`, {
              client_id: this.selectedClient
            })

            if (response.data.success) {
              this.dialogRef.close()
              this.$toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: response.data.message || 'Devis envoyé ✅',
                life: 3000
              })
            } else {
              (response.data.errors || []).forEach(e => {
                this.$toast.add({
                  severity: 'warn',
                  summary: 'Erreur',
                  detail: e,
                  life: 5000
                })
              })
            }
          } catch (error) {
            console.error(error)
            this.$toast.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Problème lors de l’envoi du devis',
              life: 5000
            })
          } finally {
            this.isLoading = false // ✅ toujours réinitialisé
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.mt-3 {
  margin-top: 1rem;
}
.d-flex {
  display: flex;
}
.justify-content-end {
  justify-content: flex-end;
}
.mr-2 {
  margin-right: 0.5rem;
}
</style>
