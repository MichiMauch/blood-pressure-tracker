"use client";

import useSWR, { mutate } from "swr";
import type { MeasurementSession } from "@/lib/types";

const API_URL = "/api/measurements";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export function useMeasurements(): MeasurementSession[] {
  const { data } = useSWR<MeasurementSession[]>(API_URL, fetcher);
  return data ?? [];
}

export async function addMeasurement(
  data: Omit<MeasurementSession, "id">
): Promise<void> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  await mutate(API_URL);
}

export async function deleteMeasurement(id: number): Promise<void> {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  await mutate(API_URL);
}
