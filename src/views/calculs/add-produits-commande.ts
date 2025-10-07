// calculs.ts

import store from '../../store';

// Adaptez selon votre modèle réel
export interface CommandeProduit {
  id: number | string;
  produit_libelle: string;
  prix_achat: number | string;
  prix_de_vente: number | string;
  coef_conversion_de_prix_vente_achat: number | string;
}

// Interface pour Produit (déjà présente dans votre code)
export interface Produit {
  libelle: string;
  cip: string;
  prix_achat: number | string;
  coef_conversion_de_prix_vente_achat: number | string;
  code: string;
  qte: number | string;
  qte_max: number | string;
  qte_min: number | string;
  description: string;
  ean: string;
  dci: string;
  tva: boolean | string;
  css: boolean | string;
  prix_de_vente: number | string;
  posologie: string;
  homologation: string;
  forme: string;
  famille: string;
  nature: string;
  classe_therapeutique: string;
  categorie: string;
  poids: number | string;
  longueur: number | string;
  largeur: number | string;
  rayon: string;
  hauteur: number | string;
  code_table: string;
  statut: string;
  code_fournisseur: string;
  rayon_id: string;
  cip_deux: string;
  fournisseurId: string;
  photo: string;
  prise_en_charge: number | string;
}


 export function calculerProduit(produit: Produit, qte: number | string, prix_achat: number | string | null, prix_de_vente: number | string | null, coef: number | string | null, qte_initiale: number | string | null): {
    total: number;
    totalTVA: number;
    totalCSS: number;
    totalPrixAchat: number;
    totalPrixVente: number;
    totalHorsTaxe: number;
    prixVente: number;
    qteFinale: number;
  } {
    // Conversion des valeurs en nombres réels
    let qteCommande = parseFloat(qte as string) || 0;

    let qteInitiale = 0;
    if (qte_initiale != null) {
      qteInitiale = parseFloat(qte_initiale as string) || 0;
    }
    
    let prixAchat = parseFloat(produit.prix_achat as string) || 0;
    if (prix_achat != null) {
      prixAchat = parseFloat(prix_achat as string) || 0;
    }

    let prixVente = parseFloat(produit.prix_de_vente as string) || 0;
    if (prix_de_vente != null) {
      prixVente = parseFloat(prix_de_vente as string) || 0;
    }

    let coefConversion = parseFloat(produit.coef_conversion_de_prix_vente_achat as string) || 0;
    if (coef != null) {
      coefConversion = parseFloat(coef as string) || 0;
    }

    const tvaActive = produit.tva == true || produit.tva == '1';
    const cssActive = produit.css == true || produit.css == '1';
  
    // Calculs
    const totalPrixAchat = prixAchat * qteCommande;
    const totalPrixVente = prixVente * qteCommande;
    const totalTVA = tvaActive ? totalPrixAchat * store.getters.tva : 0;
    const totalCSS = cssActive ? totalPrixAchat * store.getters.css : 0;
    const totalHorsTaxe = totalPrixAchat - totalTVA - totalCSS;
    const total = totalHorsTaxe + totalTVA + totalCSS
    const qteFinale = qteInitiale + qteCommande
  
    return {
        totalTVA,
        totalCSS,
        totalPrixAchat,
        totalPrixVente,
        totalHorsTaxe,
        total,
        prixVente,
        qteFinale
    };
  }

/**
 * Recalcule les prix selon le champ modifié
 */
export function recalculerPrix(
  field: string,
  prixAchatVal: number | string,
  prixVenteVal: number | string,
  coefVal: number | string,
  newValueVal: number | string
) {
  // Conversion des valeurs en nombres avec valeurs par défaut à 0
  let prixAchat = parseFloat(prixAchatVal as string) || 0;
  let prixVente = parseFloat(prixVenteVal as string) || 0;
  let coef = parseFloat(coefVal as string) || 0;
  const newValue = parseFloat(newValueVal as string) || 0;
  
  

  switch (field) {
    case 'prix_achat':
      // Si on modifie le prix d'achat
      prixAchat = newValue;
      
      if (prixVente > 0) {
        // Si prix de vente existe, on recalcule le coefficient
        coef = prixAchat > 0 ? prixVente / prixAchat : 0;
      } else if (coef > 0) {
        // Si coefficient existe mais pas prix de vente, on calcule le prix de vente
        prixVente = prixAchat * coef;
      } else {
        // Si rien d'autre n'existe, on prend prix d'achat = prix de vente et coef = 1
        prixVente = prixAchat;
        coef = 1;
      }
      break;
      
    case 'prix_de_vente':
      // Si on modifie le prix de vente
      prixVente = newValue;
      
      if (prixAchat > 0) {
        // Si prix d'achat existe, on recalcule le coefficient
        coef = prixVente / prixAchat;
      } else if (coef > 0) {
        // Si coefficient existe mais pas prix d'achat, on calcule le prix d'achat
        prixAchat = coef > 0 ? prixVente / coef : 0;
      }
      break;
      
    case 'coef_conversion_de_prix_vente_achat':
      // Si on modifie le coefficient
      coef = newValue;
      
      // CORRECTION: Si le prix d'achat existe, recalculer OBLIGATOIREMENT le prix de vente
      if (prixAchat > 0) {
        // Calcul forcé du prix de vente en fonction du nouveau coefficient
        const nouveauPrixVente = prixAchat * coef;
        
        prixVente = nouveauPrixVente;
      } else if (prixVente > 0) {
        // Si on n'a que le prix de vente, on calcule le prix d'achat
        prixAchat = coef > 0 ? prixVente / coef : 0;
        
      }
      break;
  }
  
  // Vérification finale pour s'assurer que les valeurs sont cohérentes
  if (field === 'coef_conversion_de_prix_vente_achat' && prixAchat > 0) {
    // Force la cohérence entre PA, PV et coef
    const prixVenteAttendu = prixAchat * coef;
    if (Math.abs(prixVente - prixVenteAttendu) > 0.01) {
      
      prixVente = prixVenteAttendu;
    }
  }
  
  // NOUVEAU: Vérification supplémentaire pour s'assurer que PV >= PA
  // Si on est dans le cas où PV < PA, on applique la règle PV = PA et coef = 1
  if (prixAchat > 0 && prixVente < prixAchat) {
    
    prixVente = prixAchat;
    coef = 1;
  }
  
  // Si le coefficient est < 1 et PA > 0, on force coef = 1 et PV = PA
  if (prixAchat > 0 && coef < 1) {
    coef = 1;
    prixVente = prixAchat;
  }
  
  
  return { prixAchat, prixVente, coef };
}

/**
 * Remplit les champs manquants selon les valeurs disponibles
 */
export function remplirChampsManquants(
  prixAchatVal: number | string,
  prixVenteVal: number | string,
  coefVal: number | string
) {
  let prixAchat = parseFloat(prixAchatVal as string) || 0;
  let prixVente = parseFloat(prixVenteVal as string) || 0;
  let coef = parseFloat(coefVal as string) || 0;

  // Cas 1: prix d'achat est rempli, mais prix de vente et coef sont vides
  if (prixAchat > 0 && !prixVente && !coef) {
    prixVente = prixAchat; // Le prix de vente prend la valeur du prix d'achat
    coef = 1; // Le coefficient sera 1 car prixVente / prixAchat = 1
  } 
  // Cas 2: prix d'achat et coef sont remplis, mais prix de vente est vide
  else if (!prixVente && prixAchat > 0 && coef > 0) {
    prixVente = prixAchat * coef;
  }
  // Cas 3: prix d'achat est vide, mais prix de vente et coef sont remplis
  else if (!prixAchat && prixVente > 0 && coef > 0) {
    prixAchat = prixVente / coef;
  }
  // Cas 4: coef est vide, mais prix d'achat et prix de vente sont remplis
  else if (!coef && prixAchat > 0 && prixVente > 0) {
    coef = prixVente / prixAchat;
  }

  return { prixAchat, prixVente, coef };
}
// Vérifie la cohérence des données pour une commande contenant plusieurs produits
export function verifierCoherencePourCommande(commande_produit: CommandeProduit[]): {
  coherenceStates: { [key: string]: boolean };
  incoherences: { id: number | string, message: string }[];
  allCoherent: boolean;
} {
  // Tolérance pour les écarts dus aux calculs en virgule flottante
  const epsilon = 0.01;

  // Objets pour stocker les états de cohérence et les incohérences détectées
  const coherenceStates: { [key: string]: boolean } = {};
  const incoherences: { id: number | string, message: string }[] = [];

  // Vérifie si la commande contient des produits valides
  if (!commande_produit || !Array.isArray(commande_produit) || commande_produit.length === 0) {
    console.warn("Aucune ligne produit trouvée pour la commande.");
    return { coherenceStates, incoherences, allCoherent: false };
  }

  // Parcourt chaque ligne de produit pour vérifier la cohérence des données
  for (const line of commande_produit) {
    // Convertit les valeurs des prix et du coefficient en nombres
    const prixAchat = parseFloat(line.prix_achat as string) || 0;
    const prixVente = parseFloat(line.prix_de_vente as string) || 0;
    const coef = parseFloat(line.coef_conversion_de_prix_vente_achat as string) || 0;

    // Définit les conditions de cohérence
    const condition1 = Math.abs(prixVente / prixAchat - coef) < epsilon; // Vérifie que coef = prixVente / prixAchat
    const condition2 = Math.abs(prixAchat * coef - prixVente) < epsilon; // Vérifie que prixVente = prixAchat * coef
    const condition3 = Math.abs(prixVente / coef - prixAchat) < epsilon; // Vérifie que prixAchat = prixVente / coef
    const condition4 = coef >= 1; // Le coefficient doit être supérieur ou égal à 1

    // La cohérence est respectée si toutes les conditions sont remplies
    const isCoherent = (condition1 || condition2 || condition3) && condition4;

    // Stocke les résultats de cohérence pour chaque champ
    coherenceStates[`prix_achat-${line.id}`] = isCoherent;
    coherenceStates[`prix_de_vente-${line.id}`] = isCoherent;
    coherenceStates[`coef_conversion_de_prix_vente_achat-${line.id}`] = isCoherent;

    // Si incohérent, ajoute un message explicatif
    if (!isCoherent) {
      let message = `La ligne pour le produit ${line.produit_libelle} est incohérente.`;
      if (coef < 1) {
        message += " Le coefficient est inférieur à 1.";
      }
      incoherences.push({
        id: line.id,
        message,
      });
    }
  }

  // Vérifie si toutes les lignes sont cohérentes
  const allCoherent = incoherences.length === 0;
  return { coherenceStates, incoherences, allCoherent };
}

// Retourne une classe CSS en fonction de l'état de cohérence
export function getCoherenceClass(coherenceStates: { [key: string]: boolean }, lineId: number | string, field: string): string {
  const key = `${field}-${lineId}`;
  return coherenceStates[key] === false ? 'border-danger' : 'border-dark';
}

// Vérifie la cohérence des données pour un produit unique
export function verifierCoherencePourProduit(produit: {
  id: number | string;
  libelle: string;
  prix_achat: number | string;
  prix_de_vente: number | string;
  coef_conversion_de_prix_vente_achat: number | string;
}): { isCoherent: boolean; message: string | null } {
  // Tolérance pour les écarts dus aux calculs en virgule flottante
  const epsilon = 0.01;

  // Convertit les valeurs des prix et du coefficient en nombres
  const prixAchat = parseFloat(produit.prix_achat as string) || 0;
  const prixVente = parseFloat(produit.prix_de_vente as string) || 0;
  const coef = parseFloat(produit.coef_conversion_de_prix_vente_achat as string) || 0;

  // Définit les conditions de cohérence
  const condition1 = Math.abs(prixVente / prixAchat - coef) < epsilon; // Vérifie que coef = prixVente / prixAchat
  const condition2 = Math.abs(prixAchat * coef - prixVente) < epsilon; // Vérifie que prixVente = prixAchat * coef
  const condition3 = Math.abs(prixVente / coef - prixAchat) < epsilon; // Vérifie que prixAchat = prixVente / coef
  const condition4 = coef >= 1; // Le coefficient doit être supérieur ou égal à 1

  // La cohérence est respectée si toutes les conditions sont remplies
  const isCoherent = (condition1 || condition2 || condition3) && condition4;

  // Génère un message d'erreur en cas d'incohérence
  const message = isCoherent
    ? null
    : `Incohérence détectée pour ce produit vérifiez les valeurs de prix et du coefficient.`;

  return { isCoherent, message };
}
