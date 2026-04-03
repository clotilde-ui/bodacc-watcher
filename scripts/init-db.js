/**
 * Script d'initialisation de la base de données Turso.
 * À exécuter UNE SEULE FOIS avant le premier déploiement :
 *   node scripts/init-db.js
 */

import { createClient } from "@libsql/client";
import { config } from "dotenv";

// Charge les variables depuis .env.local
config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
  console.log("⏳ Création des tables...");

  // Table principale : les entreprises ayant déménagé
  await db.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      lien            TEXT    UNIQUE NOT NULL,
      date_parution   TEXT,
      denomination    TEXT,
      siren           TEXT,
      forme_juridique TEXT,
      capital         TEXT,
      activite        TEXT,
      administration  TEXT,
      descriptif      TEXT,
      date_effet      TEXT,
      adresse_complete TEXT,
      cp              TEXT,
      ville           TEXT,
      departement     TEXT,
      region          TEXT,
      tribunal        TEXT,
      famille_avis    TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table des logs d'import (pour l'historique des synchros)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS import_logs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at      TEXT NOT NULL,
      finished_at     TEXT,
      status          TEXT DEFAULT 'running',
      records_added   INTEGER DEFAULT 0,
      error_message   TEXT
    )
  `);

  // Index pour accélérer les recherches fréquentes
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_date_parution ON companies (date_parution DESC)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_region ON companies (region)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cp ON companies (cp)`);

  // Table des listes sauvegardées
  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_lists (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      company_count INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table de liaison listes ↔ entreprises
  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_list_companies (
      list_id    INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      PRIMARY KEY (list_id, company_id)
    )
  `);

  console.log("✅ Base de données initialisée avec succès !");
  process.exit(0);
}

init().catch((e) => {
  console.error("❌ Erreur :", e.message);
  process.exit(1);
});
