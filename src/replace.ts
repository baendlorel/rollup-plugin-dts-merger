import { expect } from './common';
import { __ROLLUP_OPTIONS__, Any } from './types';

export class Replacer {
  private readonly delimiters: [string, string];
  private readonly preventAssignment: boolean;
  private readonly values: Record<string, Any>;

  constructor(options: __ROLLUP_OPTIONS__['replace']) {
    this.preventAssignment = options.preventAssignment;
    this.values = options.values;
    this.delimiters = options.delimiters;
  }

  stringify(value: Any): string {
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'function') {
      return this.stringify(value());
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
      const replacement = this.stringify(value);
      const pattern = this.regex(key);
      content = content.replace(pattern, replacement);
    }
    return content;
  }
}
