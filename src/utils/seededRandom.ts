/**
 * Simple seeded random number generator (LCG - Linear Congruential Generator)
 * Based on the Park and Miller algorithm
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /**
   * Returns a random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Returns a random number between min and max
   */
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns a random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }
}
