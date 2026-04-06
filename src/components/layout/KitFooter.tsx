import Link from "next/link";
import { COMPANY_NAME, COMPANY_LOCATION } from "@/lib/constants";

/**
 * Site footer with company attribution and legal links.
 */
export default function KitFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#08080c]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-zinc-500 sm:flex-row sm:justify-between sm:text-left">
        <p>
          Built by {COMPANY_NAME} &bull; {COMPANY_LOCATION}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="transition-colors hover:text-zinc-300"
          >
            Terms &amp; Conditions
          </Link>
          <span>&copy; 2026 {COMPANY_NAME}</span>
        </div>
      </div>
    </footer>
  );
}
