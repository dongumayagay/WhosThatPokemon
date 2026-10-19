# WTP 2.0 — Arcade Experience Roadmap

**Status:** Proposed design for review, not implemented.
**Date:** 2026-10-19
**Repository:** dongumayagay/WhosThatPokemon; production branch master; Cloudflare Pages project whos-that-pokemon.

## Intent and successful outcome

The player approved a larger redesign of the current fan-made silhouette quiz, not simply extra question modes. The new game should make each guess and reveal satisfying, give both casual and expert Pokémon fans a suitable challenge, reward mastery and collection over time, and feel deliberately designed on phones. Preserve the fast silhouette-guessing core, existing Free Play, ten-round Challenge, five-question UTC Daily Dex, generation selection for non-daily play, spoiler-free daily sharing, and Professor Oak. Ship to master after verification and confirm Cloudflare production deployment, not just a GitHub push.

This is a **multi-subproject** change. Build it as three independently testable and releasable upgrades, not one large risky patch. Completing one phase must not be represented as completing all of WTP 2.0.

## Alternative approaches considered

1. **Arcade-first incremental redesign (chosen):** Improve the repeated guess-and-reveal loop and responsive design first; then introduce meaningful challenge; finally add long-term collecting. Easier to test against the working app and less risk to the daily puzzle.
2. **Modes-first expansion:** Rapidly add lots of game types without improving the core visuals or feedback. Smaller initial code changes but risks more menus around a bland experience.
3. **Full platform rewrite with accounts, multiplayer, servers and leaderboards:** Attractive eventual possibilities, but disproportionate to a standalone fan quiz and introduces cost, identity, privacy and cheating issues without first proving the game is enjoyable.

The chosen approach keeps Svelte 5, SvelteKit 2, Tailwind 4, pure JavaScript quiz rules, no account requirements, and the existing Cloudflare Pages build. Keep dependencies minimal.

## Release A — Arcade-quality core and mobile redesign

**Detailed specification:** 2026-10-19-wtp-v2-arcade-experience-design.md in this directory.

- Redesign the screen as a game: coherent navy/royal-blue/gold visual language, readable panels, arcade-inspired decorative elements, clear play-mode selection, lightweight HUD, results, and a mobile-first layout. No new branded logos or ripped game artwork.
- Give every answer an immediate correct/wrong response, one-score-only locking, a crisp silhouette-to-color reveal and satisfying combo feedback. Provide a skip/instant reveal and honor reduced-motion settings.
- Add **optional** sound effects and, only when source rights and availability permit, Pokémon cries. All audio starts OFF and can be disabled or enabled in settings; failed audio must never block gameplay.
- Support keyboard, touch and assistive technology. Keep Professor Oak and all three existing modes operational.
- Replace the outdated browser regression test that still asserts obsolete Play and Quit buttons. Test real desktop/mobile flows.

**Acceptance gate A:** New game stages, sound toggle, no accidental early image disclosure, reduced-motion alternatives and responsive screen pass unit, Svelte/type checks, build and browser playthrough. Production deploy success and live smoke check required.

## Release B — Meaningful difficulty and Gym Trials

- Provide **Easy, Normal and Expert** choices for Free Play and ten-round Challenge. Easy: three random eligible names; Normal: four names, generally generation/type-related; Expert: four names, prefer visually similar shapes/colors or close evolution families. Avoid unfair off-generation answers and duplicate choices. An eligible-pool fallback always produces a valid question.
- Prepare one small versioned, generated static metadata file for Generations I–VIII from Pokémon species attributes (types, color, shape, evolution family, generation), rather than performing slow per-question network calls. Do not guess metadata from names or use paid APIs.
- Add eight original **Gym Trials** themed around types: Grass, Fire, Water, Electric, Rock, Psychic, Ghost and Dragon. Each trial has five type-appropriate silhouettes and a distinct non-copyrighted visual theme. Four or five correct guesses out of five earns the associated emblem; hints are allowed but a hinted answer earns fewer points. Trials can be replayed; no grind gates.
- Daily Dex remains fixed at five deterministic, worldwide UTC questions, identical answers and scoring for everyone on the same date; difficulty settings must not change it.
- Retain no mandatory timers; no time-based point bonus. Difficulty means better decoys, not speed pressure.

**Acceptance gate B:** Deterministic choice tests, expert similarity ranking and fallback tests, at least eight complete type pools, mode progression and daily invariance tests, browser coverage for difficulty switching and Trial completion.

## Release C — Personal Pokédex, milestones and achievements

- Add a **personal Pokédex** for the existing 898 Pokémon, showing recognized/unrecognized, number, generation, completion by generation, filters and keyboard-accessible browsing. Unrecognized entries must not disclose the answer names or full-color art prematurely.
- Record first correctly identified Pokémon (unique discovery) and per-Pokémon mastery counters in a compact versioned local data store. Wrong answers never count as captures; hints still count as correct identifications but with lower score. Collection never changes today's shared puzzle.
- Show context-sensitive, non-blocking achievement toasts and a browsable achievement board: First Discovery; 10, 50 and 151 unique species; 3-, 5- and 10-answer streaks; Perfect 10-Round Challenge; all eight Gym Trial emblems. Duplicate awards are idempotent and not re-triggered every session.
- Continue existing Daily Dex and Challenge-best storage keys without silently erasing user progress. Use a versioned new storage key for collection. No registration or cloud sync; clearly explain that local browser storage can be cleared.

**Acceptance gate C:** Persistence migrations/defaults, damaged/disabled storage, progress per generation, idempotent awards, cross-mode discovery tests and full mobile/desktop Pokédex browsing.

## Shared non-negotiables

1. The core silhouette is hidden before guessing; results expose names and art only after a committed answer. No accidental colored preview via UI or long-press (not a DRM promise).
2. Daily Dex is deterministic per UTC date and is unaffected by personal settings, achievements and future metadata updates; preserve the current Daily Dex seed version and game history compatibility.
3. Users can play Free Play without signing in, enabling sound, passing an expert challenge or using Professor Oak. Keyboard and touch inputs must never submit the same guess twice.
4. Interactions with third-party sprite, cry or Oak services fail gracefully; a temporarily unavailable Pokémon image must not consume a Daily Dex attempt. No paid API or new secrets are required for gameplay.
5. Sound is opt-in; honor prefers-reduced-motion and clear focus indications; feedback uses words/icons as well as color. Provide at least 44 x 44 CSS-pixel controls, no horizontal overflow at 320 CSS px.
6. Preserve original fan-project disclaimer and do not bundle unlicensed art, music or sound. Artwork and sounds from Pokémon repositories require a rights review before redistribution; generic original sound effects are the fallback.
7. Every release must run node --test tests/*.test.js, bun install --frozen-lockfile, bun run check and bun run build on the actual changed source. Update and run browser regression tests against a deployed preview, then merge to master, verify Cloudflare's production deploy status and smoke-test the live domain. A merge alone is not proof of being live.

## Technical boundaries

- **Quiz domain:** pure deterministic selection, scoring and result utilities in src/lib rather than UI components.
- **Game orchestration:** explicit round status and persisted mode state in src/lib/pokemon.svelte.js and src/lib/state.svelte.js; no duplicated score computation in the view.
- **Rendering and settings:** focused Svelte 5 components for stage, HUD, answers, navigation, result, settings and Pokédex. Share a design-token layer in src/app.css.
- **Local data:** versioned profile/settings modules that validate inputs, persist only what is needed and degrade to in-memory mode when storage is disabled.
- **Static asset metadata:** precomputed attributes for fair distractor construction and theme selection; network sprites remain optional at runtime and must have clear loading/error state.

## Risk register and sequencing

- **Third-party Pokémon assets:** avoid shipping copyrighted downloaded sound/art without permitted rights; check source provenance, ensure network failures are recoverable.
- **Difficulty tuning:** visual similarity metadata is an imperfect proxy for what humans actually find confusing; review curated examples and tune from manual playtests.
- **Daily fairness:** do not change the shipped date-seed algorithm or existing answer order when implementing Expert mode; hold static metadata updates separate from daily deck generation.
- **Persistence:** version and validate storage, preserve old keys, never corrupt today's completed status.
- **Creeping scope:** leave multiplayer, public rankings, accounts, ads, power-up stores, rare pull loot boxes and mandatory time trials out of WTP 2.0.

## Definition of done

WTP 2.0 is **not done** until releases A, B and C are implemented; their stated tests and browser checks pass; they are merged to the production master branch; Cloudflare reports production deployment success for those commits; and a browser smoke run confirms the expected UI and interactions on https://whos-that-pokemon-7iu.pages.dev.

## Research references

- https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/108 — allow difficulty customization.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion — avoid forced animation.
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay — user-gesture and autoplay restrictions.
- https://pokeapi.co/docs/v2 — source format for sprite/cry and species information; availability does not settle redistribution rights.
