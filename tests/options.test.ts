import { describe, it, expect } from 'vitest';

import { normalize } from '@/dts-merger.js';
import { run } from './runner.js';

describe('Options and Error Scenarios', () => {
  it('mergeInto invalid type', () => {
    expect(() => normalize({ mergeInto: NaN as any })).toThrow();
  });

  it('replace is not an object', () => {
    expect(() => run('common.d.ts', 'output', { replace: null as any })).toThrow();
    expect(() => run('common.d.ts', 'output', { replace: 123 as any })).toThrow();
  });

  it('include file does not exist', () => {
    // Non-existent file: plugin should warn but not throw, output should be empty
    const { content } = run('not-exist.d.ts', 'not-exist', {});
    expect(content).toBe('');
  });

  it('replace supports function', () => {
    const { content } = run('common.d.ts', 'replace-fn', {
      replace: {
        __FLAG__: (k: string) => k + '_fn',
      },
    });
    expect(content).toContain('__FLAG___fn');
  });

  it('replace supports null/undefined/boolean/number', () => {
    const { content } = run('common.d.ts', 'replace-types', {
      replace: {
        __FLAG__: null,
        __EXPORT_FLAG__: undefined,
        ReplaceableType: 42,
        REPLACEABLE_CONST: false,
      },
    });
    expect(content).toContain('null');
    expect(content).toContain('undefined');
    expect(content).toContain('42');
    expect(content).toContain('false');
  });
});
