import { getDb, ensureSchema } from "@/lib/db";
import { fetchSireneData, isNafExcluded, qualifyWithClaude } from "@/lib/qualify";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// POST /api/qualify/batch
// Body : { ids: [1, 2, 3, ...] }  (max 20)
export async function POST(request) {
  await ensureSchema();
  const db = getDb();

  const { ids } = await request.json();
  if (!ids?.length) return NextResponse.json({ results: [], errors: [] });

  // ── Récupère les données complètes depuis la DB ──
  const placeholders = ids.map(() => "?").join(",");
  const companiesRes = await db.execute({
    sql: `SELECT * FROM companies WHERE id IN (${placeholders})`,
    args: ids,
  });
  let companies = companiesRes.rows.map((r) => ({ ...r }));

  const errors = [];
  const now = new Date().toISOString();

  // ── Étape 1 : Enrichissement SIRENE (5 appels en parallèle) ──────────────
  const CONCURRENCY = 5;
  for (let i = 0; i < companies.length; i += CONCURRENCY) {
    const chunk = companies.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (c) => {
        if (c.naf_code || !c.siren) return c;
        const sirene = await fetchSireneData(c.siren);
        if (sirene?.naf) {
          await db.execute({
            sql: `UPDATE companies SET naf_code = ?, tranche_effectif = ? WHERE id = ?`,
            args: [sirene.naf, sirene.effectif, c.id],
          });
          return { ...c, naf_code: sirene.naf, tranche_effectif: sirene.effectif };
        }
        return c;
      })
    );
    // Mise à jour locale du tableau
    for (let j = 0; j < results.length; j++) {
      companies[i + j] = results[j];
    }
  }

  // ── Étape 2 : Filtre NAF ─────────────────────────────────────────────────
  const excluded = companies.filter((c) => isNafExcluded(c.naf_code));
  const toQualify = companies.filter((c) => !isNafExcluded(c.naf_code));

  // Score 0 pour les exclus NAF
  for (const c of excluded) {
    await db.execute({
      sql: `UPDATE companies SET quali_score = 0, quali_raison = ?, quali_date = ? WHERE id = ?`,
      args: ["Exclu — activité hors cible (code NAF)", now, c.id],
    });
  }

  // ── Étape 3 : Qualification Claude ───────────────────────────────────────
  const claudeResults = [];

  if (toQualify.length > 0) {
    if (!process.env.ANTHROPIC_API_KEY) {
      errors.push("ANTHROPIC_API_KEY non configuré — qualification Claude ignorée.");
    } else {
      try {
        const scored = await qualifyWithClaude(toQualify);
        claudeResults.push(...scored);
      } catch (e) {
        errors.push(`Claude API erreur : ${e.message}`);
      }
    }
  }

  // ── Étape 4 : Sauvegarde des scores ──────────────────────────────────────
  const claudeMap = Object.fromEntries(claudeResults.map((r) => [r.siren, r]));

  for (const c of toQualify) {
    const r = claudeMap[c.siren];
    const score = r?.score ?? null; // null = Claude n'a pas répondu pour ce SIREN
    const raison = r?.raison || null;
    if (score !== null) {
      await db.execute({
        sql: `UPDATE companies SET quali_score = ?, quali_raison = ?, quali_date = ? WHERE id = ?`,
        args: [score, raison, now, c.id],
      });
    }
  }

  return NextResponse.json({
    results: [
      ...excluded.map((c) => ({ id: c.id, score: 0 })),
      ...toQualify.map((c) => ({
        id: c.id,
        score: claudeMap[c.siren]?.score ?? null,
      })),
    ],
    errors,
  });
}
