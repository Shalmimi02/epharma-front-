// logUtils.ts

// logUtils.ts

// Définir une interface pour une réservation
interface ReservationProduit {
  id: number | string;
  libelle: string;
  qte: string;
  prix_de_vente: number;
  prix_achat: number;
  produit: any; // À typer si besoin
  reservation_id: number | string;
  prise_en_charge: number;
  produit_id: number | string;
  total_ht: number;
  total_tva: number;
  total_css: number;
  total_prise_en_charge: number;
  total_garde: number;
  cout_total: number;
  cout_total_reel: number;
}

interface Reservation {
  id: string;
  position: number | string;
  code: string | null;
  numero: string | null;
  remise: number;
  client: string;
  caisse: string;
  amount_reserved: number;
  amount_gived: number;
  switch_caisse_at: string | null;
  switch_finish_at: string | null;
  switch_devis_at: string | null;
  switch_dette_at: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  nom_assure?: string | null;
  identifiant_assure?: string | null;
  numero_feuille_assure?: string | null;
  secteur_assure?: string | null;
  total: number;
  montant: number;
  montant_avant_remise: number;
  prise_en_charge: number;
  total_prise_en_charge: number;
  total_tva: number;
  total_css: number;
  total_ht: number;
  total_garde: number;
  montant_taxe: number;
  deleted_at: string | null;
  garde_id: number | null;
  caisse_id: number | null;
  avant_remise: number | null;
  credit_restant: number;
  reservation_produits: ReservationProduit[];
}

  
  // Interface globale pour le stockage
  interface LogsReservation {
    reservations: Reservation[];
  }
  
  // Lecture des données depuis LocalStorage (fonction synchrone)
  export function readJsonFromFile(): LogsReservation {
    try {
      // Vérifier si localStorage est disponible
      if (typeof localStorage === "undefined") {
        return { reservations: [] };
      }
  
      const data = localStorage.getItem("logs-Reservation");
      if (!data) {
        // Pas de données, on renvoie un objet initialisé
        return { reservations: [] };
      }
  
      const parsedData: LogsReservation = JSON.parse(data);
      // Si le champ reservations n'existe pas, on l'initialise
      if (!parsedData.reservations) {
        parsedData.reservations = [];
      }
  
      // Pour chaque réservation, s'assurer qu'elle a un tableau reservation_produits
      parsedData.reservations.forEach((reservation: Reservation) => {
        if (!reservation.reservation_produits) {
          reservation.reservation_produits = [];
        }
      });
  
      return parsedData;
    } catch (error) {
      console.error("Erreur lors de la lecture dans LocalStorage:", error);
      return { reservations: [] };
    }
  }
  
  // Sauvegarde des données dans LocalStorage (fonction synchrone)
  export function saveJsonToFile(data: LogsReservation): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("logs-Reservation", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans LocalStorage :", error);
    }
  }

// 📥 Mise à jour d'une réservation
// 📥 Mise à jour d'une réservation
export async function updateReservationInJson(
    reservationId: number,
    updatedReservation: any
  ): Promise<void> {
    const jsonData = readJsonFromFile(); // Fonction synchrone
    if (!jsonData) return;
  
    const reservationIndex = jsonData.reservations.findIndex(
      (res: any) => res.id === reservationId
    );
    if (reservationIndex !== -1) {
      const reservation = jsonData.reservations[reservationIndex];
      // On fusionne les propriétés tout en préservant reservation_produits
      jsonData.reservations[reservationIndex] = {
        ...reservation,
        ...updatedReservation,
        reservation_produits:
          updatedReservation.reservation_produits || reservation.reservation_produits,
      };
      saveJsonToFile(jsonData);
    } else {
      console.warn(`Réservation ID ${reservationId} non trouvée.`);
    }
  }

// 📥 Ajout d'un produit à une réservation
export async function addProductToReservation(
    reservationId: number,
    product: any
  ): Promise<void> {
    const jsonData = readJsonFromFile();
    if (!jsonData) return;
  
    const reservationIndex = jsonData.reservations.findIndex(
      (res: any) => res.id === reservationId
    );
    if (reservationIndex === -1) {
      return;
    }
  
    const reservation = jsonData.reservations[reservationIndex];
    if (!reservation.reservation_produits) {
      reservation.reservation_produits = [];
    }
  
    reservation.reservation_produits.push({ ...product });
    saveJsonToFile(jsonData);
  }

// 🗑️ Suppression d'un produit d'une réservation
export async function removeProductFromReservation(
    reservationId: number,
    productId: number
  ): Promise<void> {
    const jsonData = readJsonFromFile();
    if (!jsonData) return;
  
    const reservationIndex = jsonData.reservations.findIndex(
      (res: any) => res.id === reservationId
    );
    if (reservationIndex === -1) {
      return;
    }
  
    const reservation = jsonData.reservations[reservationIndex];
    if (!reservation.reservation_produits) {
      return;
    }
  
    reservation.reservation_produits = reservation.reservation_produits.filter(
      (prod: any) => prod.produit_id !== productId
    );
    saveJsonToFile(jsonData);
  }

// 🛠️ Initialisation du fichier JSON si nécessaire
export async function initializeJsonFile(): Promise<void> {
    const jsonData = await readJsonFromFile();

    if (!jsonData || !jsonData.reservations) {
       
        await saveJsonToFile({ reservations: [] });
    }
}

// 📥 Ajout d'une réservation
export async function addReservationToJson(newReservation: any): Promise<void> {
    try {
        const jsonData = await readJsonFromFile();
        if (!jsonData) {
            // Initialiser les données si elles n'existent pas
            await saveJsonToFile({ reservations: [] });
        }

        // Ajouter une nouvelle réservation avec un tableau reservation_produits vide si non défini
        const reservationToAdd = {
            ...newReservation,
            reservation_produits: newReservation.reservation_produits || []
        };

        jsonData.reservations.push(reservationToAdd);
        await saveJsonToFile(jsonData);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la réservation dans LocalStorage :', error);
    }
}


/**
 * Vérifie si une date est la date actuelle.
 * @param {string} dateString - La date sous forme de chaîne de caractères.
 * @returns {boolean} - Retourne true si la date est aujourd'hui, sinon false.
 */
export function isDateToday(dateString:string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}
