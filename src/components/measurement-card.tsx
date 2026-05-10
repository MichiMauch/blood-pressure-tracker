"use client";

import type { MeasurementSession } from "@/lib/types";
import { BpCategoryBadge } from "./bp-category-badge";
import { formatTimeOfDay, getBetterMeasurement } from "@/lib/calculations";
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
  const better = getBetterMeasurement(session);
  const m1Better = better.which === 1;

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
              systolic={better.systolic}
              diastolic={better.diastolic}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-md border p-2",
                m1Better ? "border-primary/40 bg-primary/5" : "border-border"
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Messung 1
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-2xl tabular-nums",
                    m1Better ? "font-bold" : "font-normal text-muted-foreground"
                  )}
                >
                  {session.systolic1}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span
                  className={cn(
                    "text-2xl tabular-nums",
                    m1Better ? "font-bold" : "font-normal text-muted-foreground"
                  )}
                >
                  {session.diastolic1}
                </span>
              </div>
              <div
                className={cn(
                  "text-xs tabular-nums",
                  m1Better ? "font-semibold" : "text-muted-foreground"
                )}
              >
                {session.pulse1} bpm
              </div>
            </div>

            <div
              className={cn(
                "rounded-md border p-2",
                !m1Better ? "border-primary/40 bg-primary/5" : "border-border"
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Messung 2
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-2xl tabular-nums",
                    !m1Better
                      ? "font-bold"
                      : "font-normal text-muted-foreground"
                  )}
                >
                  {session.systolic2}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span
                  className={cn(
                    "text-2xl tabular-nums",
                    !m1Better
                      ? "font-bold"
                      : "font-normal text-muted-foreground"
                  )}
                >
                  {session.diastolic2}
                </span>
              </div>
              <div
                className={cn(
                  "text-xs tabular-nums",
                  !m1Better ? "font-semibold" : "text-muted-foreground"
                )}
              >
                {session.pulse2} bpm
              </div>
            </div>
          </div>

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
