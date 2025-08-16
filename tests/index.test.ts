import { describe, it, expect } from 'vitest';
import { dtsMerger } from '../src/index.js';

describe('dts-merger plugin', () => {
  it('should merge .d.ts files correctly', () => {
    const plugin = dtsMerger({ include: ['test'] });
  });
});
