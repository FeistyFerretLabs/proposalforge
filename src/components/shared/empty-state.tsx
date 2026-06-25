import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 p-12 text-center">
      <Icon className="mb-4 h-12 w-12 text-zinc-300" />
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
