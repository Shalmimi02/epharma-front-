<template>
    <EpharmaTemplate>
        <template #page_title>VENTES</template>
        <template #page_counter>
            <i class="fas fa-money-bill-wave"></i> {{ lines }}
        </template>
        <template #content>
            <div class="row border bg-light rounded p-1 mb-2 mx-auto d-flex align-items-center">
                <div class="col-md-6">
                    <form @submit.prevent="venteFilter">
                        <div class="form-row">
                            <div class="form-group col-md">
                                <div>
                                    <small class="font-weight-bold">Rechercher par date</small>
                                    <div>
                                        <label></label>
                                        <input class="form-control form-control-3 border border-dark px-[4rem]"
                                            v-model="filterForm.debut" type="date" style="padding-top: 18px; padding-bottom: 18px;
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-md">
                                <div>
                                    <small class="font-weight-bold pl-3"></small>
                                    <div>
                                        <label></label>
                                        <input class="form-control form-control-sm border border-dark px-[4rem]"
                                            v-model="filterForm.fin" type="date" style="padding-top: 18px; padding-bottom: 18px;
                                   border-bottom: 1px solid black; border-left: none; border-right: none; border-top: none; 
                                   background: #fafafa;">
                                    </div>
                                </div>
                            </div>

                            <div class="col-md mt-5 d-flex">
                                <button type="submit" class="btn">
                                    <i class="fa-solid fa-circle-check text-success" style="font-size: 1.6rem;"
                                        title="Appliquer le filtrage"></i>
                                </button>
                                <button type="button" class="btn" @click="removeFilter">
                                    <i class="fa-solid fa-circle-minus" style="font-size: 1.6rem; color: #28a745;"
                                        title="Annuler le filtrage"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="col-md-6">
                    <p class="mb-3"><small>Rechercher par mot clé</small></p>
                    <searchByKeyword class="mb-3" v-on:set-keyword-filter="searchLines" />
                </div>
            </div>

            <button hidden id="refreshcounter" type="button" @click="refreshCounters">Raffraichir le compteur</button>
            <MoneyCounter v-if="lines > 0" :key="keyCounter" :compteurs="compteurs" /><br>

            <AsdecodeTable :key="key" :newKeyWord="keyWord" :url="url" :columns="columns" :table="table"
                v-on:set-total-records="updateLines" @set-datas="updateVente">
                <template #header_action_btns>
                    <button class="btn btn-light mr-2" @click="openRecapModal(ventesList)">
                        Recapitulatif CNAMGS
                    </button>
                    <!-- <RecapitulatifComp :key="keyRecap" :datas="ventesList"/> -->
                </template>
                <template #action_btns=slotProps>
                    <button class="btn btn-sm btn-light m-1" @click="openShowModal(slotProps.data)">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-light m-1" @click="openShowFacture(slotProps.data)">
                        <i class="fa-solid fa-file-lines"></i>
                    </button>
                </template>
                <template #export_at=slotProps>

                    <span :class="[slotProps.data.export_at != null ? 'termine' : 'encours']">{{
                        slotProps.data.export_at != null ? 'exporté' : 'Non exporté'
                        }}</span>
                </template>
                <template #statut=slotProps>

                    <span :class="[slotProps.data.statut == 'Soldé' ? 'termine' : 'encours']">{{ slotProps.data.statut
                        }}</span>
                </template>
            </AsdecodeTable>

            <p class="mt-5 mb-3 font-weight-bold">Produits vendus dans la période</p>
            <form class="border bg-white rounded p-3 mx-auto mb-3" style="opacity: 0.7;">
                <div class="form-row">
                    <div class="form-group col-lg-3">
                        <div>
                            <small class="font-weight-bold">Rechercher par libelle</small>
                            <div>
                                <label></label>
                                <input class="form-control form-control-sm search-form" type="search"
                                    placeholder="Doliprane" v-model="libelle_keyword" @input="searchProduitVendu()">
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <AsdecodeTable :key="key2" table="reservation_produits" :url="urlProduitVendu" :columns="columns1">
                <template #produit="slotProps">
                    {{ slotProps.data.produit.cip }}
                </template>
                <template #id="slotProps">
                    <button class="btn  btn-primary" @click="filterByProduct(slotProps.data.produit_id)">
                        <i class="fa-solid fa-magnifying-glass mr-1"></i> Trouver les ventes
                    </button>
                </template>

            </AsdecodeTable>
        </template>
    </EpharmaTemplate>
    <!-- <div id="recap" style="display: none;">
    <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f0f0f0; text-align: left;">
            <tr>
                <th style="border: 1px solid #ccc; padding: 8px;">NBS</th>
                <th style="border: 1px solid #ccc; padding: 8px;">N° Feuilles</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Noms et Prénoms</th>
                <th style="border: 1px solid #ccc; padding: 8px;">N° Assurés</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Montant Total Ordonnance</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Montant à Payer Patient</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Montant à Payer CNAMGS</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th style="border: 1px solid #ccc; padding: 8px;" class="nbs">NBS</th>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;" class="numberF"></td>
                <td style="border: 1px solid #ccc; padding: 8px;" class="firstname"></td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;" class="numberAssurance"></td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: right;" class="MTotalOrdonnance">52 140</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: right;" class="Mt">40 000</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: right;" class="nbs">12 140</td>
            </tr>
        </tbody>
    </table>
    </div> -->

    <!-- <RecapFacture ref="RecapFacture" :key="keyRecap" :datas="ventesList" /> -->
</template>

<script>
import * as XLSX from 'xlsx';
import { defineAsyncComponent } from 'vue';
import moment from 'moment'
import MoneyCounter from '@/components/MoneyCounter.vue';
import ShowVente from './ShowVente.vue'
import ShowFacture from './ShowFacture.vue';

const RecapFacture = defineAsyncComponent(() => import('@/components/RecapFacture.vue'));
export default {
    inject: ['dialogRef'],
    components: { MoneyCounter },
    data() {
        return {
            lines: 0,
            table: 'ventes',
            detteActuelle: null,
            defaultUrl: '/api/ventes?from_period_debut=' + moment().subtract(1, 'days').format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
            url: '/api/ventes?from_period_debut=' + moment().subtract(1, 'days').format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
            urlProduitVendu: '/api/reservation_produits/vendus?from_period_debut=' + moment().subtract(1, 'days').format('YYYY-MM-DD') + '&from_period_fin=' + moment().add(1, 'days').format('YYYY-MM-DD'),
            columns: [
                {
                    key: 'caisse',
                    label: 'CAISSE',
                    exportable: true
                },
                {
                    key: 'user',
                    label: 'VENDEUSE',
                    exportable: true
                },
                {
                    key: 'client',
                    label: 'CLIENTS',
                    exportable: true
                },
                {
                    key: 'position_and_date',
                    label: 'RESERVATION',
                    exportable: true
                },
                {
                    key: 'total',
                    label: 'TTC',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'ht',
                    label: 'HT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'tva',
                    label: 'TVA',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'css',
                    label: 'CSS',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_client',
                    label: 'TOTAL CLIENT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'total_prise_en_charge',
                    label: 'PRISE EN CHARGE',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'montant_rendu',
                    label: 'MT RENDU',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'export_at',
                    label: 'EXPORTATION',
                    format: 'slot',
                    exportable: true
                },
                {
                    key: 'statut',
                    label: 'STATUT',
                    format: 'slot',
                    exportable: true
                }
            ],
            key: 1,
            key2: 1,
            keyCounter: 1,
            keyWord: '',
            keyRecap: 0,
            filterForm: {
                debut: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                fin: moment().add(1, 'days').format('YYYY-MM-DD')
            },
            columns1: [
                {
                    key: 'cip',
                    label: 'CIP',
                    exportable: true
                },
                {
                    key: 'libelle',
                    label: 'LIBELLE',
                    exportable: true
                },
                {
                    key: 'qte_vendus',
                    label: 'QTE VENDUS',
                    exportable: true
                },
                {
                    key: 'qte_actu',
                    label: 'QTE ACTU',
                    exportable: true
                },
                {
                    key: 'prix_achat',
                    label: 'PRIX D\'ACHAT',
                    format: 'money',
                    exportable: true
                },
                {
                    key: 'prix_de_vente',
                    label: 'PRIX DE VENTE',
                    format: 'money',
                    exportable: true
                },

                {
                    key: 'coef',
                    label: 'COEF',
                    exportable: true
                },
                {
                    key: 'id',
                    label: 'VENTE',
                    format: 'slot',
                },
            ],
            datas: [],
            isLoading: false,
            compteurs: [],
            ventesList: []
        }
    },
    created() {
        this.venteFilter()
    },
    mounted() {
        this.calculerCoutTotal()
    },
    methods: {
        openRecapModal(ventesList) {
            this.$dialog.open(RecapFacture, {
                props: {
                    header: "Recapitulatif de facture",
                    style: {
                        width: '70vw',
                    },
                    modal: true
                },
                data: ventesList
            });
        },
        updateVente(datas) {
            this.ventesList = datas
            this.keyRecap++
        },
        searchProduitVendu() {
            if (this.libelle_keyword.length) this.urlProduitVendu = this.urlProduitVendu + '&req_contain=' + this.libelle_keyword
            this.key2++
        },
        //fonction pour empecher les erreurs lors du filtre
        checkUrlFormat(link) {
            if (link !== undefined && link.includes('?')) link = link + '&'
            else link = link + '?'
            return link
        },
        filterByProduct(id) {
            this.url = this.checkUrlFormat(this.url) + 'contain_product=' + id
            this.key++
            this.scrollToTop(); // Appel de la fonction de scroll vers le haut
        },
        // Fonction de défilement vers le haut
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // Défilement fluide
            });
        },
        dateFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY HH:mm:ss')
            }
        },
        openShowModal(objData) {
            this.$dialog.open(ShowVente, {
                props: {
                    header: "Vente N°" + objData.id + " du " + this.dateFormat(objData.created_at),
                    style: {
                        width: '40vw',

                    },
                    modal: true
                },
                data: objData
            });

        },
        openShowFacture(objData) {
            this.$dialog.open(ShowFacture, {
                props: {
                    header: "Facture pour la vente N°" + objData.id + " du " + this.dateFormat(objData.created_at),
                    style: {
                        width: '50vw',
                    },
                    modal: true
                },
                data: objData
            });

        },
        searchLines(keyword) {
            this.removeFilter()
            this.keyWord = keyword
            this.key++
        },
        venteFilter() {
            let dateDebut = new Date(this.filterForm.debut);
            let dateFin = new Date(this.filterForm.fin);

            if (dateFin < dateDebut) {
                // La date de debut est supérieure à la date de fin
                this.filterForm.debut = null
                this.filterForm.fin = null

                this.$toast.add({
                    severity: 'warn',
                    summary: 'Oups !',
                    detail: 'La date de fin ne peut etre supérieure à la date de début',
                    life: 7000
                });
                return
            }

            let newUrl = this.defaultUrl
            // if (this.filterForm.type) {
            //     newUrl = this.checkUrlFormat(newUrl) + 'type=' + this.filterForm.type
            // }

            if (this.filterForm.debut) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_debut=' + this.filterForm.debut
            }

            if (this.filterForm.fin) {
                newUrl = this.checkUrlFormat(newUrl) + 'from_period_fin=' + this.filterForm.fin
            }
            if (this.filterForm.statut) {
                newUrl = this.checkUrlFormat(newUrl) + 'statut=' + this.filterForm.statut
            }

            this.url = newUrl
            this.key++
            this.key2++
        },
        getDatas() {
            this.isLoading = true
            this.axios.get('/api/' + this.table).then(response => {
                this.datas = response.data.data
                this.$nextTick(() => {
                    // Une fois les données affichées, générer le PDF
                    // this.key++
                    this.exportToExcel()
                });

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
        exportToExcel() {
            // this.datas
            // const worksheet = XLSX.utils.json_to_sheet('recap');
            // const workbook = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');
            // //     // Générer un fichier Excel
            // XLSX.writeFile(workbook, this.table + '.xlsx');


            // Sélectionner la div masquée par son ID
            const hiddenDiv = document.getElementById('recap');
            // Extraire les données du tableau HTML à l'intérieur de la div
            const table = hiddenDiv.querySelector('tables');
            if (!table) {
                console.error('Aucun tableau trouvé dans la div masquée');
                return;
            }
            // Utiliser SheetJS pour convertir le tableau en une feuille de calcul
            const worksheet = XLSX.utils.table_to_sheet(table);
            // Créer un nouveau fichier Excel
            const workbook = XLSX.utils.book_new();
            // Ajouter la feuille au fichier Excel
            XLSX.utils.book_append_sheet(workbook, worksheet, 'recap');
            // Générer et télécharger le fichier Excel
            XLSX.writeFile(workbook, 'recap.cnamgs.xlsx');

        },
        removeFilter() {
            this.filterForm = {
                debut: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                fin: moment().add(1, 'days').format('YYYY-MM-DD')
            },
                this.url = this.defaultUrl
            this.key++
        },
        async updateLines(nb_lines) {
            await this.calculerCoutTotal()
            this.lines = nb_lines
        },
        calculerCoutTotal() {
            this.isLoading = true
            this.axios.get('/api/ventes-calc-compteur?from_period_debut=' + this.filterForm.debut + '&from_period_fin=' + this.filterForm.fin).then(response => {
                this.isLoading = false
                this.compteurs = []
                this.compteurs.push(
                    {
                        value: response.data.total_client,
                        label: 'CLIENT'
                    },
                    {
                        value: response.data.total_pc,
                        label: 'ASSURANCE'
                    },
                    {
                        value: response.data.total_ca,
                        label: 'C.A. TTC'
                    },
                    {
                        value: response.data.total_ht,
                        label: 'HT'
                    },
                    {
                        value: response.data.total_tva,
                        label: 'TVA'
                    },
                    {
                        value: response.data.total_css,
                        label: 'CSS'
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
        triggerExport() {
            if (this.$refs.RecapFacture) {
                this.$refs.RecapFacture.exportToExcel();
            } else {
                console.error("Le composant enfant n'est pas accessible.");
            }
        }

    }
}




</script>

<style>
.encours {
    border: 1px solid darkblue;
    color: #00008b;
    background: rgb(236, 236, 255);
    font-weight: 500;
    padding: .2rem 1rem;
    border-radius: 100px;
    text-transform: uppercase;
    /* Le texte sera en majuscules */
}

.termine {
    border: 1px solid green;
    color: green;
    background: rgb(249, 255, 249);
    font-weight: 700;
    padding: .2rem 1rem;
    border-radius: 100px;
    text-transform: uppercase;
    /* Le texte sera en majuscules */
}
</style>