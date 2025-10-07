<template>
    <form autocomplete="off" @submit.prevent="createLine()">
        <div >
            <p class="h5">Informations générales</p>

            <div class="form-row">
                <div class="form-group col-md-4">
                    <label>Libelle</label>
                    <input type="text" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.libelle" autocomplete="off">
                </div>
                <div class="form-group col-md-4">
                    <label>Pin</label>
                    <input type="password" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.pin" autocomplete="new-password">
                </div>
                <div class="form-group col-md-4">
                    <label>Statut</label>
                   <select name="" id="" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.statut" required>
                    <option value="Fermer">Fermer</option>
                    <option value="Ouvert">Ouvert</option>
                   </select>
                </div>
            </div>
        </div>
        
        <div class=" d-flex justify-content-end ">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">Enregistrer <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></button>
        </div>
    </form>
</template>

<script>
        import $ from "jquery"
        import { defineComponent } from 'vue';

        export default defineComponent({
            name: 'CreateConfiguration',
            inject: ['dialogRef'],
            data() {
                return {
                    table: 'caisses',
                    isLoading: false,
                    form: {
                        created_by: this.$store.getters.user.fullname,
                    }
                }
            },
            methods: {
                createLine() {
                    this.isLoading = true
                    this.axios.post('/api/'+this.table, this.form).then(response => {
                        this.isLoading = false
                        if (response.data.success === true) {
                            this.resetForm()
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
