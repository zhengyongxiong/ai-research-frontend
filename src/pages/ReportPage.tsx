import { Check, Clipboard, Download, FileDown, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { generateReport } from "../api/client";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import type { ReportLanguage, ReportResponse, ReportType } from "../types";
import { downloadTextFile } from "../utils/download";

const reportTypes: Array<{ label: string; value: ReportType }> = [
  { label: "简版", value: "brief" },
  { label: "标准版", value: "standard" },
  { label: "投资分析版", value: "investment" },
];

const languages: Array<{ label: string; value: ReportLanguage }> = [
  { label: "中文", value: "zh" },
  { label: "英文", value: "en" },
];

const wordCounts = [1000, 2000, 3000];

export function ReportPage() {
  const [topic, setTopic] = useState("石油产业链");
  const [reportType, setReportType] = useState<ReportType>("standard");
  const [language, setLanguage] = useState<ReportLanguage>("zh");
  const [wordCount, setWordCount] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);

  const canSubmit = topic.trim().length > 0 && !loading;
  const markdownContent = useMemo(() => {
    if (!report) return "";
    return `# ${report.title}\n\n${report.content}`;
  }, [report]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const data = await generateReport({
        topic: topic.trim(),
        report_type: reportType,
        language,
        word_count: wordCount,
      });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "报告生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!report) return;
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownload(type: "md" | "txt") {
    if (!report) return;
    const safeTopic = topic.trim().replace(/[\\/:*?"<>|]/g, "_") || "research_report";
    if (type === "md") {
      downloadTextFile(`${safeTopic}.md`, markdownContent, "text/markdown;charset=utf-8");
    } else {
      downloadTextFile(`${safeTopic}.txt`, report.content, "text/plain;charset=utf-8");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(360px,440px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div>
          <p className="text-sm font-medium text-brand-700">报告生成</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">行业研究分析报告</h1>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">研究主题</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="例如：石油产业链、半导体设备、低空经济"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">报告类型</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {reportTypes.map((item) => (
                <button
                  key={item.value}
                  className={`h-10 rounded-lg border px-2 text-sm transition ${
                    reportType === item.value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setReportType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-slate-700">语言</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {languages.map((item) => (
                  <button
                    key={item.value}
                    className={`h-10 rounded-lg border px-2 text-sm transition ${
                      language === item.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setLanguage(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">字数范围</span>
              <select
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value))}
              >
                {wordCounts.map((count) => (
                  <option key={count} value={count}>
                    {count}字
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button className="w-full" loading={loading} disabled={!canSubmit} icon={<Send className="h-4 w-4" />} onClick={handleSubmit}>
            生成报告
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">结果预览</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-ink">
              {report?.title || "等待生成"}
            </h2>
          </div>
          {report ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />} onClick={handleCopy}>
                {copied ? "已复制" : "复制全文"}
              </Button>
              <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => handleDownload("md")}>
                Markdown
              </Button>
              <Button variant="secondary" icon={<FileDown className="h-4 w-4" />} onClick={() => handleDownload("txt")}>
                TXT
              </Button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-700">正在生成结构化报告</p>
            </div>
          </div>
        ) : report ? (
          <article className="max-h-[72vh] overflow-auto pr-2">
            <div className="space-y-6">
              {report.sections.map((section) => (
                <section key={section.title} className="border-b border-slate-100 pb-5 last:border-b-0">
                  <h3 className="text-lg font-semibold tracking-normal text-ink">{section.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.content}</p>
                </section>
              ))}
            </div>
          </article>
        ) : (
          <EmptyState
            title="报告会在这里出现"
            description="选择主题和报告参数后，右侧会展示可复制、可下载的结构化内容。"
          />
        )}
      </section>
    </div>
  );
}

