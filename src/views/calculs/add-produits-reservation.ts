import store from '../../store'
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
 export function calculerProduit(produit: Produit, qte: number, garde: Garde | null, prise_en_charge: number | string): {
    total: number;
    totalTVA: number;
    totalCSS: number;
    totalPrixVente: number;
    totalHorsTaxe: number;
    priseEnCharge: number;
    totalGarde: number;
    totalClient: number;
    totalPriseEnCharge: number;
  } {
    // Conversion des valeurs en nombres réels
    const prixDeVente = parseFloat(produit.prix_de_vente as string) || 0;
    const priseEnCharge = parseFloat(prise_en_charge as string) || 0;
    let montantTaxe =  0;
    if (garde != null) {
      montantTaxe = parseFloat(garde.montant_taxe as string);
    }
    let percentPriseEnCharge =  0;
    if (priseEnCharge > 0 ) {
      percentPriseEnCharge = priseEnCharge / 100;
    }
    
    const tvaActive = produit.tva == true || produit.tva == '1';
    const cssActive = produit.css == true || produit.css == '1';
  
    // Calculs
    const totalGarde = montantTaxe * qte;
    const totalPrixVente = (prixDeVente * qte) + totalGarde;
    const totalTVA = tvaActive ? totalPrixVente * store.getters.tva : 0;
    const totalCSS = cssActive ? totalPrixVente * store.getters.css : 0;
    const totalHorsTaxe = totalPrixVente - totalTVA - totalCSS - totalGarde;
    const total = totalHorsTaxe + totalTVA + totalCSS + totalGarde
    const totalPriseEnCharge = total * percentPriseEnCharge
    const totalClient = total - totalPriseEnCharge
  
    return {
        totalTVA,
        totalCSS,
        totalPrixVente,
        totalHorsTaxe,
        totalGarde,
        totalClient,
        priseEnCharge,
        totalPriseEnCharge,
        total
    };
  }
  