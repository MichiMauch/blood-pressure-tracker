"use client";

import { useState } from "react";
import { useMeasurements, deleteMeasurement } from "@/hooks/use-measurements";
import { MeasurementCard } from "@/components/measurement-card";
import { FilterPills } from "@/components/filter-pills";
import { filterByDays, filterByTimeOfDay } from "@/lib/calculations";
import { ClipboardList } from "lucide-react";

const PERIOD_OPTIONS = [
  { label: "7 Tage", value: 7 as number | null },
  { label: "30 Tage", value: 30 as number | null },
  { label: "90 Tage", value: 90 as number | null },
  { label: "Alle", value: null as number | null },
];

const TOD_OPTIONS = [
  { label: "Alle", value: "all" as const },
  { label: "Morgens", value: "morning" as const },
  { label: "Abends", value: "evening" as const },
];

export default function HistoryPage() {
  const sessions = useMeasurements();
  const [days, setDays] = useState<number | null>(30);
  const [tod, setTod] = useState<"morning" | "evening" | "all">("all");

  const filtered = filterByTimeOfDay(filterByDays(sessions, days), tod);

  async function handleDelete(id: number) {
    if (confirm("Messung wirklich loeschen?")) {
      await deleteMeasurement(id);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Verlauf</h1>

      <div className="space-y-2">
        <FilterPills options={PERIOD_OPTIONS} value={days} onChange={setDays} />
        <FilterPills options={TOD_OPTIONS} value={tod} onChange={setTod} />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} Messung{filtered.length !== 1 && "en"}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">Keine Messungen gefunden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <MeasurementCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
