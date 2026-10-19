# WTP 2.0 — Arcade Experience (Release A) Design

**Status:** Proposed for review, not implemented.
**Date:** 2026-10-19
**Parent roadmap:** 2026-10-19-wtp-v2-experience-roadmap.md
**Release boundary:** Game feel, visual identity, responsive interaction and sound only. Difficulty engine, Gym Trials and personal Pokédex belong to separate follow-up specs.

## Player outcome

A casual or experienced Pokémon fan opens the site, chooses Free Play, Daily Dex or 10-Round Challenge, immediately understands the silhouette and options, receives a satisfying but skippable result, and can start another round without friction. A mobile user with a 320-pixel-wide viewport can finish the same loop; a reduced-motion user gets the same information instantly; a user without sound still gets full feedback.

This replaces the impression of a web form with a small arcade game. Preserve gameplay rules and current scores as the source of truth.

## Interface decisions

**Home:** One compact "Who's That Pokémon?" masthead; one large primary button for **Daily Dex** (or its completed/resume status), side-by-side **Free Play** and **10-Round Challenge** cards, a small Choose Generations control for non-daily modes, optional Professor Oak control, a Settings button for Sound and Motion. No forced onboarding, banners, popups or scrolling gates.

**In-game:** Game header/HUD displays mode, question index or "Endless", score and streak in a compact responsive band; central square stage is the visual focus; answers are a two-column touch-friendly grid; Hint and End/Save are visually secondary. Keep meaningful output within naturally scrolling document flow and respect bottom safe-area insets. Full controls must remain reachable with onscreen keyboard and screen readers.

**Reveal:** A mystery silhouette sits on a contrasting card with an optional restrained animated border. Guessing locks choices synchronously and records the answer exactly once. Correct/wrong feedback appears immediately in text and icon (not color alone), while the silhouette transitions via a short flash/wipe into the colored pixel-art sprite. A correct response can trigger a short combo accent; a wrong response must still show the answer neutrally. Next and End actions remain keyboard/touch operable; a Skip Animation action reveals immediately. Reduced-motion devices skip nonessential transforms, particles and flashing. Never delay the accessible result announcement until an animation finishes.

**Results:** Summary card with accuracy, points, best streak, rank/achievement teaser where available, and primary Replay / Back to Modes actions. Existing daily spoiler-free sharing stays reachable when completed; show progress and today's status. Professor Oak remains independently dismissible and must not obscure quiz controls.

**Design tokens:** Dark ink/navy base (#17243A), electric blue (#2E68E8), sunny gold (#F7C84B), warm white (#F6F8FC), success teal (#157F65) and warm coral (#B63D47) as starting tokens, to be checked for text contrast before shipping. Soft rounded game panels, subtle pixel/retro accents and one readable headline face plus a normal high-legibility body face. Buttons convey meaning by label, shape and outline, not hue only. No sprites or logos embedded in CSS backgrounds without checking rights.

## Round lifecycle and state

Use explicit UI round phases to avoid competing flags:
- **home**: no active Pokémon; mode selection and optional previous result.
- **asking**: one active target and N answer choices; hide colored sprite; one optional hint.
- **revealing**: one answer committed, score and correctness calculated once; colored sprite/reveal effects; choices disabled.
- **review**: revealed answer plus one Next or Finish action.
- **summary**: no active question, durable end statistics or completed Daily Dex.

Existing src/lib/pokemon.svelte.js remains the controller. Introduce a round-phase field into src/lib/state.svelte.js and translate existing hidePokemon/completed semantics with a single transition function; avoid two independent booleans disagreeing about whether a guess is allowed. Pure rules stay in src/lib/game-rules.js and src/lib/daily-challenge.js. The animation is visual only; it does not alter scoring or determine whether an answer is valid.

Event flow: player selects mode -> existing Pokémon selector gives target/options -> stage loads silhouette asset -> player guesses -> controller records score and daily answer once -> stage receives a revealed phase -> text feedback and optional animation/audio -> player continues to the next target or result. An interrupted animation (navigation, tab hidden, closing modal) still leaves a valid revealed result.

For Daily Dex, preserve current UTC seed and same choices worldwide. Reloading a half-completed day reconstructs saved guesses and resumes the correct next target; scores do not depend on client animation state.

## Component boundaries and planned files

- **src/routes/+page.svelte:** compose header, game screen, settings and Professor Oak; avoid new gameplay logic here.
- **src/lib/components/PokemonImage.svelte:** become an accessible stage with distinct loading, hidden, reveal and missing-image states; keep CSS-mask silhouette behavior and prevent colored preview before a guess. If the component grows unwieldy, extract a focused RevealStage.svelte, not a generic animation framework.
- **src/lib/components/Control.svelte:** shrink to orchestrating focused ModePicker.svelte, GameHud.svelte, AnswerGrid.svelte and ResultPanel.svelte components. Presentation consumes state and invokes controller actions; it does not change points itself.
- **src/lib/components/GameSettings.svelte:** explicit sound toggle (initially off) and reduced-motion/animation preference that defaults to OS settings; both keyboard accessible.
- **src/lib/audio.js:** opt-in playback service with no imperative audio on page load. On correct answer after user interaction, play only enabled effects; a Pokémon cry after reveal is allowed only when the source's use is cleared and the file can load. Browser autoplay rejection, missing file, network error, muted device and absence of audio support silently fall back to visual/text feedback. No need to load audio while sound is off.
- **src/lib/game-rules.js / pokemon.svelte.js / state.svelte.js:** one-action-one-answer rule and phase transitions, preserving existing mode results.
- **src/app.css:** stable CSS custom properties, responsive spacing/type scale, contrast and reduced-motion media query; no layout thrash caused by full-screen effects.
- **tests/mobile_playwright.py:** replace the stale test that looks for "Play" and "Quit" and assumes four controls. Automate real current mode and answer flows.

No general component framework, account backend, multiplayer dependency or build-system migration.

## Media, assets and legal constraints

Keep existing externally hosted PokéAPI sprites; do not show the color sprite in HTML before guess while a CSS mask is used for the mystery. Cache/preload carefully without compromising hidden image, and display an explicit Retry Image affordance if external media fails. In Daily Dex, image load failures must not consume a guess or change the deterministic puzzle. A missing sprite must not leave a clickable unrecognizable question.

Sound defaults OFF. After a user enables sound, short locally generated interface notes may be used; only conditionally use remote PokéAPI cries (OGG) if permitted by their terms. Do not redistribute Pokémon cries/art locally until rights are reviewed. Provide a mute button visible during game and preserve preference only if local storage works.

## Error handling and accessibility

- If localStorage fails or returns corrupted input: use defaults and in-memory state; do not crash, erase unrelated storage or change a completed Daily Dex without valid evidence.
- If image loading stalls/fails: visible text state, retry and exit; do not count an invisible/unanswerable question as missed.
- If audio cannot play: continue gameplay without error messages or blocking; sound toggle remains usable.
- If the browser requests reduced motion: use instant reveal; avoid unnecessary movement; no fast-flashing effects. Offer an explicit animation-off setting.
- Ensure visible keyboard focus, semantic buttons, announced correctness and image alt text, reduced clutter on 320 x 568 screens, 44 x 44 minimum pointer targets and high-contrast text. No information depends on sound, color, or animation.

## Automated and manual acceptance tests

1. Original JS suite passes unchanged unless assertions reflect obsolete UI wording; never relax scoring assertions to fit faulty behavior.
2. Separate round-flow tests: one committed answer once, repeated taps ignored, hint and quit handling, immediate summary at end, mid-reveal navigation, Daily Dex reload and no reveal before answer.
3. Browser Playwright: Free Play start -> silhouette -> guess -> reveal -> next -> end; Daily Dex resume/complete/share; 10-Round result; generation selection and Oak dialog remain functional.
4. Browser viewport matrix: 320x568, 375x667, 390x844, 768x1024, 1280x800 plus landscape checks. No horizontal overflow, off-screen required controls, obstructed answer buttons or native long-press color preview.
5. Keyboard-only and screen-reader semantics: visible focus, number shortcuts, no double answer, Enter next, no keyboard hijack in text fields, correct/incorrect messages announced.
6. Emulate prefers-reduced-motion; verify no forced animation and all actions work. Sound defaults off; explicit on/off works; playback error does not block a guess.
7. Simulate failed sprite request and blocked local storage; show recoverable UI without lost/incorrect Daily Dex score.
8. Validate with node --test tests/*.test.js, bun install --frozen-lockfile, bun run check, bun run build; fix any svelte-check errors before integration. Run browser suite against preview URL.
9. Merge approved code to master only after passing checks, confirm Cloudflare production deployment SHA/status, then navigate live site to verify the new modes and reveal.

## Out of scope for Release A

No new difficulty choice engine, species metadata, Gym Trials, collection data, award board, online leaderboard, paid API or social accounts. Those are explicitly covered by Releases B and C in the parent roadmap and must not be quietly dropped.
