export interface BpCategory {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  /** Lower bound (inclusive). Classification uses the higher of systolic/diastolic. */
  min: { systolic: number; diastolic: number };
}

export const BP_CATEGORIES: BpCategory[] = [
  {
    label: "Optimal",
    color: "#22c55e",
    bgColor: "bg-green-100 dark:bg-green-950",
    textColor: "text-green-700 dark:text-green-400",
    min: { systolic: 0, diastolic: 0 },
  },
  {
    label: "Normal",
    color: "#84cc16",
    bgColor: "bg-lime-100 dark:bg-lime-950",
    textColor: "text-lime-700 dark:text-lime-400",
    min: { systolic: 120, diastolic: 80 },
  },
  {
    label: "Hoch-Normal",
    color: "#eab308",
    bgColor: "bg-yellow-100 dark:bg-yellow-950",
    textColor: "text-yellow-700 dark:text-yellow-400",
    min: { systolic: 130, diastolic: 85 },
  },
  {
    label: "Grad 1",
    color: "#f97316",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    textColor: "text-orange-700 dark:text-orange-400",
    min: { systolic: 140, diastolic: 90 },
  },
  {
    label: "Grad 2",
    color: "#ef4444",
    bgColor: "bg-red-100 dark:bg-red-950",
    textColor: "text-red-700 dark:text-red-400",
    min: { systolic: 160, diastolic: 100 },
  },
  {
    label: "Grad 3",
    color: "#991b1b",
    bgColor: "bg-red-200 dark:bg-red-900",
    textColor: "text-red-900 dark:text-red-300",
    min: { systolic: 180, diastolic: 110 },
  },
];

export function getBpCategory(systolic: number, diastolic: number): BpCategory {
  // Iterates from highest to lowest - returns the first (highest) matching category
  for (let i = BP_CATEGORIES.length - 1; i >= 0; i--) {
    const cat = BP_CATEGORIES[i];
    if (systolic >= cat.min.systolic || diastolic >= cat.min.diastolic) {
      return cat;
    }
  }
  return BP_CATEGORIES[0];
}

export const ZONE_BOUNDARIES = [
  { y: 120, label: "Optimal", color: "#22c55e" },
  { y: 130, label: "Normal", color: "#84cc16" },
  { y: 140, label: "Hoch-Normal", color: "#eab308" },
  { y: 160, label: "Grad 1", color: "#f97316" },
  { y: 180, label: "Grad 2", color: "#ef4444" },
];
