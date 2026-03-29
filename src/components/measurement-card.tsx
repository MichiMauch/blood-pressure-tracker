"use client";

import type { MeasurementSession } from "@/lib/types";
import { BpCategoryBadge } from "./bp-category-badge";
import { formatTimeOfDay } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeasurementCardProps {
  session: MeasurementSession;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export function MeasurementCard({
  session,
  onDelete,
  compact = false,
}: MeasurementCardProps) {
  return (
    <Card className={cn("p-4", compact && "p-3")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {session.date} {session.time}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimeOfDay(session.timeOfDay)}
            </span>
            <BpCategoryBadge
              systolic={session.systolicAvg}
              diastolic={session.diastolicAvg}
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">
              {session.systolicAvg}
            </span>
            <span className="text-lg text-muted-foreground">/</span>
            <span className="text-3xl font-bold tabular-nums">
              {session.diastolicAvg}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">mmHg</span>
            <span className="ml-3 text-lg tabular-nums text-muted-foreground">
              {session.pulseAvg} bpm
            </span>
          </div>

          {!compact && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                1: {session.systolic1}/{session.diastolic1} ({session.pulse1})
              </span>
              <span>
                2: {session.systolic2}/{session.diastolic2} ({session.pulse2})
              </span>
            </div>
          )}

          {session.note && (
            <p className="text-xs text-muted-foreground italic">
              {session.note}
            </p>
          )}
        </div>

        {onDelete && session.id && (
          <button
            onClick={() => onDelete(session.id!)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
