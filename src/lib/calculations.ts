import type { MeasurementSession } from "./types";
import {
  startOfWeek,
  endOfWeek,
  format,
  subDays,
  isWithinInterval,
} from "date-fns";
import { de } from "date-fns/locale";

export function avg(a: number, b: number): number {
  return Math.round((a + b) / 2);
}

export function filterByDays(
  sessions: MeasurementSession[],
  days: number | null
): MeasurementSession[] {
  if (days === null) return sessions;
  const cutoff = subDays(new Date(), days).getTime();
  return sessions.filter((s) => s.timestamp >= cutoff);
}

export function filterByTimeOfDay(
  sessions: MeasurementSession[],
  timeOfDay: "morning" | "evening" | "all"
): MeasurementSession[] {
  if (timeOfDay === "all") return sessions;
  return sessions.filter((s) => s.timeOfDay === timeOfDay);
}

interface Stats {
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  count: number;
}

export function computeStats(sessions: MeasurementSession[]): Stats | null {
  if (sessions.length === 0) return null;
  const n = sessions.length;
  return {
    avgSystolic: Math.round(
      sessions.reduce((s, m) => s + m.systolicAvg, 0) / n
    ),
    avgDiastolic: Math.round(
      sessions.reduce((s, m) => s + m.diastolicAvg, 0) / n
    ),
    avgPulse: Math.round(sessions.reduce((s, m) => s + m.pulseAvg, 0) / n),
    minSystolic: Math.min(...sessions.map((m) => m.systolicAvg)),
    maxSystolic: Math.max(...sessions.map((m) => m.systolicAvg)),
    minDiastolic: Math.min(...sessions.map((m) => m.diastolicAvg)),
    maxDiastolic: Math.max(...sessions.map((m) => m.diastolicAvg)),
    count: n,
  };
}

export interface WeeklyData {
  week: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  count: number;
}

export function groupByWeek(sessions: MeasurementSession[]): WeeklyData[] {
  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const weeks = new Map<string, MeasurementSession[]>();

  for (const s of sorted) {
    const d = new Date(s.timestamp);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const we = endOfWeek(d, { weekStartsOn: 1 });
    const key = `${format(ws, "dd.MM", { locale: de })}-${format(we, "dd.MM", { locale: de })}`;

    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key)!.push(s);
  }

  return Array.from(weeks.entries()).map(([week, data]) => ({
    week,
    systolic: Math.round(data.reduce((s, m) => s + m.systolicAvg, 0) / data.length),
    diastolic: Math.round(data.reduce((s, m) => s + m.diastolicAvg, 0) / data.length),
    pulse: Math.round(data.reduce((s, m) => s + m.pulseAvg, 0) / data.length),
    count: data.length,
  }));
}

export interface MorningEveningData {
  label: string;
  morningSys: number;
  morningDia: number;
  eveningSys: number;
  eveningDia: number;
}

export function computeMorningEvening(
  sessions: MeasurementSession[]
): MorningEveningData | null {
  const morning = sessions.filter((s) => s.timeOfDay === "morning");
  const evening = sessions.filter((s) => s.timeOfDay === "evening");

  if (morning.length === 0 && evening.length === 0) return null;

  return {
    label: "Durchschnitt",
    morningSys: morning.length
      ? Math.round(morning.reduce((s, m) => s + m.systolicAvg, 0) / morning.length)
      : 0,
    morningDia: morning.length
      ? Math.round(morning.reduce((s, m) => s + m.diastolicAvg, 0) / morning.length)
      : 0,
    eveningSys: evening.length
      ? Math.round(evening.reduce((s, m) => s + m.systolicAvg, 0) / evening.length)
      : 0,
    eveningDia: evening.length
      ? Math.round(evening.reduce((s, m) => s + m.diastolicAvg, 0) / evening.length)
      : 0,
  };
}

export function computeTrend(
  sessions: MeasurementSession[]
): "improving" | "stable" | "worsening" | null {
  if (sessions.length < 4) return null;

  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  const half = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, half);
  const newer = sorted.slice(half);

  const olderAvg =
    older.reduce((s, m) => s + m.systolicAvg, 0) / older.length;
  const newerAvg =
    newer.reduce((s, m) => s + m.systolicAvg, 0) / newer.length;

  const diff = newerAvg - olderAvg;
  if (diff < -3) return "improving";
  if (diff > 3) return "worsening";
  return "stable";
}

export function formatTimeOfDay(tod: string): string {
  switch (tod) {
    case "morning":
      return "Morgens";
    case "evening":
      return "Abends";
    default:
      return "Andere";
  }
}
