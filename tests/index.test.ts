import { describe, it, expect, beforeEach } from 'vitest';
import { dtsMerger } from '../src/index.js';

import { mockIndexDts, read, MERGE_INTO, SRC, count } from './misc.js';

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
    (plugin.writeBundle as Function)();

    const { after, before } = read();
    const a = count(after, 'MockType');
    const b = count(before, '__TYPE__');

    expect(after).toContain('MockType');
    expect(before).not.toContain('MockType');

    expect(after).not.toContain('__TYPE__');
    expect(before).toContain('__TYPE__');

    expect(a).toEqual(b);
  });

  it('should replace with empty delimiters', () => {
    const plugin = dtsMerger({
      include: [SRC],
      mergeInto: MERGE_INTO,
      replace: {
        delimiters: ['', ''],
        values: {
          __DILIMITER__: 'kasukabe',
        },
      },
    });
    (plugin.writeBundle as Function)();
    const { before, after } = read();
    const b = count(before, '__DILIMITER__');
    expect(b).toBe(2);
    expect(before).toContain('__DILIMITER__');
    expect(before).not.toContain('AAAkasukabeAAA');

    const a = count(after, '__DILIMITER__');
    expect(a).toBe(1);
    expect(after).toContain('AAAkasukabeAAA');
    expect(after).not.toContain('__DILIMITER__');
  });

  it('should prevent assignment replacement', () => {
    const plugin = dtsMerger({
      include: [SRC],
      mergeInto: MERGE_INTO,
      replace: {
        preventAssignment: true,
        values: {
          __TYPE__: 'PreventAssignType',
        },
      },
    });
    (plugin.writeBundle as Function)();
    const { after } = read();
    expect(after).toContain('PreventAssignType');
  });
});
