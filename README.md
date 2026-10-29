# React + Vite + TypeScript

A minimal React 19 application built with Vite, React Router, and Sass.

## TypeScript

The project is written entirely in TypeScript and uses project references:

- `tsconfig.app.json` — application code in `src/`
- `tsconfig.node.json` — Vite and ESLint configuration files
- `tsconfig.json` — solution file that references both projects

Strictness is enabled beyond the TypeScript defaults, including:

- `strict`, `noImplicitAny`, `strictNullChecks`
- `noUncheckedIndexedAccess`
- `noUnusedLocals`, `noUnusedParameters`
- `noFallthroughCasesInSwitch`, `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`, `noUncheckedSideEffectImports`
- `exactOptionalPropertyTypes`

Reusable domain types live in `src/types/`.

## Scripts

```bash
npm run dev        # Start the Vite dev server
npm run typecheck  # Type-check application and config projects
npm run lint       # Run ESLint with type-aware rules
npm run build      # Type-check, then build for production
npm run preview    # Preview the production build
```

## ESLint

ESLint uses the flat config format in `eslint.config.ts`, powered by
[`typescript-eslint`](https://typescript-eslint.io) with type-aware rules. The
configuration is loaded by ESLint through `jiti`.

To extend the rules, add them to the `rules` block in `eslint.config.ts`.
