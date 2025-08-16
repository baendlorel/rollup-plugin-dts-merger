import { expect } from './common.js';
import { __ROLLUP_OPTIONS__, Any, DeepPartial, ReplaceOptions } from './types.js';

type RegexTemplate = (key: string) => string;

export class Replacer {
  private readonly values: Record<string, Any>;
  private readonly regex: RegexTemplate;

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

  static generateRegexTemplate(options: ReplaceOptions): RegexTemplate {
    const { delimiters, preventAssignment, preventDeclaration } = options;
    const [p, s] = delimiters;
    if (preventAssignment && preventDeclaration) {
      return (key: string) => `${p}${key}${s}(?!\\s*[=:])`;
    } else if (preventAssignment) {
      return (key: string) => `${p}${key}${s}(?!\\s*[=])`;
    } else if (preventDeclaration) {
      return (key: string) => `${p}${key}${s}(?!\\s*[:])`;
    } else {
      return (key: string) => `${p}${key}${s}`;
    }
  }

  constructor(options: ReplaceOptions) {
    this.values = options.values;
    this.regex = Replacer.generateRegexTemplate(options);
  }

  static stringify(key: string, value: Any): string {
    switch (typeof value) {
      case 'string':
        return value;
      case 'function':
        return Replacer.stringify(key, value(key));
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

  apply(content: string) {
    for (const [key, value] of Object.entries(this.values)) {
      const replacement = Replacer.stringify(key, value);
      const pattern = this.regex(key);
      content = content.replace(pattern, replacement);
    }
    return content;
  }
}
