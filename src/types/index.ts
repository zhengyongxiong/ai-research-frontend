export type PageKey = "dashboard" | "report" | "template";

export type ReportType = "brief" | "standard" | "investment";

export type ReportLanguage = "zh" | "en";

export interface ReportRequest {
  topic: string;
  report_type: ReportType;
  language: ReportLanguage;
  word_count: number;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ReportResponse {
  title: string;
  content: string;
  sections: ReportSection[];
}

export interface PlaceholderResponse {
  placeholders: string[];
  mode?: "placeholder" | "smart";
}

export interface TemplateFillResponse {
  message: string;
  download_url: string;
}
