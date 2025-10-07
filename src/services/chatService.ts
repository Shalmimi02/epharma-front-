import axios from 'axios';
import store from '@/store';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface SendMessagePayload {
  message: string;
  conversationId?: string;
  context?: Record<string, any>;
}

export interface SendMessageResponse {
  conversationId: string;
  reply: string;
  data?: any;
}

// You can adjust this endpoint to match your backend
const getBaseUrl = () => store.getters.apiUrl || '';
const CHAT_ENDPOINT = '/api/chatbot/message';

export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const baseURL = getBaseUrl();
  const url = `${baseURL}${CHAT_ENDPOINT}`;
  const res = await axios.post(url, payload);
  return res.data as SendMessageResponse;
}

export function buildContext() {
  const user = store.getters.user;
  const pharmacie = store.getters.pharmacie;
  return {
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
    pharmacie: pharmacie ? { nom: pharmacie.nom_pharmacie, ville: pharmacie.ville } : null,
  };
}
