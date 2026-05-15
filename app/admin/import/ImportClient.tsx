"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { downloadTemplate, parseWorkbook, type ParsedRow } from "@/lib/excel";

export function ImportClient() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ inserted: number; errors: string[] } | null>(null);

  async function handleFile(file: File) {
    setSummary(null);
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    try {
      setRows(parseWorkbook(buf));
    } catch (e) {
      setRows([
        { row: 0, raw: {}, errors: [{ field: "(file)", message: (e as Error).message }] },
      ]);
    }
  }

  const validRows = rows?.filter((r) => r.data) ?? [];
  const errorRows = rows?.filter((r) => r.errors) ?? [];

  async function doImport() {
    if (!validRows.length) return;
    setSubmitting(true);
    setSummary(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: validRows.map((r) => r.data) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSummary({ inserted: 0, errors: [json.error ?? "Import failed"] });
      } else {
        setSummary({ inserted: json.inserted ?? 0, errors: json.errors ?? [] });
        setRows(null);
        setFileName(null);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-medium">1. Download the template</div>
          <p className="text-sm text-neutral-500">
            Excel sheet with all columns and example values. Edit it in Excel or Google Sheets.
          </p>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary">
          <Download className="h-4 w-4" /> Download template
        </button>
      </div>

      <div className="card p-5">
        <div className="font-medium">2. Upload your filled sheet</div>
        <p className="text-sm text-neutral-500 mb-3">
          We'll validate each row and show you what will be imported before saving.
        </p>
        <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 px-6 py-10 cursor-pointer hover:bg-neutral-50">
          <FileSpreadsheet className="h-8 w-8 text-neutral-400" />
          <span className="mt-2 text-sm text-neutral-700">
            {fileName ?? "Click to choose an .xlsx file"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>

      {summary && (
        <div className="card p-5 ring-1 ring-riverside-200 bg-riverside-50">
          <div className="font-medium text-riverside-800">
            Imported {summary.inserted} {summary.inserted === 1 ? "plant" : "plants"}.
          </div>
          {summary.errors.length > 0 && (
            <ul className="text-sm text-red-700 mt-2 list-disc pl-5">
              {summary.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {rows && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200">
            <div className="text-sm">
              <span className="font-medium text-riverside-700">{validRows.length} ready</span>
              {errorRows.length > 0 && (
                <span className="ml-3 font-medium text-red-700">
                  {errorRows.length} with errors
                </span>
              )}
            </div>
            <button
              className="btn-primary"
              disabled={!validRows.length || submitting}
              onClick={doImport}
            >
              <Upload className="h-4 w-4" />
              {submitting
                ? "Importing…"
                : `Import ${validRows.length} ${validRows.length === 1 ? "row" : "rows"}`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 text-left">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-neutral-200 align-top">
                    <td className="px-3 py-2 text-neutral-500">{r.row}</td>
                    <td className="px-3 py-2">{(r.raw as Record<string, unknown>).name as string ?? "—"}</td>
                    <td className="px-3 py-2">{(r.raw as Record<string, unknown>).plant_type as string ?? "—"}</td>
                    <td className="px-3 py-2">
                      {r.data ? (
                        <span className="inline-flex items-center gap-1 text-riverside-700">
                          <CheckCircle2 className="h-4 w-4" /> Ready
                        </span>
                      ) : (
                        <div className="text-red-700">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <XCircle className="h-4 w-4" /> Error
                          </span>
                          <ul className="text-xs mt-1 list-disc pl-5">
                            {r.errors!.map((e, j) => (
                              <li key={j}>
                                <code>{e.field}</code>: {e.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
