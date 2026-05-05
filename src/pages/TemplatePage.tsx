import { CheckCircle2, Download, FileText, UploadCloud } from "lucide-react";
import { ChangeEvent, useState } from "react";

import { extractPlaceholders, fillTemplate, toDownloadUrl } from "../api/client";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

const defaultLabels: Record<string, string> = {
  company_intro: "公司简介",
  industry_chain: "产业链分析",
  market_trend: "市场趋势",
};

export function TemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("石油产业链");
  const [instruction, setInstruction] = useState(
    "请根据石油行业研究主题，填充公司简介、产业链分析和市场趋势部分，语言正式，适合行业研究报告。"
  );
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [templateMode, setTemplateMode] = useState<"placeholder" | "smart">("placeholder");
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [savedPath, setSavedPath] = useState("");

  const canGenerate =
    !!file && topic.trim().length > 0 && instruction.trim().length > 0 && placeholders.length > 0 && !loading;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setDownloadUrl("");
    setSavedPath("");
    setPlaceholders([]);
    setTemplateMode("placeholder");
    setFieldMapping({});

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!nextFile.name.toLowerCase().endsWith(".docx")) {
      setFile(null);
      setError("仅支持上传 .docx 文件。");
      return;
    }

    setFile(nextFile);
    setExtracting(true);
    try {
      const data = await extractPlaceholders(nextFile);
      setPlaceholders(data.placeholders);
      setTemplateMode(data.mode || "placeholder");
      const initialMapping = data.placeholders.reduce<Record<string, string>>((acc, key) => {
        acc[key] = defaultLabels[key] || key;
        return acc;
      }, {});
      setFieldMapping(initialMapping);
    } catch (err) {
      setError(err instanceof Error ? err.message : "占位符提取失败。");
    } finally {
      setExtracting(false);
    }
  }

  function updateFieldMapping(key: string, value: string) {
    setFieldMapping((current) => ({ ...current, [key]: value }));
  }

  async function handleGenerate() {
    if (!file || !canGenerate) return;
    setLoading(true);
    setError("");
    setDownloadUrl("");
    setSavedPath("");
    try {
      const data = await fillTemplate({
        file,
        topic: topic.trim(),
        instruction: instruction.trim(),
        fieldMapping,
      });
      const nextDownloadUrl = toDownloadUrl(data.download_url);
      setDownloadUrl(nextDownloadUrl);
      setSavedPath("文档已生成，请点击右上角“下载 Word 文档”保存到本地。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "文档生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!downloadUrl) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("下载失败，生成文件可能已不存在，请重新生成。");
      }

      const blob = await response.blob();
      const filename = getResponseFilename(response) || getDownloadFilename(downloadUrl);
      const saved = await saveBlobToLocal(blob, filename);
      setSavedPath(saved ? `已保存到本地：${filename}` : "已触发浏览器下载，请查看系统下载文件夹。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "下载失败，请稍后重试。");
    } finally {
      setDownloading(false);
    }
  }

  function triggerBrowserDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async function saveBlobToLocal(blob: Blob, filename: string) {
    const picker = (window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{ description: string; accept: Record<string, string[]> }>;
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }).showSaveFilePicker;

    if (picker) {
      try {
        const handle = await picker({
          suggestedName: filename,
          types: [
            {
              description: "Word 文档",
              accept: {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        if (name === "AbortError") {
          return false;
        }
      }
    }

    triggerBrowserDownload(blob, filename);
    return false;
  }

  function getResponseFilename(response: Response) {
    const disposition = response.headers.get("Content-Disposition") || "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) {
      return plainMatch[1];
    }
    return "";
  }

  function getDownloadFilename(url: string) {
    try {
      const filename = new URL(url).pathname.split("/").filter(Boolean).pop();
      if (filename) {
        return decodeURIComponent(filename);
      }
    } catch {
      const filename = url.split("/").filter(Boolean).pop();
      if (filename) {
        return decodeURIComponent(filename);
      }
    }
    const safeTopic = topic.trim().replace(/[\\/:*?"<>|]/g, "_") || "filled_document";
    return `${safeTopic}_研究报告.docx`;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(380px,500px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div>
          <p className="text-sm font-medium text-brand-700">模板填充</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">Word 模板自动生成</h1>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">上传 .docx 模板</span>
            <div className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-brand-600 hover:bg-brand-50/50">
              <UploadCloud className="mb-2 h-6 w-6 text-brand-700" />
              <span className="text-sm font-medium text-slate-700">
                {file ? file.name : "选择 Word 模板文件"}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                支持占位符模板，也支持普通 Word 表格空栏
              </span>
              <input className="hidden" type="file" accept=".docx" onChange={handleFileChange} />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">研究主题</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="例如：石油产业链"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">填充说明</span>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="请描述写作风格、适用场景和需要覆盖的内容。"
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            className="w-full"
            loading={loading}
            disabled={!canGenerate}
            icon={<FileText className="h-4 w-4" />}
            onClick={handleGenerate}
          >
            生成填充文档
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">字段映射</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-ink">
              {placeholders.length
                ? templateMode === "smart"
                  ? `检测到 ${placeholders.length} 个可填字段`
                  : `检测到 ${placeholders.length} 个占位符`
                : "等待上传模板"}
            </h2>
          </div>
          {downloadUrl ? (
            <Button
              icon={<Download className="h-4 w-4" />}
              loading={downloading}
              onClick={handleDownload}
            >
              下载 Word 文档
            </Button>
          ) : null}
        </div>

        {extracting ? (
          <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-700">正在读取 Word 占位符</p>
            </div>
          </div>
        ) : placeholders.length ? (
          <div className="space-y-4">
            {downloadUrl ? (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  文档生成成功
                </div>
                {savedPath ? (
                  <div className="mt-2 break-all text-xs text-emerald-800">
                    {savedPath}
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    className="text-xs font-medium text-emerald-800 underline underline-offset-4"
                    onClick={() => {
                      handleDownload();
                    }}
                  >
                    重新下载
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {placeholders.map((key) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {templateMode === "smart" ? key : `{{${key}}}`}
                    </span>
                    <span className="text-xs text-slate-400">字段说明</span>
                  </div>
                  <input
                    className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
                    value={fieldMapping[key] || ""}
                    onChange={(event) => updateFieldMapping(key, event.target.value)}
                    placeholder={`${key} 的内容说明`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="字段会在这里出现"
            description="上传包含占位符的 docx，或带表格空栏的普通 Word 模板后，可逐项填写字段说明。"
          />
        )}
      </section>
    </div>
  );
}
