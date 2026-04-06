import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_NAME, MAIN_SITE_URL } from "@/lib/constants";

/**
 * Layout for all tool pages — breadcrumb nav + CTA banner.
 */
export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-white">
          {SITE_NAME}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-300">Tool</span>
      </nav>

      {/* Powered by bar */}
      <div className="mb-6 text-xs text-zinc-500">
        Powered by <span className="font-medium text-zinc-400">BrtNeura</span>
      </div>

      {children}

      {/* CTA Banner */}
      <div className="mt-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center">
        <p className="text-lg font-medium text-white">
          Need a custom AI solution?
        </p>
        <a
          href={MAIN_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Talk to BrtNeura
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
