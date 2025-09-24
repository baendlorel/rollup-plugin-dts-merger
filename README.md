<h1 align="center">rollup-plugin-dts-merger</h1>

[![npm version](https://img.shields.io/npm/v/rollup-plugin-dts-merger.svg)](https://www.npmjs.com/package/rollup-plugin-dts-merger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <em>🦄 A Rollup plugin for merging and replacing TypeScript declaration files (.d.ts) with flexible options! 🦄</em>
</p>

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

---

> **Note: options in 2.0.0 is not completely compatible with 1.x.x !!** [see the details](#user-content-options)

## Features

- 🚀 **Auto merge**: Automatically finds and merges all `.d.ts` files from specified directories
- 🔄 **Content replacement**: Built-in string/regex replacement functionality with support for functions
- 🎯 **Flexible filtering**: Include/exclude patterns using glob syntax
- 📦 **Zero dependencies**: Lightweight and fast
- 🔧 **Simple configuration**: Minimal setup required

## Usage

### Basic Usage

```js
// rollup.config.js
import dts from 'rollup-plugin-dts';
import dtsMerger from 'rollup-plugin-dts-merger';

export default {
  input: 'src/index.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  plugins: [
    dts(), // Generate .d.ts first
    dtsMerger({
      include: ['src'], // default is 'src'
      exclude: ['**/*.test.d.ts'],
      mergeInto: 'dist/types.d.ts',
      replace: {
        '/*__DEV__*/': 'export',
        __VERSION__: '2.0.0',
      },
    }), // Then merge additional .d.ts files
  ],
};
```

## Options

<a id="user-content-options"></a>

### `include`

- **Type**: `string | string[]`
- **Default**: `['src']`
- **Description**: Glob patterns to include files/directories. All `.d.ts` files in these locations will be merged.

### `exclude`

- **Type**: `string | string[]`
- **Default**: `['node_modules/**/*', 'dist/**/*']`
- **Description**: Glob patterns to exclude files/directories from merging.

### `mergeInto`

- **Type**: `string`
- **Default**: `'dist/index.d.ts'`
- **Description**: Target file path where all `.d.ts` content will be merged into. This file must exist before merging (usually created by `rollup-plugin-dts`).

### `replace`

- **Type**: `Record<string, any>`
- **Default**: `{}`
- **Description**: Key-value pairs for content replacement. Values can be:
  - **String**: Direct replacement
  - **Number/Boolean**: Converted to string
  - **Function**: `(key: string) => string` - Dynamic replacement based on the key
  - **null/undefined**: Converted to literal strings

#### Replace Examples

```js
{
  replace: {
    // String replacement
    '__VERSION__': '2.0.0',

    // Remove development flags
    '/*__DEV__*/': '',

    // Add export keywords
    '/*__EXPORT__*/': 'export',

    // Function-based replacement
    '__TIMESTAMP__': () => Date.now().toString(),

    // Type/value replacements
    'DEBUG_MODE': false,
    'MAX_ITEMS': 100,
    'API_ENDPOINT': null
  }
}
```

## How It Works

1. **Find files**: Scans directories matching `include` patterns for `.d.ts` files
2. **Filter**: Excludes files matching `exclude` patterns
3. **Replace content**: Applies `replace` rules to both target file and source files
4. **Merge**: Appends all source file content to the target file with source path comments

## License

MIT

## Author

- Name: KasukabeTsumugi
- Email: futami16237@gmail.com

---

✨ Enjoy merging your TypeScript declarations! ✨
