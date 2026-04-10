import { getDb, ensureSchema } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  await ensureSchema();
  const db = getDb();
  const { id } = await params;

  if (!process.env.PAPPERS_API_TOKEN) {
    return NextResponse.json({ error: "PAPPERS_API_TOKEN non configuré." }, { status: 500 });
  }

  try {
    // Récupère le SIREN de l'entreprise
    const companyRes = await db.execute({
      sql: `SELECT siren FROM companies WHERE id = ?`,
      args: [id],
    });

    if (!companyRes.rows[0]) {
      return NextResponse.json({ error: "Entreprise non trouvée." }, { status: 404 });
    }

    const siren = companyRes.rows[0].siren;
    if (!siren) {
      return NextResponse.json({ linkedin_url: null });
    }

    // Appel à l'API Pappers
    const url = `https://api.pappers.fr/v2/entreprise?siren=${encodeURIComponent(siren)}&_fields=lien_linkedin&api_token=${process.env.PAPPERS_API_TOKEN}`;
    const pappersRes = await fetch(url);

    if (!pappersRes.ok) {
      const msg = await pappersRes.text();
      throw new Error(`Pappers API ${pappersRes.status} : ${msg}`);
    }

    const data = await pappersRes.json();
    const linkedinUrl = data.lien_linkedin || null;

    // Sauvegarde en base
    await db.execute({
      sql: `UPDATE companies SET linkedin_url = ? WHERE id = ?`,
      args: [linkedinUrl, id],
    });

    return NextResponse.json({ linkedin_url: linkedinUrl });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
