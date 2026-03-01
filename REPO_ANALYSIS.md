# Repository Analysis

## 1. Repository Structure
The project is a modern **React 19** application built with **Vite 7** and **Tailwind CSS 4**, utilizing **Bun** as the runtime and package manager. It follows a monorepo-style structure but is a single package.

### Key Components:
- **`src/plugins/`**: Implements a custom plugin system using Web Workers for sandboxing. Core logic resides in `index.ts`.
- **`src/utils/secureStorage.ts`**: A custom implementation of secure storage using the Web Crypto API, encrypting data before storing it in `localStorage`.
- **`src/components/`**: A rich library of UI components based on Shadcn/UI and Radix UI primitives.
- **`biome.json`**: Uses Biome for linting and formatting, replacing the traditional ESLint/Prettier stack.

## 2. Test Coverage Gaps
- **Current Coverage:** **0%**. No test files (`*.test.ts`, `*.spec.ts`) exist in the repository.
- **Missing Infrastructure:** `package.json` lacks any test scripts or test runner dependencies (e.g., Vitest, Jest).
- **Critical Risks:**
  - **`src/utils/secureStorage.ts`**: The encryption logic is completely untested.
  - **`src/plugins/index.ts`**: The plugin sandboxing and loading mechanism is complex and security-critical but verified only manually.
  - **`src/components/PluginManager.tsx`**: UI logic for managing plugins has no automated tests.

## 3. Dependency Health
- **Status:** Bleeding Edge.
  - **React**: v19.2.3 (Latest stable)
  - **Vite**: v7.0.0 (Latest major)
  - **Tailwind CSS**: v4.0.0 (Latest major)
- **Gaps:**
  - Missing `vitest`, `jsdom`/`happy-dom`, and `@testing-library/react` for testing.
  - Reliance on `bun-types` suggests tight coupling with Bun runtime, which is fine given the `Dockerfile` setup but limits portability to Node.js environments without adjustment.

---

# High-Impact Improvement Ideas

## Idea 1: Fix Critical Data Loss in SecureStorage
**Problem Statement:**
The `SecureStorage` utility stores the encryption key in `sessionStorage` (which is cleared when the browser tab is closed) but persists the encrypted data in `localStorage`. This means that **all persisted data (API keys, settings) is effectively lost** every time the user closes the tab, as the key required to decrypt it is destroyed.

**Proposed Solution:**
- Modify `src/utils/secureStorage.ts` to either:
  1. Store the encryption key in `localStorage` alongside the data (if the threat model allows local access).
  2. Use `IndexedDB` to store non-exportable `CryptoKey` handles for better security.
  3. Derive the encryption key from a user-provided passphrase (PBKDF2) so it can be regenerated deterministically.

**Affected Files:**
- `src/utils/secureStorage.ts`

**Estimated LOC:** ~60 lines
**Risk Level:** **High** (Changes security model; will render currently stored data undecryptable, though it is already inaccessible upon session end).

## Idea 2: Implement Unit Testing Infrastructure (Vitest)
**Problem Statement:**
The project has zero tests. Any refactoring or bug fixing (like the SecureStorage issue above) carries a high risk of regression. The complex plugin system needs automated verification.

**Proposed Solution:**
- Install `vitest`, `happy-dom`, and `@testing-library/react`.
- Create `vitest.config.ts`.
- Add initial unit tests for `SecureStorage` (mocking crypto if needed) and `PluginManager`.

**Affected Files:**
- `package.json`
- `vitest.config.ts` (new)
- `src/setupTests.ts` (new)
- `src/utils/secureStorage.test.ts` (new)

**Estimated LOC:** ~200 lines (Config + Initial Tests)
**Risk Level:** **Low** (Purely additive).

## Idea 3: Runtime Plugin Validation with Zod
**Problem Statement:**
The plugin system loads code dynamically from external sources. Currently, it relies on TypeScript interfaces which are erased at runtime. A malformed plugin (missing required methods like `run` or `execute`) could crash the application or bypass security checks.

**Proposed Solution:**
- Integrate `zod` for runtime schema validation.
- Define strict schemas for `Plugin`, `Command`, `Agent`, and `Skill`.
- Validate plugins inside `loadPluginSecure` before registering them to ensure they match the expected structure.

**Affected Files:**
- `src/plugins/index.ts`
- `src/plugins/schemas.ts` (new)

**Estimated LOC:** ~120 lines
**Risk Level:** **Medium** (Strict validation might reject existing plugins that are slightly malformed, but significantly improves robustness).
