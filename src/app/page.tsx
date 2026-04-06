"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { getPublishedTools } from "@/lib/tool-registry";
import { CATEGORY_LABELS } from "@/lib/constants";
import ToolCard from "@/components/layout/ToolCard";
import type { ToolCategory } from "@/types/tool";

/**
 * Homepage with hero section, search bar, category filters, and tool grid.
 */
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ToolCategory | "all"
  >("all");

  const tools = useMemo(() => {
    let result = getPublishedTools();

    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    return result;
  }, [search, activeCategory]);

  const categories = Object.keys(CATEGORY_LABELS) as Array<
    ToolCategory | "all"
  >;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Utility tools that just work.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Browser-based tools for developers, MSMEs, and business operators
        </p>
      </section>

      {/* Search bar */}
      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-white/10 text-zinc-400 hover:bg-white/15 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-zinc-500">
            {search.trim()
              ? "No tools match your search."
              : "No tools available yet. Check back soon!"}
          </p>
        </div>
      )}
    </div>
  );
}
