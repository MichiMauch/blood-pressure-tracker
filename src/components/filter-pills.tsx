"use client";

import { cn } from "@/lib/utils";

interface FilterOption<T> {
  label: string;
  value: T;
}

interface FilterPillsProps<T> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterPills<T>({
  options,
  value,
  onChange,
}: FilterPillsProps<T>) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
