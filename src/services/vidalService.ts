import axios, { AxiosInstance } from 'axios';
import { XMLParser } from 'fast-xml-parser';

const apiKey: string = process.env.VUE_APP_VIDAL_API_KEY as string;
const baseUrl: string = process.env.VUE_APP_VIDAL_BASE_URL as string;
const appId: string = process.env.VUE_APP_VIDAL_APP_ID as string;

// Interfaces pour les produits détaillés
export interface VidalProductDetailed {
  cip: string | null;
  libelle: string;
  dci: string | null;
  forme: string | null;
  dosage: string | null;
  posologie: string | null;
  duree: string | null;
  indications: string[] | null;
  contrindications: string[] | null;
}

export interface ApiResponseDetailed {
  products: VidalProductDetailed[];
}

// Interfaces pour les produits de base
export interface VidalProduct {
  cip: string | null;
  libelle: string;
}

export interface ApiResponse {
  products: VidalProduct[];
}

if (!apiKey || !baseUrl || !appId) {
    throw new Error('Les variables d\'environnement VUE_APP_VIDAL_API_KEY, VUE_APP_VIDAL_BASE_URL ou VUE_APP_VIDAL_APP_ID ne sont pas définies.');
}

// Création de l'instance Axios avec les configurations de base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/xml',
  },
});

// Fonction pour récupérer le CIP depuis les packages
const fetchCipFromPackages = async (packageUrl: string): Promise<string | null> => {
  try {
    const response = await axiosInstance.get(packageUrl, {
      params: {
        app_id: appId,
        app_key: apiKey,
      },
      responseType: 'text',
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(response.data);

    // Supposons que le CIP est dans la balise <vidal:cip>
    return jsonObj?.feed?.entry?.['vidal:cip'] || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur lors de la recherche du CIP:', error.message);
    } else {
      console.error('Erreur inconnue lors de la recherche du CIP:', error);
    }
    throw error;
  }
};

// Fonction pour récupérer les détails d'un produit depuis son URL
const fetchProductDetails = async (productUrl: string): Promise<Partial<VidalProductDetailed>> => {
  try {
    const response = await axiosInstance.get(productUrl, {
      params: {
        app_id: appId,
        app_key: apiKey,
      },
      responseType: 'text',
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(response.data);

    const product = jsonObj?.feed?.entry || jsonObj?.entry;
    
    if (!product) {
      console.warn('Aucun détail produit trouvé pour:', productUrl);
      return {};
    }

    // Extraire les informations détaillées
    const details = {
      dci: extractDCI(product),
      forme: extractForme(product),
      dosage: extractDosage(product),
      posologie: extractPosologie(product),
      duree: extractDuree(product),
      indications: extractIndications(product),
      contrindications: extractContrindications(product)
    };

    console.log('📋 Détails extraits pour', productUrl, ':', details);
    return details;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du produit:', error);
    return {};
  }
};

// Fonctions d'extraction des données spécifiques
const extractDCI = (product: any): string | null => {
  return product['vidal:dci'] || 
         product['dci'] || 
         product['vidal:activeSubstance'] || 
         product['vidal:activeSubstances'] ||
         product['activeSubstance'] ||
         null;
};

const extractForme = (product: any): string | null => {
  return product['vidal:galenic'] || 
         product['vidal:form'] || 
         product['vidal:galenicalForm'] ||
         product['forme'] || 
         product['form'] ||
         product['galenic'] ||
         null;
};

const extractDosage = (product: any): string | null => {
  return product['vidal:dosage'] || 
         product['vidal:strength'] || 
         product['vidal:dose'] ||
         product['dosage'] || 
         product['strength'] ||
         product['dose'] ||
         null;
};

const extractPosologie = (product: any): string | null => {
  return product['vidal:posology'] || 
         product['vidal:dosing'] || 
         product['vidal:administration'] ||
         product['posologie'] || 
         product['posology'] ||
         product['dosing'] ||
         null;
};

const extractDuree = (product: any): string | null => {
  return product['vidal:duration'] || 
         product['vidal:treatmentDuration'] || 
         product['vidal:treatmentLength'] ||
         product['duration'] ||
         product['treatmentDuration'] ||
         null;
};

const extractIndications = (product: any): string[] | null => {
  const indications = product['vidal:indication'] || 
                     product['vidal:indications'] || 
                     product['vidal:therapeuticIndication'] ||
                     product['indication'] ||
                     product['indications'] ||
                     product['therapeuticIndication'];
  
  if (Array.isArray(indications)) {
    return indications;
  } else if (typeof indications === 'string') {
    return [indications];
  }
  return null;
};

const extractContrindications = (product: any): string[] | null => {
  const contrindications = product['vidal:contraindication'] || 
                          product['vidal:contraindications'] ||
                          product['vidal:contraindicatedPopulation'] ||
                          product['contraindication'] ||
                          product['contraindications'];
  
  if (Array.isArray(contrindications)) {
    return contrindications;
  } else if (typeof contrindications === 'string') {
    return [contrindications];
  }
  return null;
};

// Fonction helper pour traiter les entries de base
async function processEntries(entries: any[]): Promise<ApiResponse> {
  const resultPromises = entries.map(async (product: any, index: number) => {
    console.log(`🔄 Traitement du produit ${index + 1}:`, product);
    
    const libelle = product.title || product['title'] || 'Produit sans nom';
    console.log('📛 Libellé trouvé:', libelle);
    
    // Rechercher le lien PACKAGES
    const links = product.link || [];
    console.log('🔗 Liens disponibles:', links);
    
    let packageLink = null;
    if (Array.isArray(links)) {
      packageLink = links.find((link: any) => 
        link['@_title'] === 'PACKAGES' || 
        link['@_rel'] === 'packages' ||
        (link['@_href'] && link['@_href'].includes('packages'))
      )?.['@_href'];
    } else if (links && typeof links === 'object') {
      packageLink = links['@_href'];
    }
    
    console.log('📦 Lien package trouvé:', packageLink);

    let cip = null;
    if (packageLink) {
      try {
        cip = await fetchCipFromPackages(packageLink);
        console.log('🏷️ CIP récupéré:', cip);
      } catch (cipError) {
        console.warn('⚠️ Erreur lors de la récupération du CIP:', cipError);
      }
    }

    return { cip, libelle };
  });

  const result = await Promise.all(resultPromises);
  console.log('✅ Résultats finaux:', result);
  
  return { products: result };
}

// Fonction helper pour traiter les entries détaillées
async function processEntriesDetailed(entries: any[]): Promise<ApiResponseDetailed> {
  const resultPromises = entries.map(async (product: any, index: number) => {
    console.log(`🔄 Traitement détaillé du produit ${index + 1}:`, product);
    
    const libelle = product.title || product['title'] || 'Produit sans nom';
    console.log('📛 Libellé trouvé:', libelle);
    
    // Extraire les détails directement du produit
    let details: Partial<VidalProductDetailed> = {
      dci: extractDCI(product),
      forme: extractForme(product),
      dosage: extractDosage(product),
      posologie: extractPosologie(product),
      duree: extractDuree(product),
      indications: extractIndications(product),
      contrindications: extractContrindications(product)
    };

    // Si les détails ne sont pas complets, essayer de les récupérer via l'URL du produit
    const productLink = product.link?.find((link: any) => 
      link['@_rel'] === 'self' || 
      link['@_title'] === 'PRODUCT' ||
      link['@_type'] === 'application/atom+xml'
    )?.['@_href'];

    if (productLink && (!details.dci || !details.forme)) {
      console.log('🔗 Récupération des détails via:', productLink);
      try {
        const additionalDetails = await fetchProductDetails(productLink);
        details = { ...details, ...additionalDetails };
      } catch (detailError) {
        console.warn('⚠️ Erreur lors de la récupération des détails supplémentaires:', detailError);
      }
    }

    // Rechercher le lien PACKAGES pour le CIP
    const packageLink = product.link?.find((link: any) => 
      link['@_title'] === 'PACKAGES' || 
      link['@_rel'] === 'packages'
    )?.['@_href'];
    
    console.log('📦 Lien package trouvé:', packageLink);

    let cip = null;
    if (packageLink) {
      try {
        cip = await fetchCipFromPackages(packageLink);
        console.log('🏷️ CIP récupéré:', cip);
      } catch (cipError) {
        console.warn('⚠️ Erreur lors de la récupération du CIP:', cipError);
      }
    }

    return {
      cip,
      libelle,
      dci: details.dci ?? null,
      forme: details.forme ?? null,
      dosage: details.dosage ?? null,
      posologie: details.posologie ?? null,
      duree: details.duree ?? null,
      indications: details.indications ?? null,
      contrindications: details.contrindications ?? null
    };
  });

  const result = await Promise.all(resultPromises);
  console.log('✅ Résultats détaillés finaux:', result);
  
  return { products: result };
}

// Fonction principale pour rechercher des médicaments (version de base)
export const searchMedicaments = async (query: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get('/rest/api/products', {
      params: {
        q: query,
        app_id: appId,
        app_key: apiKey,
      },
      responseType: 'text',
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(response.data);

    const entries = jsonObj.feed?.entry || [];
    const productsArray = Array.isArray(entries) ? entries : [entries];

    return await processEntries(productsArray);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur lors de la recherche des médicaments:', error.message);
    } else {
      console.error('Erreur inconnue lors de la recherche des médicaments:', error);
    }
    throw error;
  }
};

// Fonction principale améliorée pour rechercher des médicaments avec détails
export const searchMedicamentsDetailed = async (query: string): Promise<ApiResponseDetailed> => {
  try {
    console.log('🔍 Recherche détaillée Vidal pour:', query);
    
    const response = await axiosInstance.get('/rest/api/products', {
      params: {
        q: query,
        app_id: appId,
        app_key: apiKey,
      },
      responseType: 'text',
    });

    console.log('📡 Réponse brute de l\'API Vidal:', response.data);

    if (!response.data || response.data.trim() === '') {
      console.warn('⚠️ Réponse vide de l\'API Vidal');
      return { products: [] };
    }

    const parser = new XMLParser({ 
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true
    });
    
    const jsonObj = parser.parse(response.data);
    console.log('🔄 Données XML parsées:', JSON.stringify(jsonObj, null, 2));

    if (!jsonObj || !jsonObj.feed) {
      console.warn('⚠️ Structure de réponse inattendue:', jsonObj);
      return { products: [] };
    }

    const entries = jsonObj.feed.entry || [];
    const productsArray = Array.isArray(entries) ? entries : [entries];

    return await processEntriesDetailed(productsArray);

  } catch (error) {
    console.error('❌ Erreur lors de la recherche détaillée des médicaments:', error);
    throw error;
  }
};

// Version améliorée de searchByIndication (version de base)
export const searchByIndication = async (
  indication: string, 
  age?: number, 
  weight?: number,
  contraindications?: string[]
): Promise<ApiResponse> => {
  try {
    console.log('🎯 Recherche par indication:', { indication, age, weight, contraindications });
    
    const params: any = {
      q: indication,
      app_id: appId,
      app_key: apiKey,
    };

    // Ajouter les paramètres optionnels
    if (age) params.age = age;
    if (weight) params.weight = weight;
    if (contraindications && contraindications.length > 0) {
      params.contraindications = contraindications.join(',');
    }

    console.log('📋 Paramètres de requête:', params);

    const response = await axiosInstance.get('/rest/api/products', {
      params,
      responseType: 'text',
    });

    console.log('📡 Réponse searchByIndication:', response.data);

    if (!response.data || response.data.trim() === '') {
      console.warn('⚠️ Réponse vide pour searchByIndication');
      return { products: [] };
    }

    const parser = new XMLParser({ 
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true
    });
    
    const jsonObj = parser.parse(response.data);
    console.log('🔄 JSON parsé (indication):', JSON.stringify(jsonObj, null, 2));

    const entries = jsonObj.feed?.entry || [];
    const productsArray = Array.isArray(entries) ? entries : [entries];

    return await processEntries(productsArray);

  } catch (error) {
    console.error('❌ Erreur searchByIndication:', error);
    throw error;
  }
};

// Version détaillée de searchByIndication
export const searchByIndicationDetailed = async (
  indication: string, 
  age?: number, 
  weight?: number,
  contraindications?: string[]
): Promise<ApiResponseDetailed> => {
  try {
    console.log('🎯 Recherche détaillée par indication:', { indication, age, weight, contraindications });
    
    const params: any = {
      q: indication,
      app_id: appId,
      app_key: apiKey,
    };

    if (age) params.age = age;
    if (weight) params.weight = weight;
    if (contraindications && contraindications.length > 0) {
      params.contraindications = contraindications.join(',');
    }

    console.log('📋 Paramètres de requête détaillée:', params);

    const response = await axiosInstance.get('/rest/api/products', {
      params,
      responseType: 'text',
    });

    console.log('📡 Réponse searchByIndicationDetailed:', response.data);

    if (!response.data || response.data.trim() === '') {
      console.warn('⚠️ Réponse vide pour searchByIndicationDetailed');
      return { products: [] };
    }

    const parser = new XMLParser({ 
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true
    });
    
    const jsonObj = parser.parse(response.data);
    console.log('🔄 JSON parsé (indication détaillée):', JSON.stringify(jsonObj, null, 2));

    if (!jsonObj || !jsonObj.feed) {
      console.warn('⚠️ Structure de réponse inattendue pour indication détaillée:', jsonObj);
      return { products: [] };
    }

    const entries = jsonObj.feed.entry || [];
    const productsArray = Array.isArray(entries) ? entries : [entries];

    return await processEntriesDetailed(productsArray);

  } catch (error) {
    console.error('❌ Erreur searchByIndicationDetailed:', error);
    throw error;
  }
};

// Nouvelle fonction pour rechercher par classe thérapeutique
export const searchByTherapeuticClass = async (className: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get('/rest/api/products', {
      params: {
        app_id: appId,
        app_key: apiKey,
        'therapeutic_class': className,
      },
      responseType: 'text',
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(response.data);

    const entries = jsonObj.feed?.entry || [];
    const productsArray = Array.isArray(entries) ? entries : [entries];

    return await processEntries(productsArray);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur lors de la recherche par classe thérapeutique:', error.message);
    } else {
      console.error('Erreur inconnue lors de la recherche par classe thérapeutique:', error);
    }
    throw error;
  }
};

// Fonction pour obtenir les interactions médicamenteuses
export const checkInteractions = async (medications: string[]): Promise<any> => {
  try {
    // Cette fonction nécessiterait une API spécifique pour les interactions
    // Pour l'instant, on retourne un placeholder
    console.log('Vérification des interactions pour:', medications);
    return { interactions: [] };
  } catch (error) {
    console.error('Erreur lors de la vérification des interactions:', error);
    throw error;
  }
};
