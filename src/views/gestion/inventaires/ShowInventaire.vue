<template>
    <div class="d-flex mb-3" v-if="formLocked == true && datas.statut != 'Terminé' && datas.statut != 'Annulé'">
        <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()" v-if="hasPermission('PRIVILEGES', 'inventaire_master')">
            <i class="fas fa-trash-alt"></i> Supprimer
        </button>
    </div>

    <div :key="key">
        <EditInventairePartiel v-if="datas.type == 'Partiel'" :formLocked="formLocked" :datas="datas" v-on:line_updated="switchStatutModif"></EditInventairePartiel>
        <EditInventaireTotal v-else-if="datas.type == 'Total'" :formLocked="formLocked" :datas="datas" v-on:line_updated="switchStatutModif"></EditInventaireTotal>
    </div>
</template>

<script>
import $ from "jquery"
import { defineComponent, defineAsyncComponent } from 'vue';
const EditInventairePartiel = defineAsyncComponent(() => import('./EditInventairePartiel.vue'));
const EditInventaireTotal = defineAsyncComponent(() => import('./EditInventaireTotal.vue'));

export default defineComponent({
    name: 'ShowInventairePartiel',
    inject: ['dialogRef'],
    components: { EditInventairePartiel, EditInventaireTotal },
    data() {
        return {
            key: 1,
            table: 'inventaires',
            isLoading: false,
            formLocked: true,
            datas: this.dialogRef.data,
        }
    },
    methods: {
        hasPermission(menuName, submenuName) {
            if (!this.$store.getters.habilitations) {
                return false;
            }
            const permission = this.$store.getters.habilitations.find((perm) => perm.menu === menuName);
            return permission && permission.submenus.includes(submenuName);
        },
        switchStatutModif() {
            this.key++
            if (this.formLocked == false) {
                this.formLocked = true
            }
            else this.formLocked = false
        },
        deleteLine() {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
            this.isLoading = true
            this.axios.post('/api/'+this.table+'/' + this.datas.id + '/destroy').then((response) => {
                this.isLoading = false
                if (response.data.success === true) {
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
                        life: 20000
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
             }
            } )
        }
    }
})
</script>
  