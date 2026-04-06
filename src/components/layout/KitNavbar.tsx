import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SITE_NAME, GITHUB_URL, MAIN_SITE_URL } from "@/lib/constants";

/**
 * Top navigation bar with BrtNeura Kit branding and external links.
 */
export default function KitNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#08080c]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
            K
          </div>
          <span className="text-lg font-semibold text-white">{SITE_NAME}</span>
        </Link>

        {/* Right links */}
        <div className="flex items-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Explore AI Solutions
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
