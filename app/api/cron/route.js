import { getDb, ensureSchema } from "@/lib/db";
import { importerBodacc } from "@/lib/bodacc";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(request) {
  // Vérification du secret pour éviter les appels non autorisés
  const authHeader = request.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await ensureSchema();
  const db = getDb();
  const startedAt = new Date().toISOString();
  let logId;

  try {
    const res = await db.execute({
      sql: `INSERT INTO import_logs (started_at, status) VALUES (?, 'running')`,
      args: [startedAt],
    });
    logId = Number(res.lastInsertRowid);
  } catch (e) {
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }

  try {
    const { totalAjoutes, errors } = await importerBodacc(db, 7);
    const finishedAt = new Date().toISOString();
    const status = errors.length > 0 ? "partial" : "success";

    await db.execute({
      sql: `UPDATE import_logs SET finished_at = ?, status = ?, records_added = ?, error_message = ? WHERE id = ?`,
      args: [finishedAt, status, totalAjoutes, errors.join(" | ") || null, logId],
    });

    return NextResponse.json({ success: true, totalAjoutes });
  } catch (e) {
    await db.execute({
      sql: `UPDATE import_logs SET finished_at = ?, status = 'error', error_message = ? WHERE id = ?`,
      args: [new Date().toISOString(), e.message, logId],
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
