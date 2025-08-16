import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { recursion } from '../src/dts-merger.js';

export const mockIndexDts = (mergeInto: string | string[]) => {
  const into = Array.isArray(mergeInto) ? mergeInto : [mergeInto];
  const p = join(process.cwd(), ...into);
  const templatePath = join(process.cwd(), 'tests', 'mock', 'index.d.ts.template');
  const template = readFileSync(templatePath, 'utf-8');
  writeFileSync(p, template);
};

export const MERGE_INTO = ['tests', 'mock', 'dist', 'index.d.ts'];
export const SRC = ['tests', 'mock', 'src'];

export const readResult = () => readFileSync(join(process.cwd(), ...MERGE_INTO), 'utf-8');
export const readInclude = () => {
  const srcDir = join(process.cwd(), ...SRC);
  const files: string[] = [];
  recursion(srcDir, files);
  const result: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const content = readFileSync(files[i], 'utf-8');
    result.push(content);
  }

  return result.join('\n');
};

export function countOccurrences(str: string, subStr: string): number {
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
