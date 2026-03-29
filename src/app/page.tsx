"use client";

import Link from "next/link";
import { useMeasurements } from "@/hooks/use-measurements";
import { MeasurementCard } from "@/components/measurement-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeStats, computeTrend, filterByDays } from "@/lib/calculations";
import {
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  Heart,
} from "lucide-react";
import { TimelineChart } from "@/components/charts/timeline-chart";

export default function DashboardPage() {
  const sessions = useMeasurements();
  const latest = sessions[0];

  const last14 = filterByDays(sessions, 14);
  const last7 = filterByDays(sessions, 7);
  const stats7 = computeStats(last7);
  const trend = computeTrend(filterByDays(sessions, 30));


  const TrendIcon =
    trend === "improving"
      ? TrendingDown
      : trend === "worsening"
        ? TrendingUp
        : Minus;
  const trendLabel =
    trend === "improving"
      ? "Verbessert"
      : trend === "worsening"
        ? "Verschlechtert"
        : "Stabil";
  const trendColor =
    trend === "improving"
      ? "text-green-600"
      : trend === "worsening"
        ? "text-red-600"
        : "text-muted-foreground";

  if (!latest) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Blutdruck Tracker</h1>
          <p className="text-muted-foreground">
            Starte mit deiner ersten Messung
          </p>
        </div>
        <Link href="/new">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Erste Messung erfassen
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/new">
          <Button size="sm" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            Neu
          </Button>
        </Link>
      </div>

      {/* Latest measurement */}
      <MeasurementCard session={latest} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5" />
              7-Tage Schnitt
            </div>
            {stats7 ? (
              <p className="text-xl font-bold tabular-nums">
                {stats7.avgSystolic}/{stats7.avgDiastolic}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendIcon className="h-3.5 w-3.5" />
              30-Tage Trend
            </div>
            {trend ? (
              <p className={`text-xl font-bold ${trendColor}`}>{trendLabel}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Zu wenig Daten</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mini chart */}
      {last14.length > 1 && <TimelineChart sessions={last14} />}

      {/* Recent measurements */}
      {sessions.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Letzte Messungen
            </h2>
            <Link
              href="/history"
              className="text-xs text-primary hover:underline"
            >
              Alle anzeigen
            </Link>
          </div>
          {sessions.slice(1, 4).map((s) => (
            <MeasurementCard key={s.id} session={s} compact />
          ))}
        </div>
      )}
    </div>
  );
}
