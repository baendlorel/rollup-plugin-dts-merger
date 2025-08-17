import { Any } from './types.js';

export const Defaults = {
  include: ['src'] as const,
  exclude: [],
  mergeInto: ['dist', 'index.d.ts'],
  replace: {
    delimiters: ['\\b', '\\b(?!\\.)'] as [string, string],
    preventAssignment: false,
    preventAssignmentRegex: {
      loolahead: '(?!\\s*[=:][^=:])',
      lookbehind: '(?<!\\b(?:const|let|var)\\s*)',
    },
    values: {} as Record<string, Any>,
  },
};
