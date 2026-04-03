import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 50;
  const offset = (page - 1) * limit;

  // Filtres
  const search = searchParams.get("search") || "";
  const region = searchParams.get("region") || "";
  const departement = searchParams.get("departement") || "";
  const dateDebut = searchParams.get("dateDebut") || "";
  const dateFin = searchParams.get("dateFin") || "";

  // Construction de la requête dynamique
  const conditions = [];
  const args = [];

  if (search) {
    conditions.push(`(denomination LIKE ? OR siren LIKE ? OR ville LIKE ?)`);
    const s = `%${search}%`;
    args.push(s, s, s);
  }
  if (region) {
    conditions.push(`region = ?`);
    args.push(region);
  }
  if (departement) {
    conditions.push(`departement LIKE ?`);
    args.push(`%${departement}%`);
  }
  if (dateDebut) {
    conditions.push(`date_parution >= ?`);
    args.push(dateDebut);
  }
  if (dateFin) {
    conditions.push(`date_parution <= ?`);
    args.push(dateFin);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    // Total pour la pagination
    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as total FROM companies ${where}`,
      args,
    });
    const total = Number(countRes.rows[0].total);

    // Données paginées
    const dataRes = await db.execute({
      sql: `SELECT * FROM companies ${where} ORDER BY date_parution DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    // Régions distinctes pour le filtre
    const regionsRes = await db.execute(
      `SELECT DISTINCT region FROM companies WHERE region != '' ORDER BY region`
    );
    const regions = regionsRes.rows.map((r) => r.region);

    return NextResponse.json({
      companies: dataRes.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      regions,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
