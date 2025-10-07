import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from './../store'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import NewPasswordView from '@/views/auth/NewPasswordView.vue'
import IndexUtilisateur from '@/views/admin/utilisateurs/IndexUtilisateur.vue'
import IndexProduit from '@/views/stock/produits/IndexProduit.vue'
import IndexCommande from '@/views/stock/commandes/IndexCommande.vue'
import IndexFournisseurs from '@/views/stock/fournisseurs/IndexFournisseur.vue'
import IndexBdd from '@/views/stock/bases_de_donnees/IndexBdd.vue'
import IndexRayon from '@/views/stock/rayons/IndexRayon.vue'
import IndexMouvement from '@/views/stock/mouvement/IndexMouvement.vue'
import IndexCaisse from '@/views/vente/caisse/IndexCaisse.vue'
import IndexClient from '@/views/vente/client/IndexClient.vue'
import IndexDevis from '@/views/vente/devis/IndexDevis.vue'
import IndexVente from '@/views/vente/ventes/IndexVente.vue'
import IndexConfiguration from '@/views/vente/configuration/IndexConfiguration.vue'
import IndexBilletage from '@/views/gestion/billetages/IndexBilletage.vue'
import IndexJournees from '@/views/gestion/journees/IndexJournees.vue'
import IndexGarde from '@/views/gestion/gardes/IndexGarde.vue'
import IndexInventaire from '@/views/gestion/inventaires/IndexInventaire.vue'
import IndexParametre from '@/views/admin/parametres/IndexParametre.vue'
import IndexReservations from '@/views/vente/reservations/IndexReservation.vue'
import IndexStatistique from '@/views/gestion/statistiques/IndexStatistique.vue'
import ShowReservationCaisse from '@/views/vente/caisse/ShowReservationCaisse.vue'
import ActivationView from '@/views/auth/VerificationApplication.vue'
import IndexRetour from '@/views/stock/retours/IndexRetour.vue'

interface ActivationState {
  token?: string;
  date_activation?: string;
}
const routes: Array<RouteRecordRaw> = [

  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      noHeader: true,
      noFooter: true
    }
  },
  {
    path: '/new-password',
    name: 'new.password',
    component: NewPasswordView
  },
  {
    path: '/admin/utilisateurs',
    name: 'utilisateurs',
    component: IndexUtilisateur,
    meta: { menuModule: 'admin', sousMenu: ['utilisateur'] }
  },

  {
    path: '/stock/produits',
    name: 'produit',
    component: IndexProduit,
    meta: { menuModule: 'stock', sousMenu: ['produit'] }
  },
   {
    path: '/stock/commandes',
    name:'commande',
    component:IndexCommande,
    meta: { menuModule: 'stock', sousMenu: ['commande'] }
  },
  {
    path : '/stock/fournisseurs',
    name:'fournisseurs',
    component:IndexFournisseurs,
    meta: { menuModule: 'stock', sousMenu: ['fournisseur'] }
  },
  {
    path : '/stock/retour-fournisseur',
    name:'retour-fournisseur',
    component:IndexRetour,
    meta: { menuModule: 'stock', sousMenu: ['retour'] }
  },
  {
    path:'/stock/database',
    name:'database',
    component:IndexBdd,
    meta: { menuModule: 'stock', sousMenu: ['base'] }
  },
  {
    path:'/stock/rayon',
    name:'rayon',
    component:IndexRayon,
    meta: { menuModule: 'stock', sousMenu: ['rayon'] }
  },
  {
    path:'/stock/mouvement',
    name:'mouvement',
    component:IndexMouvement,
    meta: { menuModule: 'stock', sousMenu: ['mouvement'] }
  },
  {
    path:'/vente/caisses',
    name:'caisse',
    component:IndexCaisse,
    meta: { menuModule: 'vente', sousMenu: ['caisse'] }
  },
  {
    path:'/vente/caisses/reservation/:id',
    name:'caisse.reservation',
    props: true,
    component:ShowReservationCaisse,
    meta: { menuModule: 'vente', sousMenu: ['caisse'] }
  },
  {
    path:'/vente/clients',
    name:'client',
    component:IndexClient,
    meta: { menuModule: 'vente', sousMenu: ['client'] }
  },
  {
    path:'/vente/devis',
    name:'devis',
    component:IndexDevis,
    meta: { menuModule: 'vente', sousMenu: ['devis'] }
  },
  {
    path:'/vente/dashboard',
    name:'dashboard',
    component:IndexVente,
    meta: { menuModule: 'vente', sousMenu: ['vente'] }
  },
  {
    path:'/vente/configuration',
    name:'configuration',
    component:IndexConfiguration,
    meta: { menuModule: 'vente', sousMenu: ['configuration'] }
  },
  {
    path:'/gestion/arrete-caisse',
    name:'arrete-caisse',
    component:IndexBilletage,
    meta: { menuModule: 'gestion', sousMenu: ['caisse'] }
  },
  {
    path:'/gestion/fin-journee',
    name:'fin-journee',
    component:IndexJournees,
    meta: { menuModule: 'gestion', sousMenu: ['journee'] }
  },
  {
    path:'/gestion/garde',
    name:'garde',
    component:IndexGarde,
    meta: { menuModule: 'gestion', sousMenu: ['garde'] }
  },
  {
    path:'/gestion/inventaire',
    name:'inventaire',
    component:IndexInventaire,
    meta: { menuModule: 'gestion', sousMenu: ['inventaire'] }
   },
  {
    path:'/admin/parametres',
    name:'parametres',
    component:IndexParametre,
    meta: { menuModule: 'gestion', sousMenu: ['parametre'] }
  },
  {
    path:'/vente/reservation',
    name:'reservation',
    component:IndexReservations,
    meta: { menuModule: 'gestion', sousMenu: ['reservation'] }
  },
  {
    path:'/gestion/statistique',
    name:'statistique',
    component:IndexStatistique,
    meta: { menuModule: 'gestion', sousMenu: ['stat'] }
  },
  {
    path: '/activation',
    name: 'activation',
    component: ActivationView, // remplacez ActivationView par le composant correspondant
    meta: {
      noHeader: true,
      noFooter: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Fonctions helpers avec typage
// Fonctions helpers avec typage explicite
function getActivationData(): ActivationState | null {
  try {
    const data = localStorage.getItem('activationData');
    if (!data) return null;
    
    const parsed = JSON.parse(data) as ActivationState;
    return parsed.token && parsed.date_activation ? parsed : null;
  } catch {
    return null;
  }
}

function checkActivation(data: ActivationState | null): data is ActivationState {
  return !!data?.token?.trim() && !!data?.date_activation?.trim();
}

router.beforeEach((to, from, next) => {
  // 1. Vérification de l'activation
  const activationData = getActivationData();
  const isActivated = checkActivation(activationData);

  // 2. Gestion de la page d'activation
  if (!isActivated) {
    return to.name === 'activation' ? next() : next({ name: 'activation' });
  }

  // 3. Empêcher l'accès à l'activation si déjà activé
  if (to.name === 'activation') {
    return next({ name: 'home' });
  }

  // 4. Vérification de l'authentification
  if (!store.getters.authenticated) {
    return to.name === 'login' ? next() : next({ name: 'login' });
  }

  
  
  // 5. Vérification du changement de mot de passe
  if (store.getters.user.must_change_password) {
    return to.name === 'new.password' ? next() : next({ name: 'new.password' });
  }
  // 6. redirection vers la page home si l'user est connecté et l'application est activé
  if (store.getters.authenticated && isActivated) {
    if (to.name === 'login' || to.name === 'activation') {
      return next({ name: 'home' });
    }
  }
  // 6. Autoriser l'accès
  next();
});
// Ajouter à la fin du router
router.afterEach((to) => {
  if (!to.matched.length) {
    router.replace('/');
  }
});
export default router