import { describe, it, expect, beforeEach } from 'vitest';
import { dtsMerger } from '../src/index.js';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const mockIndexDts = (mergeInto: string | string[]) => {
  const into = Array.isArray(mergeInto) ? mergeInto : [mergeInto];
  const p = join(process.cwd(), ...into);
  const templatePath = join(process.cwd(), 'tests', 'index.d.ts.template');
  const template = readFileSync(templatePath, 'utf-8');
  writeFileSync(p, template);
};

const MERGE_INTO = ['tests', 'mock-dist', 'index.d.ts'];

const readResult = () => readFileSync(join(process.cwd(), ...MERGE_INTO), 'utf-8');

describe('dts-merger plugin', () => {
  beforeEach(() => {
    mockIndexDts(MERGE_INTO);
  });

  it('should merge .d.ts files correctly', () => {
    const plugin = dtsMerger({
      include: [['tests', 'mock-src']],
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
  });
});
