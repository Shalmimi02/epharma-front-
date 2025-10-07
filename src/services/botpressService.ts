import axios from 'axios';
import store from '@/store';
import { getMedicamentStock, getDerniereVenteParVendeuse, getPrixMedicament, getProduitsEnRupture } from './databaseService';

export interface BotpressMessagePayload {
  type: 'text';
  text: string;
  userId: string;
  // You can extend with additional fields supported by your bot (e.g., metadata)
  // metadata?: Record<string, any>;
}

export interface BotpressResponse {
  // Botpress typically returns an event ack or response payload. Keep it generic.
  [key: string]: any;
}

// Essaie d'extraire le nom du médicament à partir d'une phrase liée au stock
function extractMedicamentFromStockQuery(message: string): string | null {
  const msg = message.toLowerCase().trim();

  // Quelques motifs courants
  const patterns: RegExp[] = [
    /stock\s+(?:de|du|des|d')\s+([a-z0-9\-\s]+)/i,
    /combien\s+(?:il\s+)?(?:reste|y\s+a)\s+(?:de|du|des|d')\s+([a-z0-9\-\s]+)(?:\s+en\s+stock)?/i,
    /(?:reste|stock)\s+(?:de|du|des|d')\s+([a-z0-9\-\s]+)/i,
    /combien\s+de\s+([a-z0-9\-\s]+)\s+en\s+stock/i,
    /(?:quantit[eé]|disponible)\s+(?:de|du|des|d')\s+([a-z0-9\-\s]+)/i,
  ];

  for (const re of patterns) {
    const m = message.match(re);
    if (m && m[1]) {
      let name = m[1]
        .replace(/\ben\s+stock\b/i, '')
        .replace(/\bdisponible\b/i, '')
        .replace(/\bquantit[eé]\b/i, '')
        .replace(/\?+$/, '')
        .trim();
      // Nettoyage des déterminants en tête
      name = name.replace(/^(le|la|les|du|de\s+la|des|de|d')\s+/i, '').trim();
      if (name.length) return name;
    }
  }

  // Fallback simple: mot entre "de ... en stock"
  const between = msg.match(/de\s+(.+?)\s+en\s+stock/i);
  if (between && between[1]) return between[1].trim();
  return null;
}

/**
 * Send a text message to a Botpress Cloud bot.
 *
 * @param message The text to send
 * @param userId Unique identifier of the end user (stringified)
 * @param botId Your Botpress bot ID
 * @param baseUrl Optional base URL (defaults to Botpress Cloud public endpoint)
 */
export async function sendMessageToBotpress(
  message: string,
  userId: string | number,
  botId: string,
  baseUrl = 'https://chat.botpress.cloud'
): Promise<BotpressResponse> {
  if (!botId) throw new Error('Botpress botId is required');
  // Traitement des requêtes de base de données
  const lowerMessage = message.toLowerCase();

  // Vérifier si le message concerne les produits en rupture de stock
  if (lowerMessage.includes('rupture') ||
      lowerMessage.includes('bientôt en rupture') ||
      lowerMessage.includes('bientot en rupture') ||
      lowerMessage.includes('produits manquants') ||
      lowerMessage.includes('stock faible') ||
      lowerMessage.includes('stock bas') ||
      (lowerMessage.includes('produits') && (lowerMessage.includes('rupture') || lowerMessage.includes('manque')))) {

    const seuil = lowerMessage.includes('bientôt') || lowerMessage.includes('bientot') ? 10 : 5;
    const result = await getProduitsEnRupture(seuil);

    if (result.success && result.data.length > 0) {
      const produitsText = result.data.slice(0, 10).map((p: any) =>
        `• ${p.libelle} - Stock: ${p.qte} unités`
      ).join('\n');

      const titre = seuil === 10
        ? `⚠️ ${result.data.length} produit(s) bientôt en rupture de stock (≤10 unités):`
        : `🔴 ${result.data.length} produit(s) en rupture de stock (≤5 unités):`;

      return {
        type: 'text',
        text: `${titre}\n\n${produitsText}${result.data.length > 10 ? '\n\n... et ' + (result.data.length - 10) + ' autres produits' : ''}`
      };
    } else if (result.success && result.data.length === 0) {
      return {
        type: 'text',
        text: '✅ Excellent ! Aucun produit en rupture de stock pour le moment.'
      };
    } else {
      return {
        type: 'text',
        text: '❌ Désolé, je n\'ai pas pu récupérer les informations sur les ruptures de stock. Veuillez vérifier votre connexion.'
      };
    }
  }

  // Vérifier si le message concerne le stock de médicaments
  if (lowerMessage.includes('stock') || lowerMessage.includes('reste') || lowerMessage.includes('disponible')) {
    const medicament = extractMedicamentFromStockQuery(message);
    if (medicament) {
      const result = await getMedicamentStock(medicament);
      if (result.success && result.data.length > 0) {
        const stock = result.data[0];
        return {
          type: 'text',
          text: `Stock actuel de ${stock.nom}: ${stock.quantite} unités (mis à jour le ${new Date(stock.date_mise_a_jour).toLocaleDateString()})`
        };
      } else {
        return {
          type: 'text',
          text: `Désolé, je n'ai pas trouvé d'information sur le stock pour "${medicament}".`
        };
      }
    } else {
      return {
        type: 'text',
        text: "De quel médicament parlez-vous pour le stock ? (ex: 'doliprane 500 mg')"
      };
    }
  }
  
  // Vérifier si le message concerne la dernière vente
  if (lowerMessage.includes('dernière vente') || lowerMessage.includes('derniere vente')) {
    const vendeuseMatch = message.match(/(?:de |par |la |le )?([\w\s-]+)(?:\?|\s|$)/i);
    if (vendeuseMatch) {
      const vendeuse = vendeuseMatch[1].trim();
      const result = await getDerniereVenteParVendeuse(vendeuse);
      
      if (result.success && result.data.length > 0) {
        const vente = result.data[0];
        return {
          type: 'text',
          text: `Dernière vente par ${vendeuse}: ${vente.quantite} ${vente.medicament} pour un total de ${vente.montant_total} FCFA (${new Date(vente.date_vente).toLocaleString()})`
        };
      } else {
        return {
          type: 'text',
          text: `Je n'ai pas trouvé d'information sur les ventes pour cette personne.`
        };
      }
    }
  }
  
  // Vérifier si le message concerne le prix d'un médicament
  if (lowerMessage.includes('combien coûte') || lowerMessage.includes('prix de') || lowerMessage.includes('prix du') || lowerMessage.includes('prix de la')) {
    const medicamentMatch = message.match(/(?:combien coûte|prix de|prix du|prix de la)\s+([\w\s-]+)(?:\?|\s|$)/i);
    if (medicamentMatch) {
      const medicament = medicamentMatch[1].trim();
      const result = await getPrixMedicament(medicament);
      
      if (result.success && result.data.length > 0) {
        const medicamentInfo = result.data[0];
        return {
          type: 'text',
          text: `Le prix de ${medicamentInfo.nom} est de ${medicamentInfo.prix_vente} FCFA (mis à jour le ${new Date(medicamentInfo.date_mise_a_jour).toLocaleDateString()})`
        };
      } else {
        return {
          type: 'text',
          text: `Désolé, je n'ai pas trouvé d'information sur le prix de ce médicament.`
        };
      }
    }
  }
  
  // Si aucune requête de base de données n'est détectée, envoyer au botpress normalement
  const url = `${baseUrl.replace(/\/$/, '')}/${botId}`;
  
  const payload: BotpressMessagePayload = {
    type: 'text',
    text: String(message ?? ''),
    userId: String(userId ?? 'anonymous'),
  };

  try {
    const res = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data as BotpressResponse;
  } catch (error) {
    console.error('Error sending message to Botpress:', error);
    return {
      type: 'text',
      text: 'Désolé, une erreur est survenue lors du traitement de votre demande.'
    };
  }
}

/**
 * Helper to get a default userId from the current Vuex store (falls back to 'anonymous').
 */
export function getDefaultUserId(): string {
  const u = store.getters.user;
  return u?.id ? String(u.id) : 'anonymous';
}
