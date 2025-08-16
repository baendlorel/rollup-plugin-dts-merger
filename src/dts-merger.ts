import path from 'node:path';
import console from 'node:console';
import { readdirSync, readFileSync, existsSync, statSync, appendFileSync } from 'node:fs';
import type { Plugin } from 'rollup';

import { __ROLLUP_OPTIONS__, DeepPartial } from './types';
import { expect } from './common';
import { Replacer } from './replace';

function recursion(dir: string, result: string[]) {
  for (const file of readdirSync(dir)) {
    const fullPath = path.join(dir, file);
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

function normalize(options?: DeepPartial<__ROLLUP_OPTIONS__>): __ROLLUP_OPTIONS__ {
  const {
    include: rawInclude = [],
    mergeInto = 'index.d.ts',
    replace = {},
  } = Object(options) as __ROLLUP_OPTIONS__;
  expect(Array.isArray(rawInclude), `options.include must be an array`);
  expect(typeof mergeInto === 'string', `options.mergeInto must be a string`);
  expect(typeof replace === 'object' && replace !== null, `options.replace must be an object`);

  const {
    delimiters = ['\\b', '\\b(?!\\.)'],
    preventAssignment = false,
    values = {},
  } = replace as __ROLLUP_OPTIONS__['replace'];
  expect(
    Array.isArray(delimiters) && delimiters.length === 2,
    `options.replace.delimiters must be an array of two strings`
  );
  delimiters.forEach((d) =>
    expect(typeof d === 'string', `options.replace.delimiters must contain two strings`)
  );
  expect(
    typeof preventAssignment === 'boolean',
    `options.replace.preventAssignment must be a boolean`
  );
  expect(typeof values === 'object' && values !== null, `options.replace.values must be an object`);

  const cwd = process.cwd();
  const include = rawInclude.map((i) => path.join(cwd, i));
  if (include.length === 0) {
    include.push(cwd);
  }

  return {
    include,
    mergeInto,
    replace: { delimiters, preventAssignment, values },
  };
}

/**
 * Find all .d.ts files in src and prepend their content to dist/index.d.ts
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
        const relativePath = path.relative(cwd, file);
        const content = readFileSync(file, 'utf8');
        const replaced = replacer.apply(content);
        const s = `\n// \u0023 from: ${relativePath}\n`.concat(replaced);
        appendFileSync(mergeInto, s, 'utf8');
      }
    },
  };
}
