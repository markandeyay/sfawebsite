// Deterministic hashing for engineered irregularity. Same seed -> same number, every render, server and client.

/** FNV-1a 32-bit hash of a string, mapped to [0, 1). */
export function hash01(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967296;
}

/** Deterministic value in [min, max] for a seed. */
export function jitter(seed: string, min: number, max: number): number {
  return min + hash01(seed) * (max - min);
}

/** Deterministic pick from a list for a seed. */
export function pick<T>(seed: string, items: readonly T[]): T {
  return items[Math.floor(hash01(seed) * items.length) % items.length];
}
