import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 50;
  const offset = (page - 1) * limit;

  // Filtres
  const formeJuridique = searchParams.get("formeJuridique") || "";
  const capital = searchParams.get("capital") || "";
  const descriptif = searchParams.get("descriptif") || "";
  const motCle = searchParams.get("motCle") || "";
  const ville = searchParams.get("ville") || "";
  const departement = searchParams.get("departement") || "";
  const region = searchParams.get("region") || "";
  const familleAvis = searchParams.get("familleAvis") || "";
  const dateDebut = searchParams.get("dateDebut") || "";
  const dateFin = searchParams.get("dateFin") || "";

  // Construction de la requête dynamique
  const conditions = [];
  const args = [];

  if (formeJuridique) {
    conditions.push(`forme_juridique = ?`);
    args.push(formeJuridique);
  }
  if (capital) {
    conditions.push(`capital LIKE ?`);
    args.push(`%${capital}%`);
  }
  if (descriptif) {
    conditions.push(`descriptif LIKE ?`);
    args.push(`%${descriptif}%`);
  }
  if (motCle) {
    conditions.push(`descriptif LIKE ?`);
    args.push(`%${motCle}%`);
  }
  if (ville) {
    conditions.push(`ville LIKE ?`);
    args.push(`%${ville}%`);
  }
  if (departement) {
    conditions.push(`departement LIKE ?`);
    args.push(`%${departement}%`);
  }
  if (region) {
    conditions.push(`region = ?`);
    args.push(region);
  }
  if (familleAvis) {
    conditions.push(`famille_avis = ?`);
    args.push(familleAvis);
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

    // Valeurs distinctes pour les dropdowns
    const regionsRes = await db.execute(`SELECT DISTINCT region FROM companies WHERE region != '' ORDER BY region`);
    const formesRes = await db.execute(`SELECT DISTINCT forme_juridique FROM companies WHERE forme_juridique != '' ORDER BY forme_juridique`);
    const famillesRes = await db.execute(`SELECT DISTINCT famille_avis FROM companies WHERE famille_avis != '' ORDER BY famille_avis`);
    const regions = regionsRes.rows.map((r) => r.region);
    const formesJuridiques = formesRes.rows.map((r) => r.forme_juridique);
    const famillesAvis = famillesRes.rows.map((r) => r.famille_avis);

    return NextResponse.json({
      companies: dataRes.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      regions,
      formesJuridiques,
      famillesAvis,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
