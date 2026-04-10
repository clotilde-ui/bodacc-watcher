import { getDb, ensureSchema } from "@/lib/db";

export async function GET(request) {
  await ensureSchema();
  const db = getDb();
  const { searchParams } = new URL(request.url);

  // Filtres (identiques à /api/companies)
  const formesJuridiquesFilter = (searchParams.get("formeJuridique") || "").split(",").filter(Boolean);
  const capital = searchParams.get("capital") || "";
  const descriptif = searchParams.get("descriptif") || "";
  const motCle = searchParams.get("motCle") || "";
  const ville = searchParams.get("ville") || "";
  const departement = searchParams.get("departement") || "";
  const regionsFilter = (searchParams.get("region") || "").split(",").filter(Boolean);
  const famillesAvisFilter = (searchParams.get("familleAvis") || "").split(",").filter(Boolean);
  const dateDebut = searchParams.get("dateDebut") || "";
  const dateFin = searchParams.get("dateFin") || "";
  // Export d'une liste sauvegardée (optionnel)
  const listId = searchParams.get("listId") || "";

  const conditions = [];
  const args = [];

  if (listId) {
    conditions.push(`id IN (SELECT company_id FROM saved_list_companies WHERE list_id = ?)`);
    args.push(listId);
  } else {
    if (formesJuridiquesFilter.length > 0) {
      conditions.push(`forme_juridique IN (${formesJuridiquesFilter.map(() => "?").join(",")})`);
      args.push(...formesJuridiquesFilter);
    }
    if (capital) { conditions.push(`capital LIKE ?`); args.push(`%${capital}%`); }
    if (descriptif) { conditions.push(`descriptif LIKE ?`); args.push(`%${descriptif}%`); }
    if (motCle) { conditions.push(`descriptif LIKE ?`); args.push(`%${motCle}%`); }
    if (ville) { conditions.push(`ville LIKE ?`); args.push(`%${ville}%`); }
    if (departement) { conditions.push(`departement LIKE ?`); args.push(`%${departement}%`); }
    if (regionsFilter.length > 0) {
      conditions.push(`region IN (${regionsFilter.map(() => "?").join(",")})`);
      args.push(...regionsFilter);
    }
    if (famillesAvisFilter.length > 0) {
      conditions.push(`famille_avis IN (${famillesAvisFilter.map(() => "?").join(",")})`);
      args.push(...famillesAvisFilter);
    }
    if (dateDebut) { conditions.push(`date_parution >= ?`); args.push(dateDebut); }
    if (dateFin) { conditions.push(`date_parution <= ?`); args.push(dateFin); }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const dataRes = await db.execute({
      sql: `SELECT * FROM companies ${where} ORDER BY date_parution DESC`,
      args,
    });

    const rows = dataRes.rows;

    // En-têtes CSV
    const headers = [
      "date_parution", "denomination", "siren", "forme_juridique", "capital",
      "activite", "administration", "descriptif", "date_effet",
      "adresse_complete", "cp", "ville", "departement", "region",
      "tribunal", "famille_avis", "lien",
    ];

    const escape = (val) => {
      if (val == null) return "";
      const s = String(val).replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    };

    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ];

    const csv = lines.join("\r\n");

    const filename = listId
      ? `liste-${listId}-${new Date().toISOString().slice(0, 10)}.csv`
      : `bodacc-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
