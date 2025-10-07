import { createStore } from 'vuex'
import router from '../router'
import axios from 'axios';

interface User {
  id: number,
  photo: string,
  name: string,
  fullname: string,
  email: string,
  role: string,
  must_change_password: string,
  adresse: string,
  boite_postale: string,
  ville: string,
  date_naissance: Date,
  sexe: string,
  poste: string,
  token: string,
  telephone: string,
  is_enabled: boolean,
  is_admin: boolean,
  habilitations: any | null,
}

interface Pharmacie {
  logo: string,
  nom_pharmacie: string,
  adresse: string,
  capital: string,
  statut_juridique: string,
  rccm: string,
  nif: string,
  telephone1: string,
  telephone2: string,
  email: string,
  site_web: string,
  devise: string,
  bp: string,
  slogan: string
}

interface State {
  appIsLoading: boolean,
  authenticated: boolean,
  caisseAuthenticated: boolean,
  caisseConnected: string,
  api_url: string;
  superviseurApi: string;
  tva: number;
  css: number;
  habilitations: any | null,
  user: User | null; // Utilisateur unique ou null
  pharmacie: Pharmacie | null; // Pharmacie unique ou null
}

export default createStore({
  state: {
    appIsLoading: false,
    authenticated: false,
    api_epharma_update: '',
    caisseAuthenticated: false,
    caisseConnected: '',
    api_url: process.env.VUE_APP_API_URL || 'http://127.0.0.1:9090',
    superviseurApi: 'https://epharma-panel.srv557357.hstgr.cloud',
    // api_url: 'https://demo2.srv557357.hstgr.cloud',
    // superviseurApi: 'http://localhost:9099',
    tva: 0.18,
    css: 0.01,
    habilitations: null,
    user: null, // Initialiser à null car pas d'utilisateur par défaut
    pharmacie: null,
    timezone: 'Africa/Libreville',
  } as State,
  getters: {
    appIsLoading: (state: State) => state.appIsLoading,
    authenticated: (state: State) => state.authenticated,
    user: (state: State) => state.user,
    pharmacie: (state: State) => state.pharmacie,
    habilitations: (state: State) => state.habilitations,
    caisseAuthenticated: (state: State) => state.caisseAuthenticated,
    caisseConnected: (state: State) => state.caisseConnected,
    apiComptes: (state: State) => state.api_url,
    apiStock: (state: State) => state.api_url,
    apiVentes: (state: State) => state.api_url,
    apiUrl: (state: State) => state.api_url,
    apiSuperviseur: (state: State) => state.superviseurApi,
    tva: (state: State) => state.tva,
    css: (state: State) => state.css,
  },
  mutations: {
    setApiUrl(state: State, url: string) {
      state.api_url = url;
    },
    setUserHabilitations(state: State, value: User) {
      state.habilitations = value.habilitations
    },
    setAuthenticated(state: State, value: User) {
      state.appIsLoading = true
      state.authenticated = true
      state.user = value
      if (value.is_admin) {
        state.habilitations = [
          { menu: 'ADMIN', submenus: ['utilisateur', 'parametre'] },
          { menu: 'STOCK', submenus: ['produits', 'commande', 'base', 'fournisseur', 'rayon', 'retour', 'mouvement'] },
          { menu: 'GESTION', submenus: ['billetage', 'stat', 'inventaire', 'journee', 'garde'] },
          { menu: 'VENTE', submenus: ['client', 'caisse', 'reservation', 'devis', 'vente', 'configuration'] },
          { menu: 'PRIVILEGES', submenus: ['inventaire_master', 'inventaire_mobile'] },
        ]
      } else state.habilitations = value.habilitations
      window.localStorage.setItem('epharma_asdecode_session', JSON.stringify(value))
      state.appIsLoading = false
    },
    setAuthenticatedCaisse(state: State, value: string) {
      state.caisseAuthenticated = true
      state.caisseConnected = value
    },
    clearAuthenticatedCaisse(state: State) {
      state.caisseAuthenticated = false
      state.caisseConnected = ''
    },
    setIsLoading(state: State, value: boolean) {
      state.appIsLoading = value
    },
    clearUserData(state: State) {
      state.appIsLoading = true
      state.authenticated = false
      state.user = null
      window.localStorage.removeItem('epharma_asdecode_session')
      state.appIsLoading = false
      router.push({ name: 'login' })
    },
    setUserProfileDatas(state: State, value: User) {
      state.appIsLoading = true
      state.user = value
      window.localStorage.setItem('epharma_asdecode_session', JSON.stringify(value))
      state.appIsLoading = false
    },
    setPharmacieDatas(state: State, value: Pharmacie) {
      state.pharmacie = value
    },
  },
  actions: {
    async fetchApiConfigurations({ commit, state }: { commit: Function, state: State }) {
      let apiUrl = state.api_url;

      const hostname = window.location.hostname;
      const isNgrok = hostname.includes(".ngrok-free.app");
      const isNgrokFree = hostname.includes(".ngrok.app");

      if (isNgrok || isNgrokFree) {
        // Met à jour le state et configure axios avant d’effectuer l’appel API
        apiUrl = "https://"+hostname;
        commit('setApiUrl', apiUrl);
        axios.defaults.baseURL = apiUrl;
      }
      else {
        // Maintenant, faites l’appel à l’API pour récupérer les infos de la pharmacie
        try {
          const response = await axios.get('/api/pharmacie-info');
          commit('setPharmacieDatas', response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des informations de la pharmacie:", error);
        }
      }

    },
  },
  modules: {}
})  