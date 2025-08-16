import { describe, it, expect, beforeEach } from 'vitest';
import { mockIndexDts, read, MERGE_INTO, SRC, DIST, runPlugin } from './misc.js';

describe('dts-merger plugin', () => {
  beforeEach(() => {
    mockIndexDts(MERGE_INTO);
  });

  it('should merge .d.ts files correctly', () => {
    runPlugin({
      include: [SRC],
      mergeInto: DIST.concat('type.d.ts'),
      replace: {
        values: {
          __TYPE__: 'MockType',
        },
      },
    });

    const result = read('__TYPE__', 'MockType');
    expect(result).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 3,
    });
  });

  it('should replace with empty delimiters', () => {
    runPlugin({
      include: [SRC],
      mergeInto: DIST.concat('delimiter.d.ts'),
      replace: {
        delimiters: ['', ''],
        values: {
          __DILIMITER__: 'kasukabe',
        },
      },
    });

    const result = read('__DILIMITER__', 'kasukabe');
    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 2,
    });
  });

  it('should prevent assignment replacement', () => {
    runPlugin({
      include: [SRC],
      mergeInto: DIST.concat('assignment.d.ts'),
      replace: {
        preventAssignment: true,
        values: {
          __ASSIGN__: 'Assigned',
        },
      },
    });

    const result = read('__ASSIGN__', 'Assigned');
    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 1,
      afterValue: 1,
    });
  });
});
