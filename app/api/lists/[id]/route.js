import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/lists/[id] — entreprises d'une liste (paginées)
export async function GET(request, { params }) {
  const db = getDb();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as total FROM companies WHERE id IN (SELECT company_id FROM saved_list_companies WHERE list_id = ?)`,
      args: [id],
    });
    const total = Number(countRes.rows[0].total);

    const dataRes = await db.execute({
      sql: `SELECT c.* FROM companies c
            INNER JOIN saved_list_companies slc ON c.id = slc.company_id
            WHERE slc.list_id = ?
            ORDER BY c.date_parution DESC
            LIMIT ? OFFSET ?`,
      args: [id, limit, offset],
    });

    const listRes = await db.execute({
      sql: `SELECT * FROM saved_lists WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({
      list: listRes.rows[0] || null,
      companies: dataRes.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/lists/[id] — supprime une liste (et ses liaisons)
export async function DELETE(request, { params }) {
  const db = getDb();
  const { id } = await params;

  try {
    await db.execute({ sql: `DELETE FROM saved_list_companies WHERE list_id = ?`, args: [id] });
    await db.execute({ sql: `DELETE FROM saved_lists WHERE id = ?`, args: [id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
