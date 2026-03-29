"use client";

import { useState } from "react";
import { useMeasurements } from "@/hooks/use-measurements";
import { filterByDays } from "@/lib/calculations";
import { FilterPills } from "@/components/filter-pills";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { MorningEveningChart } from "@/components/charts/morning-evening-chart";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { BarChart3 } from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "7T", value: 7 as number | null },
  { label: "30T", value: 30 as number | null },
  { label: "90T", value: 90 as number | null },
  { label: "Alle", value: null as number | null },
];

export default function ChartsPage() {
  const sessions = useMeasurements();
  const [days, setDays] = useState<number | null>(30);

  const filtered = filterByDays(sessions, days);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Noch keine Messungen fuer Grafiken vorhanden
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grafiken</h1>
        <FilterPills options={PERIOD_OPTIONS} value={days} onChange={setDays} />
      </div>

      <TimelineChart sessions={filtered} />
      <MorningEveningChart sessions={filtered} />
      <WeeklyChart sessions={filtered} />
      <DistributionChart sessions={filtered} />
    </div>
  );
}
