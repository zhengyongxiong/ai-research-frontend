import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

