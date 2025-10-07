<template>
    <form autocomplete="off" @submit.prevent="createLine()">
        <div>
            <p class="h5">Informations générales</p>

            <div class="form-row">
                <div class="form-group col-md-4">
                    <label>Libelle</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.libelle" :disabled="this.formLocked" autocomplete="off" required>
                </div>
                <div class="form-group col-md-4">
                    <label>Pin</label>
                    <input type="password" class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.pin" :disabled="this.formLocked" autocomplete="new-password" required>
                </div>
                <div class="form-group col-md-4">
                    <label>Statut</label>
                    <select class="form-control bg-bg-input border border-dark px-[4rem]"
                        v-model="form.statut" :disabled="this.formLocked" required>
                        <option value="Fermer">Fermer</option>
                        <option value="Ouvert">Ouvert</option>
                    </select>
                </div>
            </div>
        </div>

        <div class=" d-flex justify-content-end" v-if="this.formLocked == false">
            <button type="button" class="btn btn-light mr-2" @click="this.$emit('line_updated')">Annuler</button>
            <button type="submit" class="btn btn-light">
                {{ buttonLabel }} 
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </div>
    </form>
</template>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FormConfiguration',
    props: {
        datas: {
            type: Object,
            default: null,
        },
        formLocked: {
            type: Boolean,
            default: false
        }
    },
    inject: ['dialogRef'],
    data() {
        return {
            table: 'caisses',
            isLoading: false,
            line: null,
            form: {
                created_by: this.$store.getters.user.fullname,
            }
        }
    },
    created() {
        if (this.dialogRef.data) {
            this.line = this.dialogRef.data
        }
        else if (this.datas) {
            this.line = this.datas
        }
    },
    mounted() {
        if(this.line) {
            this.form = {
                libelle: this.line.libelle,
                statut: this.line.statut
            }
        }
    },
    computed: {
        buttonLabel() {
            return this.line ? "Mettre à jour" : "Enregistrer";
        }
    },
    methods: {
        createLine() {
            this.isLoading = true
            let url = '/api/' + this.table
            if (this.line) {
                url = url + '/' + this.line.id + '/update', this.form
            }

            this.axios.post(url, this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    if (this.line) {
                        this.$emit('line_updated')
                    }
                    else this.resetForm()

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
        resetForm() {
            this.form = {}
        }
    }
})
</script>
