# Who's That Pokémon?

A fan-made Pokémon silhouette quiz built with **Svelte 5** and **SvelteKit 2**.

**Cloudflare deployment:** https://whos-that-pokemon-7iu.pages.dev

The previous Vercel URL, https://wtp.vercel.app, may continue serving the older version until the hosting transition is completed. It is not configured as a redirect to Cloudflare.

## Features

- **Silhouette-based difficulty:** Easy (3 deliberately different outlines), Normal (4 moderately similar outlines), and Expert (4 visually close outlines). The ranking compares 24×24 alpha masks from the same front sprites used in the quiz, tolerating mirrored poses and tiny offsets. The index covers all 898 Pokémon and is precomputed—no mass image downloads while playing. Daily Dex remains identical for everyone.

- Play **Daily Dex**, five shared Pokémon mysteries each UTC day. Everyone gets the same five unique silhouettes and four answer choices per question drawn from the correct Pokémon's generation. Today's completed puzzle cannot restart until the next UTC day (browser storage is not tamper-proof).
- Play **Free Play** (unlimited rounds) or a **10-Round Challenge** with a clear finish line.
- Build answer streaks for **100–200 points per correct answer**, with a personal-best Challenge score saved locally on your device.
- Use one **50/50 hint per round** to leave two answer choices (one eliminated in three-choice modes, two in Daily Dex); hinted correct answers earn half points.
- Choose Pokémon generations **I–VIII** (898 Pokémon). Encounters do not repeat until the selected pool is exhausted, and wrong choices come from the selected generations.
- See live round progress, score, streak, results, Trainer ranks and immediate correct/wrong feedback.
- Daily Dex progress automatically saves on your device so you can resume after refreshing, and you can **share a spoiler-free color-grid result** (green = correct, yellow = correct with hint, dark = missed).
- No timers, social accounts, paid APIs or extra dependencies for the game.
- Press **1**–**3** in Easy mode or **1**–**4** in Normal, Expert, and Daily Dex to guess, then **Enter** to continue, or use touch-friendly buttons.
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
node --test tests/*.test.js
bun install --frozen-lockfile
bun run check
bun run build
```

You can preview the production build using `bun run preview`.

### Professor Oak's free Q&A

Professor Oak displays exactly one answer at a time. The browser sends a single question directly to [Pokémo's shared Oak API](https://pokemo.pages.dev/api/oak), which answers familiar Pokédex facts locally and asks Cloudflare's free-tier Gemma AI for less exact Pokémon questions, if the daily free quota remains. It does not keep a chat thread. No separate Gemini API key, chat history, vector database or user account is required.

**Free-tier condition:** On **Cloudflare Workers Free**, the 10,000-Neurons/day allowance has a hard cutoff; inference stops rather than generating AI overage charges. If the account upgrades to Workers Paid, requests beyond the free allowance can become billable. The shared endpoint caps response length, throttles requests per isolate, never retries with a paid provider, and falls back to local Pokédex answers when AI is unavailable. Standard Cloudflare Pages hosting remains subject to your plan and traffic.

## Mobile and browser regression checks

The game has a naturally scrolling mobile layout, responsive game stage and two-column answer buttons that remain usable on short phones. Before the answer is revealed, the Pokémon is rendered using a CSS silhouette mask rather than a previewable color image, preventing casual native long-press image previews. The answer choices are sampled without replacement, with three or four distinct names depending on mode. It is not designed to prevent a determined player using browser developer tools to identify the Pokémon.

Run the Node regression suite with `node --test tests/*.test.js`. A separate manual Playwright suite validates real browser layouts and interactions:

```bash
python -m pip install playwright
python -m playwright install chromium
BASE_URL=https://whos-that-pokemon-7iu.pages.dev python tests/mobile_playwright.py
```

Supply a Cloudflare preview URL as `BASE_URL` when testing an unreleased build. This browser suite is **not** part of GitHub Actions; Cloudflare Pages performs dependency, test, check, and build validation.

## Cloudflare Pages deployment

The project uses `@sveltejs/adapter-cloudflare` and a Git-connected Cloudflare Pages project named **`whos-that-pokemon`**.

| Setting | Value |
| --- | --- |
| Cloudflare Pages URL | `https://whos-that-pokemon-7iu.pages.dev` |
| Build command | `node --test tests/*.test.js && bun install --frozen-lockfile && bun run check && bun run build` |
| Output directory | `.svelte-kit/cloudflare` |
| Bun version | `1.4.3` via Cloudflare `BUN_VERSION` |
| Node version | `22.17.0` via `.node-version` and Cloudflare `NODE_VERSION` |
| Dependency installation | Cloudflare auto-install disabled; the build command runs Bun explicitly |

The standalone app does not need an AI secret or AI binding. Professor Oak uses the shared Pokémo endpoint instead.

A successful GitHub push is not sufficient to claim a deployment is live. Verify the latest Cloudflare deployment has a successful build/deploy status. Svelte checking is enforced in the Cloudflare build; **no GitHub Actions** are used.

### Dependency management

[`.github/dependabot.yml`](.github/dependabot.yml) configures weekly **Bun** dependency updates. Dependabot creates update PRs; it does not merge or deploy updates automatically.

The repository contains a text-based `bun.lock` originally generated before the Cloudflare adapter / Gemini SDK migration. The committed `bun.lock` contains the Cloudflare adapter and Gemini SDK, with dependency ranges synchronized to `package.json`. Cloudflare verifies installs with `bun install --frozen-lockfile` before checking and building.

### Regenerating silhouette similarity data

The checked-in `src/lib/silhouette-data.json` was generated from the front-sprite alpha masks in [PokéAPI/sprites](https://github.com/PokeAPI/sprites), pinned to commit `7a7d66b1620e646f69afd48dc1273da9033ede9c`. The original PNGs are not redistributed in the index. When regenerating (e.g. for new Pokémon), run `node scripts/generate-silhouette-data.mjs` and commit the resulting descriptor JSON. The script uses only Node built-ins. Image-matching scores are a geometric approximation of difficulty, not an empirically calibrated human error rate.

## Current limitations

- The standalone game includes Pokémon generations I–VIII; generation IX+ is not yet included in this repository.
- Pokémon sprites depend on external Pokémon asset sources.
- Professor Oak needs the shared Pokémo endpoint; flexible questions also depend on Workers AI's free allowance. When inference is unavailable, it returns an offline answer or a clear limitation message.
- The Cloudflare deployment has not replaced or deleted the Vercel project, and no domain redirects have been configured.

## Disclaimer

This is an unofficial fan project and is not affiliated with Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon names, characters, and imagery belong to their respective rights holders.
