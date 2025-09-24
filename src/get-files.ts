import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createFilter, FilterPattern } from '@rollup/pluginutils';

type Filter = (s: string) => boolean;

export function getFiles(include: FilterPattern, exclude: FilterPattern) {}

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
