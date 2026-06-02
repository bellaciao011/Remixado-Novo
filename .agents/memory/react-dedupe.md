---
name: React dedupe with react-i18next in Vite monorepo
description: Prevent multiple-React errors when react-i18next has local node_modules
---

# React Dedupe + i18next

## Rule
Add `react-i18next` and `i18next` to `resolve.dedupe` in `vite.config.ts` alongside `react` and `react-dom` when using these packages in a pnpm monorepo where local `node_modules` may exist inside the artifact package.

**Why:** When `react-i18next` is installed in a package's own `node_modules`, Vite may bundle a second copy of React alongside it, causing "Invalid hook call" / "multiple copies of React" errors at runtime.

**How to apply:**
```ts
resolve: {
  dedupe: ["react", "react-dom", "react-i18next", "i18next"],
}
```
Do NOT use alias overrides pointing to `../../node_modules/react` — they break esbuild's dependency optimization.
