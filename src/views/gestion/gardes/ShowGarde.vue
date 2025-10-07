<template>
    <div class="d-flex mb-3" v-if="formLocked == true">
        <button v-show="datas.statut=='Programmé'" type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button v-show="datas.statut=='Programmé'" type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="disableLine()">
            <i class="fa-solid fa-ban mr-1"></i>Desactiver
        </button>

        <button type="button" class="btn btn-black btn-sm mr-2" @click.prevent="OpenTable()">
            <i class="fas fa-eye"></i> Voir les produits
            <span v-if="BilletageIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
        </button>
    </div>
    <EditGarde :key="key" :formLocked="formLocked" :datas="datas" v-on:line_updated="switchStatutModif"></EditGarde>
</template>

<script>
import $ from "jquery"
import { defineComponent, defineAsyncComponent } from 'vue';
const EditGarde = defineAsyncComponent(() => import('./EditGarde.vue'));
import TableProduitGarde from './TableProduitGarde'

export default defineComponent({
    name: 'ShowGarde',
    inject: ['dialogRef'],
    components: { EditGarde },
    data() {
        return {
            key: 1,
            table: 'gardes',
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
        disableLine() {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.isLoading = true
                    this.axios.post('/api/' + this.table + '/' + this.datas.id + '/desactiver').then((response) => {
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
        },
        OpenTable() {
            this.$dialog.open(TableProduitGarde, {
                props: {
                    header: "Produits de la garde N°"+this.dialogRef.data.id,
                    style: {
                        width: '60vw',
                    },
                    modal: true
                },
                data: this.dialogRef.data
            });
        },
        // cancelGarde() {
        //      this.$confirm.require({
        //          group: 'headless',
        //          header: 'Etes-vous sûr?',
        //          message: 'Cette action est irréversible!',
        //             accept: () => {
        //     this.cancelIsLoading = true
        //     this.axios.post('/api/' + this.table + '/' + this.dialogRef.data.id + '/cancel').then(response => {
        //         this.cancelIsLoading = false
        //         if (response.data.success === true) {
        //             $('#refresh' + this.table).click()
        //             this.$toast.add({
        //                 severity: 'success',
        //                 detail: response.data.message,
        //                 life: 3000
        //             });
        //             this.dialogRef.close()
        //         }
        //         else {
        //             response.data.errors.forEach(element => {
        //                 this.$toast.add({
        //                     severity: 'warn',
        //                     summary: 'Oups !',
        //                     detail: element,
        //                     life: 7000
        //                 });
        //             });
        //         }
        //     }).catch(() => {
        //         this.cancelIsLoading = false
        //         this.$toast.add({
        //             severity: 'error',
        //             summary: 'Probleme de connexion',
        //             detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
        //             life: 5000
        //         });
        //     })
        //  }
        // })

        // }
    }

})
</script>