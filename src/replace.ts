import {
  DEFAULT_REPLACE_DELIMITERS,
  DEFAULT_REPLACE_PREVENTASSIGNMENT,
  DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOKBEHIND,
  DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOLAHEAD,
  DEFAULT_REPLACE_VALUES,
} from './defaults.js';
import { entries, isArray, isObject, isString, keys, mustBe } from './native.js';

const escape = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

const longest = (a: string, b: string) => b.length - a.length;

export function stringify(key: string, value: Any): string {
  if (value === null) {
    return 'null';
  }
  switch (typeof value) {
    case 'string':
      return value;
    case 'function':
      return stringify(key, value(key));
    case 'bigint':
    case 'number':
    case 'boolean':
    case 'undefined':
      return String(value);
    case 'object':
    case 'symbol':
    default:
      throw new TypeError(`Unsupported replacement type for key "${key}": ${typeof value}`);
  }
}
export function normalizeReplace(replace: DeepPartial<ReplaceOptions>): ReplaceOptions | string {
  if (!isObject(replace)) {
    return mustBe('replace', 'object');
  }

  const {
    delimiters = DEFAULT_REPLACE_DELIMITERS,
    preventAssignment = DEFAULT_REPLACE_PREVENTASSIGNMENT,
    values = DEFAULT_REPLACE_VALUES,
  } = replace as ReplaceOptions;

  if (!isArray(delimiters) || !isString(delimiters[0]) || !isString(delimiters[1])) {
    return mustBe('delimiters', '[string, string]');
  }

  if (typeof preventAssignment !== 'boolean') {
    return mustBe('preventAssignment', 'boolean');
  }

  if (!isObject(values)) {
    return mustBe('values', 'object');
  }

  return { delimiters, preventAssignment, values };
}

export class Replacer {
  private readonly record: Record<string, string>;
  private readonly regex: RegExp;

  constructor(options: ReplaceOptions) {
    this.record = this.generateMap(options.values);
    this.regex = this.generateRegExp(options);
  }

  generateMap(values: Record<string, Any>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const [key, value] of entries(values)) {
      map[key] = stringify(key, value);
    }
    return map;
  }

  generateRegExp(options: ReplaceOptions): RegExp {
    const { delimiters: d, preventAssignment, values } = options;
    const k = keys(values).sort(longest).map(escape);

    // negative lookbehind
    const b = preventAssignment ? DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOKBEHIND : '';
    // negative lookahead
    const a = preventAssignment ? DEFAULT_REPLACE_PREVENTASSIGNMENT_LOOLAHEAD : '';

    return new RegExp(`${b}${d[0]}(${k.join('|')})${d[1]}${a}`, 'g');
  }

  exec(content: string) {
    return content.replace(this.regex, (_, $1) => this.record[$1]);
  }
}
