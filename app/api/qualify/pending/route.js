import { getDb, ensureSchema } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/qualify/pending — IDs des entreprises sans score de qualification
export async function GET() {
  await ensureSchema();
  const db = getDb();
  try {
    const res = await db.execute(
      `SELECT id FROM companies
       WHERE quali_score IS NULL AND siren IS NOT NULL AND siren != ''
       ORDER BY id DESC`
    );
    return NextResponse.json({ ids: res.rows.map((r) => Number(r.id)) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
