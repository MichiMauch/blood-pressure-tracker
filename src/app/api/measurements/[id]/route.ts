import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";

const ALLOWED_FIELDS = new Set([
  "date",
  "time",
  "timestamp",
  "timeOfDay",
  "systolic1",
  "diastolic1",
  "pulse1",
  "systolic2",
  "diastolic2",
  "pulse2",
  "systolicAvg",
  "diastolicAvg",
  "pulseAvg",
  "note",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const validKeys = Object.keys(body).filter((k) => ALLOWED_FIELDS.has(k));
  if (validKeys.length === 0) {
    return Response.json({ error: "No valid fields" }, { status: 400 });
  }

  const fields = validKeys.map((key) => `${key} = @${key}`).join(", ");
  const values: Record<string, unknown> = { id: Number(id) };
  for (const key of validKeys) {
    values[key] = body[key];
  }

  const db = getDb();
  db.prepare(`UPDATE sessions SET ${fields} WHERE id = @id`).run(values);

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(Number(id));
  return new Response(null, { status: 204 });
}
