"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MeasurementForm } from "@/components/measurement-form";
import { BpCategoryBadge } from "@/components/bp-category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeasurement } from "@/hooks/use-measurements";
import { avg } from "@/lib/calculations";
import { ArrowRight, ArrowLeft, Check, Sun, Moon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FormValues {
  systolic: string;
  diastolic: string;
  pulse: string;
}

const EMPTY: FormValues = { systolic: "", diastolic: "", pulse: "" };

const TIME_OF_DAY_OPTIONS = [
  { value: "morning" as const, label: "Morgens", icon: Sun },
  { value: "evening" as const, label: "Abends", icon: Moon },
  { value: "other" as const, label: "Andere", icon: Clock },
];

function isValid(v: FormValues): boolean {
  const sys = parseInt(v.systolic);
  const dia = parseInt(v.diastolic);
  const pulse = parseInt(v.pulse);
  return (
    sys >= 60 && sys <= 300 &&
    dia >= 30 && dia <= 200 &&
    pulse >= 30 && pulse <= 250
  );
}

export default function NewMeasurementPage() {
  const router = useRouter();
  const createdAt = useRef(new Date());
  const [step, setStep] = useState(0); // 0 = first, 1 = second, 2 = summary
  const [m1, setM1] = useState<FormValues>({ ...EMPTY });
  const [m2, setM2] = useState<FormValues>({ ...EMPTY });
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "evening" | "other">(
    () => {
      const hour = new Date().getHours();
      if (hour < 12) return "morning";
      if (hour >= 17) return "evening";
      return "other";
    }
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const sys1 = parseInt(m1.systolic) || 0;
  const dia1 = parseInt(m1.diastolic) || 0;
  const pul1 = parseInt(m1.pulse) || 0;
  const sys2 = parseInt(m2.systolic) || 0;
  const dia2 = parseInt(m2.diastolic) || 0;
  const pul2 = parseInt(m2.pulse) || 0;

  const sysAvg = avg(sys1, sys2);
  const diaAvg = avg(dia1, dia2);
  const pulAvg = avg(pul1, pul2);

  async function handleSave() {
    setSaving(true);
    try {
      const now = createdAt.current;
      await addMeasurement({
        date: format(now, "dd.MM.yyyy"),
        time: format(now, "HH:mm"),
        timestamp: now.getTime(),
        timeOfDay,
        systolic1: sys1,
        diastolic1: dia1,
        pulse1: pul1,
        systolic2: sys2,
        diastolic2: dia2,
        pulse2: pul2,
        systolicAvg: sysAvg,
        diastolicAvg: diaAvg,
        pulseAvg: pulAvg,
        note: note || undefined,
      });
      router.push("/");
    } catch {
      setSaving(false);
      alert("Fehler beim Speichern. Bitte versuche es erneut.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Neue Messung</h1>
        <p className="text-sm text-muted-foreground">
          {format(createdAt.current, "dd.MM.yyyy, HH:mm")} Uhr
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all",
              s === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30",
              s < step && "w-2 bg-primary/60"
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardContent className="pt-6">
            <MeasurementForm label="Messung 1" idPrefix="m1" values={m1} onChange={setM1} />
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!isValid(m1)}
                size="lg"
                className="gap-2"
              >
                Weiter <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="pt-6">
            <MeasurementForm label="Messung 2" idPrefix="m2" values={m2} onChange={setM2} />
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Zurueck
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!isValid(m2)}
                size="lg"
                className="gap-2"
              >
                Weiter <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Zusammenfassung
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tabular-nums">
                    {sysAvg}
                  </span>
                  <span className="text-xl text-muted-foreground">/</span>
                  <span className="text-4xl font-bold tabular-nums">
                    {diaAvg}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    mmHg
                  </span>
                </div>
                <BpCategoryBadge systolic={sysAvg} diastolic={diaAvg} />
              </div>

              <p className="text-lg tabular-nums text-muted-foreground">
                Puls: {pulAvg} bpm
              </p>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  Messung 1: {sys1}/{dia1} ({pul1})
                </span>
                <span>
                  Messung 2: {sys2}/{dia2} ({pul2})
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Tageszeit
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OF_DAY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTimeOfDay(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-3 transition-all",
                        timeOfDay === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs text-muted-foreground">
                  Notiz (optional)
                </Label>
                <Input
                  id="note"
                  placeholder="z.B. nach dem Sport..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Zurueck
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="flex-1 gap-2"
            >
              <Check className="h-5 w-5" />
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
