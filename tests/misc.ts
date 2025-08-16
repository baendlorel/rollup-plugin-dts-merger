import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { dtsMerger, recursion } from '../src/dts-merger.js';
import { Replacer } from '../src/replace.js';
import { __ROLLUP_OPTIONS__, DeepPartial } from '../src/types.js';

export const DIST = ['tests', 'mock', 'dist'];
export const MERGE_INTO = [...DIST, 'index.d.ts'];
export const SRC = ['tests', 'mock', 'src'];

export const mockIndexDts = (mergeInto: string | string[]) => {
  const into = Array.isArray(mergeInto) ? mergeInto : [mergeInto];
  const p = join(process.cwd(), ...into);
  console.log('into', p);
  const templatePath = join(process.cwd(), 'tests', 'mock', 'index.d.ts.template');
  const template = readFileSync(templatePath, 'utf-8');
  writeFileSync(p, template);
};

function count(str: string, subStr: string): number {
  if (!str) {
    return 0;
  }
  if (!subStr) {
    throw new Error('Substring cannot be empty');
  }
  const first = subStr[0];
  const l = subStr.length;
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === first) {
      if (str.slice(i, i + l) === subStr) {
        count++;
        i += l;
      }
    }
  }

  return count;
}

export const read = (key: string, value: any) => {
  const before = readFileSync(join(process.cwd(), ...MERGE_INTO), 'utf-8');
  const after = (() => {
    const srcDir = join(process.cwd(), ...SRC);
    const files: string[] = [];
    recursion(srcDir, files);
    const result: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const content = readFileSync(files[i], 'utf-8');
      result.push(content);
    }

    return result.join('\n');
  })();

  const v = Replacer.stringify(key, value);

  return {
    before,
    after,
    beforeKey: count(before, key),
    beforeValue: count(before, v),
    afterKey: count(after, key),
    afterValue: count(after, v),
  };
};

export function runPlugin(opts: DeepPartial<__ROLLUP_OPTIONS__>) {
  const plugin = dtsMerger(opts);
  (plugin.writeBundle as Function)();
}
