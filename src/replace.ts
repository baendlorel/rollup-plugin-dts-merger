import { __OPTS__, Any, DeepPartial, ReplaceOptions } from './types.js';

function escape(str: string) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function longest(a: string, b: string) {
  return b.length - a.length;
}

export function stringify(key: string, value: Any): string {
  switch (typeof value) {
    case 'string':
      return value;
    case 'function':
      return stringify(key, value(key));
    case 'bigint':
    case 'number':
    case 'boolean':
      return value.toString();
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null) {
        return 'null';
      }
    case 'symbol':
    default:
      throw new TypeError(`Unsupported replacement type for key "${key}": ${typeof value}`);
  }
}

export class Replacer {
  private readonly map: Record<string, string>;
  private readonly regex: RegExp;

  static normalize(replace: DeepPartial<ReplaceOptions>): ReplaceOptions | string {
    if (typeof replace !== 'object' || replace === null) {
      return `options.replace must be an object`;
    }

    const {
      delimiters = ['\\b', '\\b(?!\\.)'],
      preventAssignment = false,
      values = {},
    } = replace as ReplaceOptions;

    if (!Array.isArray(delimiters)) {
      return `options.replace.delimiters must be an array of two strings`;
    }

    if (typeof delimiters[0] !== 'string' || typeof delimiters[1] !== 'string') {
      return `options.replace.delimiters must contain two strings`;
    }

    if (typeof preventAssignment !== 'boolean') {
      return `options.replace.preventAssignment must be a boolean`;
    }

    if (typeof values !== 'object' || values === null) {
      return `options.values must be an object`;
    }

    return { delimiters, preventAssignment, values };
  }

  constructor(options: ReplaceOptions) {
    this.map = this.generateMap(options.values);
    this.regex = this.generateRegExp(options);
  }

  generateMap(values: Record<string, Any>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      map[key] = stringify(key, value);
    }
    return map;
  }

  generateRegExp(options: ReplaceOptions): RegExp {
    const { delimiters: d, preventAssignment, values } = options;
    const keys = Object.keys(values).sort(longest).map(escape);

    // negative lookbehind
    const b = preventAssignment ? '(?<!\\b(?:const|let|var)\\s*)' : '';
    // negative lookahead
    const a = preventAssignment ? '(?!\\s*[=:][^=:])' : '';

    return new RegExp(`${b}${d[0]}(${keys.join('|')})${d[1]}${a}`, 'g');
  }

  apply(content: string) {
    return content.replace(this.regex, (_, $1) => this.map[$1]);
  }
}
