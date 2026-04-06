import type { ToolDefinition } from "@/types/tool";

/**
 * Central registry of all tools.
 * Add new tools here — they will automatically appear on the homepage
 * when isPublished is set to true.
 */
export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    slug: "vcf-converter",
    name: "VCF Converter",
    description:
      "Convert 50K+ phone numbers to a .vcf file. Import to any Android/iPhone instantly.",
    category: "telecom",
    icon: "📱",
    keywords: [
      "vcf",
      "vcard",
      "contacts",
      "phone",
      "csv",
      "import",
      "android",
      "iphone",
    ],
    component: () => import("@/components/tools/VcfConverter"),
    isPublished: true,
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description:
      "Prettify, minify, and validate JSON with syntax highlighting. Instant error detection.",
    category: "developer",
    icon: "{ }",
    keywords: [
      "json",
      "format",
      "prettify",
      "minify",
      "validate",
      "syntax",
    ],
    component: () => import("@/components/tools/JsonFormatter"),
    isPublished: true,
  },
  {
    slug: "gst-calculator",
    name: "GST Calculator",
    description:
      "Calculate CGST, SGST, IGST breakup for Indian invoices. Supports all tax slabs.",
    category: "business",
    icon: "🧾",
    keywords: [
      "gst",
      "tax",
      "cgst",
      "sgst",
      "igst",
      "invoice",
      "india",
      "calculator",
    ],
    component: () => import("@/components/tools/GstCalculator"),
    isPublished: true,
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description:
      "Test regular expressions with real-time matching. Includes Indian PAN, Aadhaar, phone presets.",
    category: "developer",
    icon: "⚡",
    keywords: [
      "regex",
      "regular expression",
      "pattern",
      "match",
      "test",
      "pan",
      "aadhaar",
    ],
    component: () => import("@/components/tools/RegexTester"),
    isPublished: true,
  },
  {
    slug: "csv-json",
    name: "CSV ↔ JSON Converter",
    description:
      "Convert between CSV and JSON formats. Handles large files, auto-detects delimiters.",
    category: "data",
    icon: "🔄",
    keywords: [
      "csv",
      "json",
      "convert",
      "data",
      "delimiter",
      "tab",
      "comma",
      "export",
    ],
    component: () => import("@/components/tools/CsvJson"),
    isPublished: true,
  },
];

/**
 * Finds a tool by its URL slug.
 * @throws Error if the slug does not match any registered tool.
 */
export function getToolBySlug(slug: string): ToolDefinition {
  const tool = TOOL_REGISTRY.find((t) => t.slug === slug);
  if (!tool) {
    throw new Error(`Tool not found: "${slug}"`);
  }
  return tool;
}

/**
 * Returns all tools that are marked as published.
 */
export function getPublishedTools(): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.isPublished);
}
