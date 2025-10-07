<template>
    <EpharmaTemplate>
        <template #page_title> COMMANDES </template>
        <template #page_counter>
            <i class="fas fa-shipping-fast"></i> {{ lines }}
        </template>
        <template #content>
            <!-- composant pour afficher les valeurs totale -->
            <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" />
            <!-- partie des filtres -->
            <div class="bg-white row border shadow-md rounded p-1 mb-3 mx-auto d-flex align-items-center">
                <div class="col-md-8">
                    <p class="mb-3"><small>Rechercher par date ou fournisseur</small></p>
                    <form @submit.prevent="periodFilter" class="form-row">
                        <div class="col-md">
                            <input class="form-control form-control-sm border border-dark px-[4rem]" type="date"
                                v-model="filterForm.debut">
                        </div>
                        <div class="col-md">
                            <input class="form-control form-control-sm border border-dark px-[4rem]" type="date"
                                v-model="filterForm.fin">
                        </div>
                        <div class="col-md">

                            <select class="form-control border border-dark px-[4rem] h-75"
                                v-model="filterForm.fournisseur_libelle" >
                                <option disabled :value="null">Selection du fournisseur</option>
                                <option v-for="fournisseur in fournisseurs" :key="fournisseur.libelle"
                                    :value="fournisseur">
                                    {{ fournisseur.libelle }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button type="submit" class="btn">
                                <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                                    title="Appliquer le filtrage"></i>
                            </button>
                            <button type="button" class="btn" @click="removeFilter">
                                <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                                    title="Annuler le filtrage"></i>
                            </button>
                        </div>

                    </form>
                </div>

                <div class="col-md-4">
                    <p class="mb-3"><small>Rechercher par mots clés</small></p>
                    <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" />
                </div>
            </div>
            <!-- tableau de donnees -->
            <AsdecodeTable :key="key" :newKeyWord="keyWord" :url="url" :columns="columns" :table="table"
                @set-total-records="updateLines" @set-extra_data="updateExtraDatas">
                <template #header_action_btns>
                    <button class="btn btn-light btn-sm mr-2" @click="openCreateModal()">
                        <i class="fa-solid fa-plus"></i> Nouvelle commande
                    </button>
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fas fa-edit"></i>
                    </button>
                </template>
                <template #status=slotProps>
                    <span :class="[slotProps.data.status == 'SUCCESS' ? 'termine' : 'encours']">{{ slotProps.data.status
                        }}</span>
                </template>
            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
</template>

<script>
import $ from 'jquery'
import { defineComponent, defineAsyncComponent } from 'vue';
import MoneyCounter from '@/components/MoneyCounter.vue';
const FormCommande = defineAsyncComponent(() => import('./FormCommande.vue'));
import { FormatService } from '@/services/FormatService';

export default defineComponent({
    components: { MoneyCounter },
    data() {
        return {
            lines: 0,
            table: 'commandes',
            defaultUrl: '/api/commandes',
            url: '/api/commandes',
            columns: [
                {
                    key: 'numero',
                    label: 'NUMERO',
                    exportable: true
                },
                {
                    key: 'created_at',
                    label: 'DATE DE CREATION',
                    format: 'date',
                    exportable: true
                },
                {
                    key: 'fournisseur_libelle',
                    label: 'FOURNISSEUR',
                    exportable: true
                },
                {
                    key: 'facture',
                    label: 'N°FACTURE',
                    exportable: true
                },
                {
                    key: 'status',
                    label: 'STATUT',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'total_achat',
                    label: 'PRIX D\'ACHAT ',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_vente',
                    label: 'TOTAL VENTE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_tva',
                    label: 'TOTAL TVA',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_css',
                    label: 'TOTAL CSS',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'created_by',
                    label: 'CREE PAR',
                    exportable: true
                },
                {
                    key: 'ended_with',
                    label: 'TERMINE PAR',
                    exportable: true
                },
            ],
            fournisseurs: [],
            key: 1,
            keyCounter: 1,
            keyWord: '',
            filterForm: {
                fournisseur_libelle: null
            },
            compteurs: []
        }
    },
    mounted() {
        this.getFournisseurs()
    },
    methods: {
        //filtre par periode
        periodFilter() {
            let newUrl = this.defaultUrl;

            let dateDebut = new Date(this.filterForm.debut);
            let dateFin = new Date(this.filterForm.fin);

            // Validation des dates
            if (this.filterForm.debut && this.filterForm.fin && dateFin < dateDebut) {
                this.filterForm.debut = null;
                this.filterForm.fin = null;

                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La date de fin ne peut pas être antérieure à la date de début.',
                    life: 7000
                });
                return;
            }

            // Ajout des paramètres de date
            if (this.filterForm.debut) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'period_from=' + this.filterForm.debut;
            }

            if (this.filterForm.fin) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'period_to=' + this.filterForm.fin;
            }

            // Ajout du paramètre fournisseur
            if (this.filterForm.fournisseur_libelle && this.filterForm.fournisseur_libelle.libelle) {
                newUrl = FormatService.checkUrlFormat(newUrl) + 'fournisseur_libelle=' + encodeURIComponent(this.filterForm.fournisseur_libelle.libelle);
            }

            this.url = newUrl;
            this.key++;
        },
        //vider les inputs du filtre
        removeFilter() {
            this.filterForm = {}
            this.url = this.defaultUrl
            this.key++
        },
        //ouvrir le modal qui cree une nouvelle commade
        openCreateModal() {
            //demande de confirmation
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    //ouverture du modal
                    this.$dialog.open(FormCommande, {
                        props: {
                            header: "Nouvelle commande",
                            style: {
                                width: '90vw',
                            },
                            maximizable: true,
                            breakpoints: { '1199px': '75vw', '575px': '90vw' },
                            modal: true,
                            
                        }
                    })
                }
            });
        },
        //afficher les details d'une commande
        openShowModal(objData) {
            this.$dialog.open(FormCommande, {
                props: {
                    header: "Commande N°" + objData.id,
                    maximizable: true,
                    breakpoints: { '1199px': '75vw', '575px': '90vw' },
                    style: {
                        width: '90vw',
                    },
                    modal: true
                },
                data: objData,
                onClose: () => {
                                $('#refresh' + this.table).click()
                }
            });
        },
        //recuperer la liste des fournisseurs
        getFournisseurs() {
            this.isLoading = true
            this.axios.get('/api/fournisseurs').then(response => {
                this.fournisseurs = response.data.data
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
        // fonction qui affiche le nombre de ligne present dans le tableau
        updateLines(nb_lines) {
            this.lines = nb_lines
        },
        // mettre a jour les compteurs et les incoherances si besoin
        updateExtraDatas(extraDatas) {
            const compteur = extraDatas.compteurs
            this.compteurs= []
            this.compteurs.push(
                {
                    value: compteur.cout_total_achat,
                    label: 'COÛT D\'ACHAT'
                },
                {
                    value: compteur.cout_total_vente,
                    label: 'CHIFFRE D\'AFFAIRE POTENTIEL'
                },
            )
            this.keyCounter++
        },
        // appliquer le filtre dans dans le tableau asdecode
        searchLines(keyword) {
            this.keyWord = keyword
            this.key++
        }
    }
})
</script>

<style>
.encours {
    border: 1px solid darkblue;
    color: #00008b;
    background: rgb(236, 236, 255);
    font-weight: 500;
    padding: .2rem 1rem;
    border-radius: 100px;
}

.termine {
    border: 1px solid green;
    color: green;
    background: rgb(249, 255, 249);
    font-weight: 700;
    padding: .2rem 1rem;
    border-radius: 100px;
}
</style>