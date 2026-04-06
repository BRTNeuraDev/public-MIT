"use client";

import { useState, useCallback } from "react";
import { trackUsage, trackDownload } from "@/lib/analytics";

/** Supported conversion modes */
type ConvertMode = "csv-to-json" | "json-to-csv";

/** Auto-detects delimiter from the first line of CSV text */
function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

/**
 * Parses a CSV line respecting quoted fields.
 * Handles commas and quotes inside quoted values.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

/** Converts CSV text to a JSON string (array of objects) */
function csvToJson(csv: string): string {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row.");
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] ?? "").trim();
    });
    return obj;
  });

  return JSON.stringify(rows, null, 2);
}

/** Escapes a CSV field value, quoting if it contains delimiter, quotes, or newlines */
function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Converts a JSON array to CSV text */
function jsonToCsv(json: string): string {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of objects.");
  }
  if (parsed.length === 0) {
    throw new Error("JSON array is empty.");
  }

  // Extract all unique keys across all objects
  const keySet = new Set<string>();
  for (const item of parsed) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error("Each element in the JSON array must be an object.");
    }
    Object.keys(item as Record<string, unknown>).forEach((k) => keySet.add(k));
  }
  const headers = Array.from(keySet);

  const headerRow = headers.map(escapeCsvField).join(",");
  const dataRows = parsed.map((item: Record<string, unknown>) => {
    return headers
      .map((h) => {
        const val = item[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return escapeCsvField(JSON.stringify(val));
        return escapeCsvField(String(val));
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * CSV ↔ JSON Converter tool: convert between CSV and JSON formats with auto-detection.
 */
export default function CsvJson() {
  const [mode, setMode] = useState<ConvertMode>("csv-to-json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const placeholder =
    mode === "csv-to-json"
      ? "name,email,city\nJohn,john@example.com,Pune\nJane,jane@example.com,Mumbai"
      : '[{\n  "name": "John",\n  "email": "john@example.com",\n  "city": "Pune"\n}]';

  const handleConvert = useCallback(() => {
    setError("");
    setOutput("");
    setCopied(false);
    try {
      const result =
        mode === "csv-to-json" ? csvToJson(input) : jsonToCsv(input);
      setOutput(result);
      trackUsage("csv-json", "CSV ↔ JSON");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    }
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const isJson = mode === "csv-to-json";
    const blob = new Blob([output], {
      type: isJson ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isJson ? "converted.json" : "converted.csv";
    a.click();
    URL.revokeObjectURL(url);
    trackDownload("csv-json");
  }, [output, mode]);

  const handleModeSwitch = useCallback(
    (newMode: ConvertMode) => {
      if (newMode === mode) return;
      setMode(newMode);
      setInput("");
      setOutput("");
      setError("");
      setCopied(false);
    },
    [mode]
  );

  return (
    <div className="space-y-6">
      {/* How to use guide */}
      <details className="group rounded-lg border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300">
          How to use this tool
          <span className="text-zinc-600 transition-transform group-open:rotate-180">&#9660;</span>
        </summary>
        <div className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-zinc-400 space-y-2">
          <p><strong className="text-zinc-300">Step 1:</strong> Choose conversion direction — CSV → JSON or JSON → CSV.</p>
          <p><strong className="text-zinc-300">Step 2:</strong> Paste your data into the text area.</p>
          <p><strong className="text-zinc-300">Step 3:</strong> Click <strong className="text-indigo-400">Convert</strong> to transform the data.</p>
          <p><strong className="text-zinc-300">Step 4:</strong> Use <strong className="text-zinc-300">Copy to Clipboard</strong> or <strong className="text-emerald-400">Download</strong> to save the result.</p>
          <p className="text-zinc-500 pt-1">CSV → JSON auto-detects comma or tab delimiters and uses the first row as headers. JSON → CSV extracts all unique keys as column headers.</p>
        </div>
      </details>

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleModeSwitch("csv-to-json")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "csv-to-json"
              ? "bg-indigo-600 text-white"
              : "bg-white/10 text-zinc-400 hover:bg-white/15 hover:text-white"
          }`}
        >
          CSV → JSON
        </button>
        <button
          onClick={() => handleModeSwitch("json-to-csv")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "json-to-csv"
              ? "bg-indigo-600 text-white"
              : "bg-white/10 text-zinc-400 hover:bg-white/15 hover:text-white"
          }`}
        >
          JSON → CSV
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {mode === "csv-to-json" ? "Paste your CSV" : "Paste your JSON array"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          maxLength={5_242_880}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={!input.trim()}
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Convert
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-mono text-red-400">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <pre className="max-h-96 overflow-auto font-mono text-sm text-zinc-200 whitespace-pre">
              {output}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Download {mode === "csv-to-json" ? ".json" : ".csv"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
