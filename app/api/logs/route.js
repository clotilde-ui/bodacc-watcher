import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const db = getDb();
  try {
    const res = await db.execute(
      `SELECT * FROM import_logs ORDER BY started_at DESC LIMIT 20`
    );
    return NextResponse.json({ logs: res.rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
