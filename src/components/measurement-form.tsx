"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeasurementValues {
  systolic: string;
  diastolic: string;
  pulse: string;
}

interface MeasurementFormProps {
  label: string;
  idPrefix: string;
  values: MeasurementValues;
  onChange: (values: MeasurementValues) => void;
}

export function MeasurementForm({
  label,
  idPrefix,
  values,
  onChange,
}: MeasurementFormProps) {
  const sysRef = useRef<HTMLInputElement>(null);
  const diaRef = useRef<HTMLInputElement>(null);
  const pulseRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof MeasurementValues, value: string) => {
    if (value && !/^\d*$/.test(value)) return;
    onChange({ ...values, [field]: value });
    if (field === "systolic" && value.length === 3) {
      diaRef.current?.focus();
    } else if (field === "diastolic" && value.length === 2) {
      pulseRef.current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-sys`} className="text-xs text-muted-foreground">
            Systolisch
          </Label>
          <Input
            ref={sysRef}
            id={`${idPrefix}-sys`}
            type="tel"
            inputMode="numeric"
            placeholder="120"
            value={values.systolic}
            onChange={(e) => update("systolic", e.target.value)}
            className="h-14 text-center text-2xl font-bold tabular-nums"
            maxLength={3}
            autoFocus
          />
          <p className="text-center text-[10px] text-muted-foreground">mmHg</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-dia`} className="text-xs text-muted-foreground">
            Diastolisch
          </Label>
          <Input
            ref={diaRef}
            id={`${idPrefix}-dia`}
            type="tel"
            inputMode="numeric"
            placeholder="80"
            value={values.diastolic}
            onChange={(e) => update("diastolic", e.target.value)}
            className="h-14 text-center text-2xl font-bold tabular-nums"
            maxLength={3}
          />
          <p className="text-center text-[10px] text-muted-foreground">mmHg</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-pulse`} className="text-xs text-muted-foreground">
            Puls
          </Label>
          <Input
            ref={pulseRef}
            id={`${idPrefix}-pulse`}
            type="tel"
            inputMode="numeric"
            placeholder="72"
            value={values.pulse}
            onChange={(e) => update("pulse", e.target.value)}
            className="h-14 text-center text-2xl font-bold tabular-nums"
            maxLength={3}
          />
          <p className="text-center text-[10px] text-muted-foreground">bpm</p>
        </div>
      </div>
    </div>
  );
}
