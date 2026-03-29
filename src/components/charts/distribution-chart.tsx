"use client";

import type { MeasurementSession } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { getBpCategory, BP_CATEGORIES } from "@/lib/bp-categories";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";

interface DistributionChartProps {
  sessions: MeasurementSession[];
}

export function DistributionChart({ sessions }: DistributionChartProps) {
  if (sessions.length === 0) return null;

  const data = sessions.map((s) => ({
    dia: s.diastolicAvg,
    sys: s.systolicAvg,
    date: s.date,
    time: s.time,
    fill: getBpCategory(s.systolicAvg, s.diastolicAvg).color,
  }));

  // Category distribution counts
  const distribution = BP_CATEGORIES.map((cat) => ({
    ...cat,
    count: sessions.filter((s) => {
      const c = getBpCategory(s.systolicAvg, s.diastolicAvg);
      return c.label === cat.label;
    }).length,
  })).filter((c) => c.count > 0);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Verteilung</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="dia"
                name="Diastolisch"
                type="number"
                domain={["auto", "auto"]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Diastolisch (mmHg)",
                  position: "bottom",
                  fontSize: 10,
                  offset: -5,
                }}
              />
              <YAxis
                dataKey="sys"
                name="Systolisch"
                type="number"
                domain={["auto", "auto"]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
                label={{
                  value: "Systolisch",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 10,
                  offset: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
                formatter={(value, name) => [
                  `${value} mmHg`,
                  `${name}`,
                ]}
                labelFormatter={() => ""}
              />
              <Scatter
                data={data}
                shape={(props: { cx?: number; cy?: number; fill?: string }) => (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill={props.fill}
                    fillOpacity={0.7}
                    stroke={props.fill}
                    strokeWidth={1}
                  />
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {distribution.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center gap-2 rounded-md px-2 py-1"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs">
                {cat.label}: {cat.count}x (
                {Math.round((cat.count / sessions.length) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
