<template>
    <div class="container">
        <p class="h5">Paramètre de sauvegarde automatisé</p>
        <p class="h5">Enregistrez les paramètres de votre serveur de sauvegarde distant.</p>
        <div class="form-row">
            <div class="form-group col-md-4">
                <p>Remote IP</p>
                <input v-model="form.remoteIp" class="form-control border border-[#ccc]" type="text" 
                       pattern="^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$">
            </div>
            <div class="form-group col-md-4">
                <p>Remote Port</p>
                <input v-model="form.remotePort" class="form-control border border-[#ccc]" type="number">
            </div>
            <div class="form-group col-md-4">
                <p>Nom d'utilisateurs (FTP)</p>
                <input v-model="form.ftpUser" class="form-control border border-[#ccc]" type="text">
            </div>
            <div class="form-group col-md-4">
                <p>Mot de passe (FTP)</p>
                <input v-model="form.ftpPassword" class="form-control border border-[#ccc]" type="password">
            </div>
        </div>

        <button class="mt-4 bg-bleu2 text-white border border-bleu2" 
                @click="saveSettings"
                :disabled="loadingSave">
            Enregistrer les modifications
            <span v-if="loadingSave" class="spinner-border spinner-border-sm" role="status"></span>
        </button>
        <p class="mt-4">Backup manuel</p>
        <p>Utilisez la commande <span class="font-weight-bold">DUMP</span> pour enregistrer une archive de votre
            base
            données. Vous pouvez ensuite télécharger la sauvegarde et la conserver pour une restauration en cas
            <br> de
            problème. <br> La commande <span class="font-weight-bold"> RESTORE</span> sert à déployer
            manuellement une
            archive de la base de données local sur le serveur de sauvegarde distant.
        </p>
        <p class="text-gri2 font-weight-bold">Historique des sauvegardes</p>
        
        <ul class="list-group mb-4">
            <li v-for="backup in backups" :key="backup.id" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <span class="font-weight-bold">{{ formatDate(backup.created_at) }}</span>
                    <span class="text-muted ml-2">({{ backup.file_size }})</span>
                </div>
                <div>
                    <button 
                        class="btn btn-sm btn-outline-primary mr-2"
                        @click="downloadBackup(backup.id)">
                        <i class="fas fa-download"></i> Télécharger
                    </button>
                    <button 
                        class="btn btn-sm btn-outline-success"
                        @click="restoreBackup(backup.id)"
                        :disabled="restoring">
                        <span v-if="restoring" class="spinner-border spinner-border-sm" role="status"></span>
                        <span v-else><i class="fas fa-undo"></i> Restaurer</span>
                    </button>
                </div>
            </li>
            
            <li v-if="backups && backups.length === 0" class="list-group-item">
                Aucune sauvegarde disponible
            </li>
        </ul>
        
        <p class="text-gri2 font-weight-bold">Dernière restauration automatique (Restore) <br> <span
                class="text-dark">26/04/2024 22:44</span> </p>
        <div class="d-flex">
            <button class="bg-bleu2 text-white border border-bleu2" @click="dumbMaj">Dump
                <span v-if="loadingDumb == true" class="spinner-border spinner-border-sm" role="status"
                aria-hidden="true"></span>
            </button>
          
        </div><br><br>
        <p class="font-weight-bold">Mise à jour</p>
        <p>Votre infrastructure ePharma est constitué de deux applications dont les mises à jours sont gérées de
            façon
            indépendente. Les boutons ci-dessous vous donne la possibilité de <br> télécharger les nouvelles
            mise à jour
            de chaque application si il y'en a.<br>
            *En cas de mise à jour majeur, vous recevrez une notification de la part du support technique de
            ePharma.
        </p>
        <p class="text-gri2 font-weight-bold">Actions</p>
        <CheckUpdateButton />
        <!-- <div class="d-flex">
            <button class="bg-bleu2 text-white border border-bleu2">Vérifier la derniere mises à jour
            </button>
           
        </div><br><br> -->
        <!-- <div class="d-flex">
            <div>
                <p class="font-weight-bold">Accès à distance</p>
                <p>Enregistrer les nouveaux paramètres d'accès distant.</p>
            </div>
            <div class="ml-4">
                <p class="font-weight-bold">Version</p>
                <p>15.05.2023 2.1.1</p>
            </div>
        </div>

        <div class="d-flex">
            <div>
                <p>IP Backend</p>
                <button class="bg-bleu2 text-white border border-bleu2">Vérifier IP Backend</button>
            </div>
            <div class="ml-4">
                <p class="ml-5">IP SSH</p>
                <button class="bg-bleu2 text-white border border-bleu2">Vérifier IP SSH</button>
            </div>
        </div> -->
    </div>
</template>
<script>
import CheckUpdateButton from './CheckUpdateButton.vue'
export default{
    components: {
        CheckUpdateButton
    },
    data(){
        return {
            loadingDumb:false,
            backups: [],
            restoring: false,
            loadingBackups: false,
            loadingSave: false,
            form: {
                remoteIp: '',
                remotePort: '',
                ftpUser: '',
                ftpPassword: ''
            }
        }
    },methods:{
        async fetchBackups() {
            this.loadingBackups = true;
            try {
                const response = await this.axios.get('/api/backups');
                this.backups = response.data.data || []; // Fallback sur un tableau vide
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec du chargement des sauvegardes',
                    life: 5000
                });
            } finally {
                this.loadingBackups = false;
            }
        },
        async saveSettings() {
            this.loadingSave = true;
            try {
                // Validation simple
                if (!this.form.remoteIp || !this.form.remotePort) {
                    throw new Error('Les champs IP et Port sont obligatoires');
                }

                const response = await this.axios.post('/api/pharmacie-sftp', {
                    remote_ip: this.form.remoteIp,
                    remote_port: this.form.remotePort,
                    ftp_username: this.form.ftpUser,
                    ftp_password: this.form.ftpPassword
                });

                if (response.data.success) {
                    this.$toast.add({
                        severity: 'success',
                        detail: 'Paramètres sauvegardés avec succès',
                        life: 3000
                    });
                } else {
                    throw new Error(response.data.message || 'Erreur lors de la sauvegarde');
                }
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.response?.data?.message || error.message,
                    life: 5000
                });
            } finally {
                this.loadingSave = false;
            }
        },

        async downloadBackup(id) {
            try {
                // Solution 1: Téléchargement via nouvelle fenêtre
                window.open(`/api/backup/download/${id}`, '_blank');
                
                // Solution 2: Téléchargement automatique
                /*const response = await this.axios.get(`/api/backup/download/${id}`, {
                    responseType: 'blob'
                });
                
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `backup-${id}.zip`);
                document.body.appendChild(link);
                link.click();
                link.remove();*/
                
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec du téléchargement',
                    life: 5000
                });
            }
        },

        async restoreBackup(id) {
            this.restoring = true;
            try {
                const response = await this.axios.post(`/api/backup/restore/${id}`);
                
                this.$toast.add({
                    severity: 'success',
                    detail: response.data.message,
                    life: 5000
                });
                
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec de la restauration',
                    life: 5000
                });
            } finally {
                this.restoring = false;
            }
        },
        dumbMaj() {
            this.loadingDumb = true
            this.axios.post( '/api/backup-database').then(response => {
                this.loadingDumb = false
                if (response.data.success === true) {
                    
                    this.resetForm()
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
                this.loadingDumb = false
                this.$toast.add({
                    severity: 'error',
                    summary: 'Probleme de connexion',
                    detail: 'Une erreur s\'est produite lors de la connexion au serveur !',
                    life: 5000
                });
            })

        },formatDate(dateString) {
            const options = { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('fr-FR', options);
        }
    },
    mounted() {
        this.fetchBackups();
    }
    
}
</script>

<style>
.list-group-item {
    transition: all 0.3s ease;
}

.btn-outline-primary:hover {
    background-color: #007bff;
    color: white !important;
}

.btn-outline-success:hover {
    background-color: #28a745;
    color: white !important;
}

.fas {
    margin-right: 5px;
}
</style>