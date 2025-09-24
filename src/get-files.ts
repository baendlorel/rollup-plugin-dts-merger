import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFilter, FilterPattern } from '@rollup/pluginutils';

type Filter = (s: string) => boolean;

export function getFiles(include: FilterPattern, exclude: FilterPattern) {
  const includes = createFilter(include, null);
  const excludes = createFilter(null, exclude);

  const dtsFiles: string[] = [];
  recursion(excludes, process.cwd(), dtsFiles);
  return dtsFiles.filter(includes);
}

/**
 * Load all .d.ts files recursively from a given path
 * @param excludes
 * @param nextPath full path of the item
 * @param list valid file paths
 * @param nonexist nonexist file paths
 * @returns
 */
function recursion(excludes: Filter, nextPath: string, list: string[]) {
  if (excludes(nextPath)) {
    return;
  }

  const s = statSync(nextPath);
  if (s.isDirectory()) {
    const items = readdirSync(nextPath);
    for (let i = 0; i < items.length; i++) {
      const fullPath = join(nextPath, items[i]);
      recursion(excludes, fullPath, list);
    }
    return;
  }

  if (s.isFile() && nextPath.endsWith('.d.ts')) {
    list.push(nextPath);
    return;
  }
}
