<template>
    <ProgressBar class="my-1" v-if="resIsLoading === true" mode="indeterminate" style="height: 6px"></ProgressBar>

    <div v-else>
        <div v-if="hasPermission('PRIVILEGES', 'inventaire_master')">
            <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
        </div>
        <div class="d-flex border p-3 mb-3 bg-light">
            <button type="button" class="btn btn-light mr-2" @click="SwitchWithDiff">
                <span v-if="showDiffOnly">
                    <i class="fa-solid fa-filter-circle-xmark text-primary"></i> Tout afficher
                </span>
                <span v-show="!showDiffOnly && hasPermission('PRIVILEGES', 'inventaire_master')">
                    <i class="fa-solid fa-filter"></i> Ecart
                </span>
            </button>
            <button type="button" class="btn btn-light mr-2" @click="updateInventaire('Terminé')">
                <i class="fa-solid fa-check"></i> Terminer
            </button>
            <button v-show="hasPermission('PRIVILEGES', 'inventaire_master')" class="btn btn-danger ml-auto" @click="updateInventaire('Annulé')">
                <i class="fa-solid fa-ban"></i> Annuler
            </button>
        </div>

        <div v-for="(rayon, index) in rayons" :key="index" class="mb-3">
            <div v-if="hasPermission('PRIVILEGES', 'inventaire_master')">
                <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
            </div>
        <SectionVisibility :libelleSection="'rayon ' + rayon" :isOpen="false">
            <template #section_content>
                <AsdecodeTable useSearch :key="key + rayon"
                    :url=" '/api/' + table + '?inventaire_id=' + inventaire.id + '&show_diff_only=' + showDiffOnly + '&rayon_libelle=' + rayon"
                    :columns="columns" :table="table" :newKeyWord="keyWord" v-on:set-total-records="updateLines">
                    <template #header_action_btns>

                    </template>
                    <template #action_btns=slotProps>
                         <span v-if="isLoadingInput[slotProps.data.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                         <input v-else type="number" class="form-control border border-dark px-[4rem]" :id="slotProps.data.id" min="0"
                           :value="slotProps.data.qte_reelle" @change="updateIventaireProduit(slotProps.data, $event)" style="width: 100px;">
                    </template>
                    <div></div>
                </AsdecodeTable>
            </template>
        </SectionVisibility>
    </div>
    </div>


</template>
<script>
import { defineComponent } from 'vue';
import MoneyCounter from '@/components/MoneyCounter.vue';
import $ from 'jquery';
export default defineComponent({
    name: 'CreateInventaireTotal',
    inject: ['dialogRef'],
    components: { MoneyCounter },
    mounted() {
        this.createInventaire()
    },
    data() {
        return {
            table: 'inventaire_produit',
            isLoading: false,
            isLoadingInput: [],
            resIsLoading: false,
            showDiffOnly: false,
            produits: [],
            rayons: [],
            form: {
                type: 'Total',
            },
            inventaire: false,
            inventaire_created: false,
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
                    key: 'produit_cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'produit_prix_achat',
                    label: 'Prix d\'achat ',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'produit_prix_de_vente',
                    label: 'Prix de vente',
                    format: 'money',
                    exportable: true
                },

            ],
            produits_selected: [],
            compteurs: [],
            key: 1,
            keyCounter: 1,
            keyWord: ''
        }
    },
   
    methods: {
        SwitchWithDiff() {
            if (this.showDiffOnly == true) {
                this.showDiffOnly = false
            } else this.showDiffOnly = true
            this.key++
        },
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
        getRayons() {
            this.resIsLoading = true
            this.axios.get( '/api/statistiques/rayons-inventaire/' + this.inventaire.id).then(response => {
                this.rayons = response.data
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
        createInventaire() {
            this.resIsLoading = true
            this.axios.post( '/api/inventaires', this.form).then((response) => {
                if (response.data.success == true) {
                    this.inventaire = response.data.data
                    this.inventaire_created = true
                    this.getRayons();
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
                                        key: 'produit_cip',
                                        label: 'CIP',
                                        exportable: true
                                    },
                                    {
                                        key: 'produit_prix_achat',
                                        label: 'Prix d\'achat ',
                                        format: 'money',
                                        exportable: true
                                    },
                                    {
                                        key: 'produit_prix_de_vente',
                                        label: 'Prix de vente',
                                        format: 'money',
                                        exportable: true
                                    }
                                

                                ]
                    } else {
                    // Sinon, on retire certaines colonnes (ici, les colonnes de prix par exemple)
                        // L'utilisateur a la permission : afficher toutes les colonnes
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
                                    {
                                        key: 'produit_cip',
                                        label: 'CIP',
                                        exportable: true
                                    },
                                    {
                                        key: 'produit_prix_achat',
                                        label: 'Prix d\'achat ',
                                        format: 'money',
                                        exportable: true
                                    },
                                    {
                                        key: 'produit_prix_de_vente',
                                        label: 'Prix de vente',
                                        format: 'money',
                                        exportable: true
                                    },
                                    

                                ]
                    }
                    $('#refreshinventaires').click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });

                    this.resIsLoading = false
                }
                else {
                    //afficher les erreurs coté backend
                    response.data.errors.forEach(element => {
                        this.$toast.add({
                            severity: 'warn',
                            summary: 'Oups !',
                            detail: element,
                            life: 7000
                        });
                    });
                    //arreter le chargement
                    this.resIsLoading = false
                }

            })
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
                    this.axios.post( '/api/inventaires/' + this.inventaire.id + '/update', form).then(response => {
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

        calculerCoutTotal() {
            this.isLoading = true
            this.axios.get( '/api/inventaires-calc-compteur/' + this.inventaire.id).then(response => {
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
    }
})
</script>