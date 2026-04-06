"use client";

import { useState, useCallback } from "react";
import { trackUsage, trackDownload } from "@/lib/analytics";

/** Parsed contact with name and phone number */
interface Contact {
  name: string;
  phone: string;
}

/** Detects the CSV delimiter from a line of text */
function detectDelimiter(line: string): string | null {
  const delimiters = [",", "\t", "|"];
  for (const d of delimiters) {
    if (line.includes(d)) return d;
  }
  return null;
}

/** Normalizes a phone number: strips non-digits, auto-prefixes 10-digit numbers */
function normalizePhone(raw: string, countryPrefix: string): string {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (digits.length === 10) {
    const prefix = countryPrefix.replace(/^\+/, "");
    return `+${prefix}${digits}`;
  }
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/** Generates a vCard 3.0 string for a single contact */
function toVCard(contact: Contact): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contact.name}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    "END:VCARD",
  ].join("\r\n");
}

/** Formats byte count to human-readable size */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * VCF Converter tool: converts phone numbers (plain text or CSV) into a downloadable .vcf file.
 */
export default function VcfConverter() {
  const [input, setInput] = useState("");
  const [countryPrefix, setCountryPrefix] = useState("+91");
  const [namePrefix, setNamePrefix] = useState("Lead");
  const [startIndex, setStartIndex] = useState(1);
  const [firstRowHeader, setFirstRowHeader] = useState(false);
  const [phoneCol, setPhoneCol] = useState(0);
  const [nameCol, setNameCol] = useState(-1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [vcfBlob, setVcfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  // Detect if input looks like CSV
  const lines = input.trim().split("\n").filter(Boolean);
  const firstLine = lines[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const isCsv = delimiter !== null;
  const headers = isCsv ? firstLine.split(delimiter) : [];

  const handleParse = useCallback(() => {
    setError("");
    setContacts([]);
    setVcfBlob(null);
    setDownloaded(false);

    const rawLines = input.trim().split("\n").filter(Boolean);
    if (rawLines.length === 0) {
      setError("Please paste at least one phone number.");
      return;
    }

    const det = detectDelimiter(rawLines[0] ?? "");
    const csv = det !== null;
    const dataLines = csv && firstRowHeader ? rawLines.slice(1) : rawLines;

    const seen = new Set<string>();
    const parsed: Contact[] = [];
    let idx = startIndex;

    for (const line of dataLines) {
      let phone: string;
      let name: string;

      if (csv && det) {
        const cols = line.split(det).map((c) => c.trim());
        phone = cols[phoneCol] ?? "";
        name = nameCol >= 0 ? (cols[nameCol] ?? "") : "";
      } else {
        phone = line.trim();
        name = "";
      }

      if (!phone) continue;

      const normalized = normalizePhone(phone, countryPrefix);
      if (seen.has(normalized)) continue;
      seen.add(normalized);

      const contactName = name || `${namePrefix} ${idx}`;
      parsed.push({ name: contactName, phone: normalized });
      idx++;
    }

    if (parsed.length === 0) {
      setError("No valid phone numbers found in input.");
      return;
    }

    setContacts(parsed);
    trackUsage("vcf-converter", "VCF Converter");
  }, [input, countryPrefix, namePrefix, startIndex, firstRowHeader, phoneCol, nameCol]);

  const handleGenerate = useCallback(() => {
    const vcfContent = contacts.map(toVCard).join("\r\n");
    const blob = new Blob([vcfContent], { type: "text/vcard" });
    setVcfBlob(blob);
  }, [contacts]);

  const handleDownload = useCallback(() => {
    if (!vcfBlob) return;
    const url = URL.createObjectURL(vcfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.vcf";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    trackDownload("vcf-converter");
  }, [vcfBlob]);

  return (
    <div className="space-y-6">
      {/* How to use guide */}
      <details className="group rounded-lg border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300">
          How to use this tool
          <span className="text-zinc-600 transition-transform group-open:rotate-180">&#9660;</span>
        </summary>
        <div className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-zinc-400 space-y-2">
          <p><strong className="text-zinc-300">Step 1:</strong> Paste phone numbers (one per line) or CSV data into the text area.</p>
          <p><strong className="text-zinc-300">Step 2:</strong> If CSV is detected, select the Phone and Name columns. Check &quot;First row is header&quot; if applicable.</p>
          <p><strong className="text-zinc-300">Step 3:</strong> Set the country prefix (default +91 for India), name prefix (e.g. &quot;Lead&quot;), and starting index.</p>
          <p><strong className="text-zinc-300">Step 4:</strong> Click <strong className="text-indigo-400">Parse Contacts</strong> to preview. Duplicates are removed automatically.</p>
          <p><strong className="text-zinc-300">Step 5:</strong> Click <strong className="text-indigo-400">Generate VCF</strong>, then <strong className="text-emerald-400">Download .vcf</strong>.</p>
          <p><strong className="text-zinc-300">Step 6:</strong> Import the .vcf file on your Android or iPhone (instructions shown after download).</p>
          <p className="text-zinc-500 pt-1">Supports 50,000+ contacts. 10-digit numbers are auto-prefixed with the country code.</p>
        </div>
      </details>

      {/* Input textarea */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Paste phone numbers (one per line) or CSV data
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          maxLength={5_242_880}
          placeholder={"9876543210\n9123456789\n...or paste CSV with headers"}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* CSV column selectors */}
      {isCsv && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-300">CSV detected ({headers.length} columns)</p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="header-check"
              checked={firstRowHeader}
              onChange={(e) => setFirstRowHeader(e.target.checked)}
              className="rounded border-white/20 bg-white/10"
            />
            <label htmlFor="header-check" className="text-sm text-zinc-400">
              First row is header
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Phone column</label>
              <select
                value={phoneCol}
                onChange={(e) => setPhoneCol(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              >
                {headers.map((h, i) => (
                  <option key={i} value={i} className="bg-zinc-900">
                    {firstRowHeader ? h.trim() : `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Name column (optional)</label>
              <select
                value={nameCol}
                onChange={(e) => setNameCol(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              >
                <option value={-1} className="bg-zinc-900">None (auto-generate)</option>
                {headers.map((h, i) => (
                  <option key={i} value={i} className="bg-zinc-900">
                    {firstRowHeader ? h.trim() : `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Config fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Country prefix</label>
          <input
            type="text"
            value={countryPrefix}
            onChange={(e) => setCountryPrefix(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Name prefix</label>
          <input
            type="text"
            value={namePrefix}
            onChange={(e) => setNamePrefix(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Start index</label>
          <input
            type="number"
            value={startIndex}
            onChange={(e) => setStartIndex(Number(e.target.value))}
            min={1}
            className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Parse button */}
      <button
        onClick={handleParse}
        disabled={!input.trim()}
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Parse Contacts
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Preview */}
      {contacts.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm font-medium text-emerald-400">
              {contacts.length.toLocaleString()} unique contacts parsed
            </p>
            <div className="mt-2 space-y-1">
              {contacts.slice(0, 5).map((c, i) => (
                <p key={i} className="font-mono text-xs text-zinc-400">
                  {c.name} &mdash; {c.phone}
                </p>
              ))}
              {contacts.length > 5 && (
                <p className="text-xs text-zinc-500">
                  ...and {(contacts.length - 5).toLocaleString()} more
                </p>
              )}
            </div>
          </div>

          {/* Generate VCF */}
          {!vcfBlob && (
            <button
              onClick={handleGenerate}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Generate VCF
            </button>
          )}

          {/* Download */}
          {vcfBlob && (
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Download .vcf ({formatSize(vcfBlob.size)})
              </button>

              {/* Import instructions */}
              {downloaded && (
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
                  <p className="text-sm font-medium text-zinc-300">How to import contacts</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-indigo-400">Android</p>
                      <ol className="space-y-1 text-xs text-zinc-400 list-decimal list-inside">
                        <li>Open the downloaded .vcf file</li>
                        <li>Select &quot;Contacts&quot; app when prompted</li>
                        <li>Tap &quot;Import&quot; to save all contacts</li>
                      </ol>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-indigo-400">iPhone</p>
                      <ol className="space-y-1 text-xs text-zinc-400 list-decimal list-inside">
                        <li>Email the .vcf file to yourself</li>
                        <li>Open the attachment in Mail</li>
                        <li>Tap &quot;Add All Contacts&quot;</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
