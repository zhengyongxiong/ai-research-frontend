import { ArrowRight, BarChart3, FileText } from "lucide-react";

import type { PageKey } from "../types";

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

const cards = [
  {
    key: "report" as const,
    title: "生成行业研究报告",
    body: "输入研究主题，生成结构化行业分析内容。",
    icon: BarChart3,
  },
  {
    key: "template" as const,
    title: "上传模板并自动填充",
    body: "识别 Word 占位符，按字段生成并回填文档。",
    icon: FileText,
  },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-brand-700">AI Research Copilot</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink md:text-4xl">
            文档生成 Demo 工作台
          </h1>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group rounded-lg border border-slate-200 bg-white p-6 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lg"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-700" />
              </div>
              <h2 className="text-xl font-semibold tracking-normal text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{card.body}</p>
            </button>
          );
        })}
      </section>
    </div>
  );
}
