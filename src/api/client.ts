import type {
  PlaceholderResponse,
  ReportRequest,
  ReportResponse,
  TemplateFillResponse,
} from "../types";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let message = "请求失败，请稍后重试。";
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function generateReport(payload: ReportRequest) {
  return request<ReportResponse>("/api/report/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function extractPlaceholders(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<PlaceholderResponse>("/api/template/extract-placeholders", {
    method: "POST",
    body: formData,
  });
}

export function fillTemplate(params: {
  file: File;
  topic: string;
  instruction: string;
  fieldMapping: Record<string, string>;
}) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("topic", params.topic);
  formData.append("instruction", params.instruction);
  formData.append("field_mapping", JSON.stringify(params.fieldMapping));

  return request<TemplateFillResponse>("/api/template/fill", {
    method: "POST",
    body: formData,
  });
}

export function toDownloadUrl(downloadUrl: string) {
  if (/^https?:\/\//i.test(downloadUrl)) {
    return downloadUrl;
  }
  return `${API_BASE_URL}${downloadUrl}`;
}
