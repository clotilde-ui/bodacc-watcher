import { getDb } from "@/lib/db";
import { importerBodacc } from "@/lib/bodacc";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Vercel : max 60s pour les fonctions

export async function POST(request) {
  const db = getDb();

  // Créer un log "en cours"
  const startedAt = new Date().toISOString();
  let logId;
  try {
    const res = await db.execute({
      sql: `INSERT INTO import_logs (started_at, status) VALUES (?, 'running')`,
      args: [startedAt],
    });
    logId = Number(res.lastInsertRowid);
  } catch (e) {
    return NextResponse.json({ error: "Erreur DB : " + e.message }, { status: 500 });
  }

  try {
    const { totalAjoutes, errors } = await importerBodacc(db, 7);

    const finishedAt = new Date().toISOString();
    const status = errors.length > 0 ? "partial" : "success";
    const errorMsg = errors.length > 0 ? errors.slice(0, 5).join(" | ") : null;

    await db.execute({
      sql: `UPDATE import_logs SET finished_at = ?, status = ?, records_added = ?, error_message = ? WHERE id = ?`,
      args: [finishedAt, status, totalAjoutes, errorMsg, logId],
    });

    return NextResponse.json({ success: true, totalAjoutes, errors });
  } catch (e) {
    await db.execute({
      sql: `UPDATE import_logs SET finished_at = ?, status = 'error', error_message = ? WHERE id = ?`,
      args: [new Date().toISOString(), e.message, logId],
    });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
