export interface MeasurementSession {
  id?: number;
  date: string; // DD.MM.YYYY
  time: string; // HH:MM
  timestamp: number; // Unix ms for sorting
  timeOfDay: "morning" | "evening" | "other";

  systolic1: number;
  diastolic1: number;
  pulse1: number;

  systolic2: number;
  diastolic2: number;
  pulse2: number;

  systolicAvg: number;
  diastolicAvg: number;
  pulseAvg: number;

  note?: string;
}
