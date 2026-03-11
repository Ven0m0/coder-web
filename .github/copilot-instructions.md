# GitHub Copilot Instructions — OpenCode CLI

## Stack Constraints (enforce strictly)
- **Runtime/PM**: Bun — suggest `bun add`, `bun run`, never `npm`/`npx`/`node`
- **Linting/Formatting**: Biome — never suggest ESLint, Prettier, or `.eslintrc`/`.prettierrc`
- **Styling**: Tailwind CSS utility classes only — no inline `style={}`, no CSS Modules
- **UI Components**: shadcn/ui + Radix UI — never edit `src/components/ui/**`
- **Language**: TypeScript — avoid `any`, prefer explicit types
- **Path imports**: Always use `@/` alias for `src/` (e.g. `import { cn } from "@/lib/utils"`)

## Code Style
- Double quotes, semicolons, 2-space indent, 100-char line width (Biome defaults)
- `const` over `let` everywhere — Biome enforces this as an error
- PascalCase for component files, camelCase for utilities

## Project Layout
```
src/
  App.tsx          ← all routes live here, nowhere else
  pages/           ← route-level components; Index.tsx is the default page
  components/
    ui/            ← shadcn/ui primitives, READ-ONLY
    *.tsx          ← application components
  hooks/           ← custom React hooks
  lib/utils.ts     ← cn() helper: clsx + tailwind-merge
  plugins/         ← plugin registry + Web Worker sandbox
  utils/           ← secureStorage, tokenOptimizer, toast
```

## Key Patterns

### Class merging
```ts
import { cn } from "@/lib/utils";
// cn() = clsx + tailwind-merge
className={cn("base-classes", condition && "conditional-class", className)}
```

### Secure storage (encrypted localStorage)
```ts
import { SecureStorage } from "@/utils/secureStorage";
await SecureStorage.setItem("key", value);
const val = await SecureStorage.getItem("key");
```
> Note: Key is session-scoped — data is unreadable after tab close.

### New page checklist
1. `src/pages/MyPage.tsx` — create the component
2. `src/App.tsx` — add `<Route path="/my-page" element={<MyPage />} />` above the `*` route
3. `src/pages/Index.tsx` — add navigation link so the page is reachable

### Plugin loading
```ts
import { loadPluginSecure } from "@/plugins/index";
// Only whitelisted paths: "./plugins/" or "/plugins/"
await loadPluginSecure("./plugins/my-plugin", true); // true = persist across sessions
```

## What NOT to suggest
- `npm install` / `yarn add` / `pnpm add` — use `bun add`
- ESLint or Prettier config files
- Inline styles or CSS modules
- Editing any file under `src/components/ui/`
- Scattering routes outside `src/App.tsx`
- Using `eval()` or unguarded dynamic `import()` with user input
- `let` when `const` is sufficient
