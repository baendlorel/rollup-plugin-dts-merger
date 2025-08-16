import { join as pathJoin, relative } from 'node:path';
import { readdirSync, readFileSync, existsSync, statSync, appendFileSync } from 'node:fs';
import type { Plugin } from 'rollup';

import { __OPTS__, __STRICT_OPTS__, DeepPartial } from './types.js';
import { expect } from './common.js';
import { Replacer } from './replace.js';

function isExistedDir(fullPath: string) {
  return existsSync(fullPath) && statSync(fullPath).isDirectory();
}

function isExistedDts(fullPath: string) {
  return existsSync(fullPath) && statSync(fullPath).isFile() && fullPath.endsWith('.d.ts');
}

export function recursion(exclude: Set<string>, unknownPath: string, result: string[]) {
  if (exclude.has(unknownPath)) {
    return;
  }

  if (isExistedDts(unknownPath)) {
    result.push(unknownPath);
    return;
  }

  if (!isExistedDir(unknownPath)) {
    return;
  }

  const items = readdirSync(unknownPath);
  for (let i = 0; i < items.length; i++) {
    const fullPath = pathJoin(unknownPath, items[i]);
    recursion(exclude, fullPath, result);
  }
}

function normalize(options?: DeepPartial<__OPTS__>): __STRICT_OPTS__ {
  const {
    include: rawInclude = [],
    exclude: rawExclude = [],
    mergeInto = ['dist', 'index.d.ts'],
    replace = {},
  } = Object(options) as __OPTS__;
  const cwd = process.cwd();
  const join = (p: string | string[]) =>
    Array.isArray(p) ? pathJoin(cwd, ...p) : pathJoin(cwd, p);

  expect(Array.isArray(rawInclude), `options.include must be an array`);
  expect(Array.isArray(rawExclude), `options.exclude must be an array`);
  expect(
    typeof mergeInto === 'string' || Array.isArray(mergeInto),
    `options.mergeInto must be string/string[]`
  );

  const include = rawInclude.length
    ? new Set(rawInclude.map((item) => join(item)))
    : new Set([join('src')]);
  const exclude = new Set(rawExclude.map((item) => join(item)));
  const union = new Set([...include, ...exclude]);

  expect(
    union.size === include.size + exclude.size,
    `options.include and options.exclude must not share any items`
  );

  return {
    include,
    exclude,
    mergeInto: join(mergeInto),
    replace: Replacer.normalize(replace),
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
export function dtsMerger(options?: DeepPartial<__OPTS__>): Plugin {
  const cwd = process.cwd();
  const { include, exclude, mergeInto, replace } = normalize(options);
  const replacer = new Replacer(replace);

  const plugin: Plugin = {
    name: '__NAME__',
    writeBundle() {
      if (!existsSync(mergeInto)) {
        const rel = relative(cwd, mergeInto);
        // & only warns but not quit
        const warn = this?.warn ?? console.warn;
        warn(`__NAME__ : '${rel}' does not exist, please check the order of plugins!`);
      }

      const dtsFiles: string[] = [];
      include.forEach((p) => recursion(exclude, p, dtsFiles));

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

  Object.defineProperty(plugin, '__KSKBTMG__', {
    value: { include, exclude, mergeInto, replace },
  });
  return plugin as Plugin;
}
