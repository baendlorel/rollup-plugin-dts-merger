import { join as pathJoin, relative } from 'node:path';
import { readdirSync, readFileSync, existsSync, statSync, appendFileSync } from 'node:fs';
import type { Plugin } from 'rollup';

import { __ROLLUP_OPTIONS__, __STRICT_ROLLUP_OPTIONS__, DeepPartial } from './types.js';
import { expect } from './common.js';
import { Replacer } from './replace.js';

function recursion(dir: string, result: string[]) {
  for (const file of readdirSync(dir)) {
    const fullPath = pathJoin(dir, file);
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    if (file.endsWith('.d.ts')) {
      result.push(fullPath);
      continue;
    }
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      recursion(fullPath, result);
    }
  }
}

function normalize(options?: DeepPartial<__ROLLUP_OPTIONS__>): __STRICT_ROLLUP_OPTIONS__ {
  const {
    include: include = [],
    mergeInto: rawMergeInto = 'index.d.ts',
    replace: rawReplace = {},
  } = Object(options) as __ROLLUP_OPTIONS__;
  expect(Array.isArray(include), `options.include must be an array`);
  expect(
    typeof rawMergeInto === 'string' || Array.isArray(rawMergeInto),
    `options.mergeInto must be a string`
  );

  const cwd = process.cwd();
  const join = (p: string | string[]) =>
    Array.isArray(p) ? pathJoin(cwd, ...p) : pathJoin(cwd, p);

  return {
    include: include.length ? include.map((item) => join(item)) : [join('src')],
    mergeInto: join(rawMergeInto),
    replace: Replacer.normalize(rawReplace),
  };
}

/**
 * ## Intro
 * Find all `.d.ts` files in directories(default: 'src') as your provided. Then append their content to the target declaration file, default (default: 'dist/index.d.ts')
 *
 * __NAME__ has a built in simple replacer which looks like '@rollup/plugin-replace', shares some same options.
 *
 * ## Usage
 * Put it in plugins array in rollup.config.js
 * @example
 * ```typescript
 * {
 *   input: 'src/index.ts',
 *   output: [{ file: 'dist/index.d.ts', format: 'es' }],
 *   plugins: [dts({ tsconfig }), dtsMerger()],
 * }
 * ```
 * You can use options(__ROLLUP_OPTIONS__) to customize the behavior
 *
 *
 * __PKG_INFO__
 */
export function dtsMerger(options?: DeepPartial<__ROLLUP_OPTIONS__>): Plugin {
  const cwd = process.cwd();
  const { include, mergeInto, replace } = normalize(options);

  const replacer = new Replacer(replace);

  return {
    name: '__NAME__',
    writeBundle() {
      if (!existsSync(mergeInto)) {
        console.warn(`__NAME__ Warning: ${mergeInto} does not exist, skipping.`);
        return;
      }

      const dtsFiles: string[] = [];
      for (let i = 0; i < include.length; i++) {
        recursion(include[i], dtsFiles);
      }

      for (let i = 0; i < dtsFiles.length; i++) {
        const file = dtsFiles[i];
        const relativePath = relative(cwd, file);
        const content = readFileSync(file, 'utf8');
        const replaced = replacer.apply(content);
        const s = `\n// \u0023 from: ${relativePath}\n`.concat(replaced);
        appendFileSync(mergeInto, s, 'utf8');
      }
    },
  };
}
