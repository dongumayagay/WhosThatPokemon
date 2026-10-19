# Daily Dex game design

**Intent:** Improve replayability of the existing Who's That Pokemon? silhouette quiz with a lightweight daily ritual, fair difficulty, and friendly progress feedback. Do not add accounts, timers, paid services, or ad mechanics. Preserve Free Play, 10-Round Challenge, selected generations, and Professor Oak.

## Player loop

- **Daily Dex** is exactly five fixed silhouettes shared by all players for one UTC day, chosen across Generations I-VIII. The answer choices are four distinct Pokemon from the answer's generation. Each round has an optional 50/50 hint, leaving the correct option and one wrong option; hinted scores are halved.
- On each guess, reveal the sprite and immediate correctness; show cumulative score, combo, and progress. A daily session ends after five guesses. The result shows accuracy, rank, and a color-coded sequence without names. A Share button uses the native share sheet where supported or copies spoiler-free text.
- Today's in-progress/finished daily results persist locally for refresh and can be resumed; completed daily puzzle is unavailable to replay until the next UTC day. No account/security promise: browser storage can be cleared.
- Free Play stays unlimited and 10-Round Challenge remains available. Generation selection applies to these two modes, not Daily Dex, to keep daily results comparable. No mandatory time pressure.

## Engineering

- Deterministic daily deck and share/result helpers in `src/lib/daily-challenge.js` (pure JavaScript), with seeded random generation and same-generation distractors via `createChoiceIdsFromPool(..., 4)`.
- `src/lib/pokemon.svelte.js` owns the mode state transitions and JSON storage under `wtp-daily-v1` plus existing challenge best. A saved guess contains answer name and hint flag; replay validated guesses to reconstruct score without trusting serialized state.
- `src/lib/game-rules.js` resolves completion for five-round daily or ten-round challenge and disables hints properly in the four-choice case.
- UI changes confined to existing `Control.svelte` and minimal `Header.svelte`, `state.svelte.js`, route mount. Preserve touch targets and reduce-motion behavior. No new external assets or dependencies.

## Verification

- Unit tests for same date same puzzle, date changes, unique valid IDs/options, choice counts, answer validation, hint scoring and 50/50 eliminations, share format without answers, and progress reload reconstruction.
- Existing suite `node --test tests/*.test.js`, framework check/build on Cloudflare. Verify the production deployment reports success and the live home page exposes Daily Dex after merging `master`.
