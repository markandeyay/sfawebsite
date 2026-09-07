// Deterministic hashing for engineered irregularity. Same seed -> same number, every render, server and client.

/**
 * FNV-1a 32-bit hash of a string, mapped to [0, 1).
 *
 * FNV-1a alone has weak avalanche in its final byte: seeds that differ only
 * in the last character ("catno:1" .. "catno:9") land within a few percent
 * of each other, so every catalog number tilted the same way. The murmur3
 * finalizer mixes every bit into every other bit, so neighbouring seeds
 * spread across the whole range.
 */
export function hash01(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
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
