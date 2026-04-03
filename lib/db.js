import { createClient } from "@libsql/client";

// Singleton : on réutilise la même connexion à chaque requête
let client = null;

export function getDb() {
  if (!client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(
        "Variables d'environnement manquantes : TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requis."
      );
    }
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}
