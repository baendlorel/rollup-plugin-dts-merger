export type Any =
  | string
  | number
  | boolean
  | null
  | undefined
  | object
  | symbol
  | bigint
  | Function;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface __ROLLUP_OPTIONS__ {
  /**
   * Will join the given paths with `process.pwd()`
   * - if omitted, will use `path.join(<cwd>,'src)`
   * - if item is an array, will use `path.join(<cwd>,...item)`
   * @default path.join(<cwd>, include[0])
   */
  include: (string | string[])[];

  /**
   * The file to merge into, relative to `process.cwd()`
   * - if it is an array, will use `path.join(<cwd>,...mergeInto)`
   * @default ['dist', 'index.d.ts']
   */
  mergeInto: string | string[];

  /**
   * Simple replace options inspired by '@rollup/plugin-replace', not such powerful as the original one.
   * - `preventAssignment`:
   *    - whether to replace some thing like 'var __NAME__ = xxx;'.
   *    - default is `false`, recommended to set it to `true`. But keep it the same as '@rollup/plugin-replace'
   * - `value`: a key-value object to replace expressions in the '.d.ts' files.
   *    - default is `{}`
   * - `delimiters`: used to determine the boundary of the words.
   *    - since this plugin works on declaration files, it is recommended to use `['', '']`
   *    - default is `['\\b', '\\b(?!\\.)']` @see https://www.npmjs.com/package/@rollup/plugin-replace
   */
  replace: ReplaceOptions;
}

export interface __STRICT_ROLLUP_OPTIONS__ {
  include: string[];
  mergeInto: string;
  replace: ReplaceOptions;
}

export interface ReplaceOptions {
  /**
   * To replace every occurrence of `<@foo@>` instead of every occurrence of `foo`, supply delimiters
   * - `[string, string]` is actually `[prefix, suffix]`
   * - since this plugin works on declaration files, it is recommended to use `['', '']`
   * - default is `['\\b', '\\b(?!\\.)']` @see https://www.npmjs.com/package/@rollup/plugin-replace
   * @example
   * ```typescript
   * // if delimiters: ['<@', '@>'], values:{ foo: 'bar' }
   * // Before
   * const a = '<@foo@>';
   * // After
   * const a = 'bar';
   * ```
   */
  delimiters: [string, string];

  /**
   * Default is `false`, but it is recommended to set it to `true`.
   * @example
   * ```typescript
   * // Before
   * const __NAME__ = 'a';
   * const ERR_NAME = '__NAME__Error';
   *
   * // After: If preventAssignment: false, values:{ __NAME__: 'SomeName' }
   * const SomeName = 'SomeName';
   * const ERR_NAME = 'SomeNameError';
   *
   * // After: If preventAssignment: true
   * const __NAME__ = 'a';
   * const ERR_NAME = 'SomeNameError';
   * ```
   */
  preventAssignment: boolean;

  /**
   * Default is `false`, but it is recommended to set it to `true`.
   * - similar to `preventAssignment` but works for declarations
   *   - simply, the logic of `=` used in `preventAssignment` is changed to `:`
   * @example
   * ```typescript
   * // Before
   * declare const __NAME__: string;
   *
   * // After: If preventDeclaration: false, values:{ __NAME__: 'SomeName' }
   * declare const SomeName: string;
   *
   * // After: If preventDeclaration: true
   * declare const __NAME__: string;
   * ```
   */
  preventDeclaration: boolean;

  /**
   * A key-value object to replace expressions in the '.d.ts' files.
   * - if `value` is a function, it will be called with `key` and the return value will be used as the replacement.
   *   - this means then meet `{ key: 'fn' }`, then `fn` will be called as `fn(key)` and use the result to stringify.
   * - otherwise, just stringify the value.
   */
  values: Record<string, Any>;
}
