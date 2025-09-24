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

function createRealFilter(include: FilterPattern, exclude: FilterPattern): Filter {
  const rollupFilter = createFilter(include, exclude);

  return (path: string) => {
    // For files, use the rollup filter directly
    if (path.endsWith('.d.ts')) {
      return rollupFilter(path);
    }

    // For directories, we need to decide whether to traverse into them
    // The key insight: we should traverse a directory if it might contain
    // files that match our include pattern and don't match our exclude pattern

    // Always allow traversal if there's no include pattern (means include all)
    if (!include) {
      // But still check exclude for directories
      if (exclude) {
        const excludeFilter = createFilter(undefined, exclude);
        return excludeFilter(path);
      }
      return true;
    }

    // If we have include patterns, check if this directory could contain matching files
    const includeArray = Array.isArray(include) ? include : [include];

    for (const pattern of includeArray) {
      const patternStr = String(pattern);

      // If pattern is a specific file, check if this directory is on the path to that file
      if (patternStr.endsWith('.d.ts')) {
        if (patternStr.startsWith(path + '/')) {
          return true;
        }
        continue;
      }

      // For glob patterns, test if this directory could match
      // Create a test file path and see if it would match the pattern
      const testFilePath = join(path, 'test.d.ts');
      if (rollupFilter(testFilePath)) {
        return true;
      }

      // Also check if we need to traverse deeper for ** patterns
      if (patternStr.includes('**')) {
        // For ** patterns, we usually need to traverse unless the path is clearly unrelated
        return true;
      }

      // For single * patterns, check if the directory structure matches
      if (patternStr.includes('*') && !patternStr.includes('**')) {
        // Extract the directory part before the filename pattern
        const lastSlash = patternStr.lastIndexOf('/');
        if (lastSlash !== -1) {
          const dirPattern = patternStr.substring(0, lastSlash);
          const testDirPath = path + '/dummy';
          if (createFilter([dirPattern + '/*'], undefined)(testDirPath)) {
            return true;
          }
        } else {
          // Pattern is in current directory, allow if we're in the right directory
          return true;
        }
      }
    }

    return false;
  };
}

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
