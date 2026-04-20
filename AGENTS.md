# Repository Guidelines

## Project Structure & Module Organization
This monorepo contains two workspaces:
- `cf-blog-client/`: React + TypeScript frontend (Vite). Core code is in `src/`, with `components/`, `pages/`, `layouts/`, `features/`, `stores/`, and `services/`.
- `cf-blog-server/`: Cloudflare Workers backend. Entry is `src/index.js`, with build/runtime config in `webpack.config.js` and `wrangler.toml`.
- `docs/`: project documentation and design notes.

Keep modules focused (single responsibility). API calls should be grouped by feature (`src/features/*/services`) instead of scattered across UI components.

## Build, Test, and Development Commands
From repo root:
- `pnpm dev` — run client and server in parallel for local development.
- `pnpm build` — build all workspaces.
- `pnpm lint` — run workspace lint tasks.
- `pnpm format` — format codebase with Prettier.
- `pnpm typecheck` — run TypeScript checks.

Workspace-level examples:
- `pnpm --filter @narcissus/cf-client test` — run Vitest tests for frontend.
- `pnpm --filter @narcissus/cf-client preview` — preview production build.
- `cd cf-blog-server && npm run dev` — run Worker locally on port `8788`.

## Coding Style & Naming Conventions
- Use 2-space indentation and keep files in `kebab-case` (e.g. `post-detail-page.tsx`).
- React only: function components + Hooks; avoid class components.
- Prefer TypeScript `interface` for structured data; avoid broad `any`.
- Use CSS Modules (`*.module.css`) to prevent global style leakage.
- Use flex layouts for responsive UI; do not introduce float-based layouts.
- Do not use unsafe APIs such as `eval()` or `with()`.
- Run ESLint + Prettier before commit.

## Testing Guidelines
- Frontend tests use Vitest + Testing Library; place tests as `*.test.tsx` next to components/pages.
- Focus tests on user-visible behavior, routing, and critical state transitions.
- Backend currently has no automated test suite; include manual verification steps in PRs when touching `cf-blog-server/`.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (current history uses `feat: ...`).
- Prefer messages like `feat(client): add tag filter panel` or `fix(server): handle token expiry`.
- PRs should include: scope summary, affected workspace(s), test evidence (command output), linked issue, and screenshots/GIFs for UI changes.
- For API/auth changes, document request/response impact and any migration or config updates.

## Security & Configuration Tips
- Frontend API base URL is controlled by `VITE_API_BASE_URL`; avoid hardcoding endpoints.
- Keep auth/error handling centralized via Axios interceptors (`cf-blog-client/src/services/api-client.ts`).
- Never commit secrets; use Wrangler/environment configuration for deployment credentials.
