<template>
  <div class="relative">
    <!-- Bouton Notification -->
    <button class="notification" @click="toggleSidebar">
      <div class="bell-container">
        <div class="bell"></div>
      </div>
      <!-- Affichage du compteur de notifications via un span -->
      <span v-if="notificationsCount > 0" class="notif-counter">
        {{ notificationsCount }}
      </span>
    </button>

    <!-- Sidebar coulissante -->
    <transition name="slide-in-right">
      <aside v-if="isOpen" class="sidebar-notifications">
        <!-- En-tête fixe de la sidebar -->
        <div class="sidebar-header">
          <h3 class="sidebar-title">Notifications</h3>
          <button class="close-btn" @click="toggleSidebar">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <!-- Conteneur scrollable pour la liste des notifications -->
        <div class="notifications-wrapper">
          <ul class="notifications-list">
            <!-- Si aucune notification n'est disponible -->
            <li v-if="normalizedNotifications.length === 0">
              <h5 class="text-muted text-center">Aucune notification disponible</h5>
            </li>
            <!-- Affichage des notifications -->
            <li
              v-for="notif in normalizedNotifications"
              :key="notif.id"
              class="notification-item"
              :class="{ 'read-notification': notif.read_at !== null }"
            >
              <h4>{{ notif.libelle }}</h4>
              <p>{{ notif.description }}</p>
              <!-- Bouton de détails si la notification possède des produits -->
              <div v-if="notif.hasProduits" class="produits-container">
                <button class="details-btn" @click="toggleDetails(notif.id)">
                  Voir détails 
                  <i :class="expanded[notif.id] ? 'fa-solid fa-triangle-up' : 'fa-solid fa-triangle-down'"></i>
                </button>
                <!-- Liste déroulante des produits avec transition -->
                <transition name="slide-down">
                  <ul v-if="expanded[notif.id]" class="produits-list">
                    <li 
                      v-for="(prod, idx) in notif.produits" 
                      :key="idx">
                      {{ prod.produit_libelle }} {{ prod.date_expiration }}
                    </li>
                  </ul>
                </transition>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'NotificationButton',
  data() {
    return {
      isOpen: false,            // État d'ouverture/fermeture de la sidebar
      notifications: [],        // Notifications récupérées depuis l'API
      intervalId: null,         // Pour stocker l'ID du setInterval
      expanded: {}              // Objet pour suivre les notifications déroulées (par id)
    };
  },
  computed: {
    notificationsCount() {
      // Ne compte que les notifications non lues (read_at === null)
      return this.notifications.filter(notif => notif.read_at === null).length;
    },
    /**
     * Normalise et trie les notifications :
     * - Tente de parser notif.data si c'est une chaîne JSON.
     * - Extrait "libelle" (ou "title") et "description" (ou "message").
     * - Si data contient un objet (ou tableau) "produits", on le conserve et on définit hasProduits.
     * - Trie pour que les notifications non lues apparaissent en premier, puis par date décroissante.
     */
    normalizedNotifications() {
      return this.notifications
        .map(notif => {
          let data = notif.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              data = {};
            }
          }
          return {
            ...notif,
            libelle: data.libelle || data.title || 'Sans libellé',
            description: data.description || data.message || 'Aucune description disponible',
            produits: data.produits
              ? (Array.isArray(data.produits) ? data.produits : [data.produits])
              : [],
            hasProduits: !!data.produits
          };
        })
        .sort((a, b) => {
          // Notifications non lues en premier
          if (a.read_at === null && b.read_at !== null) return -1;
          if (a.read_at !== null && b.read_at === null) return 1;
          // Ensuite, tri par date de création décroissante
          return new Date(b.created_at) - new Date(a.created_at);
        });
    }
  },
  mounted() {
    // Chargement initial des notifications
    this.fetchNotifications();
    // Mise en place d'un polling toutes les 5 minutes
    this.intervalId = setInterval(() => {
      this.fetchNotifications();
    }, 300000); // 300000 ms = 5 minutes
  },
  beforeUnmount() {
    // Nettoyage du polling à la destruction du composant
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    toggleSidebar() {
      this.isOpen = !this.isOpen;
      // Si le menu vient de s'ouvrir et qu'il y a des notifications non lues, on marque les notifications comme lues
      if (this.isOpen && this.notificationsCount > 0) {
        setTimeout(() => {
          this.markNotificationsAsRead();
        }, 300); // délai de 300 ms
      }
    },
    async fetchNotifications() {
      try {
        // Remplacez l'URL par votre route API
        const response = await this.axios.get(
          '/api/notifications?notifiable_id=' + this.$store.getters.user.id
        );
        this.notifications = response.data.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications :', error);
        this.notifications = [];
      }
    },
    async markNotificationsAsRead() {
      try {
        // Appel API pour marquer toutes les notifications comme lues
        await this.axios.post(
          '/api/notifications/' + this.$store.getters.user.id + '/read-all',
          { userId: this.$store.getters.user.id }
        );
        // Légère temporisation avant la mise à jour locale pour laisser s'exécuter la transition CSS
        setTimeout(() => {
          this.notifications = this.notifications.map(notif => ({
            ...notif,
            read_at: notif.read_at || new Date().toISOString()
          }));
        }, 150);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des notifications :', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de marquer les notifications comme lues.',
          life: 3000,
        });
      }
    },
    async clearNotifications() {
      try {
        await this.axios.post(
          '/api/notifications/' + this.$store.getters.user.id + '/read-all',
          { userId: this.$store.getters.user.id }
        );
        this.notifications = this.notifications.map(notif => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString()
        }));
        this.$toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Notifications marquées comme lues avec succès.',
          life: 3000,
        });
      } catch (error) {
        console.error('Erreur lors de la suppression des notifications :', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de marquer les notifications comme lues.',
          life: 3000,
        });
      }
    },
    toggleDetails(notifId) {
      // Inverse l'état d'affichage pour la notification donnée
      this.expanded[notifId] = !this.expanded[notifId];
    }
  }
};
</script>

<style scoped>
/* Conteneur général de la sidebar */
.sidebar-notifications {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background-color: #f2f2f2;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
  /* On ne met plus overflow-y: auto ici pour que seul le contenu soit scrollable */
}

/* En-tête fixe de la sidebar */
.sidebar-header {
  position: sticky;
  top: 0;
  background-color: #f2f2f2;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0.5rem 1rem;
  border-bottom: 1px solid #ccc;
}
.sidebar-title {
  margin: 0;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Bouton de fermeture dans l'en-tête */
.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn i,
.close-btn .icon {
  width: 24px;
  height: 24px;
  stroke: #333;
}
.close-btn i:hover {
  stroke: #555;
  color: #555;
  transition: color 0.2s ease-in-out;
}

/* Conteneur scrollable pour la liste des notifications */
.notifications-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
}

/* Style de la scrollbar pour un rendu épuré */
.notifications-wrapper::-webkit-scrollbar {
  width: 8px;
}
.notifications-wrapper::-webkit-scrollbar-track {
  background: #f2f2f2;
  border-radius: 6px;
}
.notifications-wrapper::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 6px;
}

/* Liste des notifications */
.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notification-item {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #fff;
  border-radius: 4px;
  transition: opacity 0.3s;
}
.notification-item h4 {
  margin: 0 0 0.3rem;
  font-weight: 600;
  font-size: 1rem;
}
.notification-item p {
  margin: 0;
  font-size: 0.85rem;
}

/* Notifications déjà lues */
.read-notification {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
}

/* Conteneur pour le bouton détails et la liste déroulante */
.produits-container {
  margin-top: 0.5rem;
}
.details-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}
.details-btn i {
  margin-left: 0.3rem;
}

/* Transition pour la liste déroulante des produits */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px; /* ajustez en fonction du contenu */
  opacity: 1;
}

/* Liste déroulante des produits */
.produits-list {
  margin: 0.5rem 0 0 1rem;
  list-style: none;
  padding-left: 0.5rem;
  border-left: 2px solid #ccc;
}
.produits-list li {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

/* Transition slide-in-right pour la sidebar */
.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-in-right-enter-from {
  transform: translateX(100%);
}
.slide-in-right-enter-to {
  transform: translateX(0%);
}
.slide-in-right-leave-from {
  transform: translateX(0%);
}
.slide-in-right-leave-to {
  transform: translateX(100%);
}

/* making bell shape with one div */
.bell {
    border: 2.17px solid white;
    border-radius: 10px 10px 0 0;
    width: 15px;
    height: 17px;
    background: transparent;
    display: block;
    position: relative;
    top: -3px;
  }
  .bell::before,
  .bell::after {
    content: "";
    background: white;
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 2.17px;
  }
  .bell::before {
    top: 100%;
    width: 20px;
  }
  .bell::after {
    top: calc(100% + 4px);
    width: 7px;
  }
  
  /* container main styling */
  .notification {
    background: transparent;
    border: none;
    padding: 15px 15px;
    border-radius: 50px;
    cursor: pointer;
    transition: 300ms;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Cercle du compteur. 
     On enlève l'ancienne règle content: "1" 
     et on passe par un <span> en HTML pour un compteur dynamique. */
  .notif-counter {
    color: white;
    font-size: 10px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: red;
    position: absolute;
    right: 8px;
    top: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  /* container background hover effect */
  .notification:hover {
    background: rgba(170, 170, 170, 0.062);
  }
  
  /* container animations: 
     Survol -> cloche qui «tremble» */
  .notification:hover > .bell-container {
    animation: bell-animation 650ms ease-out 0s 1 normal both;
  }
  @keyframes bell-animation {
    20% {
      transform: rotate(15deg);
    }
    40% {
      transform: rotate(-15deg) scale(1.1);
    }
    60% {
      transform: rotate(10deg) scale(1.1);
    }
    80% {
      transform: rotate(-10deg);
    }
    0%,
    100% {
      transform: rotate(0deg);
    }
  }

</style>
