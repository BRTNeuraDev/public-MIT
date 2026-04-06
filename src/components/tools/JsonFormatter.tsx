"use client";

import { useState, useCallback } from "react";
import { trackUsage, trackDownload } from "@/lib/analytics";

/**
 * JSON Formatter tool: prettify, minify, and validate JSON with error detection.
 */
export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePrettify = useCallback(() => {
    setError("");
    setOutput("");
    setCopied(false);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      trackUsage("json-formatter", "JSON Formatter");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    setError("");
    setOutput("");
    setCopied(false);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      trackUsage("json-formatter", "JSON Formatter");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    trackDownload("json-formatter");
  }, [output]);

  return (
    <div className="space-y-6">
      {/* How to use guide */}
      <details className="group rounded-lg border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300">
          How to use this tool
          <span className="text-zinc-600 transition-transform group-open:rotate-180">&#9660;</span>
        </summary>
        <div className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-zinc-400 space-y-2">
          <p><strong className="text-zinc-300">Step 1:</strong> Paste your raw JSON into the text area.</p>
          <p><strong className="text-zinc-300">Step 2:</strong> Choose your indent size (2 or 4 spaces) using the chips.</p>
          <p><strong className="text-zinc-300">Step 3:</strong> Click <strong className="text-indigo-400">Prettify</strong> to format with indentation, or <strong className="text-zinc-300">Minify</strong> to compress into a single line.</p>
          <p><strong className="text-zinc-300">Step 4:</strong> Use <strong className="text-zinc-300">Copy to Clipboard</strong> or <strong className="text-emerald-400">Download .json</strong> to save the result.</p>
          <p className="text-zinc-500 pt-1">Invalid JSON will show the exact error location so you can fix it quickly.</p>
        </div>
      </details>

      {/* Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Paste your JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          maxLength={1_048_576}
          placeholder={'{\n  "key": "value"\n}'}
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* Indent selector + action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Indent chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">Indent:</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                indent === n
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-zinc-400 hover:bg-white/15 hover:text-white"
              }`}
            >
              {n} spaces
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <button
          onClick={handlePrettify}
          disabled={!input.trim()}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prettify
        </button>
        <button
          onClick={handleMinify}
          disabled={!input.trim()}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Minify
        </button>
      </div>

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
              Download .json
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
