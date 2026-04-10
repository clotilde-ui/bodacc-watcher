import Anthropic from "@anthropic-ai/sdk";

// ─── Filtre NAF ───────────────────────────────────────────────────────────────
// Codes exclus : pas de besoin en mobilier de bureau
const NAF_EXCLUDED_RANGES = [
  [1, 3],   // 01xx–03xx : Agriculture, sylviculture, pêche
  [45, 47], // 45xx–47xx : Commerce de détail / auto
  [55, 56], // 55xx–56xx : Hôtellerie / restauration
  [75, 75], // 75xx      : Vétérinaires
  [86, 88], // 86xx–88xx : Santé / médico-social
  [97, 98], // 97xx–98xx : Ménages
];

export function isNafExcluded(nafCode) {
  if (!nafCode) return false;
  const prefix = parseInt(nafCode.replace(/\./g, "").substring(0, 2), 10);
  return NAF_EXCLUDED_RANGES.some(([min, max]) => prefix >= min && prefix <= max);
}

// ─── Enrichissement SIRENE ────────────────────────────────────────────────────
// Utilise l'API ouverte data.gouv.fr (gratuite, sans clé)
// Fallback optionnel vers l'API INSEE si SIRENE_API_KEY est configuré
export async function fetchSireneData(siren) {
  try {
    // API ouverte (data.gouv.fr) — aucun compte requis
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siren)}&page=1&per_page=3`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      const company = data.results?.find((r) => r.siren === siren);
      if (company) {
        return {
          naf: company.activite_principale || null,
          effectif: company.tranche_effectif_salarie || null,
        };
      }
    }
  } catch (_) {}

  // Fallback : API INSEE officielle (nécessite SIRENE_API_KEY)
  if (process.env.SIRENE_API_KEY) {
    try {
      const res = await fetch(
        `https://api.insee.fr/entreprises/sirene/V3.11/siren/${encodeURIComponent(siren)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.SIRENE_API_KEY}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const ul = data.uniteLegale;
        const periods = ul?.periodesUniteLegale || [];
        const active = periods.find((p) => !p.dateFin) || periods[0] || {};
        return {
          naf: active.activitePrincipaleUniteLegale || null,
          effectif: ul?.trancheEffectifsUniteLegale || null,
        };
      }
    } catch (_) {}
  }

  return null;
}

// ─── Qualification Claude ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es un assistant de qualification commerciale pour une entreprise qui vend du mobilier de bureau (bureaux, chaises, rangements, salles de réunion).

Pour chaque entreprise, réponds UNIQUEMENT en JSON valide avec ce format :
[
  {
    "siren": "XXXXXXXXX",
    "score": 0,
    "raison": "explication courte en une phrase"
  }
]

Scores :
- 0 = non pertinent (pas de bureau, activité terrain/physique pure)
- 1 = peu probable (très petite structure ou activité incertaine)
- 2 = probable (structure avec des bureaux, taille raisonnable)
- 3 = très pertinent (entreprise avec bureaux certains, taille significative)`;

export async function qualifyWithClaude(companies) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const payload = companies.map((c) => ({
    siren: c.siren,
    nom: c.denomination,
    forme_juridique: c.forme_juridique,
    naf: c.naf_code,
    effectif_tranche: c.tranche_effectif,
    descriptif: c.descriptif,
  }));

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Qualifie ces entreprises pour l'achat de mobilier de bureau :\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const text = response.content[0]?.text || "[]";
  // Extrait le tableau JSON même si Claude ajoute du texte autour
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]);
}
