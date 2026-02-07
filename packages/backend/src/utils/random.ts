// packages/backend/src/utils/random.ts
/**
 * Seeded RNG for deterministic seeds when SEED env is set.
 * Uses mulberry32 PRNG.
 */

let seed: number | null = null;

function getSeed(): number {
  if (seed !== null) return seed;
  const envSeed = process.env.SEED;
  if (envSeed != null && envSeed !== "") {
    const n = parseInt(envSeed, 10);
    if (!Number.isNaN(n)) {
      seed = n >>> 0;
      return seed;
    }
  }
  seed = (Math.random() * 0xffffffff) >>> 0;
  return seed;
}

/** Returns [0, 1). Deterministic when SEED is set. */
export function random(): number {
  const s = (getSeed() + 0x6d2b79f5) | 0;
  seed = s;
  return (s >>> 0) / 0x100000000;
}

/** Integer in [min, max] inclusive. */
export function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/** Pick one element from array. Deterministic when SEED is set. */
export function pick<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("pick() on empty array");
  return arr[randomInt(0, arr.length - 1)] as T;
}

/** Shuffle array in place. Returns same array. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
}

/** Reset internal seed (e.g. for tests). */
export function setSeed(s: number | null): void {
  seed = s;
}
