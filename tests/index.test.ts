import { describe, it, expect, beforeEach } from 'vitest';
import { dtsMerger } from '../src/index.js';

import {
  mockIndexDts,
  readResult,
  MERGE_INTO,
  SRC,
  countOccurrences,
  readInclude,
} from './misc.js';

describe('dts-merger plugin', () => {
  beforeEach(() => {
    mockIndexDts(MERGE_INTO);
  });

  it('should merge .d.ts files correctly', () => {
    const plugin = dtsMerger({
      include: [SRC],
      mergeInto: MERGE_INTO,
      replace: {
        values: {
          __TYPE__: 'MockType',
        },
      },
    });
    const fn = plugin.writeBundle as Function;
    expect(typeof fn === 'function').toBe(true);
    fn();
    const result = readResult();
    expect(result).toContain('MockType');
    expect(result).not.toContain('__TYPE__');
    const a = countOccurrences(result, 'MockType');

    const origin = readInclude();
    const b = countOccurrences(origin, '__TYPE__');
    expect(a).toEqual(b);
  });
});
