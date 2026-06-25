"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 p-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-medium text-zinc-500",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((item, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "bg-white transition-colors",
                onRowClick && "cursor-pointer hover:bg-zinc-50"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 text-zinc-900", col.className)}
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
