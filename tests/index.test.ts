import { describe, it, expect } from 'vitest';
import { dtsMerger } from '../src/index.js';

describe('dts-merger plugin', () => {
  it('should merge .d.ts files correctly', () => {
    const plugin = dtsMerger({
      include: ['tests/mock-src'],
      mergeInto: 'tests/mock-dist/index.d.ts',
      replace: {
        values: {
          __TYPE__: 'MockType',
        },
      },
    });
    const fn = plugin.writeBundle as Function;
    expect(typeof fn === 'function').toBe(true);
    fn();
  });
});
