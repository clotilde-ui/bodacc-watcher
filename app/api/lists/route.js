import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/lists — retourne toutes les listes sauvegardées
export async function GET() {
  const db = getDb();
  try {
    const res = await db.execute(
      `SELECT * FROM saved_lists ORDER BY created_at DESC`
    );
    return NextResponse.json({ lists: res.rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/lists — crée une nouvelle liste à partir des filtres courants
// Body JSON : { name, filters: { formeJuridique, capital, descriptif, motCle, ville,
//               departement, region, familleAvis, dateDebut, dateFin } }
export async function POST(request) {
  const db = getDb();
  try {
    const body = await request.json();
    const { name, filters = {} } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Un nom est requis." }, { status: 400 });
    }

    // Construire la requête en fonction des filtres
    const conditions = [];
    const args = [];

    const formesJuridiquesFilter = (filters.formeJuridique || []);
    if (formesJuridiquesFilter.length > 0) {
      conditions.push(`forme_juridique IN (${formesJuridiquesFilter.map(() => "?").join(",")})`);
      args.push(...formesJuridiquesFilter);
    }
    if (filters.capital) { conditions.push(`capital LIKE ?`); args.push(`%${filters.capital}%`); }
    if (filters.descriptif) { conditions.push(`descriptif LIKE ?`); args.push(`%${filters.descriptif}%`); }
    if (filters.motCle) { conditions.push(`descriptif LIKE ?`); args.push(`%${filters.motCle}%`); }
    if (filters.ville) { conditions.push(`ville LIKE ?`); args.push(`%${filters.ville}%`); }
    if (filters.departement) { conditions.push(`departement LIKE ?`); args.push(`%${filters.departement}%`); }
    const regionsFilter = filters.region || [];
    if (regionsFilter.length > 0) {
      conditions.push(`region IN (${regionsFilter.map(() => "?").join(",")})`);
      args.push(...regionsFilter);
    }
    const famillesAvisFilter = filters.familleAvis || [];
    if (famillesAvisFilter.length > 0) {
      conditions.push(`famille_avis IN (${famillesAvisFilter.map(() => "?").join(",")})`);
      args.push(...famillesAvisFilter);
    }
    if (filters.dateDebut) { conditions.push(`date_parution >= ?`); args.push(filters.dateDebut); }
    if (filters.dateFin) { conditions.push(`date_parution <= ?`); args.push(filters.dateFin); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Récupérer les IDs correspondants
    const idsRes = await db.execute({
      sql: `SELECT id FROM companies ${where} ORDER BY date_parution DESC`,
      args,
    });
    const ids = idsRes.rows.map((r) => r.id);

    if (ids.length === 0) {
      return NextResponse.json({ error: "Aucune entreprise ne correspond aux filtres." }, { status: 400 });
    }

    // Insérer la liste
    const listRes = await db.execute({
      sql: `INSERT INTO saved_lists (name, company_count) VALUES (?, ?) RETURNING id`,
      args: [name.trim(), ids.length],
    });
    const listId = listRes.rows[0].id;

    // Insérer les liaisons par batch
    const batchSize = 100;
    for (let i = 0; i < ids.length; i += batchSize) {
      const chunk = ids.slice(i, i + batchSize);
      const placeholders = chunk.map(() => "(?, ?)").join(",");
      const batchArgs = chunk.flatMap((companyId) => [listId, companyId]);
      await db.execute({
        sql: `INSERT OR IGNORE INTO saved_list_companies (list_id, company_id) VALUES ${placeholders}`,
        args: batchArgs,
      });
    }

    return NextResponse.json({ success: true, listId, count: ids.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
