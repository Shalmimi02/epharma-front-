<template>
    <div class="d-flex mb-3" v-if="formLocked == true">
        <button type="button" class="btn btn-info btn-sm mr-2" @click="switchStatutModif()" v-show="datas.libelle.toLowerCase() != 'default'">
            <i class="fas fa-edit"></i> Modifier
        </button>
        <button type="button" class="btn btn-danger btn-sm mr-2" @click.prevent="deleteLine()" v-show="datas.libelle.toLowerCase() != 'default'">
            <i class="fas fa-trash-alt"></i> Supprimer
        </button>
        <button type="button" class="btn btn-secondary btn-sm" @click="showTable()">
            <i class="fas fa-eye"></i> Voir les produits
        </button>
    </div>
    <FormRayon :key="key" :formLocked="formLocked" :datas="datas" v-on:line_updated="switchStatutModif"></FormRayon>
</template>

<script>
import $ from "jquery"
import { defineComponent, defineAsyncComponent } from 'vue';
const FormRayon = defineAsyncComponent(() => import('./FormRayon.vue'));
const TableRayon = defineAsyncComponent(() => import('./TableRayon.vue'))

export default defineComponent({
    name: 'ShowRayon',
    inject: ['dialogRef'],
    components: { FormRayon, TableRayon },
    data() {
        return {
            key: 1,
            table: 'rayons',
            isLoading: false,
            formLocked: true,
            datas: this.dialogRef.data,
        }
    },
    methods: {
        showTable() {

            this.$dialog.open(TableRayon, {
                props: {
                    header: "Listes des produits",
                    style: {
                        width: '90vw',
                    },
                    modal: true
                },
                data: this.datas
            });


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
                    });
                }
            })
             }
       
          
    }
})
</script>