<template>
    <EpharmaTemplate>
        <template #page_title> CAISSE </template>
        <template #page_counter>
            <i class="fas fa-shipping-fast"></i> {{ lines }}
        </template>
        <template #content>
            <p class="text-center">Ouvrir une session dans une des caisses de la pharmacie</p>
            <div class="col-md-4 ml-auto mb-3">
                <searchByKeyword v-on:set-keyword-filter="searchLines" />
            </div>
            <AsdecodeTable :key="key" :url="'/api/' + table" :columns="columns" :table="table"
                :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                <template #header_action_btns>
                </template>
                <template #pin=slotProps>
                    <div v-if="slotProps.data.statut == 'Ouvert' && this.$store.getters.caisseConnected == slotProps.data.id && this.$store.getters.caisseAuthenticated">
                        <i class="fa-solid fa-check text-success"></i>
                    </div>
                    <input type="password" class="form-control-sm form-control border border-dark px-[4rem]"
                        style="width: 100px;" autocomplete="off"
                        v-else-if="slotProps.data.statut == 'Ouvert'" @change="login($event, slotProps.data.id)">
                    <div v-else>
                        <i class="fa-solid fa-xmark text-danger"></i>
                    </div>
                </template>
                <template #login=slotProps>
                    <router-link class="btn btn-success  btn-sm" :to="{ name: 'caisse.reservation', params: { id: slotProps.data.id } }" v-if="slotProps.data.statut == 'Ouvert' && this.$store.getters.caisseConnected == slotProps.data.id && this.$store.getters.caisseAuthenticated">
                        <i class="fa-solid fa-right-to-bracket mr-1"></i> Direct
                    </router-link>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import $ from 'jquery'

import { defineComponent } from 'vue';
export default defineComponent({
    
    data() {
        return {
            lines: 0,
            table: 'caisses',
            columns: [
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'current_authorized_user',
                    label: 'DERNIER UTILISATEUR CONNECTÉ',
                    exportable: true
                },
                {
                    key: 'pin',
                    label: 'PIN',
                    format: 'slot',
                },
                {
                    key: 'login',
                    label: 'LOGIN',
                    format: 'slot',
                },
            ],
            key: 1,
            keyWord: '',
        }
    },

    mounted(){
        if (this.$store.getters.caisseAuthenticated) {
            this.$router.push({ name: 'caisse.reservation', params: { id: this.$store.getters.caisseConnected } })
        }
    },
    methods: {
        login(event, idCaisse) {
            this.isLoading = true
            let form = {
                fullname: this.$store.getters.user.fullname,
                pin: event.target.value
            }
            this.axios.post('/api/caisses/' + idCaisse + '/login', form).then(response => {
                if (response.data.success === true) {
                    this.$store.commit('setAuthenticatedCaisse', idCaisse)
                    $('#refresh' + this.table).click()
                }
                else {
                    this.$toast.add({
                        severity: 'warn',
                        detail: response.data.errors[0],
                        life: 5000
                    });
                }
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
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        }
    }

})
</script>