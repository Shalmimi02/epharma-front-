// Définition des types pour le store Vuex

export interface AuthState {
  token: string | null;
  user: {
    id: string | number;
    username: string;
    // Ajoutez d'autres propriétés utilisateur si nécessaire
  } | null;
}

export interface RootState {
  auth: AuthState;
  // Ajoutez d'autres états de modules si nécessaire
}
