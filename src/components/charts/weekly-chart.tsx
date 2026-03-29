"use client";

import type { MeasurementSession } from "@/lib/types";
import { groupByWeek } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface WeeklyChartProps {
  sessions: MeasurementSession[];
}

export function WeeklyChart({ sessions }: WeeklyChartProps) {
  const data = groupByWeek(sessions);
  if (data.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Wochenstatistik</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 9 }}
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
                formatter={(value, name) => [
                  `${value} ${name === "Puls" ? "bpm" : "mmHg"}`,
                  `${name}`,
                ]}
              />
              <Bar
                dataKey="systolic"
                name="Systolisch"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="diastolic"
                name="Diastolisch"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
