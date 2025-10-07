import "primevue/resources/themes/bootstrap4-light-blue/theme.css"
import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DynamicDialog from 'primevue/dynamicdialog';
import DialogService from 'primevue/dialogservice';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import Image from 'primevue/image';
import FileUpload from 'primevue/fileupload';
import Editor from "primevue/editor";
import InputNumber from 'primevue/inputnumber';
import AutoComplete from 'primevue/autocomplete';
import ProgressBar from 'primevue/progressbar';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Chart from 'primevue/chart';
import SelectButton from 'primevue/selectbutton';
import SpeedDial from 'primevue/speeddial';
import MultiSelect from 'primevue/multiselect';
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import EpharmaTemplate from "@/layouts/EpharmaTemplate.vue";
import AsdecodeTable from "@/components/AsdecodeTable.vue";
import searchByKeyword from "@/components/searchByKeyword.vue";
import HourGlassLoader from "@/components/HourGlassLoader.vue";
import SectionVisibility from "@/components/SectionVisibility.vue";
import { FormatService } from '@/services/FormatService';

import 'jquery/dist/jquery'
import 'bootstrap/dist/js/bootstrap'

//parametres cors et la base url des requetes dans la spa
axios.defaults.withCredentials = true
axios.defaults.baseURL = store.getters.apiUrl

//si l'utilisateur s'est déjà connecté
const session = window.localStorage.getItem("epharma_asdecode_session");

if (session !== null) {
    const user = JSON.parse(session);
    store.commit('setAuthenticated', user);
}
  
// redirriger si l'utilisateur n'est pas connecté
// axios.interceptors.response.use((response: any) => {
//     if (response.status == 401) {
//         store.commit('clearUserData')
//         router.push({ name: 'login' })
//     } else {
//         return response
//     }
// },
//     (error) => {
//         if (error.response.status == 401) {
//             store.commit('clearUserData')
//             router.push({ name: 'login' })
//         }
//     },
// );

const app = createApp(App);

// Charger les informations de la pharmacie avant de lancer l'application
store.dispatch('fetchApiConfigurations').then(() => {
    
    app.use(PrimeVue);
    app.use(store)
    app.use(router)
    app.use(DialogService)
    app.use(ToastService)
    app.use(ConfirmationService)
    app.use(VueAxios, axios)
    app.component('EpharmaTemplate', EpharmaTemplate);
    app.component('AsdecodeTable', AsdecodeTable);
    app.component('searchByKeyword', searchByKeyword);
    app.component('DataTable', DataTable);
    app.component('DataTableColumn', Column);
    app.component('DynamicDialog', DynamicDialog);
    app.component('SearchDropdown', Dropdown);
    app.component('ProgressSpinner', ProgressSpinner);
    app.component('ShowImage', Image);
    app.component('FileUpload', FileUpload);
    app.component('TextEditor', Editor);
    app.component('InputNumber', InputNumber);
    app.component('AutoComplete', AutoComplete);
    app.component('ProgressBar', ProgressBar);
    app.component('DataView', DataView);
    app.component('DataViewLayoutOptions', DataViewLayoutOptions);
    app.component('ShowToast', Toast);
    app.component('TabView', TabView);
    app.component('TabPanel', TabPanel);
    app.component('ChartJS', Chart);
    app.component('SelectButton', SelectButton);
    app.component('SpeedDial', SpeedDial);
    app.component('MultiSelect', MultiSelect);
    app.component('ConfirmDialog', ConfirmDialog);
    app.component('HourGlassLoader', HourGlassLoader);
    app.component('SectionVisibility', SectionVisibility);

    // Ajout des fonctions globales
    app.config.globalProperties.$moneyFormat = FormatService.moneyFormat;
    app.config.globalProperties.$dateFormat = FormatService.dateFormat;
    app.config.globalProperties.$checkUrlFormat = FormatService.checkUrlFormat;

    app.mount('#app')
});