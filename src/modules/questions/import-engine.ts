import type { ImportAdapter } from "./import-types";

/**
 * Future home of the Universal Question Import Engine.
 * Adapters (CSV, Excel, Word, PDF, JSON, ZIP) normalize to canonical JSON here.
 * Word .docx: mammoth extract → Gemini JSON extraction (no parser fallback).
 */
export const importAdapters: Record<string, ImportAdapter> = {
  csv: {
    id: "csv",
    label: "CSV / TXT",
    extensions: [".csv", ".txt"],
    enabled: false,
  },
  json: {
    id: "json",
    label: "JSON",
    extensions: [".json"],
    enabled: false,
  },
  xlsx: {
    id: "xlsx",
    label: "Excel",
    extensions: [".xlsx"],
    enabled: false,
  },
  docx: {
    id: "docx",
    label: "Word",
    extensions: [".docx"],
    enabled: true,
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    extensions: [".pdf"],
    enabled: false,
  },
  zip: {
    id: "zip",
    label: "ZIP (questions + images)",
    extensions: [".zip"],
    enabled: false,
  },
};
