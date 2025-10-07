// calcul-total-produit-reservation.ts

import store from '../../store'; // Assurez-vous que le chemin est correct

export interface Garde {
  numero: string;
  date_debut: Date;
  date_fin: Date;
  heure_debut: TimeRanges;
  heure_fin: TimeRanges;
  montant_taxe: string | number;
  total_taxe: string;
  is_active: string;
}

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
  tva: boolean | number;
  css: boolean | number;
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
  montant_taxe: number | string;
}

export interface IReservationProduit {
  id: number;
  libelle: string;
  qte: string;
  prix_de_vente: string;
  prix_achat: string;
  cout_total: string;
  cout_total_reel: string;
  produit: Produit;
  reservation_id: string;
  prise_en_charge: string;
  produit_id: string;
  total_ht: string;
  total_tva: string;
  total_css: string;
  total_prise_en_charge: string;
  total_garde: string;
  is_sold: number;
  vente_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ICalculResult {
  total: number;
  totalTVA: number;
  totalCSS: number;
  totalPrixVente: number;
  totalHorsTaxe: number;
  priseEnCharge: number;
  totalGarde: number;
  totalClient: number;
  totalPriseEnCharge: number;
  cout_total:number;
}

/**
 * Fonction optimisée pour calculer les totaux en utilisant les prix corrects du produit.
 */
export function calculerTotalProduits(
    reservationOrProd: IReservationProduit | Produit,
    qte: number,
    garde: Garde | null,
    prise_en_charge: number | string,
    remise_percent?: number
  ): ICalculResult {
    let prodBrut: Produit;
    let prixDeVenteStr: string;
  
    if ('produit' in reservationOrProd && reservationOrProd.produit) {
      prodBrut = reservationOrProd.produit;
      prixDeVenteStr = prodBrut.prix_de_vente as string;
    } else {
      prodBrut = reservationOrProd as Produit;
      prixDeVenteStr = prodBrut.prix_de_vente as string;
    }
  
    const prixDeVente = parseFloat(prixDeVenteStr) || 0;
    const priseEnCharge = parseFloat(prise_en_charge as string) || 0;
  
    let montantTaxe = 0;
    if (garde && garde.montant_taxe !== undefined) {
      montantTaxe = parseFloat(garde.montant_taxe as string) || 0;
    }
  
    const percentPriseEnCharge = priseEnCharge > 0 ? priseEnCharge / 100 : 0;
  
    const tvaVal = prodBrut.tva;
    const cssVal = prodBrut.css;
    const tvaActive = tvaVal === true || tvaVal === 1;
    const cssActive = cssVal === true || cssVal === 1;
  
    const defaultTvaRate = 0.18;
    const defaultCssRate = 0.01;
  
    const storeTva = store?.getters?.tva;
    const storeCss = store?.getters?.css;
  
    const tvaRate = (typeof storeTva === 'number' && storeTva > 0)
      ? storeTva
      : defaultTvaRate;
  
    const cssRate = (typeof storeCss === 'number' && storeCss >= 0)
      ? storeCss
      : defaultCssRate;
  
    const totalGarde = montantTaxe * qte;
  
    const totalPrixVente = prixDeVente * qte + totalGarde;
  
    const totalTVA = tvaActive ? totalPrixVente * tvaRate : 0;
    const totalCSS = cssActive ? totalPrixVente * cssRate : 0;
  
    const totalHorsTaxe = totalPrixVente - totalTVA - totalCSS - totalGarde;
  
    let total = totalHorsTaxe + totalTVA + totalCSS + totalGarde;
  
    if (remise_percent && remise_percent > 0) {
      const totalRemise = total * (remise_percent / 100);
      total -= totalRemise;
    }
  
    const totalPriseEnCharge = total * percentPriseEnCharge;
  
    const totalClient = total - totalPriseEnCharge;
  
     // Log des résultats pour débogage
    console.log("CalculerTotalProduits Result:", {
        total,
        totalTVA,
        totalCSS,
        totalPrixVente,
        totalHorsTaxe,
        priseEnCharge,
        totalGarde,
        totalClient,
        totalPriseEnCharge,
        cout_total: totalClient, // Assurez-vous que cout_total est correctement calculé
    });
  
    return {
      total,
      totalTVA,
      totalCSS,
      totalPrixVente,
      totalHorsTaxe,
      priseEnCharge,
      totalGarde,
      totalClient,
      totalPriseEnCharge,
      cout_total: total, // Ajout de cout_total
    };
  }
  
