import { join, relative } from 'node:path';
import {
  readdirSync,
  readFileSync,
  existsSync,
  statSync,
  appendFileSync,
  writeFileSync,
} from 'node:fs';
import type { Plugin } from 'rollup';
import { createFilter } from '@rollup/pluginutils';

import { replace } from './replace.js';
import { RollupDtsMergerOptions } from './global.js';

export function getDtsFiles(
  exclude: (s: string) => boolean,
  nextPath: string,
  list: string[],
  nonexist: string[]
) {
  if (!exclude(nextPath)) {
    return;
  }

  if (!existsSync(nextPath)) {
    nonexist.push(nextPath);
    return;
  }

  const s = statSync(nextPath);
  if (s.isFile() && nextPath.endsWith('.d.ts')) {
    list.push(nextPath);
    return;
  }

  if (!s.isDirectory()) {
    return;
  }

  const items = readdirSync(nextPath);
  for (let i = 0; i < items.length; i++) {
    const fullPath = join(nextPath, items[i]);
    getDtsFiles(exclude, fullPath, list, nonexist);
  }
}

function normalize(options?: RollupDtsMergerOptions): __STRICT_OPTS__ {
  const {
    include = ['src'],
    exclude = ['node_modules/**/*', 'dist/**/*'],
    mergeInto = 'dist/index.d.ts',
    replace: rawReplace = {},
  } = Object(options) as RollupDtsMergerOptions;

  if (typeof mergeInto !== 'string') {
    throw new TypeError('mergeInto must be a string');
  }
  if (rawReplace === null || typeof rawReplace !== 'object') {
    throw new TypeError('replace must be an object');
  }

  const replaceList: string[] = [];
  Object.entries(rawReplace).forEach(([key, value]) => {
    if (typeof value === 'function') {
      replaceList.push(key, String(value(key)));
    } else {
      replaceList.push(key, String(value));
    }
  });

  const list: string[] = [];
  const nonexist: string[] = [];
  // & find all .d.ts files first, then filter
  getDtsFiles(createFilter(undefined, exclude), process.cwd(), list, nonexist);

  if (nonexist.length > 0) {
    console.warn(`__NAME__: The following files do not exist:\n${nonexist.join('\n')}`);
  }

  return { list: list.filter(createFilter(include, undefined)), mergeInto, replaceList };
}

/**
 * ## Intro
 * Find all `.d.ts` files in directories(default: 'src') as your provided. Then append their content to the target declaration file, default (default: 'dist/index.d.ts')
 *
 * We have a built in simple replacer which looks like '@rollup/plugin-replace', shares some same options.
 *
 * @params options RollupDtsMergerOptions
 * @returns Plugin
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
 * You can use options(RollupDtsMergerOptions) to customize the behavior
 *
 * __PKG_INFO__
 */
export function dtsMerger(options?: RollupDtsMergerOptions): Plugin {
  const cwd = process.cwd();
  const opts = normalize(options);

  const plugin: Plugin = {
    name: '__NAME__',
    writeBundle() {
      const { list, mergeInto, replaceList } = opts;

      if (!existsSync(mergeInto)) {
        const rel = relative(cwd, mergeInto);
        // & only warns but not quit
        throw new Error(`__NAME__: '${rel}' does not exist, please check the order of plugins!`);
      }

      // first, replace the content of `mergeInto` target
      if (existsSync(mergeInto) && statSync(mergeInto).isFile()) {
        let content = readFileSync(mergeInto, 'utf8');
        content = replace(replaceList, content);
        writeFileSync(mergeInto, content, 'utf8');
      }

      // replace and append
      for (let i = 0; i < list.length; i++) {
        let content = readFileSync(list[i], 'utf8');
        content = replace(replaceList, content);

        const relativePath = relative(cwd, list[i]);
        const s = `\n// \u0023 from: ${relativePath}\n${content}`;
        appendFileSync(mergeInto, s, 'utf8');
      }
    },
  };

  Reflect.defineProperty(plugin, '__KSKB_TMG_OPTS__', { value: opts });

  return plugin as Plugin;
}
