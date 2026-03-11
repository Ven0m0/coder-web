# OpenCode CLI — Agent Instructions

> **Progressive disclosure**: Start here. Deeper details follow in later sections.

---

## Layer 1 · Quick Reference

### Critical Rules (read first)
- **Runtime**: Bun only — never use `npm`, `npx`, or `node` commands
- **Linter/Formatter**: Biome only — never add ESLint, Prettier, or their configs
- **Styling**: Tailwind CSS classes only — no inline styles, no CSS modules
- **Components**: Prefer shadcn/ui; never edit `src/components/ui/` files directly
- **Routes**: All routes live in `src/App.tsx` — never scatter them elsewhere
- **Path alias**: `@/` maps to `src/` — always use it for imports inside `src/`

### Essential Commands
```bash
bun run dev          # Dev server on http://localhost:8080
bun run build        # Production build → dist/
bun run lint         # Check with Biome
bun run lint:fix     # Auto-fix Biome issues
bun run format       # Format with Biome
```

### Project at a Glance
| Aspect | Choice |
|--------|--------|
| Runtime & PM | Bun |
| UI Framework | React 19 |
| Bundler | Vite 7 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui + Radix UI |
| Lint/Format | Biome 2 |
| State/Query | TanStack Query v5 |
| Routing | React Router DOM v7 |

---

## Layer 2 · Architecture

### Directory Structure
```
src/
├── App.tsx              # Router — all routes defined here
├── main.tsx             # Entry point, plugin initialization
├── pages/               # Route-level components
│   ├── Index.tsx        # Default page (always update this for new features)
│   └── NotFound.tsx     # 404 page
├── components/
│   ├── ui/              # shadcn/ui primitives — DO NOT edit
│   └── *.tsx            # Application components
├── hooks/               # React hooks
├── lib/
│   └── utils.ts         # cn() helper (clsx + tailwind-merge)
├── plugins/
│   ├── index.ts         # Plugin registry, loader, Web Worker sandbox
│   └── example-plugin.ts
└── utils/
    ├── secureStorage.ts  # AES-GCM encrypted localStorage via Web Crypto
    ├── tokenOptimizer.ts # ZON/TOON format token reduction
    └── toast.ts          # Toast helpers
```

### Plugin System
Plugins are loaded via `loadPluginSecure()` in `src/plugins/index.ts`:
- Whitelisted sources only: `./plugins/` and `/plugins/`
- Executed in a **Web Worker** sandbox with restricted globals
- Signature verified against `PLUGIN_SIGNATURES` before load
- Plugin paths persisted to `localStorage` for session restore via `initializePlugins()`

Plugin interface:
```ts
interface Plugin {
  name: string;        // required
  version: string;
  description: string;
  commands?: Command[];  // CLI command extensions
  agents?: Agent[];      // AI agent extensions
  skills?: Skill[];      // Reusable skill components
}
```

### Secure Storage
`SecureStorage` in `src/utils/secureStorage.ts` wraps `localStorage` with AES-GCM encryption.

**Known limitation**: The encryption key is stored in `sessionStorage`, so encrypted data in `localStorage` is unreadable after tab close. API keys and settings will be lost on tab close. See `REPO_ANALYSIS.md` for proposed fixes.

### Coding Conventions
- **Imports**: Biome auto-organizes; `@/` for internal, third-party first
- **Quotes**: Double quotes (`"`) for JS/TS
- **Semicolons**: Required
- **Indent**: 2 spaces, max line width 100
- **`const` over `let`**: Biome enforces this as an error
- **`noExplicitAny`**: Warn — avoid `any`, use proper types
- **Component files**: PascalCase (`MyComponent.tsx`)
- **Utility files**: camelCase (`myUtil.ts`)

---

## Layer 3 · Deep Details

### Adding a New Page
1. Create `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx` above the `*` catch-all
3. Add a link/navigation in `src/pages/Index.tsx` so users can reach it

### Adding a New Component
1. Check if a shadcn/ui component covers the need: `src/components/ui/`
2. If not, create `src/components/MyComponent.tsx`
3. Use `cn()` from `@/lib/utils` for conditional class merging

### Using Secure Storage
```ts
import { SecureStorage } from "@/utils/secureStorage";

await SecureStorage.setItem("api_key", value);   // encrypts → localStorage
const key = await SecureStorage.getItem("api_key"); // decrypts
SecureStorage.removeItem("api_key");
```

### Using Token Optimizer
ZON (Zero-token Optimized Notation) and TOON formats reduce LLM API token costs:
```ts
import { tokenOptimizer } from "@/utils/tokenOptimizer";
```

### Docker Deployment
```bash
docker-compose up -d --build    # Build and start
docker-compose logs -f          # Follow logs
docker-compose down             # Stop
```
Container serves the Vite build via nginx on port 80.

### Adding a Plugin
1. Place plugin file in `src/plugins/` or `public/plugins/`
2. Register its signature in `PLUGIN_SIGNATURES` in `src/plugins/index.ts`
3. Load via `loadPluginSecure("./plugins/my-plugin")` or through the PluginManager UI

### MCP Integration
`.mcp.json` at root configures Model Context Protocol tools. The `MCPManager` component provides UI for managing MCP connections.

### Security Considerations
- Plugin code runs in Web Workers — no DOM access
- Only whitelisted plugin sources are loaded
- Content Security Policy headers set in `nginx.conf`
- Avoid `eval()` or dynamic `import()` of user-supplied strings
- `SecureStorage` uses non-extractable `CryptoKey` — key cannot be exported

### Testing Infrastructure
**Current coverage: 0%** — test files exist (`*.test.ts`) but no test runner is configured.
To add testing: install `vitest` + `happy-dom` + `@testing-library/react`, create `vitest.config.ts`.
See `REPO_ANALYSIS.md` Idea 2 for a detailed implementation plan.

### Dependency Management
- Renovate bot auto-merges minor/patch updates weekly (configured in `.github/renovate.json`)
- Dependabot monitors GitHub Actions
- All dependencies are bleeding-edge (React 19, Vite 7, Tailwind 4) — check compatibility when adding new packages

---

## Related Files
- `README.md` — User-facing project overview
- `DEPLOYMENT.md` — Self-hosting guide (Docker, Bun, Nginx)
- `REPO_ANALYSIS.md` — Technical debt and improvement proposals
- `AI_RULES.md` — Tech stack constraints (authoritative source for stack decisions)
- `.github/copilot-instructions.md` — GitHub Copilot variant of these instructions
