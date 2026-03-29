"use client";

import type { MeasurementSession } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

interface TimelineChartProps {
  sessions: MeasurementSession[];
}

export function TimelineChart({ sessions }: TimelineChartProps) {
  const data = [...sessions]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((s) => ({
      date: s.date,
      time: s.time,
      sys: s.systolicAvg,
      dia: s.diastolicAvg,
      pulse: s.pulseAvg,
    }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Zeitverlauf</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[50, "auto"]}
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
                labelFormatter={(label, payload) => {
                  if (payload?.[0]?.payload?.time) {
                    return `${label}, ${payload[0].payload.time}`;
                  }
                  return label;
                }}
              />
              <ReferenceArea y1={0} y2={120} fill="#22c55e" fillOpacity={0.05} />
              <ReferenceArea y1={120} y2={130} fill="#84cc16" fillOpacity={0.05} />
              <ReferenceArea y1={130} y2={140} fill="#eab308" fillOpacity={0.05} />
              <ReferenceArea y1={140} y2={160} fill="#f97316" fillOpacity={0.05} />
              <ReferenceArea y1={160} y2={300} fill="#ef4444" fillOpacity={0.05} />
              <ReferenceLine y={140} stroke="#f97316" strokeDasharray="3 3" label={{ value: "140", fontSize: 9, fill: "#f97316" }} />
              <ReferenceLine y={120} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "120", fontSize: 9, fill: "#22c55e" }} />
              <Line
                type="monotone"
                dataKey="sys"
                name="Systolisch"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="dia"
                name="Diastolisch"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="pulse"
                name="Puls"
                stroke="var(--color-chart-5)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Systolisch
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-chart-2" /> Diastolisch
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 rounded-full border border-chart-5" /> Puls
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
