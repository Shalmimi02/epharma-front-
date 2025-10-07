<template>
    <form @submit.prevent="UpdateLine()">
        <h5 class="mb-3">Periode de billetage</h5>

        <div class="form-row mb-3">
            <div class="form-group col-md-3">
                <label>Date de debut</label>
                <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.date_debut" required :disabled="this.dialogRef.data.statut == 'validé'">
            </div>
            <div class="form-group col-md-2">
                <label>Heure de debut</label>
                <input type="time" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.heure_debut" required :disabled="this.dialogRef.data.statut == 'validé'">
            </div>
            <div class="form-group col-md-3">
                <label>Date de fin</label>
                <input type="date" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.date_fin" required :disabled="this.dialogRef.data.statut == 'validé'">
            </div>
            <div class="form-group col-md-2">
                <label>Heure de fin</label>
                <input type="time" class="form-control form-control-sm border border-dark px-[4rem]"
                    v-model="form.heure_fin" required :disabled="this.dialogRef.data.statut == 'validé'">
            </div>
        </div>
        <div class="d-flex">
            <div class="text-center m-3">
                <span class="bg-primary text-white  px-3 py-2">Total billetage {{ moneyFormat(totalBilletage) }}</span>
            </div>

            <button type="button" class="btn btn-success mt-2" style="height: 38px;" @click.prevent="printSolde()">
                <i class='fas fa-print'></i> Imprimer
            </button>
        </div>

        <h5 class="mb-3">Comptage</h5>
        <div class="form-inline mb-3 p-2 border border-primary">
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 5 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.cinq_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 10 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.dix_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 25 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.vingt_cinq_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 50 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.cinquante_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Piece(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-coins mr-1"></i> 100 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.cent_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Piece(s)</span>
            </div>
        </div>

        <div class="form-inline mb-3 p-2 border border-primary">
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 500 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.cinq_cent_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 1 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.mil_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 2 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.deux_mil_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 5 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.cinq_mil_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Billet(s)</span>
            </div>
            <div class="form-group mx-sm-3 mb-2">
                <strong class="text-primary"><i class="fa-solid fa-money-bill mr-1"></i> 10 000 FCFA</strong>
                <input type="number" class="form-control form-control-sm mx-2 border border-dark px-[4rem]"
                    v-model="form.dix_mil_franc" min="0" :disabled="this.dialogRef.data.statut == 'validé'">
                <span>Billet(s)</span>
            </div>
        </div>

        <h5 class="mb-3">Commentaire</h5>
        <textarea class="form-control border border-dark px-[4rem] mb-3" rows="4" v-model="form.description"
            disabled></textarea>

        <h5 class="mb-3">Commentaire de validation</h5>
        <textarea class="form-control border border-dark px-[4rem]" rows="4" v-model="form.commentaire_validation"
            :disabled="this.dialogRef.data.statut == 'validé'"></textarea>

        <div class="d-flex justify-content-end mt-3">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Fermer</button>
            <button type="submit" class="btn btn-light mr-2" v-if="this.dialogRef.data.statut != 'validé'">
                Valider le billetage
                <span v-if="BilletageIsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
            <!-- Nouveau bouton Sauvegarder (uniquement si le billetage n'est pas déjà validé) -->
            <button type="button" class="btn btn-primary mr-2" v-if="dialogRef.data.statut != 'validé'"
                @click.prevent="saveChanges()" :disabled="IsSaving">
                Mettre à jour
                <span v-if="IsSaving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
            <button type="submit" class="btn btn-black mr-2" @click.prevent="openProduit()">
                <i class="fas fa-eye"></i>
                Voir les produits
                <span v-if="IsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
            <button type="submit" class="btn btn-danger mr-2" @click.prevent="deleteLine()">
                <i class="fas fa-trash"></i>
                Supprimer
                <span v-if="IsLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
            <section ref="Billetage" v-show="false">
                <div class="invoice-box" id="Billetage">
                    <div class="invoice">

                        <div class="">
                            <p>
                                Nom:{{ this.$store.state.pharmacie.nom_pharmacie }}<br>
                                Adresse: {{ this.$store.state.pharmacie.adresse }} <br>
                                Tel1: {{ this.$store.state.pharmacie.telephone1 }} <br>
                                Tel2: {{ this.$store.state.pharmacie.telephone2 }}
                            </p>
                        </div>

                    </div>
                    <div class="invoice-b">
                        <h2>BILLETAGE N°{{ this.dialogRef.data.id }}</h2>
                    </div>
                    <div>
                        <h3>Periode du billetage</h3>
                        <p> <strong>Date:{{ dateFormat(this.dialogRef.data.date_debut) }} -
                                {{ dateFormat(this.dialogRef.data.date_fin) }}</strong><br>
                            <strong>Heure:{{ this.dialogRef.data.heure_debut }} -
                                {{ this.dialogRef.data.heure_fin }}</strong><br>
                            <strong>Caissière: {{ this.dialogRef.data.ended_with }}</strong>
                        </p>


                    </div>

                    <p><strong> COMPTAGE</strong></p>
                    <table class="table table-bordered" cellpadding="0" cellspacing="4">
                        <thead>

                            <tr>
                                <th>5 (cinq) FCFA</th>
                                <th>10 (dix ) FCFA</th>
                                <th>25 (vingt-cinq) FCFA</th>
                                <th>50 (cinquante) FCFA</th>
                                <th>100 (cent) FCFA</th>
                                <th>500 (cinq cent) FCFA</th>
                                <th>1000 (mille) FCFA</th>
                                <th>2000 (deux mille) FCFA</th>
                                <th>5000 (cinq mille) FCFA</th>
                                <th>10 000 (dix mille) FCFA</th>

                            </tr>

                        </thead>
                        <tbody>
                            <tr>
                                <td>{{ this.dialogRef.data.cinq_franc }}</td>
                                <td>{{ this.dialogRef.data.dix_franc }}</td>
                                <td>{{ this.dialogRef.data.vingt_cinq_franc }}</td>
                                <td>{{ this.dialogRef.data.cinquante_franc }} </td>
                                <td>{{ this.dialogRef.data.cent_franc }}</td>
                                <td>{{ this.dialogRef.data.cinq_cent_franc }}</td>
                                <td>{{ this.dialogRef.data.mil_franc }}</td>
                                <td>{{ this.dialogRef.data.deux_mil_franc }}</td>
                                <td>{{ this.dialogRef.data.cinq_mil_franc }}</td>
                                <td>{{ this.dialogRef.data.dix_mil_franc }}</td>


                            </tr>
                            <td colspan="10"> Total: {{ moneyFormat(totalBilletage) }}</td>


                        </tbody>

                    </table>

                    <div>
                        <p> <strong>Commentaire de validation:</strong><br>
                            {{ this.dialogRef.data.commentaire_validation }}
                        </p>
                    </div>

                </div>

                <div class="footer">
                    <strong>{{ this.$store.getters.pharmacie.nom_pharmacie }}.</strong><br>
                    {{ this.$store.getters.pharmacie.adresse }} | BP: <br>
                    TEL: {{ this.$store.getters.pharmacie.telephone1 }} / {{ this.$store.getters.pharmacie.telephone2 }}
                    |
                    Email: {{ this.$store.getters.pharmacie.email }}<br>
                    {{ this.$store.getters.pharmacie.rccm }} | {{ this.$store.getters.pharmacie.nif }}
                </div>

            </section>
        </div>
    </form>
</template>

<script>
import { defineComponent } from 'vue';
import $ from 'jquery';
import moment from 'moment';
import TableProduitBilletage from './TableProduitBilletage.vue'
export default defineComponent({
    inject: ['dialogRef'],
    data() {
        return {
            table: 'billetages',
            BilletageIsLoading: false,
            IsLoading: false,
            IsSaving: false,
            form: {
                date_debut: this.dialogRef.data.date_debut,
                date_fin: this.dialogRef.data.date_fin,
                heure_debut: this.dialogRef.data.heure_debut,
                heure_fin: this.dialogRef.data.heure_fin,
                statut: this.dialogRef.data.statut,
                description: this.dialogRef.data.description,
                commentaire_validation: this.dialogRef.data.commentaire_validation,
                cinq_franc: this.dialogRef.data.cinq_franc,
                dix_franc: this.dialogRef.data.dix_franc,
                vingt_cinq_franc: this.dialogRef.data.vingt_cinq_franc,
                cinquante_franc: this.dialogRef.data.cinquante_franc,
                cent_franc: this.dialogRef.data.cent_franc,
                cinq_cent_franc: this.dialogRef.data.cinq_cent_franc,
                mil_franc: this.dialogRef.data.mil_franc,
                deux_mil_franc: this.dialogRef.data.deux_mil_franc,
                cinq_mil_franc: this.dialogRef.data.cinq_mil_franc,
                dix_mil_franc: this.dialogRef.data.dix_mil_franc,
                total_billetage: this.dialogRef.data.total_billetage,
                ecart: this.dialogRef.data.ecart,

            }
        }
    },
    computed: {
        totalBilletage() {
            let total = 0
            let total_cinqf = this.form.cinq_franc * 5
            let total_dixf = this.form.dix_franc * 10
            let total_vingtf = this.form.vingt_cinq_franc * 25
            let total_cinquantef = this.form.cinquante_franc * 50
            let total_centf = this.form.cent_franc * 100
            let total_cinqcf = this.form.cinq_cent_franc * 500
            let total_millef = this.form.mil_franc * 1000
            let total_deuxMf = this.form.deux_mil_franc * 2000
            let total_cinqMf = this.form.cinq_mil_franc * 5000
            let total_dixMf = this.form.dix_mil_franc * 10000
            total = total_cinqf + total_dixf + total_vingtf + total_cinquantef + total_centf + total_cinqcf + total_millef + total_deuxMf + total_cinqMf + total_dixMf
            return total
        },
        ecartCalcule() {
            // Remplacez par votre logique de calcul d'écart
            // Par exemple: différence entre le billetage et un montant de référence
            const montantReference = this.dialogRef.data.total_vente || 0;
            return this.totalBilletage - montantReference;
        }
    },
    watch: {
        totalBilletage: {
            immediate: true,
            handler(newValue) {
                this.form.total_billetage = newValue;
            }
        },

        ecartCalcule: {
            immediate: true,
            handler(newValue) {
                this.form.ecart = newValue;
            }
        }
    },
    methods: {
        moneyFormat(varMoney) {
            if (varMoney) {
                // Arrondir d'abord la valeur à l'entier le plus proche
                const roundedValue = Math.round(varMoney);
                // Formater sans décimales
                return new Intl.NumberFormat('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(roundedValue) + ' FCFA';
            }
            return '0 FCFA';
        },
        openProduit() {
            this.$dialog.open(TableProduitBilletage, {
                props: {
                    header: 'Liste des produits du billetages n°' + this.dialogRef.data.id,
                    style: {
                        width: '80',
                    },
                    modal: true
                },
                data: this.dialogRef.data
            })
        },
        UpdateLine() {
            this.BilletageIsLoading = true
            this.form.statut = 'validé'
            this.axios.post('/api/' + this.table + '/' + this.dialogRef.data.id + '/update', this.form).then(response => {
                this.BilletageIsLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    // this.$emit('line_updated')
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
                this.BilletageIsLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })

        },
        dateFormat(varDate) {
            if (varDate != '') {
                const newDate = new Date(varDate)
                if (newDate) return moment(newDate).format('DD/MM/YYYY')
            }
        },
        // Nouvelle méthode pour sauvegarder les modifications sans valider
        saveChanges() {
        this.IsSaving = true;
        this.axios
            .post('/api/' + this.table + '/' + this.dialogRef.data.id + '/update', this.form)
            .then(response => {
            this.IsSaving = false;
            if (response.data.success === true) {
                $('#refresh' + this.table).click();
                this.dialogRef.close();
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
            }
            })
            .catch(() => {
            this.IsSaving = false;
            this.$toast.add({
                severity: 'error',
                summary: 'Probleme de connexion',
                detail:
                "Une erreur s'est produite lors de la connexion au serveur !",
                life: 5000
            });
            });
        },
        deleteLine(){
            this.$confirm.require({
                group: 'headless',
                header: 'Etes-vous sûr?',
                message: 'Cette action est irréversible!',
                accept: () => {
                    this.isLoading = true
                    this.axios.post('/api/billetages/' + this.dialogRef.data.id + '/destroy').then((response) => {
                        this.isLoading = false
                        if (response.data.success === true) {
                            $('#refreshbilletages').click()
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
        printSolde() {
            const receiptContent = this.$refs.Billetage.innerHTML;
            const printWindow = window.open("", "", "width=1000,height=900");

            // Charger le contenu et les styles dans la nouvelle fenêtre
            printWindow.document.write(`
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <style>
                body {
                font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
               
                }

                .invoice-box {  
                font-size: 16px;
                line-height: 24px;
                color: #555;
                }

                .invoice {
                display: flex;
                 justify-content: space-between;
                font-size: 16px;
                line-height: 24px;
                color: ;
                }

                .invoice-box table {
                border: solid;
                  border-collapse: collapse;  //mettre les bordures dans tout le tableau
                width: 100%;
                   
                
                }
                .invoice-box th, td {
                border: 1px solid black;
                padding: 5px ;
                 
                }
                .invoice-b {
                 text-align: center;
                }
                 .invoice-h {
                 text-align: center;
                  border: solid;
                  padding: 2px
                }


                .invoice-box table td {
               
                vertical-align: top;
                }

                .invoice-box table tr td:nth-child(2) {
                text-align: center;
                }

                .invoice-box table tr.top table td {
                padding-bottom: 20px;
                }

                .invoice-box table tr.top table td.title {
                font-size: 45px;
                line-height: 45px;
                color: #333;
                }

                .invoice-box table tr.information table td {
                text-align: center;
                }

                .invoice-box table tr.heading td {
                background: #eee;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                }

                .invoice-box table tr.details td {
                padding-bottom: 20px;
                }

                .invoice-box table tr.item td {
                border-bottom: 1px solid #eee;
                }

                .invoice-box table tr.item.last td {
                border-bottom: none;
                }

                .invoice-box table tr.total td:nth-child(2) {
                border-top: 2px solid #eee;
                font-weight: bold;
                }

                .print-button {
                display: block;
                width: 100px;
                margin: 20px auto;
                padding: 10px;
                background-color: #007bff;
                color: white;
                text-align: center;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                }
                .print-logo {
                width: 150px;
                }

                .print-button:hover {
                background-color: #0056b3;
                }
                .footer {
                background-color: #f1f1f1; /* Light gray background */
                text-align: center;
                padding: 10px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
                width: 100%;
                position: fixed;
                bottom: 0;
                left: 0;
                }

                .footer strong {
                color: #333;
                }
            </style>
            </head>
            <body>
            ${receiptContent}
            </body>
            </html>
        `);

            // Attendre que le contenu soit chargé avant d'imprimer
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();

        },

        // },
        // resetForm() {
        //     this.form = {}
        // }
    },
})
</script>
