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

export type BetterIndex = 1 | 2;

export interface BetterMeasurement {
  which: BetterIndex;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export function getBetterMeasurement(
  s: Pick<
    MeasurementSession,
    | "systolic1"
    | "diastolic1"
    | "pulse1"
    | "systolic2"
    | "diastolic2"
    | "pulse2"
  >
): BetterMeasurement {
  const m1Wins =
    s.systolic1 < s.systolic2 ||
    (s.systolic1 === s.systolic2 && s.diastolic1 <= s.diastolic2);
  return m1Wins
    ? {
        which: 1,
        systolic: s.systolic1,
        diastolic: s.diastolic1,
        pulse: s.pulse1,
      }
    : {
        which: 2,
        systolic: s.systolic2,
        diastolic: s.diastolic2,
        pulse: s.pulse2,
      };
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
  const better = sessions.map((m) => getBetterMeasurement(m));
  return {
    avgSystolic: Math.round(better.reduce((s, m) => s + m.systolic, 0) / n),
    avgDiastolic: Math.round(better.reduce((s, m) => s + m.diastolic, 0) / n),
    avgPulse: Math.round(better.reduce((s, m) => s + m.pulse, 0) / n),
    minSystolic: Math.min(...better.map((m) => m.systolic)),
    maxSystolic: Math.max(...better.map((m) => m.systolic)),
    minDiastolic: Math.min(...better.map((m) => m.diastolic)),
    maxDiastolic: Math.max(...better.map((m) => m.diastolic)),
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

  return Array.from(weeks.entries()).map(([week, data]) => {
    const better = data.map((m) => getBetterMeasurement(m));
    return {
      week,
      systolic: Math.round(
        better.reduce((s, m) => s + m.systolic, 0) / better.length
      ),
      diastolic: Math.round(
        better.reduce((s, m) => s + m.diastolic, 0) / better.length
      ),
      pulse: Math.round(
        better.reduce((s, m) => s + m.pulse, 0) / better.length
      ),
      count: data.length,
    };
  });
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

  const mBetter = morning.map((m) => getBetterMeasurement(m));
  const eBetter = evening.map((m) => getBetterMeasurement(m));

  return {
    label: "Durchschnitt",
    morningSys: mBetter.length
      ? Math.round(mBetter.reduce((s, m) => s + m.systolic, 0) / mBetter.length)
      : 0,
    morningDia: mBetter.length
      ? Math.round(
          mBetter.reduce((s, m) => s + m.diastolic, 0) / mBetter.length
        )
      : 0,
    eveningSys: eBetter.length
      ? Math.round(eBetter.reduce((s, m) => s + m.systolic, 0) / eBetter.length)
      : 0,
    eveningDia: eBetter.length
      ? Math.round(
          eBetter.reduce((s, m) => s + m.diastolic, 0) / eBetter.length
        )
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
    older.reduce((s, m) => s + getBetterMeasurement(m).systolic, 0) /
    older.length;
  const newerAvg =
    newer.reduce((s, m) => s + getBetterMeasurement(m).systolic, 0) /
    newer.length;

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
