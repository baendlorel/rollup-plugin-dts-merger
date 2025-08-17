import { Any } from './types.js';

export const DEFAULT_INCLUDE = ['src'];
export const DEFAULT_EXCLUDE = [];
export const DEFAULT_MERGEINTO = ['dist', 'index.d.ts'];
export const DEFAULT_REPLACE = {} as Record<string, Any>;
export const DEFAULT_REPLACE_DELIMITERS = ['\\b', '\\b(?!\\.)'] as [string, string];
export const DEFAULT_REPLACE_PREVENTASSIGNMENT = false;
export const DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOKBEHIND = '(?<!\\b(?:const|let|var)\\s*)';
export const DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOLAHEAD = '(?!\\s*[=:][^=:])';
export const DEFAULT_REPLACE_VALUES = {} as Record<string, Any>;
