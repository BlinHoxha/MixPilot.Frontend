# MixPilot Frontend

One frontend workspace with a React web workstation, an Expo mobile companion and two small shared TypeScript packages. It stays separate from `Framework.sln` and `MixPilot.sln`. There is no frontend base-repository/base-service hierarchy.

## Start on this Windows machine

From `C:\Users\blinh\source\repos\MixPilot.Frontend`:

```powershell
# One-time setup; installs Node 22 and pnpm locally, without changing system Node.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Setup.ps1

# Start the web app.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/Run.ps1 dev
```

Open **http://localhost:5173**. The web app connects to **http://localhost:5290** by default. Start PostgreSQL, apply MixPilot's migrations and start `MixPilot.Api` using the backend README. This frontend does not start or configure your database.

Setup creates ignored `apps/web/.env.local` and `apps/mobile/.env.local` from their examples, only if missing. Local development identity requires both the frontend opt-in and the backend's `Development` identity. Production web builds always ignore the development identity flag.

With Node 22.12+ and pnpm 10.32.1 already installed, use `pnpm install --frozen-lockfile`, copy the example env files, then `pnpm dev`.

## What works in this increment

- Responsive dark workstation based on the supplied template: home, library, set builder, saved sets, playlists and preferences.
- Library: paginated search, genre filter, sorting, metadata registration/edit/delete, detail view and authorized CSV metadata import. Blank BPM/key/energy values stay unknown.
- Playlists: create an ordered collection from selected library tracks and view its members.
- Set builder: structured constraints, generated saved plans, add/remove/reorder tracks, lock/unlock, save revisions, regenerate unlocked tracks, view history, and BPM/key/energy metadata charts.
- Set explanations through MixPilot's existing Framework-backed endpoint, when advertised by capabilities.
- Shared generated OpenAPI operations, envelope handling, ProblemDetails including validation fields and trace IDs, cancellation, request timeouts, no automatic mutation retries, and expected-revision writes.
- Web OIDC code + PKCE integration shell, memory-only access tokens, identity-scoped query caches and cache clearing on session end.
- Expo companion preview: library search/details and saved-set browsing/review using the same API client.

## What is intentionally pending

Audio upload/playback, waveforms and signal analysis, durable jobs/SignalR, external discovery, DJ export, subscriptions, notifications, richer artwork, favorites and recommendations depend on additional backend capabilities. The app does not simulate them. Set planning is deterministic; the local explanation provider is extractive rather than an LLM.

Mobile production sign-in, native secure credential storage, mobile editing/quick-save and full native device testing are follow-up work. The native preview is development-only and deliberately blocks release mode until real authentication is integrated. Responsive web is functional separately from the native app.

Web OIDC requires your real authority, public client ID, scope/resource, backend audience and registered redirect `http://localhost:5173/auth/callback` (HTTPS on deployment). Account-provider login and renewal have not been verified against a live provider. Access tokens are not persisted; reloading requires sign-in again. Do not place secrets in `VITE_*` or `EXPO_PUBLIC_*` variables. AI provider credentials remain exclusively in the backend.

## Workspace

```text
apps/web/src/
  app/                  Routing and shell
  components/           Reused web controls and feedback
  core/                 Web session and query setup
  features/library/     Personal library workflows
  features/sets/        Set editor, charts and explanations
  features/workspace/   Dashboard, collections and profile
apps/mobile/            Expo Router screens and native presentation
packages/api-client/    OpenAPI snapshot, generated types, typed transport
packages/shared/        Pure validation, formatting and theme tokens
```

Share types and pure logic; keep browser/native presentation and session storage inside their apps. Additional packages and global state stores should be introduced only when an actual use case needs them.

## Contracts and checks

```powershell
# Import a freshly exported backend schema and regenerate the client.
$env:MIXPILOT_OPENAPI = '..\MixPilot\docs\openapi.json'
pnpm contracts:generate
pnpm contracts:check
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm --filter @mixpilot/mobile export:android
```

Unset `MIXPILOT_OPENAPI` when the backend checkout is unavailable. CI checks generated output against the committed snapshot; supplying this variable additionally checks the backend snapshot itself. Backend tests enforce a success-response schema on every operation. Do not edit `generated.ts` manually.

Browser tests intercept the API using test-only fixtures. They verify frontend workflows and responsive behavior, not a live PostgreSQL/API deployment. Unit tests cover transport, auth failures, conflict/field-error handling, cancellation, 204 deletes and input validation. Native export validates bundling, not device behavior.

## Mobile development

Run `pnpm mobile` or `scripts/Run.ps1 mobile`. Android emulator API default: `http://10.0.2.2:5290`. Physical devices need your PC's reachable LAN address in `EXPO_PUBLIC_API_URL`, a suitable backend listener and local firewall configuration. The default localhost-bound API cannot be reached from a physical device. This project has not changed firewall settings. Use an SDK-compatible Expo development environment; iOS native builds require a Mac or a configured build service.

## References

Implementation follows the supplied frontend guide's foundation-first roadmap, adapted to the actual MixPilot API and the user's preference for minimal abstractions. Current tooling compatibility was checked against [Vite](https://vite.dev/guide/), [Expo monorepos](https://docs.expo.dev/guides/monorepos/), [Expo's dependency manifest](https://unpkg.com/expo@57.0.27/bundledNativeModules.json) and [OpenAPI TypeScript](https://openapi-ts.dev/introduction).
