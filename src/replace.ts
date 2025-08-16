import { expect } from './common.js';
import { __ROLLUP_OPTIONS__, Any, DeepPartial } from './types.js';

export class Replacer {
  private readonly delimiters: [string, string];
  private readonly preventAssignment: boolean;
  private readonly values: Record<string, Any>;

  static normalize(
    replace: DeepPartial<__ROLLUP_OPTIONS__['replace']>
  ): __ROLLUP_OPTIONS__['replace'] {
    expect(typeof replace === 'object' && replace !== null, `options.replace must be an object`);

    const {
      delimiters = ['\\b', '\\b(?!\\.)'],
      preventAssignment = false,
      values = {},
    } = replace as __ROLLUP_OPTIONS__['replace'];

    expect(
      Array.isArray(delimiters) && delimiters.length === 2,
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
      typeof values === 'object' && values !== null,
      `options.replace.values must be an object`
    );

    return { delimiters, preventAssignment, values };
  }

  constructor(options: __ROLLUP_OPTIONS__['replace']) {
    this.preventAssignment = options.preventAssignment;
    this.values = options.values;
    this.delimiters = options.delimiters;
  }

  stringify(key: string, value: Any): string {
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'function') {
      return this.stringify(key, value(key));
    }

    expect(typeof value !== 'object', `replacement cannot be an object`);
    return JSON.stringify(value);
  }

  regex(key: string): RegExp {
    const r = `${this.delimiters[0]}${key}${this.delimiters[1]}`;
    if (this.preventAssignment) {
      return new RegExp(`${r}(?!\\s*=)`, 'g');
    }
    return new RegExp(r, 'g');
  }

  apply(content: string) {
    for (const [key, value] of Object.entries(this.values)) {
      const replacement = this.stringify(key, value);
      const pattern = this.regex(key);
      content = content.replace(pattern, replacement);
    }
    return content;
  }
}
