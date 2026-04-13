import { getDb, type MeasurementSession } from "@/lib/db";
import { NextRequest } from "next/server";

const VALID_TIME_OF_DAY = new Set(["morning", "evening", "other"]);

function validateBody(
  body: Record<string, unknown>
): string | null {
  const requiredStrings = ["date", "time", "timeOfDay"] as const;
  const requiredNumbers = [
    "timestamp",
    "systolic1", "diastolic1", "pulse1",
    "systolic2", "diastolic2", "pulse2",
    "systolicAvg", "diastolicAvg", "pulseAvg",
  ] as const;

  for (const field of requiredStrings) {
    if (typeof body[field] !== "string" || !(body[field] as string).trim()) {
      return `Feld "${field}" fehlt oder ist ungueltig`;
    }
  }

  if (!VALID_TIME_OF_DAY.has(body.timeOfDay as string)) {
    return `timeOfDay muss "morning", "evening" oder "other" sein`;
  }

  for (const field of requiredNumbers) {
    if (typeof body[field] !== "number" || !Number.isFinite(body[field] as number)) {
      return `Feld "${field}" fehlt oder ist keine Zahl`;
    }
  }

  return null;
}

export async function GET() {
  const db = getDb();
  const sessions = db
    .prepare("SELECT * FROM sessions ORDER BY timestamp DESC")
    .all() as MeasurementSession[];

  return Response.json(sessions);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungueltiges JSON" }, { status: 400 });
  }

  const error = validateBody(body);
  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sessions (
      date, time, timestamp, timeOfDay,
      systolic1, diastolic1, pulse1,
      systolic2, diastolic2, pulse2,
      systolicAvg, diastolicAvg, pulseAvg,
      note
    ) VALUES (
      @date, @time, @timestamp, @timeOfDay,
      @systolic1, @diastolic1, @pulse1,
      @systolic2, @diastolic2, @pulse2,
      @systolicAvg, @diastolicAvg, @pulseAvg,
      @note
    )
  `);

  const result = stmt.run({
    date: body.date,
    time: body.time,
    timestamp: body.timestamp,
    timeOfDay: body.timeOfDay,
    systolic1: body.systolic1,
    diastolic1: body.diastolic1,
    pulse1: body.pulse1,
    systolic2: body.systolic2,
    diastolic2: body.diastolic2,
    pulse2: body.pulse2,
    systolicAvg: body.systolicAvg,
    diastolicAvg: body.diastolicAvg,
    pulseAvg: body.pulseAvg,
    note: body.note ?? null,
  });

  const newId = Number(result.lastInsertRowid);

  // Fire-and-forget webhook to Flux
  const fluxWebhook = process.env.FLUX_WEBHOOK_URL;
  const apiKey = process.env.API_KEY;
  if (fluxWebhook && apiKey) {
    fetch(fluxWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        id: newId,
        date: body.date,
        time: body.time,
        timestamp: body.timestamp,
        systolicAvg: body.systolicAvg,
        diastolicAvg: body.diastolicAvg,
        pulseAvg: body.pulseAvg,
        note: body.note ?? null,
      }),
    }).catch((e) => console.warn("Flux webhook failed:", e));
  }

  return Response.json({ id: newId }, { status: 201 });
}
