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
   * - if omitted, will use `<process.cwd()>/src`
   * @example path.join(process.cwd(), include[0])
   */
  include: string[];

  /**
   * The file to merge into, relative to `process.cwd()`
   * @example 'dist/index.d.ts'
   */
  mergeInto: string;

  /**
   * Simple replace options inspired by '@rollup/plugin-replace', not such powerful as the original one.
   * - `preventAssignment`: default is false, but it is recommended to set it to `true`.
   * - `value`: a key-value object to replace expressions in the '.d.ts' files.
   * - `delimiters`: used to determine the boundary of the words.
   */
  replace: {
    /**
     * To replace every occurrence of `<@foo@>` instead of every occurrence of `foo`, supply delimiters
     * - `[string, string]` is actually `[prefix, suffix]`
     * - default is `['\\b', '\\b(?!\\.)']` @see https://www.npmjs.com/package/@rollup/plugin-replace
     * @example
     * // if delimiters: ['<@', '@>'], values:{ foo: 'bar' }
     * // Before
     * const a = '<@foo@>';
     * // After
     * const a = 'bar';
     */
    delimiters: [string, string];

    /**
     * Default is `false`, but it is recommended to set it to `true`.
     * @example
     * // If preventAssignment: false, values:{ __NAME__: 'dts-merger' }
     * // Before
     * const __NAME__ = 'DtsMerger';
     * const ERR_NAME = '__NAME__Error';
     * // After
     * const 'DtsMerger' = 'DtsMerger';
     * const ERR_NAME = 'DtsMergerError';
     *
     * // If preventAssignment: true
     * // After
     * const __NAME__ = 'DtsMerger';
     * const ERR_NAME = 'DtsMergerError';
     */
    preventAssignment: boolean;

    /**
     * A key-value object to replace expressions in the '.d.ts' files.
     * - if `value` is a function, it will be called with `key` and the return value will be used as the replacement.
     *   - this means then meet `{ key: 'fn' }`, then `fn` will be called as `fn(key)` and use the result to stringify.
     * - otherwise, just stringify the value.
     */
    values: Record<string, Any>;
  };
}
