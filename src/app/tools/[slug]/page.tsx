"use client";

import { Suspense, use, useState, useEffect, type ComponentType } from "react";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tool-registry";
import { useToolAnalytics } from "@/lib/analytics";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

/**
 * Renders the lazy-loaded tool component for a given slug.
 * Loads the component in an effect to avoid creating components during render.
 */
function LazyTool({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);

  const tool = getToolBySlug(slug);

  useEffect(() => {
    let cancelled = false;
    tool.component().then((mod) => {
      if (!cancelled) setComponent(() => mod.default);
    });
    return () => { cancelled = true; };
  }, [tool]);

  if (!Component) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <Component />;
}

/**
 * Dynamic tool page that loads the tool component based on the URL slug.
 * Wrapped in an ErrorBoundary to isolate tool crashes from the rest of the app.
 */
export default function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  let tool;
  try {
    tool = getToolBySlug(slug);
  } catch {
    notFound();
  }

  useToolAnalytics(slug, tool.name);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">{tool.name}</h1>
      <p className="mb-8 text-zinc-400">{tool.description}</p>

      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          }
        >
          <LazyTool slug={slug} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
