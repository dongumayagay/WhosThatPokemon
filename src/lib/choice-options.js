/**
 * Choose the correct Pokémon and two distinct alternatives.
 * Sampling without replacement prevents duplicate buttons and infinite retries.
 * @param {number} correctId
 * @param {number} total
 * @param {() => number} [random]
 * @returns {number[]}
 */
export function createChoiceIds(correctId, total, random = Math.random) {
  if (!Number.isInteger(correctId) || !Number.isInteger(total) || total < 3 || correctId < 1 || correctId > total) {
    throw new RangeError('Valid Pokémon and at least three possible answers are required.');
  }
  // Sample from the IDs excluding the correct one, without replacement.
  const alternatives = Array.from({ length: total - 1 }, (_, i) =>
    i + 1 < correctId ? i + 1 : i + 2
  );
  const picked = [correctId];
  for (let i = 0; i < 2; i++) {
    const j = i + Math.min(alternatives.length - i - 1, Math.max(0, Math.floor(random() * (alternatives.length - i))));
    [alternatives[i], alternatives[j]] = [alternatives[j], alternatives[i]];
    picked.push(alternatives[i]);
  }
  // Fisher–Yates for an unbiased position of the correct answer.
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}
