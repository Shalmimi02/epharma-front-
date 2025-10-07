<template>
    <form @submit.prevent="updateLine()">
        <SectionVisibility libelleSection="Informations principales" :isOpen="true">
            <template #section_content>
                <div class="form-row my-3">
                <div class="form-group col-md-4">
                    <label>Nom</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.last_name"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-4">
                    <label>Prenom</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.first_name"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-4">
                    <label>Nom d'utilisateur</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.name"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-4">
                    <label>Adresse email</label>
                    <input type="email" class="form-control border border-dark px-[4rem]" v-model="form.email"
                        :disabled="this.formLocked">
                </div>
                <div class="form-group col-md-4">
                    <label>Téléhone</label>
                    <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.telephone"
                        :disabled="this.formLocked">
                </div>
            </div>
            </template>
        </SectionVisibility>
        
        <SectionVisibility libelleSection="Contacts et localisation" :isOpen="!formLocked">
            <template #section_content>
                <div class="form-row my-3">
                    <div class="form-group col-md-4">
                        <label>Contact de secours</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.contact_de_secours" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Adresse</label>
                        <input type="text" class="form-control border border-dark px-[4rem] " v-model="form.adresse"
                            :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Boite postale</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.boite_postale" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Ville</label>
                        <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.ville"
                            :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Date de naissance</label>
                        <input type="date" class="form-control border border-dark px-[4rem]"
                            v-model="form.date_naissance" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Lieu de naissance</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.lieu_naissance" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Sexe</label>
                        <select name="" class="form-control border border-dark px-[4rem]"
                            id="exampleFormControlSelect1" v-model="form.sexe" :disabled="this.formLocked">
                            <option value="Homme">Homme</option>
                            <option value="Femme">Femme</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label> Nom du père</label>
                        <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.nom_pere"
                            :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Nom de la mère</label>
                        <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.nom_mere"
                            :disabled="this.formLocked">
                    </div>
                </div>
            </template>
        </SectionVisibility>

        <SectionVisibility libelleSection="Identification civil" :isOpen="!formLocked">
            <template #section_content>
                <div class="form-row my-3">
                    <div class="form-group col-md-4">
                        <label>N° Pièce d'identité</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.numero_cni" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>N° Permis de conduire</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.numero_permis_conduire" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Type de permis de conduire</label>
                        <select name="" class="form-control border border-dark px-[4rem]"
                            id="exampleFormControlSelect1" v-model="form.type_permis_conduire"
                            :disabled="this.formLocked">
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="F">F</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label>Matricule de la fonction publique</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.matricule_fonction_publique" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> N° CNSS</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.numero_cnss" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Matricule CNSS</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.matricule_cnss" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>N° CNAMGS</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.numero_cnamgs" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Situation familiale</label>
                        <select name="" class="form-control border border-dark px-[4rem]"
                            id="exampleFormControlSelect1" v-model="form.situation_familial"
                            :disabled="this.formLocked">
                            <option value="Célibataire">Célibataire</option>
                            <option value="Divorcé">Divorcé</option>
                            <option value="Marié">Marié</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label> Nombre d'enfants à charge</label>
                        <input type="number" class="form-control border border-dark px-[4rem]"
                            v-model="form.nombre_enfant_charge" :disabled="this.formLocked">
                    </div>
                </div>
            </template>
        </SectionVisibility>

        <SectionVisibility libelleSection="Formation" :isOpen="!formLocked">
            <template #section_content>
                <div class="form-row my-3">
                    <div class="form-group col-md-4">
                        <label> Niveau d'etude</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.niveau_etude" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Dernier diplome</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.dernier_diplome" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label> Etablissement d'obtention du dernier diplome</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.etablissement" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Profession de formation</label>
                        <input type="text" class="form-control border border-dark px-[4rem]"
                            v-model="form.profession_formation" :disabled="this.formLocked">
                    </div>
                </div>
            </template>
        </SectionVisibility>

        <SectionVisibility libelleSection="Contrat" :isOpen="!formLocked">
            <template #section_content>
                <div class="form-row my-3">
                    <div class="form-group col-md-4">
                        <label>Poste</label>
                        <input type="text" class="form-control border border-dark px-[4rem]" v-model="form.poste"
                            :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Mode de paiement du salaire</label>
                        <select name="" class="form-control border border-dark px-[4rem]"
                            id="exampleFormControlSelect1" v-model="form.mode_paiement_salaire"
                            :disabled="this.formLocked">
                            <option value="Virement">Virement</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label> Type de contrat</label>
                        <select name="" class="form-control border border-dark px-[4rem]"
                            id="exampleFormControlSelect1" v-model="form.type_contrat" :disabled="this.formLocked">
                            <option value="CDI">CDI</option>
                            <option value="CDD">CDD</option>
                            <option value="Intermitent">Intermitent</option>
                            <option value="Stagiaire">Stagiaire</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label>Date d'embauche</label>
                        <input type="date" class="form-control border border-dark px-[4rem]"
                            v-model="form.date_embauche" :disabled="this.formLocked">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Date de fin du contrat</label>
                        <input type="date" class="form-control border border-dark px-[4rem]"
                            v-model="form.date_fin_contrat" :disabled="this.formLocked">
                    </div>
                </div>
            </template>
        </SectionVisibility>

        <SectionVisibility libelleSection="Habilitations" :isOpen="!formLocked">
            <template #section_content>
                <div v-if="!this.datas.is_admin" class="my-3">
                    <h6>Modules</h6>
                    <hr>
                    <div class="p-3 row">
                        <div class="col-md-6 d-flex row align-items-center border-bottom">
                            <div class="col-md-3">
                                <span>Admin</span>
                            </div>
                            <div class="col-md">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(adminHabilitations, 'utilisateur', $event)"
                                        name="utilisateur" :checked="adminHabilitations.includes('utilisateur')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Utilisateur</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(adminHabilitations, 'parametre', $event)"
                                        name="parametre" :checked="adminHabilitations.includes('parametre')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Parametres</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 d-flex row align-items-center border-bottom">
                            <div class="col-md-3">
                                <span>Stock</span>
                            </div>
                            <div class="col-md">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'produits', $event)"
                                        name="produits" :checked="stockHabilitations.includes('produits')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Produits</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'commande', $event)"
                                        name="commande" :checked="stockHabilitations.includes('commande')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Commande</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'base', $event)" name="base"
                                        :checked="stockHabilitations.includes('base')" :disabled="this.formLocked">
                                    <label class="form-check-label">Base</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'fournisseur', $event)"
                                        name="fournisseur" :checked="stockHabilitations.includes('fournisseur')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Fournisseur</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'rayon', $event)" name="rayon"
                                        :checked="stockHabilitations.includes('rayon')" :disabled="this.formLocked">
                                    <label class="form-check-label">Rayon</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input"
                                        @change="toggleSubMenu(stockHabilitations, 'mouvement', $event)"
                                        name="mouvement" :checked="stockHabilitations.includes('mouvement')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Mouvement</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 d-flex row align-items-center border-bottom">
                            <div class="col-md-3">
                                <span>Gestion</span>
                            </div>
                            <div class="col-md">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="billetage"
                                        @change="toggleSubMenu(gestionHabilitations, 'billetage', $event)"
                                        :checked="gestionHabilitations.includes('billetage')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Billetage</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="stat"
                                        @change="toggleSubMenu(gestionHabilitations, 'stat', $event)"
                                        :checked="gestionHabilitations.includes('stat')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Stat</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="inventaire"
                                        @change="toggleSubMenu(gestionHabilitations, 'inventaire', $event)"
                                        :checked="gestionHabilitations.includes('inventaire')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Inventaire</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="journee"
                                        @change="toggleSubMenu(gestionHabilitations, 'journee', $event)"
                                        :checked="gestionHabilitations.includes('journee')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Journée</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="garde"
                                        @change="toggleSubMenu(gestionHabilitations, 'garde', $event)"
                                        :checked="gestionHabilitations.includes('garde')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Garde</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 d-flex row align-items-center border-bottom">
                            <div class="col-md-3">
                                <span>Vente</span>
                            </div>
                            <div class="col-md">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="client"
                                        @change="toggleSubMenu(venteHabilitations, 'client', $event)"
                                        :checked="venteHabilitations.includes('client')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Client</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="caisse"
                                        @change="toggleSubMenu(venteHabilitations, 'caisse', $event)"
                                        :checked="venteHabilitations.includes('caisse')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Caisse</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="reservation"
                                        @change="toggleSubMenu(venteHabilitations, 'reservation', $event)"
                                        :checked="venteHabilitations.includes('reservation')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Réservation</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="devis"
                                        @change="toggleSubMenu(venteHabilitations, 'devis', $event)"
                                        :checked="venteHabilitations.includes('devis')" :disabled="this.formLocked">
                                    <label class="form-check-label">Devis</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="vente"
                                        @change="toggleSubMenu(venteHabilitations, 'vente', $event)"
                                        :checked="venteHabilitations.includes('vente')" :disabled="this.formLocked">
                                    <label class="form-check-label">Vente</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="configuration"
                                        @change="toggleSubMenu(venteHabilitations, 'configuration', $event)"
                                        :checked="venteHabilitations.includes('configuration')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Configuration</label>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 d-flex row align-items-center border-bottom">
                            <div class="col-md-3">
                                <span>Privilèges</span>
                            </div>
                            <div class="col-md">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="inventaire_master"
                                        @change="toggleSubMenu(privilegeHabilitations, 'inventaire_master', $event)"
                                        :checked="privilegeHabilitations.includes('inventaire_master')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Inventaire master</label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="inventaire_mobile"
                                        @change="toggleSubMenu(privilegeHabilitations, 'inventaire_mobile', $event)"
                                        :checked="privilegeHabilitations.includes('inventaire_mobile')"
                                        :disabled="this.formLocked">
                                    <label class="form-check-label">Inventaire mobile</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </SectionVisibility>
        
        <div class=" d-flex justify-content-end" v-if="this.formLocked == false">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Annuler</button>
            <button type="submit" class="btn btn-light">
                Mettre à jour
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
            </button>
        </div>
    </form>

</template>
<style scoped>
#voirmoins {
    display: none;
}
</style>

<script>
import $ from "jquery"
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'EditUtilisateur',
    inject: ['dialogRef'],
    props: ['formLocked', 'datas'],
    data() {
        return {
            montreinputEditUtilisateur: false,
            table: 'utilisateurs',
            isLoading: false,
            showMore: false,
            form: {
                last_name: this.datas.last_name,
                first_name: this.datas.first_name,
                name: this.datas.name,
                telephone: this.datas.telephone,
                email: this.datas.email,
                adresse: this.datas.adresse,
                boite_postale: this.datas.boite_postale,
                ville: this.datas.ville,
                date_naissance: this.datas.date_naissance,
                lieu_naissance: this.datas.lieu_naissance,
                sexe: this.datas.sexe,
                nom_pere: this.datas.nom_pere,
                nom_mere: this.datas.nom_mere,
                numero_cni: this.datas.numero_cni,
                numero_permis_conduire: this.datas.numero_permis_conduire,
                type_permis_conduire: this.datas.type_permis_conduire,
                matricule_fonction_publique: this.datas.matricule_fonction_publique,
                numero_cnss: this.datas.numero_cnss,
                matricule_cnss: this.datas.matricule_cnss,
                numero_cnamgs: this.datas.numero_cnamgs,
                situation_familial: this.datas.situation_familial,
                nombre_enfant_charge: this.datas.nombre_enfant_charge,
                niveau_etude: this.datas.niveau_etude,
                dernier_diplome: this.datas.dernier_diplome,
                etablissement: this.datas.etablissement,
                profession_formation: this.datas.profession_formation,
                poste: this.datas.poste,
                mode_paiement_salaire: this.datas.mode_paiement_salaire,
                type_contrat: this.datas.type_contrat,
                date_embauche: this.datas.date_embauche,
                date_fin_contrat: this.datas.date_fin_contrat,
                contact_de_secours: this.datas.contact_de_secours,
                habilitations: this.datas.habilitations
            },
            adminHabilitations: [],
            stockHabilitations: [],
            gestionHabilitations: [],
            venteHabilitations: [],
            privilegeHabilitations: [],
            menus: [
                { menu: 'ADMIN', submenus: ['utilisateur', 'parametre'] },
                { menu: 'STOCK', submenus: ['produits', 'commande', 'base', 'fournisseur', 'rayon', 'mouvement'] },
                { menu: 'GESTION', submenus: ['billetage', 'stat', 'inventaire', 'journee', 'garde'] },
                { menu: 'VENTE', submenus: ['client', 'caisse', 'reservation', 'devis', 'vente', 'configuration'] },
                { menu: 'PRIVILEGES', submenus: ['inventaire_master', 'inventaire_mobile'] },
            ],
        }
    },
    mounted() {
        if (this.datas.habilitations) {
            this.datas.habilitations.forEach(element => {
                if (element.menu == 'ADMIN' && element.submenus.length > 0) {
                    this.adminHabilitations = element.submenus
                }
                if (element.menu == 'STOCK' && element.submenus.length > 0) {
                    this.stockHabilitations = element.submenus
                }
                if (element.menu == 'GESTION' && element.submenus.length > 0) {
                    this.gestionHabilitations = element.submenus
                }
                if (element.menu == 'VENTE' && element.submenus.length > 0) {
                    this.venteHabilitations = element.submenus
                }
                if (element.menu == 'PRIVILEGES' && element.submenus.length > 0) {
                    this.privilegeHabilitations = element.submenus
                }
            });
        }
    },

    methods: {
        toggleSubMenu(tab, submenu, event) {
            if (event.target.checked) {
                if (!tab.includes(submenu)) {
                    tab.push(submenu);
                }
            } else {
                // Sinon, retirer le sous-menu
                const index = tab.indexOf(submenu);
                if (index > -1) {
                    tab.splice(index, 1);
                }
            }
        },
        showMoreDatas() {
            if (this.showMore == false) {
                this.showMore = true
            } else this.showMore = false
        },
        updateLine() {
            this.isLoading = true

            this.form.habilitations = [
                { menu: 'ADMIN', submenus: this.adminHabilitations },
                { menu: 'STOCK', submenus: this.stockHabilitations },
                { menu: 'GESTION', submenus: this.gestionHabilitations },
                { menu: 'VENTE', submenus: this.venteHabilitations },
                { menu: 'PRIVILEGES', submenus: this.privilegeHabilitations }
            ]
            this.form.fullname = this.form.last_name + ' ' + this.form.first_name
            this.axios.post( '/api/' + this.table + '/' + this.datas.id + '/update', this.form).then(response => {
                this.isLoading = false
                if (response.data.success === true) {
                    $('#refresh' + this.table).click()
                    this.$emit('line_updated')
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000,
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
    }
})
</script>
