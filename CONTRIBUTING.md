# Contributing to BrtNeura Kit

Thanks for your interest in contributing. This guide covers the conventions and workflow for the project.

## Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project (for analytics — tools work without it)

## Setup

```bash
git clone https://github.com/brtneuraDev/public-MIT.git
cd public-MIT
npm install
cp .env.example .env.local
# Fill in Firebase config values (or leave blank to skip analytics)
npm run dev
```

## Project Conventions

### Code Style

- **TypeScript strict mode** — no `any`, no untyped assertions without comments
- **Tailwind CSS only** — no inline styles, no CSS modules
- **`'use client'` only when needed** — only on components using browser APIs (useState, useEffect, etc.)
- **JSDoc on all exports** — every exported function, component, or type needs a JSDoc comment
- **Zero `console.log` in production** — use the analytics helper for tracking

### Tool Architecture

Every tool follows this pattern:

1. **Register in `src/lib/tool-registry.ts`** — define slug, name, description, category, keywords, and lazy component import
2. **Create component in `src/components/tools/`** — one file per tool
3. **Self-contained** — no imports between tools
4. **Handle errors and empty states** — every tool must show appropriate UI for error conditions and empty input
5. **Track usage** — call `trackUsage()` on the primary action and `trackDownload()` on file downloads

### Adding a New Tool

```typescript
// 1. Add to src/lib/tool-registry.ts
{
  slug: "your-tool",
  name: "Your Tool",
  description: "Short description for the card.",
  category: "developer",  // telecom | developer | business | data
  icon: "🔧",
  keywords: ["keyword1", "keyword2"],
  component: () => import("@/components/tools/YourTool"),
  isPublished: true,
}

// 2. Create src/components/tools/YourTool.tsx
// Use existing tools as reference for the component pattern
```

### File Organization

```
src/components/tools/YourTool.tsx   # Tool component
src/lib/tool-registry.ts           # Registration (MUST update)
```

Do NOT create subdirectories per tool unless the tool requires multiple files.

## Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Follow the code conventions above
3. Run `npm run build` and `npm run lint` — both must pass
4. Write a clear PR description explaining what the tool does and why
5. One tool per PR unless they're closely related

## Security

- Never commit `.env.local` or any file containing secrets
- All data processing must be client-side — no server endpoints that process user data
- Input fields must have `maxLength` limits
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
