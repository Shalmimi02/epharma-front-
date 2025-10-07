<template>
    <div class="d-flex mb-3" v-if="formLocked == true">
        <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()">
            <i class="fas fa-trash-alt"></i> Supprimer
        </button>
    </div>
    <FormConfiguration :key :formLocked="formLocked" :datas="datas" v-on:line_updated="switchStatutModif">
    </FormConfiguration>
</template>

<script>
import $ from "jquery"
import { defineComponent, defineAsyncComponent } from 'vue';
const FormConfiguration = defineAsyncComponent(() => import('./FormConfiguration.vue'));

export default defineComponent({
    name: 'ShowConfiguration',
    inject: ['dialogRef'],
    components: { FormConfiguration },
    data() {
        return {
            key: 1,
            table: 'caisses',
            isLoading: false,
            formLocked: true,
            datas: this.dialogRef.data,
        }
    },
    methods: {
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
            this.axios.post('/api/' + this.table + '/' + this.datas.id + '/destroy').then((response) => {
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
            })
           
        }
    }
})
</script>