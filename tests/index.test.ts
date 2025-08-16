import { describe, it, expect, beforeAll } from 'vitest';
import { PluginRunner } from './misc.js';

describe('dts-merger plugin', () => {
  beforeAll(() => {
    PluginRunner.clear();
  });

  it('should replace .d.ts files correctly', () => {
    const runner = new PluginRunner('normal.d.ts', {
      replace: {
        values: {
          __TYPE__: 'MockType',
          __MULTI__: 'mul',
          __EXCLUDE__: 'exc',
        },
      },
    });

    expect(runner.run('__TYPE__', 'MockType')).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 3,
    });

    expect(runner.read('__MULTI__', 'mul')).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 2,
    });

    expect(runner.read('__EXCLUDE__', 'exc')).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 3,
    });
  });

  it('should replace .d.ts files preventing assignments', () => {
    const runner = new PluginRunner('normal.d.ts', {
      mergeInto: ['tests', 'mock', 'dist', 'normal-replaced.d.ts'],
      replace: {
        preventAssignment: true,
        values: {
          __TYPE__: 'MockType',
          __MULTI__: 'mul',
          __EXCLUDE__: 'exc',
        },
      },
    });

    expect(runner.run('__TYPE__', 'MockType')).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 1,
      afterValue: 2,
    });

    expect(runner.read('__MULTI__', 'mul')).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 1,
      afterValue: 1,
    });

    expect(runner.read('__EXCLUDE__', 'exc')).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 2,
      afterValue: 1,
    });
  });

  it('should replace with empty delimiters', () => {
    const result = new PluginRunner('delimiter.d.ts', {
      replace: {
        delimiters: ['', ''],
        values: {
          __DILIMITER__: 'kasukabe',
        },
      },
    }).run('__DILIMITER__', 'kasukabe');

    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 2,
    });
  });

  it('should prevent assignment', () => {
    const result = new PluginRunner('prevented-assignment.d.ts', {
      include: [['tests', 'mock', 'src', 'assignment.d.ts']],
      mergeInto: ['tests', 'mock', 'dist', 'prevented-assignment.d.ts'],
      replace: {
        preventAssignment: true,
        values: {
          __ASSIGN__: 'Assigned',
        },
      },
    }).run('__ASSIGN__', 'Assigned');

    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 1,
      afterValue: 1,
    });
  });

  it('should replace assignment', () => {
    const result = new PluginRunner('assignment.d.ts', {
      include: [['tests', 'mock', 'src', 'assignment.d.ts']],
      mergeInto: ['tests', 'mock', 'dist', 'replaced-assignment.d.ts'],
      replace: {
        values: {
          __ASSIGN__: 'Assigned',
        },
      },
    }).run('__ASSIGN__', 'Assigned');

    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 0,
      afterValue: 2,
    });
  });

  it('should keep', () => {
    const result = new PluginRunner('keep.d.ts', {
      replace: {
        preventAssignment: true,
      },
    }).run('__IB__', 'adsfas');

    expect(result).toMatchObject({
      beforeKey: 2,
      beforeValue: 0,
      afterKey: 2,
      afterValue: 0,
    });
  });

  it('should respect exclude option', () => {
    const result = new PluginRunner('excluded.d.ts', {
      include: ['tests/mock/src'],
      exclude: [
        'tests/mock/src/keep.d.ts',
        'tests/mock/src/delimiter.d.ts',
        'tests/mock/src/assignment.d.ts',
      ],
      mergeInto: ['tests', 'mock', 'dist', 'normal-excluded.d.ts'],
      replace: {
        preventAssignment: true,
        values: {
          __EXCLUDE__: 'excluded',
        },
      },
    }).run('__EXCLUDE__', 'excluded');
    // 只剩下 mock/src 目录下未被 exclude 的那个文件
    expect(result).toMatchObject({
      beforeKey: 3,
      beforeValue: 0,
      afterKey: 2,
      afterValue: 1,
    });
  });
});
