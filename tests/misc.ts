import { join } from 'node:path';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';

import { dtsMerger, recursion } from '../src/dts-merger.js';
import { stringify } from '../src/replace.js';
import { __ROLLUP_OPTIONS__, DeepPartial } from '../src/types.js';

export const DIST = ['tests', 'mock', 'dist'];
export const MERGE_INTO = [...DIST, 'index.d.ts'];
export const SRC = ['tests', 'mock', 'src'];

export const clear = () => {
  const dist = join(process.cwd(), ...DIST);
  rmSync(dist, { force: true, recursive: true });
  mkdirSync(dist, { recursive: true });
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
  const after = readFileSync(join(process.cwd(), ...MERGE_INTO), 'utf-8');
  const before = (() => {
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

  const v = stringify(key, value);

  return {
    before,
    after,
    beforeKey: count(before, key),
    beforeValue: count(before, v),
    afterKey: count(after, key),
    afterValue: count(after, v),
  };
};

export function runPlugin(name: string, opts: DeepPartial<__ROLLUP_OPTIONS__>) {
  opts.include ??= [SRC];
  opts.mergeInto ??= DIST.concat(name);
  const plugin = dtsMerger(opts);
  (plugin.writeBundle as Function)();
}
