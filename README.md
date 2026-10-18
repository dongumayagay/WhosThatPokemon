# Who's That Pokémon?

A fan-made Pokémon silhouette quiz built with **Svelte 5** and **SvelteKit 2**.

**Cloudflare deployment:** https://whos-that-pokemon-7iu.pages.dev

The previous Vercel URL, https://wtp.vercel.app, may continue serving the older version until the hosting transition is completed. It is not configured as a redirect to Cloudflare.

## Features

- Guess Pokémon from their silhouettes in a multiple-choice game.
- Choose Pokémon generations **I–VIII** (the current standalone game's dataset covers 898 Pokémon).
- See your results and score after each round.
- Open **Professor Oak** for one Pokémon question and one speech-bubble answer, without any chat thread or API key.

For a broader Pokédex, team builder, and a newer guessing-game implementation, see the separate [Pokémo](https://github.com/dongumayagay/pokemo) project and its [live site](https://pokemo.pages.dev).

## Local development

Requirements:

- **Bun 1.4.3** (selected for the Cloudflare Pages build).
- **Node.js 22.17+** for framework/tooling compatibility.
- No external AI API key is required for Professor Oak.

```bash
git clone https://github.com/dongumayagay/WhosThatPokemon.git
cd WhosThatPokemon
bun install
bun run dev
```

Run validation before shipping:

```bash
bun run check
bun run build
```

You can preview the production build using `bun run preview`.

### Professor Oak's free Q&A

Professor Oak displays exactly one answer at a time. The browser sends a single question directly to [Pokémo's shared Oak API](https://pokemo.pages.dev/api/oak), which returns verified Pokédex facts where possible and uses Cloudflare Workers AI for more general Pokémon questions. No separate Gemini API key, chat history, vector database or user account is required.

The two websites share a server-side AI allowance. Cloudflare Workers AI has a free daily allocation, but **usage on paid Cloudflare accounts may be billable beyond it**. Server-side throttling is best effort rather than a guaranteed account-level spending cap.

## Cloudflare Pages deployment

The project uses `@sveltejs/adapter-cloudflare` and a Git-connected Cloudflare Pages project named **`whos-that-pokemon`**.

| Setting | Value |
| --- | --- |
| Cloudflare Pages URL | `https://whos-that-pokemon-7iu.pages.dev` |
| Build command | `bun install --frozen-lockfile && bun run check && bun run build` |
| Output directory | `.svelte-kit/cloudflare` |
| Bun version | `1.4.3` via Cloudflare `BUN_VERSION` |
| Node version | `22.17.0` via `.node-version` and Cloudflare `NODE_VERSION` |
| Dependency installation | Cloudflare auto-install disabled; the build command runs Bun explicitly |

The standalone app does not need an AI secret or AI binding. Professor Oak uses the shared Pokémo endpoint instead.

A successful GitHub push is not sufficient to claim a deployment is live. Verify the latest Cloudflare deployment has a successful build/deploy status. Svelte checking is enforced in the Cloudflare build; **no GitHub Actions** are used.

### Dependency management

[`.github/dependabot.yml`](.github/dependabot.yml) configures weekly **Bun** dependency updates. Dependabot creates update PRs; it does not merge or deploy updates automatically.

The repository contains a text-based `bun.lock` originally generated before the Cloudflare adapter / Gemini SDK migration. The committed `bun.lock` contains the Cloudflare adapter and Gemini SDK, with dependency ranges synchronized to `package.json`. Cloudflare verifies installs with `bun install --frozen-lockfile` before checking and building.

## Current limitations

- The standalone game includes Pokémon generations I–VIII; generation IX+ is not yet included in this repository.
- Pokémon sprites depend on external Pokémon asset sources.
- Professor Oak requires the shared Pokémo endpoint to be available; questions outside the stored facts also depend on free-tier Workers AI availability.
- The Cloudflare deployment has not replaced or deleted the Vercel project, and no domain redirects have been configured.

## Disclaimer

This is an unofficial fan project and is not affiliated with Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon names, characters, and imagery belong to their respective rights holders.
