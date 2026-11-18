<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Signed-in pages live under `src/routes/_authenticated/` (client-only gate, redirects to `/auth`); `/` is the signed-in home, so there is no `src/routes/index.tsx`. Why: the app has no public surface besides sign-in.
- Session data is read/written from the browser with the generated Supabase client and protected by RLS on `public.sessions` (own rows only). Why: no server-side logic is needed, so no server functions.
- Daily topic rotation and streak math live in `src/lib/practice.ts` with tests in `src/lib/practice.test.ts`. Why: keep date rules pure and testable.
- AI feedback runs in a TanStack server function (`src/lib/feedback.functions.ts` → `feedback.server.ts`) behind `requireSupabaseAuth`, not a Supabase Edge Function. Why: the Lovable AI key lives in the app's server runtime, and the endpoint must only serve signed-in users.
- `src/start.ts` registers `attachSupabaseAuth` (`src/lib/auth-attacher.ts`) as function middleware. Why: it sends the user's bearer token that `requireSupabaseAuth` verifies.
