# Who's That Pokémon?

A fan-made Pokémon silhouette quiz built with **Svelte 5** and **SvelteKit 2**.

**Cloudflare deployment:** https://whos-that-pokemon-7iu.pages.dev

The previous Vercel URL, https://wtp.vercel.app, may continue serving the older version until the hosting transition is completed. It is not configured as a redirect to Cloudflare.

## Features

- Guess Pokémon from their silhouettes in a multiple-choice game.
- Choose Pokémon generations **I–VIII** (the current standalone game's dataset covers 898 Pokémon).
- See your results and score after each round.
- Open **Professor Oak** for a Pokémon-themed AI conversation, provided the server-side Google Gemini key is configured.

For a broader Pokédex, team builder, and a newer guessing-game implementation, see the separate [Pokémo](https://github.com/dongumayagay/pokemo) project and its [live site](https://pokemo.pages.dev).

## Local development

Requirements:

- **Bun 1.4.3** (selected for the Cloudflare Pages build).
- **Node.js 22.17+** for framework/tooling compatibility.
- A Google Gemini API key **only** if you want to test Professor Oak chat.

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

### Environment variables

Create a local `.env` file, based on [`.env.example`](.env.example), if you plan to use the AI feature:

```dotenv
GEMINI_API_KEY=your_private_api_key
```

The key is consumed **server-side**, never shipped to the browser. The `/api/chat` endpoint returns HTTP **503** with a helpful message when the key is missing. The guessing game itself does not require an API key.

The Professor Oak endpoint uses `@google/genai` with the `gemini-3.8-flash` model. Google API usage may incur charges according to your Google account's terms; keep request quotas and budget limits in mind.

## Cloudflare Pages deployment

The project uses `@sveltejs/adapter-cloudflare` and a Git-connected Cloudflare Pages project named **`whos-that-pokemon`**.

| Setting | Value |
| --- | --- |
| Cloudflare Pages URL | `https://whos-that-pokemon-7iu.pages.dev` |
| Build command | `bun ci && bun run check && bun run build` |
| Output directory | `.svelte-kit/cloudflare` |
| Bun version | `1.4.3` via Cloudflare `BUN_VERSION` |
| Node version | `22.17.0` via `.node-version` and Cloudflare `NODE_VERSION` |
| Dependency installation | Cloudflare auto-install disabled; the build command runs Bun explicitly |

Set the **`GEMINI_API_KEY`** secret separately in Cloudflare's production environment to enable Professor Oak after deployment. Do not paste real secrets into GitHub, README, or public environment variables. The AI feature is **not verified operational** without that secret.

A successful GitHub push is not sufficient to claim a deployment is live. Verify the latest Cloudflare deployment has a successful build/deploy status. Svelte checking is enforced in the Cloudflare build; **no GitHub Actions** are used.

### Dependency management

[`.github/dependabot.yml`](.github/dependabot.yml) configures weekly **Bun** dependency updates. Dependabot creates update PRs; it does not merge or deploy updates automatically.

The repository contains a text-based `bun.lock` originally generated before the Cloudflare adapter / Gemini SDK migration. The committed `bun.lock` contains the Cloudflare adapter and Gemini SDK, with dependency ranges synchronized to `package.json`. Cloudflare verifies installs with `bun ci` before checking and building.

## Current limitations

- The standalone game includes Pokémon generations I–VIII; generation IX+ is not yet included in this repository.
- Pokémon sprites depend on external Pokémon asset sources.
- Professor Oak requires an external Google API key and is unavailable without it.
- The Cloudflare deployment has not replaced or deleted the Vercel project, and no domain redirects have been configured.

## Disclaimer

This is an unofficial fan project and is not affiliated with Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon names, characters, and imagery belong to their respective rights holders.
