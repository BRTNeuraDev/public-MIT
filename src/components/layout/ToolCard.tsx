import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";
import { CATEGORY_LABELS } from "@/lib/constants";

/**
 * Grid card component displaying a tool's name, description, icon and category.
 */
export default function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-indigo-500/40 hover:bg-white/[0.06]"
    >
      {/* Icon + category row */}
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <span className="text-lg">{tool.icon}</span>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-400">
          {CATEGORY_LABELS[tool.category] ?? tool.category}
        </span>
      </div>

      {/* Name + description */}
      <div>
        <h3 className="font-semibold text-white group-hover:text-indigo-300">
          {tool.name}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
