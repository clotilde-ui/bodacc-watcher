import { createClient } from "@libsql/client";

// Singleton : on réutilise la même connexion à chaque requête
let client = null;
let initialized = false;

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

// Initialise les tables si elles n'existent pas encore (idempotent)
export async function ensureSchema() {
  if (initialized) return;
  const db = getDb();

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_lists (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      company_count INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS saved_list_companies (
      list_id    INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      PRIMARY KEY (list_id, company_id)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_date_parution ON companies (date_parution DESC)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_region ON companies (region)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cp ON companies (cp)`);

  // Migration : colonne linkedin_url (ignorée si elle existe déjà)
  try {
    await db.execute(`ALTER TABLE companies ADD COLUMN linkedin_url TEXT`);
  } catch (_) {}

  initialized = true;
}
