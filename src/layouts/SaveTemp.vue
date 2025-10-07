<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <a class="navbar-brand" href="#">
            <div class="pr-3 border-secondary border-right">
                <img src="/img/icons/epgbe.png" alt="" id="imglogo1epharma">
            </div>
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
                <div class="nav-item dropdown "  
                    @click="toggleDropdown('admin')">
                    <router-link :to="{ name: 'admin' }" class="nav-link"
                        :class="{ 'active': this.$route.name === 'admin' }">
                        ADMIN
                    </router-link>
                    <div class="ml-70%">
                        <div class="dropdown-menu" :class="{ show: dropdownOpen['admin'] }">
                            <router-link class="dropdown-item" :to="{ name: 'utilisateurs' }">
                                <i class="fas fa-users"></i>
                            <p class="font-weight-bold d-flex justify-content-center">Utilisateurs</p>
                            </router-link>

                            <router-link :to="{ name: 'parametres' }" class="dropdown-item">
                                <i class="fas fa-cogs"></i>
                            <p class="font-weight-bold d-flex justify-content-center">Parametres</p>
                            </router-link>
                        </div>
                      </div>
                </div>
                <div class="nav-item dropdown"
                    @click="toggleDropdown('stock')">
                    <router-link :to="{ name: 'stock' }" class="nav-link"
                        :class="{ 'active': this.$route.name === 'stock' }">
                        STOCK
                    </router-link>
                    <div class="dropdown-menu dropdown-stock " :class="{ show: dropdownOpen['stock'] }" >     
                        <router-link :to="{ name: 'produit' }" class="dropdown-item">
                            <div class="d-flex flex-column pt-2">
                                <div class="d-flex justify-content-center"> <i
                                        class="fas fa-prescription-bottle-alt"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Produits</p>
                            </div>
                        </router-link>

                        <router-link :to="{ name: 'commande' }" class="dropdown-item">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-shipping-fast"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Commandes</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'fournisseurs' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-briefcase"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Fournisseurs</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'database' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="	fas fa-database"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Bases de données</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'rayon' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-stairs"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Rayon</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'mouvement' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-person-walking"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Mouvement</p>
                            </div>
                        </router-link>
                    
                    </div>
                </div>

                <div class="nav-item dropdown" 
                    @click="toggleDropdown('vente')">
                    <router-link :to="{ name: 'vente' }" class="nav-link"
                        :class="{ 'active': this.$route.name === 'vente' }">
                        VENTE
                    </router-link>
                    <div class="dropdown-menu" :class="{ show: dropdownOpen['vente'] }">
                        <router-link class="dropdown-item" :to="{ name: 'reservation' }">
                            <div class="d-flex flex-column pt-2">
                                <div class="d-flex justify-content-center"><i class="fas fa-medkit"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Reservations</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'caisse' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-cash-register"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Caisses</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'client' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-user-circle"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Clients</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'devis' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-file-invoice"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Devis</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'dashboard' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-money-bill"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Ventes</p>
                            </div>
                        </router-link>
                        <router-link class="dropdown-item" :to="{ name: 'configuration' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fas fa-cogs"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Configurations</p>
                            </div>
                        </router-link>
                    </div>
                </div>

                <div class="nav-item dropdown" 
                     @click="toggleDropdown('gestion')">
                    <router-link :to="{ name: 'gestion' }" class="nav-link"
                        :class="{ 'active': this.$route.name === 'gestion' }">
                        GESTION
                    </router-link>
                    <div class="dropdown-menu" :class="{ show: dropdownOpen['gestion'] }">
                        <router-link class="dropdown-item" :to="{ name: 'arrete-caisse' }">
                            <div class="d-flex flex-column pt-2">
                                <div class="d-flex justify-content-center"><i class="fas fa-money-bill"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Billetages</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'fin-journee' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-circle-info"></i></div>
                                <p class="font-weight-bold d-flex justify-content-center">Journées</p>
                            </div>
                        </router-link>

                        <router-link class="dropdown-item" :to="{ name: 'garde' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-moon"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Gardes</p>
                            </div>
                        </router-link>
                        <router-link class="dropdown-item" :to="{ name: 'inventaire' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-boxes-stacked"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Inventaires</p>
                            </div>
                        </router-link>
                        <router-link class="dropdown-item" :to="{ name: 'statistique' }">
                            <div class="d-flex flex-column pt-1">
                                <div class="d-flex justify-content-center"><i class="fa-solid fa-chart-simple"></i>
                                </div>
                                <p class="font-weight-bold d-flex justify-content-center">Statistiques</p>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>

            <nav-bar></nav-bar>

            <!-- espace compte utilisateur  -->
            <div class="d-flex ml-auto align-items-center">
                <div class="text-white mr-3">
                    <i class="fa-regular fa-circle-user mr-1"></i> AD E-PHARMA
                </div>
                <div>
                    <button type="button" class="btn text-white">
                        se déconnecter
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <div class=" border-bottom mb-2" style="margin-top: 60px;">
        <div class="container-fluid d-flex justify-content-between align-items-center text-bleu2 py-2 px-3 ">
            <div>
                <h3 class="font-weight-bold">
                    <slot name="page_title"></slot>
                </h3>
            </div>
            <div>
                <h2 class="font-weight-bold">
                    <slot name="page_counter"></slot>
                </h2>
            </div>
        </div>
    </div>

    <div class="container-fluid">
        <slot name="content"></slot>
    </div>
</template>


<script>
import NavBar from './NavBar.vue';

export default {
    name: 'DropdownNavCard',
    components: { NavBar },
    data() {
        return {
            dropdownOpen: {
                admin: false,
                stock: false,
                vente: false,
                gestion: false
            }
        };
    },
    methods: {
        showDropdown(menu) {
            this.dropdownOpen[menu] = true;
        },
        hideDropdown(menu) {
            this.dropdownOpen[menu] = false;
        },
        toggleDropdown(menu) {
            this.dropdownOpen[menu] = !this.dropdownOpen[menu];
        }
    }
};
</script>

<style scoped>
.horizontal-dropdown-menu {
    display: flex;
    flex-direction: row;
  
}

.dropdown-menu.show {
    display: flex;
    justify-content: center; /* Centrer horizontalement */
    /* position: absolute; */
     margin-left: 50vh; /*Centrer à 50% de la largeur de son parent */
     margin-right: 50%;
    transform: translateX(-35%);
    z-index: 1000;
    
}

.dropdown-menu.dropdown-stock{
 
    justify-content: center; /* Centrer horizontalement */
    position: absolute;
    /* left: 20%; Centrer à 50% de la largeur de son parent */
    transform: translateX(-20%);
    z-index: 1000;
}


#imglogo1epharma{
     width:30px;
}
</style>





<!-- <template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <a class="navbar-brand" href="#">
            <div class="pr-3 border-secondary border-right">
                <img src="/img/icons/epgbe.png" alt="" id="imglogo1epharma">
            </div>
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav mr-auto">
                <a href="#ADMIN" class="nav-link" :class="{ 'active': this.$route.name === 'admin' }">
                    ADMIN
                </a>
                <a href="#STOCK" class="nav-link" :class="{ 'active': this.$route.name === 'stock' }">
                    STOCK
                </a>
                <a href="#VENTE" class="nav-link"
                    :class="{ 'active': this.$route.name === 'vente' }">
                    VENTE
                </a>
                <a href="#GESTION" class="nav-link"
                    :class="{ 'active': this.$route.name === 'gestion' }">
                    GESTION
                </a>
            </div>

            <div class="dropdown">
                <button type="button" class="btn rounded-circle" :class="{ 'text-white border': DropdownIsOpen == true }"
                    @click="toggleDropdown">
                    <i class="fa-solid fa-circle-chevron-down text-secondary"></i>
                </button>
                <div ref="dropdownMenu" class="dropdown-menu p-0 mt-3">
                    <div class="shadow-lg card">
                        <div class="card-body">
                            <nav class="nav #d-flex justify-content-center">
                                <slot name="sous_menu"></slot>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex ml-auto align-items-center">
                <div class="text-white  mr-3">
                    <i class="fa-regular fa-circle-user mr-1"></i> AD E-PHARMA
                </div>
                <div>
                    <router-link :to="{ name: 'login' }">
                        <button type="button" class="btn text-white">
                        se déconnecter
                    </button>
                   </router-link>
                </div>
            </div>
        </div>
    </nav>
    <div class=" border-bottom mb-2" style="margin-top: 60px;">
        <div class="container-fluid d-flex justify-content-between align-items-center text-bleu2 py-2 px-3 ">
            <div>
                <h3 class="font-weight-bold">
                    <slot name="page_title"></slot>
                </h3>
            </div>
            <div>
                <h2 class="font-weight-bold">
                    <slot name="page_counter"></slot>
                </h2>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <slot name="content"></slot>
    </div>
</template>

<script>
import $ from 'jquery';

export default {
    name: 'DropdownNavCard',
    data() {
        return {
            DropdownIsOpen: false
        }
    },
    methods: {
        toggleDropdown() {
            if (this.DropdownIsOpen == true) {
                this.DropdownIsOpen = false
            } else this.DropdownIsOpen = true
            $(this.$refs.dropdownMenu).slideToggle('slow');
        }
    }
};
</script>

<style scoped>
.dropdown-menu {
    width: 100%;
    padding: 0;
    display: none;
}

.card {
    width: 100%;
}

#imglogo1epharma {
    width: 30px;
}
</style> -->