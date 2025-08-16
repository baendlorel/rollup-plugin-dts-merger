import { expect } from './common.js';
import { __ROLLUP_OPTIONS__, Any, DeepPartial, ReplaceOptions } from './types.js';

function escape(str: string) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function longest(a: string, b: string) {
  return b.length - a.length;
}

function getLookAhead(pa: boolean, pd: boolean): string {
  if (pa && pd) {
    return '(?!\\s*[=:][^=:])';
  } else if (pa) {
    return '(?!\\s*[=][^=])';
  } else if (pd) {
    return '(?!\\s*[:][^:])';
  } else {
    return '';
  }
}

function stringify(key: string, value: Any): string {
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
  private readonly values: Record<string, Any>;
  private readonly regex: RegExp;

  static generateRegExp(options: ReplaceOptions): RegExp {
    const { delimiters, preventAssignment, preventDeclaration, values } = options;
    const keys = Object.keys(values).sort(longest).map(escape);
    const [p, s] = delimiters;

    // const lookAhead = preventAssignment || preventDeclaration ? '(?<!\\b(?:const|let|var|function)\\s*)' : '';
    // & logic above is from '@rollup/plugin-replace', it only checks for variable declarations
    // & but ignores expressions like `aaa = 3`, which should be prevented too
    const lookAhead = '';
    const lookBehind = getLookAhead(preventAssignment, preventDeclaration);
    return new RegExp(`${lookAhead}${p}(${keys.join('|')})${s}${lookBehind}`, 'g');
  }

  static normalize(replace: DeepPartial<ReplaceOptions>): ReplaceOptions {
    expect(typeof replace === 'object' && replace !== null, `options.replace must be an object`);

    const {
      delimiters = ['\\b', '\\b(?!\\.)'],
      preventAssignment = false,
      preventDeclaration = false,
      values = {},
    } = replace as ReplaceOptions;

    expect(
      Array.isArray(delimiters) && delimiters.length >= 2,
      `options.replace.delimiters must be an array of two strings`
    );
    expect(
      typeof delimiters[0] === 'string' && typeof delimiters[1] === 'string',
      `options.replace.delimiters must contain two strings`
    );

    expect(
      typeof preventAssignment === 'boolean',
      `options.replace.preventAssignment must be a boolean`
    );

    expect(
      typeof preventDeclaration === 'boolean',
      `options.replace.preventAssignment must be a boolean`
    );

    expect(
      typeof values === 'object' && values !== null,
      `options.replace.values must be an object`
    );

    return { delimiters, preventAssignment, preventDeclaration, values };
  }

  constructor(options: ReplaceOptions) {
    this.values = options.values;
    this.regex = Replacer.generateRegExp(options);
  }

  apply(content: string) {
    const entries = Object.entries(this.values);
    for (let i = 0; i < entries.length; i++) {
      const replacement = stringify(entries[i][0], entries[i][1]);
      content = content.replace(this.regex, replacement);
    }
    return content;
  }
}
