<template>
    <div v-if="hasPermission('PRIVILEGES', 'inventaire_master')">
        <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
    </div>
    <ProgressBar class="my-1" v-if="isLoading === true" mode="indeterminate" style="height: 6px"></ProgressBar>
    <div>
        <!-- <searchByKeyword class="mb-3 mt-3" v-on:set-keyword-filter="searchLines" /> -->
        <AsdecodeTable useSearch :key="key"
            :url="'/api/' + table + '?inventaire_id=' + inventaire.id + '&show_diff_only=' + showDiffOnly + '&rayon_libelle=' + inventaire.rayon"
            :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines"
            @get-table-url="refreshCounters">
            <template #header_action_btns>
                <button type="button" class="btn btn-light mr-2" @click="updateInventaire('Terminé')"
                    v-if="this.formLocked == false && inventaire.statut != 'Terminé' && inventaire.statut != 'Annulé'">
                    <i class="fa-solid fa-check"></i> Terminer
                </button>
                <button type="button" class="btn btn-light mr-2" @click="SwitchWithDiff">
                    <span v-if="showDiffOnly">
                        <i class="fa-solid fa-filter-circle-xmark text-primary"></i> Tout afficher
                    </span>
                    <span v-else>
                        <i class="fa-solid fa-filter"></i> Ecart
                    </span>
                </button>
                <button type="button" class="btn btn-danger ml-auto" @click="updateInventaire('Annulé')"
                    v-if="this.formLocked == false && inventaire.statut != 'Terminé' && inventaire.statut != 'Annulé'">
                    <i class="fa-solid fa-ban"></i> Annuler
                </button>
            </template>
            <template #action_btns=slotProps>
                 <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <input v-else type="number" class="form-control border border-dark px-[4rem]" :id="slotProps.data.id" min="0"
                    :value="slotProps.data.qte_reelle" @change="updateIventaireProduit(slotProps.data, $event)"
                    style="width: 100px;" :disabled="this.formLocked">
            </template>
        </AsdecodeTable>
    </div>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue';
import MoneyCounter from '@/components/MoneyCounter.vue'
import $ from 'jquery';
export default defineComponent({
    name: 'CreateInventairePartiel',
    inject: ['dialogRef'],
    components: { MoneyCounter },
    props: ['formLocked', 'datas'],
    data() {
        return {
            table: 'inventaire_produit',
            isLoading: false,
            isLoadingInput: [],
            showDiffOnly: false,
            inventaire: this.datas,
            columns: [
                {
                    key: 'produit_libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'qte_reelle',
                    label: 'QTE REELLE',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QTE EN STOCK',
                    exportable: true
                },
                {
                    key: 'ecart',
                    label: 'ECART',
                    exportable: true
                },
                {
                    key: 'qte_finale',
                    label: 'QTE FINALE',
                    exportable: true
                },
                {
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'produit_prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit_prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'money',
                    exportable: true
                },
            ],
            key: 1,
            keyCounter: 1,
            keyWord: '',
            compteurs: []
        }
    },
    methods: {
        //fonction pour empecher les erreurs lors du filtre
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        hasPermission(menuName, submenuName) {
            if (!this.$store.getters.habilitations) {
                return false;
            }
            const permission = this.$store.getters.habilitations.find((perm) => perm.menu === menuName);
            return permission && permission.submenus.includes(submenuName);
        },
        updateInventaire(status) {
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.isLoading = true
                    let form = {
                        'statut': status
                    }
                    this.axios.post('/api/inventaires/' + this.inventaire.id + '/update', form).then(response => {
                        this.isLoading = false
                        if (response.data.success === true) {
                            $('#refreshinventaires').click()
                            this.$emit('line_updated')
                            this.$toast.add({
                                severity: 'success',
                                detail: response.data.message,
                                life: 3000
                            });
                            this.dialogRef.close()
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
                }
            })
        },
        async updateLines(nb_lines) {
            await this.calculerCoutTotal()
            this.lines = nb_lines
        },
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        },
        async updateIventaireProduit(line, event) {
            const newQuantity = event.target.value; // Récuperation la nouvelle valeur saisie
            this.isLoadingInput = { ...this.isLoadingInput, [line.id]: true };

            // Mettre à jour immédiatement l'interface utilisateur
            line.qte_reelle = newQuantity;

            let form = {
                'qte_reelle': newQuantity
            };

            try {
                const response = await this.axios.post(`/api/${this.table}/${line.id}/update`, form);

                if (response.data.success) {
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });

                    
                } else {
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });

                    // Revenir à la valeur précédente en cas d'erreur
                    event.target.value = line.qte_reelle; // Réafficher la valeur précédente
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });

                
                event.target.value = line.qte_reelle; // Réafficher la valeur précédente
            } finally {
                this.isLoadingInput = { ...this.isLoadingInput, [line.id]: false };
            }
        },
        SwitchWithDiff() {
            if (this.showDiffOnly == true) {
                this.showDiffOnly = false
            } else this.showDiffOnly = true
            this.key++
        },

        calculerCoutTotal() {
            this.isLoading = true
            this.axios.get('/api/inventaires-calc-compteur/' + this.inventaire.id).then(response => {
                this.isLoading = false
                this.compteurs = []
                this.compteurs.push(
                    {
                        value: response.data.cout_total_achat,
                        label: 'VALEUR  DU STOCK À L\'ACHAT'
                    },
                    {
                        value: response.data.cout_total_achat_reel,
                        label: 'VAL À L\'ACHAT AP'
                    },
                    {
                        value: response.data.cout_total_vente_reel,
                        label: 'VAL À LA VENTE AP'
                    },
                    {
                        value: response.data.diff_total_achat,
                        label: 'DIFF DU STOCK '
                    },
                )
                this.keyCounter++
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
        getRayons() {
            this.isLoading = true
            this.axios.get('/api/rayons/').then(response => {
                this.rayons = response.data.data
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
        }

    }, 
    mounted() {
        // Définir les colonnes en fonction de la permission
    if (this.hasPermission('PRIVILEGES', 'inventaire_master')) {
      // L'utilisateur a la permission : afficher toutes les colonnes
      this.columns = [
                {
                    key: 'produit_libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'qte_reelle',
                    label: 'QTE REELLE',
                    exportable: true
                },
                {
                    key: 'qte',
                    label: 'QTE EN STOCK',
                    exportable: true
                },
                {
                    key: 'ecart',
                    label: 'ECART',
                    exportable: true
                },
                {
                    key: 'qte_finale',
                    label: 'QTE FINALE',
                    exportable: true
                },
                {
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'produit_prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit_prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'money',
                    exportable: true
                },
            ];
    } else {
      // Sinon, on retire certaines colonnes (ici, les colonnes de prix par exemple)
      this.columns = [
                {
                    key: 'produit_libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                // {
                //     key: 'qte_reelle',
                //     label: 'QTE REELLE',
                //     exportable: true
                // },
                // {
                //     key: 'qte',
                //     label: 'QTE EN STOCK',
                //     exportable: true
                // },
                // {
                //     key: 'ecart',
                //     label: 'ECART',
                //     exportable: true
                // },
                // {
                //     key: 'qte_finale',
                //     label: 'QTE FINALE',
                //     exportable: true
                // },
                {
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'produit_prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit_prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'money',
                    exportable: true
                },
        ];
    }
    }

})

</script>