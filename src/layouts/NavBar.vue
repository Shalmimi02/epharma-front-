<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" v-if="this.$store.getters.authenticated">
        <a class="navbar-brand" href="/">
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
                <a href="#ADMIN" v-if="hasPermissionForMenu('ADMIN')" class="nav-link" @click.prevent="toggleSubMenu('ADMIN')"
                    :class="{ 'active': this.$route.name === 'admin' }">
                    ADMIN
                </a>
                <a href="#STOCK" v-if="hasPermissionForMenu('STOCK')" class="nav-link" @click.prevent="toggleSubMenu('STOCK')"
                    :class="{ 'active': this.$route.name === 'stock' }">
                    STOCK
                </a>
                <a href="#VENTE" v-if="hasPermissionForMenu('VENTE')" class="nav-link" @click.prevent="toggleSubMenu('VENTE')"
                    :class="{ 'active': this.$route.name === 'vente' }">
                    VENTE
                </a>
                <a href="#GESTION" v-if="hasPermissionForMenu('GESTION')" class="nav-link" @click.prevent="toggleSubMenu('GESTION')"
                    :class="{ 'active': this.$route.name === 'gestion' }">
                    GESTION
                </a>
            </div>

            <transition name="fade-slide">
                <div v-if="activeMenu" class="submenu-container">
                    <div class="submenu-content d-flex justify-content-center">

                        <nav class="nav text-center" v-if="activeMenu == 'ADMIN'">
                            <router-link v-if="hasPermission('ADMIN', 'utilisateur')" class="nav-link" :to="{ name: 'utilisateurs' }"
                                :class="{ 'active': this.$route.name === 'utilisateurs' }">
                                <i class="fas fa-users"></i>
                                <p class="font-weight-bold">Utilisateurs</p>
                            </router-link>
                            <router-link v-if="hasPermission('ADMIN', 'parametre')" :to="{ name: 'parametres' }" class="nav-link"
                                :class="{ 'active': this.$route.name === 'parametres' }">
                                <i class="fas fa-cogs"></i>
                                <p class="font-weight-bold">Parametres</p>
                            </router-link>
                        </nav>

                        <nav class="nav text-center" v-if="activeMenu == 'STOCK' && hasPermissionForMenu('STOCK')">
                            <router-link v-if="hasPermission('STOCK', 'produits')" :to="{ name: 'produit' }" class="nav-link"
                                :class="{ 'active': this.$route.name === 'produit' }">
                                <i class="fas fa-prescription-bottle-alt"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Produits</p>
                            </router-link>
                            <router-link v-if="hasPermission('STOCK', 'commande') " :to="{ name: 'commande' }" class="nav-link"
                                :class="{ 'active': this.$route.name === 'commande' }">
                                <i class="fas fa-shipping-fast"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Commandes</p>
                            </router-link>
                            <router-link v-if="hasPermission('STOCK', 'fournisseur') " class="nav-link" :to="{ name: 'fournisseurs' }"
                                :class="{ 'active': this.$route.name === 'fournisseurs' }">
                                <i class="fas fa-briefcase"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Fournisseurs</p>
                            </router-link>
                            <router-link v-if="hasPermission('STOCK', 'base') " class="nav-link" :to="{ name: 'database' }"
                                :class="{ 'active': this.$route.name === 'database' }">
                                <i class="fas fa-database"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Bases de données</p>
                            </router-link>
                            <router-link v-if="hasPermission('STOCK', 'rayon') " class="nav-link" :to="{ name: 'rayon' }"
                                :class="{ 'active': this.$route.name === 'rayon' }">
                                <i class="fa-solid fa-stairs"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Rayon</p>
                            </router-link>
                             <router-link v-if="hasPermission('STOCK', 'retour') " class="nav-link" :to="{ name: 'retour-fournisseur' }"
                                :class="{ 'active': this.$route.name === 'retour-fournisseur' }">
                                <i class="fa-solid fa-person-walking"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Retour-fournisseur</p>
                            </router-link>
                            <router-link v-if="hasPermission('STOCK', 'mouvement') " class="nav-link" :to="{ name: 'mouvement' }"
                                :class="{ 'active': this.$route.name === 'mouvement' }">
                                <i class="fa-solid fa-person-walking"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Mouvement</p>
                            </router-link>
                        </nav>

                        <nav class="nav text-center" v-if="activeMenu == 'VENTE' && hasPermissionForMenu('VENTE')">
                            <router-link v-if="hasPermission('VENTE', 'reservation')" class="nav-link" :to="{ name: 'reservation' }"
                                :class="{ 'active': this.$route.name === 'reservation' }">
                                <i class="fas fa-medkit"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Reservations</p>
                            </router-link>
                            <router-link v-if="hasPermission('VENTE', 'caisse') " class="nav-link" :to="{ name: 'caisse' }"
                                :class="{ 'active': this.$route.name === 'caisse' }">
                                <i class="fas fa-cash-register"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Caisses</p>
                            </router-link>
                            <router-link v-if="hasPermission('VENTE', 'client') " class="nav-link" :to="{ name: 'client' }"
                                :class="{ 'active': this.$route.name === 'client' }">
                                <i class="fas fa-user-circle"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Clients</p>
                            </router-link>
                            <router-link v-if="hasPermission('VENTE', 'devis') " class="nav-link" :to="{ name: 'devis' }"
                                :class="{ 'active': this.$route.name === 'devis' }">
                                <i class="fas fa-file-invoice"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Devis</p>
                            </router-link>
                            <router-link v-if="hasPermission('VENTE', 'vente') " class="nav-link" :to="{ name: 'dashboard' }"
                                :class="{ 'active': this.$route.name === 'dashboard' }">
                                <i class="fas fa-money-bill"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Ventes</p>
                            </router-link>
                            <router-link v-if="hasPermission('VENTE', 'configuration') " class="nav-link" :to="{ name: 'configuration' }"
                                :class="{ 'active': this.$route.name === 'configuration' }">
                                <i class="fas fa-cogs"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Configurations</p>
                            </router-link>
                        </nav>

                        <nav class="nav text-center" v-if="activeMenu == 'GESTION' && hasPermissionForMenu('GESTION') ">
                            <router-link v-if="hasPermission('GESTION', 'billetage')" class="nav-link" :to="{ name: 'arrete-caisse' }" :class="{ 'active': this.$route.name === 'arrete-caisse' }">
                                <i class="fas fa-money-bill"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Billetages</p>
                            </router-link>
                            <router-link v-if="hasPermission('GESTION', 'journee')" class="nav-link" :to="{ name: 'fin-journee' }" :class="{ 'active': this.$route.name === 'fin-journee' }">
                                <i class="fa-solid fa-circle-info"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Journées</p>
                            </router-link>
                            <router-link v-if="hasPermission('GESTION', 'garde')" class="nav-link" :to="{ name: 'garde' }"
                                :class="{ 'active': this.$route.name === 'garde' }">
                                <i class="fa-solid fa-moon"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Gardes</p>
                            </router-link>
                            <router-link v-if="hasPermission('GESTION', 'inventaire')" class="nav-link" :to="{ name: 'inventaire' }"
                                :class="{ 'active': this.$route.name === 'inventaire' }">
                                <i class="fa-solid fa-boxes-stacked"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Inventaires</p>
                            </router-link>
                            <router-link  v-if="hasPermission('GESTION', 'stat')" class="nav-link" :to="{ name: 'statistique' }" :class="{ 'active': this.$route.name === 'statistique' }">
                                <i class="fa-solid fa-chart-simple"></i>
                                <p class="font-weight-bold d-flex justify-content-center">Statistiques</p>
                            </router-link>
                        </nav>

                    </div>
                </div>
            </transition>

            <div class="dropdown">
                <button v-if="activeMenu != null" type="button" class="btn rounded-circle text-white border"
                    @click="closeSubMenu">
                    <i class="fa-solid fa-circle-chevron-down " style="font-size: 1.1rem;"></i>
                </button>
            </div>

            <div class="d-flex ml-auto align-items-center">
                <notification-button class="mr-3" />
                <div class="text-white  mr-3">
                    <i class="fa-regular fa-circle-user mr-1"></i> {{ this.$store.getters.user.fullname }}
                </div>
                <div>
                    <button type="button" class="btn text-white" @click="logout()">
                        Se déconnecter <span v-if="isLoading == true" class="spinner-border spinner-border-sm"
                            role="status" aria-hidden="true"></span>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import NotificationButton from '@/components/NotificationButton.vue'; 
export default {
    name: 'NavigationBar',
    components: {
        NotificationButton // on déclare le composant ici
    },
    data() {
        return {
            isLoading: false,
            activeMenu: null,
        };
    },
    methods: {
        hasPermission(menuName, submenuName) {
            if (!this.$store.getters.habilitations) {
                return false;
            }
            const permission = this.$store.getters.habilitations.find((perm) => perm.menu === menuName);
            return permission && permission.submenus.includes(submenuName);
        },
        hasPermissionForMenu(menuName) {
            if (!this.$store.getters.habilitations) {
                return false;
            }
            const permission = this.$store.getters.habilitations.find((perm) => perm.menu === menuName);
            return permission && permission.submenus.length > 0;
        },
        toggleSubMenu(menu) {
            this.activeMenu = this.activeMenu === menu ? null : menu;
        },
        closeSubMenu() {
            this.activeMenu = null;
        },
        logout() {
            this.isLoading = true
            this.$router.push({name: 'login'})
            this.$store.commit('clearUserData')
            this.axios.post('/api/logout').then(response => {
                if (response.data.success === true) {
                    this.$toast.add({
                        severity: 'success',
                        detail: response.data.message,
                        life: 3000
                    });
                }
                else {
                    response.data.errors.forEach(element => {
                        this.$toast.error(element, {
                            duration: '8000',
                            position: 'top-left'
                        })
                    });
                }
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
};
</script>

<style scoped>
.submenu-container .nav-link {
    color: black !important;
}

.submenu-container .nav-link:hover,
.active {
    color: rgb(64, 87, 156) !important;
}

.submenu-container {
    position: absolute;
    top: 65px;
    /* Adjust according to your needs */
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}

.submenu-container::before {
    content: '';
    position: absolute;
    top: -10px;
    /* Ajustez pour que l'ombre commence juste au-dessus de la div */
    left: 0;
    right: 0;
    height: auto;
    z-index: -1;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
    width: 100vw;
    /* S'assurer que l'ombre prend toute la largeur de l'écran */
}

.submenu-content {
    background-color: white;
    padding: 5px;
    border-radius: 14px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    min-width: 500px;
    max-width: 100%;
    min-height: 60px;
    animation: fadeIn 0.3s ease-out, slideDown 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-10px);
    }

    to {
        transform: translateY(0);
    }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

#imglogo1epharma {
    width: 30px;
}
</style>
