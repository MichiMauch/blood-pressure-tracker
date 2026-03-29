"use client";

import { useState } from "react";
import { useMeasurements } from "@/hooks/use-measurements";
import { generatePdfReport } from "@/lib/pdf-export";
import { computeStats, filterByDays } from "@/lib/calculations";
import { BpCategoryBadge } from "@/components/bp-category-badge";
import { FilterPills } from "@/components/filter-pills";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileCheck } from "lucide-react";
import { subDays } from "date-fns";

const PERIOD_OPTIONS = [
  { label: "7 Tage", value: 7 as number | null },
  { label: "30 Tage", value: 30 as number | null },
  { label: "90 Tage", value: 90 as number | null },
  { label: "Alle", value: null as number | null },
];

export default function ExportPage() {
  const sessions = useMeasurements();
  const [selectedDays, setSelectedDays] = useState<number | null>(30);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const filtered = filterByDays(sessions, selectedDays);
  const stats = computeStats(filtered);

  async function handleExport() {
    if (filtered.length === 0) return;

    setGenerating(true);
    setGenerated(false);

    const endDate = new Date();
    const startDate = selectedDays
      ? subDays(endDate, selectedDays)
      : new Date(Math.min(...filtered.map((s) => s.timestamp)));

    await generatePdfReport(filtered, startDate, endDate);

    setGenerating(false);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PDF Export</h1>
      <p className="text-sm text-muted-foreground">
        Erstelle einen formatierten Bericht fuer deinen Arzt
      </p>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Zeitraum
          </h3>
          <FilterPills
            options={PERIOD_OPTIONS}
            value={selectedDays}
            onChange={setSelectedDays}
          />
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Vorschau
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Messungen</span>
              <span className="font-medium">{stats.count}</span>
              <span className="text-muted-foreground">Durchschnitt</span>
              <span className="font-bold tabular-nums">
                {stats.avgSystolic}/{stats.avgDiastolic} mmHg
              </span>
              <span className="text-muted-foreground">Puls</span>
              <span className="font-medium tabular-nums">
                {stats.avgPulse} bpm
              </span>
              <span className="text-muted-foreground">Kategorie</span>
              <BpCategoryBadge
                systolic={stats.avgSystolic}
                diastolic={stats.avgDiastolic}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleExport}
        disabled={filtered.length === 0 || generating}
        size="lg"
        className="w-full gap-2"
      >
        {generated ? (
          <>
            <FileCheck className="h-5 w-5" />
            Heruntergeladen!
          </>
        ) : generating ? (
          "Wird erstellt..."
        ) : (
          <>
            <FileDown className="h-5 w-5" />
            PDF herunterladen ({filtered.length} Messungen)
          </>
        )}
      </Button>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Keine Messungen im gewaehlten Zeitraum
        </p>
      )}
    </div>
  );
}
