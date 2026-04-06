"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackUsage } from "@/lib/analytics";

/** A regex preset with pattern, flags, and sample text */
interface RegexPreset {
  label: string;
  pattern: string;
  flags: string;
  sample: string;
}

/** A single regex match result */
interface MatchResult {
  text: string;
  index: number;
}

/** Maximum time allowed for regex execution before aborting (ms) */
const REGEX_TIMEOUT_MS = 200;

/** Presets for common Indian and developer patterns */
const PRESETS: RegexPreset[] = [
  {
    label: "Indian Phone",
    pattern: "[6-9]\\d{9}",
    flags: "g",
    sample: "Call 9876543210 or 8765432109",
  },
  {
    label: "PAN Card",
    pattern: "[A-Z]{5}[0-9]{4}[A-Z]",
    flags: "g",
    sample: "My PAN is ABCDE1234F",
  },
  {
    label: "Aadhaar",
    pattern: "\\d{4}\\s?\\d{4}\\s?\\d{4}",
    flags: "g",
    sample: "Aadhaar: 1234 5678 9012",
  },
  {
    label: "Email",
    pattern: "[\\w.-]+@[\\w.-]+\\.\\w+",
    flags: "g",
    sample: "pawan@brtneura.com and info@kit.dev",
  },
  {
    label: "GSTIN",
    pattern: "\\d{2}[A-Z]{5}\\d{4}[A-Z]\\d[Z][A-Z\\d]",
    flags: "g",
    sample: "GSTIN: 27ABCDE1234F1Z5",
  },
  {
    label: "IFSC Code",
    pattern: "[A-Z]{4}0[A-Z0-9]{6}",
    flags: "g",
    sample: "IFSC: SBIN0001234",
  },
];

/**
 * Executes regex matching with a time limit to prevent ReDoS.
 * Returns matches or an error string if the pattern takes too long.
 */
function executeRegexSafe(
  pattern: string,
  flags: string,
  testStr: string
): { matches: MatchResult[]; error: string } {
  try {
    const regex = new RegExp(pattern, flags);
    const results: MatchResult[] = [];
    const start = performance.now();

    if (flags.includes("g")) {
      let match: RegExpExecArray | null;
      let safety = 0;
      while ((match = regex.exec(testStr)) !== null && safety < 1000) {
        if (performance.now() - start > REGEX_TIMEOUT_MS) {
          return {
            matches: results,
            error: "Pattern too complex — execution timed out. Simplify your regex or reduce input size.",
          };
        }
        results.push({ text: match[0], index: match.index });
        if (match[0].length === 0) regex.lastIndex++;
        safety++;
      }
    } else {
      const match = regex.exec(testStr);
      if (performance.now() - start > REGEX_TIMEOUT_MS) {
        return {
          matches: [],
          error: "Pattern too complex — execution timed out. Simplify your regex or reduce input size.",
        };
      }
      if (match) {
        results.push({ text: match[0], index: match.index });
      }
    }

    return { matches: results, error: "" };
  } catch (e) {
    return {
      matches: [],
      error: e instanceof Error ? e.message : "Invalid regex",
    };
  }
}

/**
 * Regex Tester tool: test regular expressions with real-time matching
 * and Indian document presets (PAN, Aadhaar, Phone, GSTIN, IFSC).
 */
export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");
  const [regexResult, setRegexResult] = useState<{
    matches: MatchResult[];
    error: string;
  }>({ matches: [], error: "" });

  /** Debounce ref for analytics tracking */
  const trackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Debounced analytics call — fires once per 2s of idle after a match */
  const debouncedTrack = useCallback(() => {
    if (trackTimer.current) clearTimeout(trackTimer.current);
    trackTimer.current = setTimeout(() => {
      trackUsage("regex-tester", "Regex Tester");
    }, 2000);
  }, []);

  /** Run regex matching with timeout protection whenever inputs change */
  useEffect(() => {
    // Debounce execution to avoid running on every keystroke
    const timer = setTimeout(() => {
      if (!pattern || !testStr) {
        setRegexResult({ matches: [], error: "" });
        return;
      }

      const result = executeRegexSafe(pattern, flags, testStr);
      setRegexResult(result);

      if (result.matches.length > 0 && !result.error) {
        debouncedTrack();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pattern, flags, testStr, debouncedTrack]);

  const { matches, error: regexError } = regexResult;

  /** Load a preset into the pattern and test string fields */
  const loadPreset = useCallback((preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestStr(preset.sample);
  }, []);

  return (
    <div className="space-y-6">
      {/* How to use guide */}
      <details className="group rounded-lg border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300">
          How to use this tool
          <span className="text-zinc-600 transition-transform group-open:rotate-180">&#9660;</span>
        </summary>
        <div className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-zinc-400 space-y-2">
          <p><strong className="text-zinc-300">Quick start:</strong> Click any <strong className="text-zinc-300">Preset</strong> button (Indian Phone, PAN, Aadhaar, etc.) to load a pattern with sample text instantly.</p>
          <p><strong className="text-zinc-300">Custom pattern:</strong> Type your regex in the pattern field. Use the flags field to set modifiers (g = global, i = case-insensitive, m = multiline).</p>
          <p><strong className="text-zinc-300">Real-time:</strong> Matches update live as you type — no need to click a button.</p>
          <p><strong className="text-zinc-300">Results:</strong> Each match is shown in green with its index position in the test string.</p>
          <p className="text-zinc-500 pt-1">Includes presets for Indian Phone, PAN Card, Aadhaar, Email, GSTIN, and IFSC Code.</p>
        </div>
      </details>

      {/* Presets */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => loadPreset(preset)}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern + Flags input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Pattern
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            maxLength={500}
            placeholder="[6-9]\\d{9}"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
          <span className="text-sm text-zinc-500 font-mono">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g"
            className="w-16 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-center"
          />
        </div>
      </div>

      {/* Test string textarea */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Test String
        </label>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          rows={5}
          maxLength={524_288}
          placeholder="Paste your test string here..."
          className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* Regex error */}
      {regexError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-mono text-red-400">
          {regexError}
        </div>
      )}

      {/* Results */}
      {pattern && testStr && !regexError && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-300">
            Matches{" "}
            <span className="ml-1.5 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
              {matches.length}
            </span>
          </h3>

          {matches.length === 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              No matches found.
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((m, i) => (
                <div
                  key={`${m.index}-${i}`}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.05] px-4 py-2.5"
                >
                  <span className="text-xs text-zinc-600 font-mono min-w-[2rem]">
                    #{i + 1}
                  </span>
                  <span className="font-mono text-sm font-semibold text-emerald-400">
                    {m.text}
                  </span>
                  <span className="ml-auto text-xs text-zinc-600 font-mono">
                    index {m.index}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!pattern && !testStr && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-6 py-8 text-center">
          <p className="text-sm text-zinc-500">
            Enter a pattern and test string, or select a preset to get started.
          </p>
        </div>
      )}
    </div>
  );
}
