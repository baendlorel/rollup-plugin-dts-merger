import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFilter, FilterPattern } from '@rollup/pluginutils';

type Filter = (s: string) => boolean;

export function getFiles(include: FilterPattern, exclude: FilterPattern) {
  const filter = createRealFilter(include, exclude);
  const list: string[] = [];
  const nonexist: string[] = [];
  recursion(filter, process.cwd(), list, nonexist);
  if (nonexist.length > 0) {
    console.warn(`__NAME__: The following files do not exist:\n${nonexist.join('\n')}`);
  }

  return list;
}

function createRealFilter(include: FilterPattern, exclude: FilterPattern): Filter {}

function recursion(filter: Filter, nextPath: string, list: string[], nonexist: string[]) {
  if (!filter(nextPath)) {
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
    recursion(filter, fullPath, list, nonexist);
  }
}
