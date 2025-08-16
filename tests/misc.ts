import { join } from 'node:path';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import type { Plugin } from 'rollup';

import { dtsMerger, recursion } from '../src/dts-merger.js';
import { stringify } from '../src/replace.js';
import { __OPTS__, __STRICT_OPTS__, DeepPartial } from '../src/types.js';

export const DIST = ['tests', 'mock', 'dist'];
export const MERGE_INTO = [...DIST, 'index.d.ts'];
export const SRC = ['tests', 'mock', 'src'];

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

export class PluginRunner {
  static clear() {
    const dist = join(process.cwd(), ...DIST);
    rmSync(dist, { force: true, recursive: true });
    mkdirSync(dist, { recursive: true });
  }

  private readonly plugin: Plugin;
  private readonly opts: __STRICT_OPTS__;
  private readonly writeBundle: () => void;

  constructor(name: string, opts: DeepPartial<__OPTS__>) {
    opts.include ??= [SRC.concat(name)];
    opts.mergeInto ??= DIST.concat(name);
    this.plugin = dtsMerger(opts);
    this.opts = (this.plugin as any).__KSKBTMG__;
    this.writeBundle = (this.plugin as any).writeBundle.bind(this.plugin);
  }

  read(key: string, value: any) {
    const after = readFileSync(join(this.opts.mergeInto), 'utf-8');
    const before = (() => {
      const srcDir = join(...this.opts.include);
      const files: string[] = [];
      recursion(this.opts.exclude, srcDir, files);
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
  }

  run(key: string, value: any) {
    this.writeBundle();
    return this.read(key, value);
  }
}
