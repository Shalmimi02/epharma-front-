<template>
    <form @submit.prevent="createLine()">
        <div>
            <p>Informations personnelles</p>

            <div class="form-row">
                <div class="form-group col-md-3">
                    <label>Montant de la taxe CFA</label>
                    <input type="number" class="form-control bg-bg-input border border-dark px-[4rem]" min="0" v-model="form.montant_taxe" required>
                </div>
                <div class="form-group col-md-3">
                    <label>Date de début</label>
                    <input type="date" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.date_debut" @change="validationDate" required />
                </div>
                <div class="form-group col-md-3">
                    <label>Heure de début</label>
                    <input type="time" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.heure_debut" @change="validationHeure" required />
                </div>
                <div class="form-group col-md-3">
                    <label>Date de fin</label>
                    <input type="date" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.date_fin" @change="validationDate" required>
                </div>
                <div class="form-group col-md-3">
                    <label>Heure de fin</label>
                    <input type="time" class="form-control bg-bg-input border border-dark px-[4rem]" v-model="form.heure_fin" @change="validationHeure" required>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-light mr-2" @click="this.dialogRef.close()">Fermer</button>
            <button type="submit" class="btn btn-light">
                Enregistrer
                <span v-if="isLoading == true" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
        </div>
    </form>
</template>

<script>
import $ from "jquery";
import { defineComponent } from "vue";

export default defineComponent({
    name: "CreateGarde",
    inject: ["dialogRef"],
    data() {
        return {
            table: "gardes",
            isLoading: false,
            form: {
                montant_taxe: null,
                date_debut: null,
                heure_debut: null,
                date_fin: null,
                heure_fin: null,
            },
        };
    },
    methods: {
        createLine() {
            this.isLoading = true;
            this.axios
                .post("/api/" + this.table, this.form)
                .then((response) => {
                    this.isLoading = false;
                    if (response.data.success === true) {
                        this.resetForm();
                        $("#refresh" + this.table).click();
                        this.dialogRef.close();
                        this.$toast.add({
                            severity: "success",
                            detail: response.data.message,
                            life: 3000,
                        });
                    } else {
                        response.data.errors.forEach((element) => {
                            this.$toast.add({
                                severity: "warn",
                                summary: "Oups !",
                                detail: element,
                                life: 7000,
                            });
                        });
                    }
                })
                .catch(() => {
                    this.isLoading = false;
                    this.$toast.add({
                        severity: "error",
                        summary: "Problème de connexion",
                        detail: "Une erreur s'est produite lors de la connexion au serveur !",
                        life: 5000,
                    });
                });
        },
        resetForm() {
            this.form = {
                montant_taxe: null,
                date_debut: null,
                heure_debut: null,
                date_fin: null,
                heure_fin: null,
            };
        },
        validationDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        //condition pour verifier si la date de debut est antérieure à la date actuelle 
        if (this.form.date_debut) {
            const selectedDateDebut = new Date(this.form.date_debut);
            if (selectedDateDebut < today) {
                this.form.date_debut = null;
                this.$toast.add({
                    severity: "warn",
                    summary: "Date invalide",
                    detail: "La date de début ne peut pas être antérieure à aujourd'hui.",
                    life: 5000,
                });
            }
        }
        //condition pour verifier si la date de fin est antérieure à la date actuelle et l'incohérence de date
        if (this.form.date_fin) {
            const selectedDateFin = new Date(this.form.date_fin);
            if (selectedDateFin < today) {
                this.form.date_fin = null;
                this.$toast.add({
                    severity: "warn",
                    summary: "Date invalide",
                    detail: "La date de fin ne peut pas être antérieure à la date actuelle.",
                    life: 5000,
                });
            }

            if (this.form.date_debut && selectedDateFin < new Date(this.form.date_debut)) {
                this.form.date_fin = null;
                this.$toast.add({
                    severity: "warn",
                    summary: "Incohérence des dates",
                    detail: "La date de fin ne peut pas être antérieure à la date de début.",
                    life: 5000,
                });
            }
        }
    },

    validationHeure() {
    const now = new Date();

    // Vérification pour l'heure de début
    if (this.form.heure_debut) {
        if (!this.form.date_debut) {
            this.$toast.add({
                severity: "warn",
                summary: "Heure invalide",
                detail: "Veuillez noter la date de début avant l'heure.",
                life: 5000,
            });
            this.form.heure_debut = null;
            return;
        }

        const selectedDateDebut = new Date(this.form.date_debut);
        const [hoursDebut, minutesDebut] = this.form.heure_debut.split(":");
        const selectedTimeDebut = new Date();
        selectedTimeDebut.setHours(hoursDebut, minutesDebut, 0, 0);

        if (selectedDateDebut.toDateString() === now.toDateString() && selectedTimeDebut < now) {
            this.form.heure_debut = null;
            this.$toast.add({
                severity: "warn",
                summary: "Heure invalide",
                detail: "L'heure de début ne peut pas être antérieure à l'heure actuelle.",
                life: 5000,
            });
        }
    }

    // Vérification pour l'heure de fin
    if (this.form.heure_fin) {
        if (!this.form.date_fin) {
            this.$toast.add({
                severity: "warn",
                summary: "Heure invalide",
                detail: "Veuillez noter les dates avant l'heure.",
                life: 5000,
            });
            this.form.heure_fin = null;
            return;
        }

        const selectedDateFin = new Date(this.form.date_fin);
        const [hoursFin, minutesFin] = this.form.heure_fin.split(":");
        const selectedTimeFin = new Date();
        selectedTimeFin.setHours(hoursFin, minutesFin, 0, 0);

        if (selectedDateFin.toDateString() === now.toDateString() && selectedTimeFin < now) {
            this.form.heure_fin = null;
            this.$toast.add({
                severity: "warn",
                summary: "Heure invalide",
                detail: "L'heure de fin ne peut pas être antérieure à l'heure actuelle.",
                life: 5000,
            });
        }

        // Validation de l'incohérence entre début et fin
        if (this.form.date_debut === this.form.date_fin && this.form.heure_debut && this.form.heure_fin) {
            const [hoursDebut, minutesDebut] = this.form.heure_debut.split(":");
            const selectedTimeDebut = new Date();
            selectedTimeDebut.setHours(hoursDebut, minutesDebut, 0, 0);

            if (selectedTimeFin < selectedTimeDebut) {
                this.form.heure_fin = null;
                this.$toast.add({
                    severity: "warn",
                    summary: "Incohérence des heures",
                    detail: "L'heure de fin ne peut pas être antérieure à l'heure de début.",
                    life: 5000,
                });
            }
        }
    }
}



    
    },
});
</script>
