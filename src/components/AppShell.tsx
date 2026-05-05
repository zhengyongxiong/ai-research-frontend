import type { ReactNode } from "react";
import { BarChart3, FileText, Home, Sparkles } from "lucide-react";

import type { PageKey } from "../types";

interface AppShellProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}

const navItems: Array<{
  key: PageKey;
  label: string;
  icon: typeof Home;
}> = [
  { key: "dashboard", label: "工作台", icon: Home },
  { key: "report", label: "研究报告", icon: BarChart3 },
  { key: "template", label: "模板填充", icon: FileText },
];

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
          <div className="flex items-center gap-3 md:mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-normal text-ink">AI Research</div>
              <div className="text-xs text-slate-500">Copilot Demo</div>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto md:mt-0 md:flex-col md:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  key={item.key}
                  className={`flex h-10 min-w-fit items-center gap-2 rounded-lg px-3 text-sm font-medium transition md:w-full ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
