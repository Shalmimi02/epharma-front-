<template>

    <div class="container">
        <div class="row">
            <div class="mb-3 col-md-4">
                     <div class="card" >
                    <div class="card-header">
                        <h5>FORMES</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addForme()">
                            <div class="form-group  mb-2">
                                <input type="text" class="form-control" v-model="forme.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="formeLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span> </button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" style="cursor: pointer;" v-for="forme in formes" :key="forme"
                                @click="selectFormeLine(forme)">
                                <i class="fa-solid fa-edit mr-1"></i> {{ forme.libelle }}
                            </li>

                        </ul>
                    </div>
                </div>               
            </div>

            <div class="mb-3 col-md-4">
                <div class="card" >
                    <div class="card-header">
                        <h5>FAMILLE</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addFamille()">
                            <div class="form-group  mb-2">
                                <input type="text" class="form-control" v-model="famille.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="famLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span></button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" style="cursor: pointer;" v-for="famille in familles"
                                :key="famille" @click="selectFamilleLine(famille)">
                                <i class="fa-solid fa-edit mr-1"></i> {{ famille.libelle }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-3 col-md-4">
                <div class="card" >
                    <div class="card-header">
                        <h5>NATURE</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addNature()">
                            <div class="form-group  mb-2">

                                <input type="text" class="form-control" v-model="nature.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="natureLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span> </button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" @click="selectNatureLine(nature)" style="cursor: pointer;"
                                v-for="nature in natures" :key="nature">
                                <i class="fa-solid fa-edit mr-1"></i> {{ nature.libelle }}
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-3 col-md-4">
                <div class="card" >
                    <div class="card-header">
                        <h5>CLASSE THERAPEUTIQUE</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addClasse()">
                            <div class="form-group  mb-2">
                                <input type="text" class="form-control" v-model="classe.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="classeLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span> </button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" @click="selectClasseLine(classe)" style="cursor: pointer;"
                                v-for="classe in classes" :key="classe_theraps">
                                <i class="fa-solid fa-edit mr-1"></i> {{ classe.libelle }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-3 col-md-4">
                <div class="card" >
                    <div class="card-header">
                        <h5>CATEGORIE</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addCategorie()">
                            <div class="form-group  mb-2">
                                <input type="text" class="form-control" v-model="categorie.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="categLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span> </button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" @click="selectCategorieLine(categorie)" style="cursor: pointer;"
                                v-for="categorie in categories" :key="categorie">
                                <i class="fa-solid fa-edit mr-1"></i> {{ categorie.libelle }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-3 col-md-4">
                <div class="card" >
                    <div class="card-header">
                        <h5>MOTIF</h5>
                    </div>
                    <div class="card-body p-0">
                        <form class="form-inline" @submit.prevent="addMotif()">
                            <div class="form-group  mb-2">
                                <input type="text" class="form-control" v-model="motif.libelle" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mb-2"><i class="fa-solid fa-save"></i>
                                Enregistrer <span v-if="isLoading == true" class="spinner-border spinner-border-sm"
                                    aria-hidden="true"></span> </button>
                        </form>
                        <ul class="list-group list-group-flush" style="max-height: 200px; overflow-y: auto;">
                            <li class="list-group-item" @click="selectMotifLine(motif)" style="cursor: pointer;"
                                v-for="motif in motifs" :key="motif">
                                <i class="fa-solid fa-edit mr-1"></i> {{ motif.libelle }}
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    data() {
        return {
            isLoading: false,
            formeLoading: false,
            natureLoading: false,
            famLoading: false,
            categLoading: false,
            classeLoading: false,
            nature: {},
            categorie: {},
            classe: {},
            forme: {},
            famille: {},
            motif: {},
            formes: [],
            familles: [],
            classes: [],
            motifs: [],
            categories: [],
            natures: []

        }
    },
    mounted() {
        this.getFormes()
        this.getFamille()
        this.getNature()
        this.getClasses()
        this.getMotif()
        this.getCategorie()
    },
    methods: {
        selectFormeLine(line) {
            this.forme.libelle = line.libelle
            this.forme.id = line.id
            this.forme.type = 'edit'
        },
        addForme() {
            this.isLoading = true
            if (this.forme.type && this.forme.type == 'edit') {
                this.axios.post('/api/prod_formes/' + this.forme.id + '/update', this.forme).then(response => {
                    this.isLoading = false
                    if (response.data.success === true) {
                        this.forme = {}
                        this.getFormes()
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
            }
            else {
                this.axios.post('/api/prod_formes', this.forme).then(response => {
                    this.isLoading = false
                    if (response.data.success === true) {
                        this.forme = {}
                        this.getFormes()
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
            }

        },
        getFormes() {
            this.formeLoading = true
            this.axios.get('/api/prod_formes').then(response => {
                this.formes = response.data.data
                this.formeLoading = false
            }).catch(() => {
                this.formeLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },

        selectFamilleLine(line) {
            this.famille.libelle = line.libelle
            this.famille.id = line.id
            this.famille.type = 'edit'
        },
        addFamille() {
            this.famLoading = true
            if (this.famille.type && this.famille.type == 'edit') {
                this.axios.post('/api/prod_familles/' + this.famille.id + '/update', this.famille).then(response => {
                    this.famLoading = false
                    if (response.data.success === true) {
                        this.famille = {}
                        this.getFamille()
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
                    this.famLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })
            }
            else {
                this.axios.post('/api/prod_familles', this.famille).then(response => {
                    this.famLoading = false
                    if (response.data.success === true) {
                        this.famille = {}
                        this.getFamille()
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
                    this.famLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })
            }
        },
        getFamille() {
            this.famLoading = true
            this.axios.get('/api/prod_familles').then(response => {
                this.familles = response.data.data
                this.famLoading = false
            }).catch(() => {
                this.famLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        selectNatureLine(line) {
            this.nature.libelle = line.libelle
            this.nature.id = line.id
            this.nature.type = 'edit'
        },
        addNature() {
            this.narureLoading = true
            if (this.nature.type && this.nature.type == 'edit') {
                this.axios.post('/api/prod_natures/' + this.nature.id + '/update', this.nature).then(response => {
                    this.natureLoading = false
                    if (response.data.success === true) {
                        this.nature = {}
                        this.getNature()
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
                    this.natureLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }
            else {
                this.axios.post('/api/prod_natures', this.nature).then(response => {
                    this.natureLoading = false
                    if (response.data.success === true) {
                        this.nature = {}
                        this.getNature()
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
                    this.natureLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }
        },
        getNature() {
            this.natureLoading = true
            this.axios.get('/api/prod_natures').then(response => {
                this.natures = response.data.data
                this.natureLoading = false
            }).catch(() => {
                this.natureLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },

        selectClasseLine(line) {
            this.classe.libelle = line.libelle
            this.classe.id = line.id
            this.classe.type = 'edit'
        },
        addClasse() {
            this.classeLoading = true
            if (this.classe.type && this.classe.type == 'edit') {
                this.axios.post('/api/prod_classe_theraps/' + this.classe.id + '/update', this.classe).then(response => {
                    this.classeLoading = false
                    if (response.data.success === true) {
                        this.classe = {}
                        this.getClasses()
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
                    this.classeLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }
            else {
                this.axios.post('/api/prod_classe_theraps', this.classe).then(response => {
                    this.classeLoading = false
                    if (response.data.success === true) {
                        this.classe = {}
                        this.getClasses()
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
                    this.classeLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }
        },
        getClasses() {
            this.classeLoading = true
            this.axios.get('/api/prod_classe_theraps').then(response => {
                this.classes = response.data.data
                this.classeLoading = false
            }).catch(() => {
                this.classeLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        selectCategorieLine(line) {
            this.categorie.libelle = line.libelle
            this.categorie.id = line.id
            this.categorie.type = 'edit'
        },
        addCategorie() {
            this.categLoading = true
            if (this.categorie.type && this.categorie.type == 'edit') {
                this.axios.post('/api/prod_categories/' + this.categorie.id + '/update', this.categorie).then(response => {
                    this.categLoading = false
                    if (response.data.success === true) {
                        this.categorie = {}
                        this.getCategorie()
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
                    this.categLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }
            else {
                this.axios.post('/api/prod_categories', this.categorie).then(response => {
                    this.categLoading = false
                    if (response.data.success === true) {
                        this.categorie = {}
                        this.getCategorie()
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
                    this.categLoading = false
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Probleme de connexion',
                        detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                        life: 5000
                    });
                })

            }

        },
        getCategorie() {
            this.categLoading = true
            this.axios.get('/api/prod_categories').then(response => {
                this.categories = response.data.data
                this.categLoading = false
            }).catch(() => {
                this.categLoading = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })
        },
        selectMotifLine(line) {
            this.motif.libelle = line.libelle
            this.motif.id = line.id
            this.motif.type = 'edit'
        },
        addMotif() {
            this.isLoading = true
            if (this.motif.type && this.motif.type == 'edit') {
                this.axios.post('/api/mouv_motifs/' + this.motif.id + '/update', this.motif).then(response => {
                    this.isLoading = false
                    if (response.data.success === true) {
                        this.motif = {}
                        this.getMotif()
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

            }
            else {
                this.axios.post('/api/mouv_motifs', this.motif).then(response => {
                    this.isLoading = false
                    if (response.data.success === true) {
                        this.motif = {}
                        this.getMotif()
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

            }
        },
        getMotif() {
            this.isLoading = true
            this.axios.get('/api/mouv_motifs').then(response => {
                this.motifs = response.data.data
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
    }
})
</script>