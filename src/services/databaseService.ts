import axios from 'axios';
import store from '@/store';

const API_BASE_URL = 'http:127.0.0.1:9090/api'; // Backend Laravel (Sanctum)

export interface DatabaseQueryResult {
  success: boolean;
  data: any[];
  error?: string;
}

function getAuthToken(): string | null {
  // Tente de récupérer depuis le store (en relâchant le typage), puis depuis localStorage
  const tokenFromStore = (store as any)?.state?.auth?.token ?? (store as any)?.getters?.['auth/token'];
  const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return tokenFromStore ?? tokenFromStorage ?? null;
}

// Utilise un contrat sûr sans SQL côté front
export async function queryDatabase(kind: 'stock' | 'last_sale' | 'price', params: Record<string, any> = {}): Promise<DatabaseQueryResult> {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, {
      kind,
      params
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
      }
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Database query error:', error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || 'Erreur lors de l\'exécution de la requête'
    };
  }
}

export async function getMedicamentStock(nomMedicament: string): Promise<DatabaseQueryResult> {
  return queryDatabase('stock', { name: nomMedicament });
}

export async function getDerniereVenteParVendeuse(nomVendeuse: string): Promise<DatabaseQueryResult> {
  return queryDatabase('last_sale', { seller: nomVendeuse });
}

export async function getPrixMedicament(nomMedicament: string): Promise<DatabaseQueryResult> {
  return queryDatabase('price', { name: nomMedicament });
}

// Récupère les produits en rupture ou bientôt en rupture de stock
export async function getProduitsEnRupture(seuil: number = 10): Promise<DatabaseQueryResult> {
  try {
    const response = await axios.get(`${API_BASE_URL}/produits`, {
      params: {
        req_qte_max: seuil,
        req_qte_min: 0
      },
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {})
      }
    });

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits en rupture:', error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || 'Erreur lors de la récupération des produits en rupture'
    };
  }
}
