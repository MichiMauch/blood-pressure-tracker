"use client";

import type { MeasurementSession } from "@/lib/types";
import { computeMorningEvening } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface MorningEveningChartProps {
  sessions: MeasurementSession[];
}

export function MorningEveningChart({ sessions }: MorningEveningChartProps) {
  const result = computeMorningEvening(sessions);
  if (!result) return null;

  const data = [
    {
      name: "Morgens",
      Systolisch: result.morningSys,
      Diastolisch: result.morningDia,
    },
    {
      name: "Abends",
      Systolisch: result.eveningSys,
      Diastolisch: result.eveningDia,
    },
  ].filter((d) => d.Systolisch > 0);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Morgens vs. Abends</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, "auto"]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
              />
              <Bar
                dataKey="Systolisch"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Diastolisch"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4">
          {result.morningSys > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Morgens</p>
              <p className="text-sm font-bold tabular-nums">
                {result.morningSys}/{result.morningDia}
              </p>
            </div>
          )}
          {result.eveningSys > 0 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Abends</p>
              <p className="text-sm font-bold tabular-nums">
                {result.eveningSys}/{result.eveningDia}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
