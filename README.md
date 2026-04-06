# BrtNeura Kit

Browser-based utility tools that just work. No sign-ups, no data uploads, no backend processing. Everything runs in your browser.

**Live:** [kit.brtneura.com](https://kit.brtneura.com)

## Tools

| Tool | Category | Description |
|------|----------|-------------|
| VCF Converter | Telecom | Convert 50K+ phone numbers to .vcf for instant import on Android/iPhone |
| JSON Formatter | Developer | Prettify, minify, and validate JSON with error detection |
| GST Calculator | Business | CGST, SGST, IGST breakup for Indian invoices across all tax slabs |
| Regex Tester | Developer | Real-time pattern matching with Indian document presets (PAN, Aadhaar, GSTIN) |
| CSV / JSON Converter | Data | Bidirectional CSV-to-JSON conversion with auto-delimiter detection |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4
- **Analytics:** Firebase (anonymous usage metrics only)
- **Deployment:** Vercel

## Architecture

```
src/
  app/              # Next.js App Router pages
  components/
    layout/         # Shared layout components (Navbar, Footer, ErrorBoundary)
    tools/          # One component per tool
  lib/
    tool-registry.ts  # Central registry — single source of truth for all tools
    firebase.ts       # Firebase singleton (client-side only)
    analytics.ts      # Fire-and-forget usage tracking
    constants.ts      # Site metadata and labels
  types/
    tool.ts           # ToolDefinition interface
```

**Key design decisions:**

- **Tool registry pattern** — all tools are defined in `tool-registry.ts` with lazy-loaded components. Add a tool by adding an entry; it appears on the homepage automatically.
- **Client-side only** — zero backend processing. All data stays in the user's browser.
- **Firebase for analytics only** — no user data is stored. Anonymous usage counts, device type, and timestamps are collected for product decisions.
- **Self-contained tools** — no cross-tool imports. Each tool is an independent module.

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Firebase config values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file with your Firebase project config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_ADMIN_PIN=
```

## Adding a New Tool

1. Register the tool in `src/lib/tool-registry.ts`
2. Create the component in `src/components/tools/YourTool.tsx`
3. Use `trackUsage()` and `trackDownload()` from `src/lib/analytics.ts`
4. Set `isPublished: true` when ready

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

## Security

- All data processing is client-side — nothing leaves the browser
- Security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Firestore rules enforce analytics-only writes with field validation
- No user authentication or PII collection
- See [SECURITY.md](SECURITY.md) for reporting vulnerabilities

## Disclosure

This project was built with AI-assisted development tools. All architecture decisions, code review, and quality assurance are human-driven. We use AI the same way we use IDEs, linters, and code generators — to accelerate development while maintaining engineering standards.

## License

MIT License. See [LICENSE](LICENSE) for full text.

Built by [BRTNeura Technology LLP](https://brtneura.com) in Pimpri-Chinchwad, Pune.
