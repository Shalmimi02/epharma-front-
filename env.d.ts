// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    VUE_APP_VIDAL_API_KEY: string;
    VUE_APP_VIDAL_BASE_URL: string;
    // Ajoutez d'autres variables d'environnement si nécessaire
  }
}
