import { join as pathJoin, relative } from 'node:path';
import { readdirSync, readFileSync, existsSync, statSync, appendFileSync } from 'node:fs';
import type { Plugin, PluginContext, RollupError } from 'rollup';

import { __OPTS__, __STRICT_OPTS__, DeepPartial } from './types.js';
import { normalizeReplace, Replacer } from './replace.js';
import { defineProperty, isArray, isObject, isString, mustBe } from './native.js';
import {
  DEFAULT_EXCLUDE,
  DEFAULT_INCLUDE,
  DEFAULT_MERGEINTO,
  DEFAULT_REPLACE,
} from './defaults.js';

export function recursion(
  exclude: Set<string>,
  unknownPath: string,
  list: string[],
  nonexist: string[]
) {
  if (exclude.has(unknownPath)) {
    return;
  }

  if (!existsSync(unknownPath)) {
    nonexist.push(unknownPath);
    return;
  }

  const s = statSync(unknownPath);
  if (s.isFile() && unknownPath.endsWith('.d.ts')) {
    list.push(unknownPath);
    return;
  }

  if (!s.isDirectory()) {
    return;
  }

  const items = readdirSync(unknownPath);
  for (let i = 0; i < items.length; i++) {
    const fullPath = pathJoin(unknownPath, items[i]);
    recursion(exclude, fullPath, list, nonexist);
  }
}

function normalize(options?: DeepPartial<__OPTS__>): __STRICT_OPTS__ | string {
  const {
    include: rawInclude = DEFAULT_INCLUDE,
    exclude: rawExclude = DEFAULT_EXCLUDE,
    mergeInto = DEFAULT_MERGEINTO,
    replace: rawReplace = DEFAULT_REPLACE,
  } = Object(options) as __OPTS__;

  const cwd = process.cwd();
  const join = (p: string | string[]) => (isArray(p) ? pathJoin(cwd, ...p) : pathJoin(cwd, p));

  if (!isArray(rawInclude) || !isArray(rawExclude)) {
    return mustBe('include and exclude', 'array');
  }
  if (!isString(mergeInto) && !isArray(mergeInto)) {
    return mustBe('mergeInto', 'string/string[]');
  }

  const include = new Set(rawInclude.length ? rawInclude.map((item) => join(item)) : [join('src')]);
  const exclude = new Set(rawExclude.map((item) => join(item)));
  const union = new Set([...include, ...exclude]);

  if (union.size !== include.size + exclude.size) {
    return mustBe('include and exclude', 'disjoint');
  }

  const replace = normalizeReplace(rawReplace);
  if (isString(replace)) {
    return replace;
  }

  return {
    include,
    exclude,
    mergeInto: join(mergeInto),
    replace,
  };
}

function getContext(ctx: PluginContext) {
  const fallback = {
    warn: console.warn,
    error: (e: string | RollupError) => {
      throw isString(e) ? new Error(e) : e;
    },
  };

  if (!isObject(ctx)) {
    return fallback;
  }

  return typeof ctx.warn === 'function' ? ctx : fallback;
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
  const opts = normalize(options);

  const plugin: Plugin = {
    name: '__NAME__',
    writeBundle(this: PluginContext) {
      const ctx = getContext(this);

      if (isString(opts)) {
        ctx.error(opts);
      }

      const { include, exclude, mergeInto, replace } = opts as __STRICT_OPTS__;
      const replacer = new Replacer(replace);

      if (!existsSync(mergeInto)) {
        const rel = relative(cwd, mergeInto);
        // & only warns but not quit
        ctx.warn(`__NAME__: '${rel}' does not exist, please check the order of plugins!`);
      }

      const list: string[] = [];
      const nonexist: string[] = [];
      include.forEach((p) => recursion(exclude, p, list, nonexist));
      if (nonexist.length > 0) {
        ctx.warn(`__NAME__: The following files do not exist:\n${nonexist.join('\n')}`);
      }

      for (let i = 0; i < list.length; i++) {
        const relativePath = relative(cwd, list[i]);
        const content = readFileSync(list[i], 'utf8');
        const replaced = replacer.exec(content);
        const s = `\n// \u0023 from: ${relativePath}\n`.concat(replaced);
        appendFileSync(mergeInto, s, 'utf8');
      }
    },
  };

  defineProperty(plugin, '__KSKB_TUMUGI__', {
    value: opts,
  });

  return plugin as Plugin;
}
