import { describe, it, expect, beforeAll } from 'vitest';
import { PluginRunner } from './misc.js';

describe('dts-merger plugin', () => {
  beforeAll(() => {
    PluginRunner.clear();
  });

  it('should merge .d.ts files correctly', () => {
    const result = new PluginRunner('normal.d.ts', {
      replace: {
        values: {
          __TYPE__: 'MockType',
        },
      },
    }).run('__TYPE__', 'MockType');

    expect(result).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 3,
    });
  });

  it('should replace with empty delimiters', () => {
    run('delimiter.d.ts', {
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
    run('assignment.d.ts', {
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

  it('should keep', () => {
    run('keep.d.ts', {
      replace: {
        preventAssignment: true,
      },
    });

    const result = read('__IB__', 'adsfas');
    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 2,
      afterValue: 0,
    });
  });
});
