<template>
    <form @submit.prevent="openCreateModal">
        <div class="form-group">
            <label>Sur quel rayon voulez-vous faire l'inventaire partiel ?</label>
            <div class="form-check" v-for="rayon in rayons" :key="rayon.id">
                <input class="form-check-input" type="radio" v-model="rayonSelected" :id="rayon.id" :value="rayon">
                <label class="form-check-label" :for="rayon.id">
                    {{ rayon.libelle }}
                </label>
            </div>
        </div>
        
        <button v-if="rayonSelected != ''" type="submit" class="btn btn-primary mt-3"> Continuer
            <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </button>
    </form>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
const CreateInventairePartiel = defineAsyncComponent(() => import('./CreateInventairePartiel.vue'));
export default defineComponent({
    name: 'ChoiceRayon',
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false,
            resIsLoading: false,
            rayons: [],
            rayonSelected: ''
        }
    },
    mounted() {
        this.getRayons()
    },
    methods: {
        openCreateModal() {
            this.dialogRef.close()
            this.$dialog.open(CreateInventairePartiel, {
                props: {
                    header: "Inventaire du rayon " + this.rayonSelected.libelle,
                    style: {
                        width: '80vw'
                    },
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    modal: true
                },
                data: this.rayonSelected
            });
        },
        getRayons() {
            this.resIsLoading = true
            this.axios.get('/api/rayons').then((response) => {
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
        
    }
});
</script>