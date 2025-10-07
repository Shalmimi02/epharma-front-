<template>
    <p>Pour que l'importation fonctionne, la première ligne qui correspond aux entetes de votre tableau doit contenir
        les noms des colonnes suivant ecrit de la meme maniere peu importe l'ordre <b>sans espace svp</b>. 
        <b>NB: Ne pas envoyer un fichier  excel avec des colonnes vides.</b>
    </p>
    <transition name="slide-down">
            <div v-if="showResponse" class="import-response danger">
                <h3>Résultat de l'importation</h3>
                <p><strong>Nombre total de produits importés :</strong> {{ importResponse.data.nb_importations }}</p>
                <p><strong>Nombre de produits ignorés :</strong> {{ importResponse.data.nb_importations_ignores }}</p>
                
                <div v-if="importResponse.data.importations_ignores.length > 0">
                    <p><strong>Liste des produits ignorés :</strong></p>
                    <ul>
                        <li v-for="(item, index) in importResponse.data.importations_ignores" :key="index">
                            {{ item }}
                        </li>
                    </ul>
                </div>
                <div v-else>
                    <p>Aucun produit ignoré.</p>
                </div>
            </div>
    </transition>
    <div class="card card-body overflow-auto p-0 mb-3">
        <table class="table table-bordered overflow-auto">
            <thead>
                <tr class="bg-danger text-white">
                    <th scope="col">1</th>
                    <th scope="col">lot</th>
                    <th scope="col">produit_cip</th>
                    <th scope="col">prix_achat</th>
                    <th scope="col">prix_de_vente</th>
                    <th scope="col">qte</th>
                    <th scope="col">date_expiration</th>
                    <!-- <th scope="col">coef_conversion_de_prix_vente_achat</th> -->
                   
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>2</th>
                    <td>XXXXXXX</td>
                    <td>XXXXXXX</td>
                    <td>XXXXXXX</td>
                    <td>XXXXXXX</td>
                    <td>XXXXXXX</td>
                    <td>XXXXXXX</td>
                    <!-- <td>XXXXXXX</td> -->
                </tr>
            </tbody>
        </table>
    </div>
    <!-- Bouton de téléchargement -->
    <div class="text-center mt-3">
            <a href="/FACTURE-LBV-4393371.xlsx" download class="btn btn-secondary">
                Télécharger l'exemple
            </a>
    </div>
    <p class="text-center">Le produit_cip doit correspondre soit au cip ou au cip2 d'un produit de la base de donnée</p>
    <p class="text-danger text-center">La colonne produit_cip est obligatoire </p>
    <form @submit.prevent="runImport" class="col-md-10 mx-auto">
        <div class="form-group">
            <label>Votre fichier excel doit avoir l'extension <span class="text-danger">.xlsx</span></label>
            <!-- <input type="file" ref="fichier" accept=".xlsx" v-on:change="handleFileChange()"
                required> -->
                <input class="form-control" type="file" @change="handleFileChange" ref="fileInput"/>
        </div>
        <button v-if="excelData.length" type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            <div v-if="isLoading == true">
                Importation en cours
                <span class="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
            </div>
            <spa v-else>Démarrer</spa>
        </button>

        <!-- <pre v-if="formattedJson">{{ formattedJson }}</pre> -->
    </form>
</template>
<script>
import $ from 'jquery'
import * as XLSX from "xlsx";

export default {
    inject: ['dialogRef'],
    data() {
        return {
            isLoading: false,
            excelData: [], // Pour stocker les données Excel avec en-tête
            showResponse: false,        // Contrôle la visibilité de la div
            importResponse: {}       // Stocke la réponse de l'importation
            // form: {
            //     is_active: false
            // }
        }
    },
    computed: {
        formattedJson() {
            return JSON.stringify(this.excelData, null, 2);
        },
    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);

                    this.excelData = rows.map(row => {
                        const rowData = {};
                        headers.forEach((header, index) => {
                            rowData[header] = row[index];
                        });
                        return rowData;
                    });
                };
                reader.readAsArrayBuffer(file);
            }
        },
        runImport() {
            this.isLoading = true
            this.axios.post('/api/commande_produit/import-excel', 
            { 
                produits: this.excelData, 
                commande_id: this.dialogRef.data.id,
                tva: this.$store.getters.tva,
                css: this.$store.getters.css
            }).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    this.excelData =[]
                     // Réinitialiser l'input de fichier
                     if (this.$refs.fileInput) {
                        this.$refs.fileInput.value = null;
                    }
                    $('#refreshcommande_produit').click()
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 1003000
                    });
                    // Mise à jour de importResponse avec les données reçues
                     
                    this.importResponse = response.data;
                    this.showResponse = true;
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
        // resetForm() {
        //     this.form = {
        //         is_active: false
        //     }
        // }
    }
}
</script>

<style scoped>
pre {
    background-color: #f4f4f4;
    padding: 15px;
    border-radius: 4px;
    max-height: 400px;
    overflow: auto;
}
/* Animation de glissement vers le bas */
.slide-down-enter-active {
    transition: max-height 0.5s ease-out, opacity 0.5s ease-out;
}
.slide-down-leave-active {
    transition: max-height 0.5s ease-in, opacity 0.5s ease-in;
}
.slide-down-enter-from,
.slide-down-leave-to {
    max-height: 0;
    opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
    max-height: 500px; /* Ajustez selon vos besoins */
    opacity: 1;
}

/* Styles pour la div de réponse */
.import-response {
    background-color: #f8f9fa;
    border: 1px solid #ced4da;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
    overflow-y: auto;
    max-height: 200px; /* Hauteur maximale pour le défilement */
}

.import-response ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.import-response li {
    padding: 5px 0;
    border-bottom: 1px solid #e9ecef;
}

.import-response li:last-child {
    border-bottom: none;
}
</style>

