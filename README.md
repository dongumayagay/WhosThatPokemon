# Who's That Pokemon?

Test your Pokemon Knowledge by Guessing **Who's That Pokemon?!**

View the Live site [Click here](https://wtp.vercel.app/)

## Requirements

- Node.js

## Setup

clone or download the repo
then install the dependencies with your package manager of choice ( npm, yarn, pnpm )

```
# for npm
npm install

# for yarn
yarn

# for pnpm
pnpm install

```

## Developing

start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Cloudflare deployment (Bun)

This app runs on Cloudflare Pages using `@sveltejs/adapter-cloudflare`.

- Install dependencies with Bun 1.4.3, then run `bun run check` and `bun run build`.
- The Pages output directory is `.svelte-kit/cloudflare`.
- Set a server-side `GEMINI_API_KEY` secret on Cloudflare Pages for Professor Oak.
- Without that key, the quiz remains available and the Professor Oak endpoint responds with a clear 503 error.
- Never commit your API key or a populated `.env` file.

The Cloudflare Pages build checks the app before deployment. No GitHub Actions are used.
