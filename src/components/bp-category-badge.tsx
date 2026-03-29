"use client";

import { getBpCategory } from "@/lib/bp-categories";
import { cn } from "@/lib/utils";

interface BpCategoryBadgeProps {
  systolic: number;
  diastolic: number;
  className?: string;
}

export function BpCategoryBadge({
  systolic,
  diastolic,
  className,
}: BpCategoryBadgeProps) {
  const category = getBpCategory(systolic, diastolic);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        category.bgColor,
        category.textColor,
        className
      )}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {category.label}
    </span>
  );
}
