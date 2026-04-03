/**
 * Logique d'import BODACC
 * Traduit depuis le script Google Apps Script original.
 * Filtre : déménagements, secteur privé corporate, hors DOM-TOM et Corse.
 */

const BODACC_API =
  "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records";

/**
 * Lance l'import BODACC pour les N derniers jours.
 * Retourne le nombre de nouvelles entreprises ajoutées.
 */
export async function importerBodacc(db, joursEnArriere = 7) {
  const today = new Date();
  const dateDebut = new Date(today);
  dateDebut.setDate(today.getDate() - joursEnArriere);
  const dateStr = dateDebut.toISOString().split("T")[0];

  const whereClause = `dateparution >= date'${dateStr}' AND (search("transfert") OR search("siège") OR search("adresse")) AND familleavis_lib = "Modifications diverses"`;

  let offset = 0;
  let totalAjoutes = 0;
  let hasMore = true;
  const errors = [];

  while (hasMore && totalAjoutes < 1000) {
    const url =
      `${BODACC_API}?where=${encodeURIComponent(whereClause)}` +
      `&limit=100&offset=${offset}&order_by=dateparution DESC`;

    let data;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (e) {
      errors.push(`Erreur réseau (offset ${offset}) : ${e.message}`);
      break;
    }

    const records = data.results;
    if (!records || records.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of records) {
      const lien = record.url_complete || "https://www.bodacc.fr";

      // --- 1. Filtre sur le descriptif ---
      let modifs = {};
      try {
        modifs =
          typeof record.modificationsgenerales === "string"
            ? JSON.parse(record.modificationsgenerales)
            : record.modificationsgenerales || {};
      } catch (_) {}

      const desc = (modifs.descriptif || "").toLowerCase();

      const motsClesDemenagement = [
        "transfert",
        "nouveau siège",
        "adresse du siège",
        "adresse de l'établissement",
      ];
      const motsExclus = [
        "dissolution",
        "cessation",
        "liquidation",
        "transmission universelle",
        "clôture",
      ];

      if (
        !motsClesDemenagement.some((m) => desc.includes(m)) ||
        motsExclus.some((m) => desc.includes(m))
      )
        continue;

      // --- 2. Filtre forme juridique ---
      let listepersonnes = {};
      try {
        listepersonnes =
          typeof record.listepersonnes === "string"
            ? JSON.parse(record.listepersonnes)
            : record.listepersonnes || {};
      } catch (_) {}

      const personne = listepersonnes.personne
        ? Array.isArray(listepersonnes.personne)
          ? listepersonnes.personne[0]
          : listepersonnes.personne
        : {};

      const fjOriginal = personne.formeJuridique || "";
      if (!fjOriginal) continue;

      const fj = fjOriginal.toLowerCase();

      const excludedTerms = [
        "agricole",
        "viticole",
        "forestier",
        "foncier",
        "portefeuille",
        "construction-vente",
        "libre partenariat",
        "soins ambulatoires",
        "public",
        "epic",
        "epcc",
        "etat",
        "collectivité",
      ];
      if (excludedTerms.some((t) => fj.includes(t))) continue;

      const allowedForms = [
        "actions simplifiée",
        "responsabilité limitée",
        "anonyme",
        "nom collectif",
        "exercice libéral",
        "coopérative",
        "intérêt économique",
        "droit étranger",
        "avocats",
        "scp",
      ];
      if (!allowedForms.some((t) => fj.includes(t))) continue;

      // --- 3. Filtre géographique (hors DOM-TOM et Corse) ---
      const codeDep = (record.numerodepartement || "").toString().toUpperCase();
      if (
        codeDep.startsWith("97") ||
        codeDep.startsWith("98") ||
        codeDep === "2A" ||
        codeDep === "2B"
      )
        continue;

      // --- 4. Extraction des données ---
      const siren = (
        personne.numeroImmatriculation?.numeroIdentification ||
        ""
      )
        .toString()
        .replace(/\s+/g, "");

      const denomination = record.commercant || personne.denomination || "";

      const capitalRaw = personne.capital;
      const capital =
        typeof capitalRaw === "object"
          ? String(capitalRaw?.montantCapital || "")
          : String(capitalRaw || "");

      let ville = record.ville || "";
      let cp = record.cp || "";
      let adresseComplete = "";

      if (personne.adresseSiegeSocial) {
        const a = personne.adresseSiegeSocial;
        ville = a.ville || ville;
        cp = a.codePostal || cp;
        adresseComplete = [a.numeroVoie, a.typeVoie, a.nomVoie]
          .filter(Boolean)
          .join(" ");
        if (cp || ville)
          adresseComplete += ` ${cp} ${ville}`.trimEnd();
      }

      const departement =
        [
          record.departement_nom_officiel,
          record.numerodepartement ? `(${record.numerodepartement})` : null,
        ]
          .filter(Boolean)
          .join(" ") || "";

      // --- 5. Insertion en base (INSERT OR IGNORE = pas de doublon) ---
      try {
        const result = await db.execute({
          sql: `INSERT OR IGNORE INTO companies
            (lien, date_parution, denomination, siren, forme_juridique, capital,
             activite, administration, descriptif, date_effet, adresse_complete,
             cp, ville, departement, region, tribunal, famille_avis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            lien,
            record.dateparution || "",
            denomination,
            siren,
            fjOriginal,
            capital,
            personne.activite || "",
            personne.administration || "",
            modifs.descriptif || "",
            modifs.dateEffet || "",
            adresseComplete,
            cp,
            ville,
            departement,
            record.region_nom_officiel || "",
            record.tribunal || "",
            record.familleavis_lib || "",
          ],
        });
        // rowsAffected = 0 si doublon ignoré, 1 si insertion réelle
        if (result.rowsAffected > 0) totalAjoutes++;
      } catch (e) {
        errors.push(`Erreur DB (${lien}) : ${e.message}`);
      }
    }

    offset += 100;
    // Pause pour ne pas surcharger l'API
    await new Promise((r) => setTimeout(r, 300));
  }

  return { totalAjoutes, errors };
}
