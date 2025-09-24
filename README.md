<h1 align="center">rollup-plugin-dts-merger</h1>

<p align="center">
  <em>🦄 A Rollup plugin for merging and replacing TypeScript declaration files (.d.ts) with flexible options! 🦄</em>
</p>

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Author](#author)

## Changes in 1.3

- Added `replace` option for simple string replacements using `String.prototype.replaceAll`.
- Fixed an issue where an empty `replace` option would replace all characters with `undefined`. Now, if `replace` is empty, no replacements are made.

## Features

- Merge multiple `.d.ts` files into a single file
- Flexible include/exclude options for files and directories
- Integrated replacement system for declaration content (inspired by `@rollup/plugin-replace`)

## Installation

```bash
pnpm add -D rollup-plugin-dts-merger
# or
npm install --save-dev rollup-plugin-dts-merger
```

## Usage

Add the plugin to your `rollup.config.mjs`:

```js
import { dtsMerger } from 'rollup-plugin-dts-merger';

export default {
  plugins: [
    dtsMerger({
      // paths can be string or string[]
      // -> path.join(process.cwd(), 'item')
      // -> path.join(process.cwd(), ...['src', 'exports'])
      include: ['item', ['src', 'exports']],
      exclude: ['src/exclude-this.d.ts'], // also joined with cwd
      mergeInto: ['dist', 'index.d.ts'], // also joined with cwd
      replace: {
        preventAssignment: true,
        values: {
          __TYPE__: 'MyType',
        },
      },
    }),
  ],
};
```

## API Reference

### Plugin Options

| Option      | Type                     | Default                  | Description                                                 |
| ----------- | ------------------------ | ------------------------ | ----------------------------------------------------------- |
| `include`   | `(string \| string[])[]` | `["src"]`                | Relative paths to include. Directories and files supported. |
| `exclude`   | `(string \| string[])[]` | `[]`                     | Relative paths to exclude.                                  |
| `mergeInto` | `string \| string[]`     | `["dist", "index.d.ts"]` | Output file path.                                           |
| `replace`   | `ReplaceOptions`         | See below                | Replacement options.                                        |
| `replace`   | `Record<string, any>`    | `{}`                     | use `string.replaceAll` to replace things                   |

#### ReplaceOptions

| Option              | Type                 | Default                 | Description                                                        |
| ------------------- | -------------------- | ----------------------- | ------------------------------------------------------------------ |
| `delimiters`        | `[string, string]`   | `["\\b", "\\b(?!\\.)"]` | Word boundary for replacement. Use `['', '']` for all occurrences. |
| `preventAssignment` | `boolean`            | `false`                 | Prevents replacing assignments/declarations. Recommended: `true`.  |
| `values`            | `Record<string,Any>` | `{}`                    | Key-value pairs for replacement. Value can be a function.          |

#### Example ReplaceOptions

```js
const replaceOpts = {
  delimiters: ['<@', '@>'],
  preventAssignment: true,
  values: {
    __NAME__: 'MyName',
    // can be a function, DtsMerger will pass 'key' to it
    __TYPE__: (key) => key.toLowerCase(),
  },
};
```

## Examples

### Basic Merge & Replace

```js
import { dtsMerger } from 'rollup-plugin-dts-merger';

dtsMerger({
  include: ['src'],
  mergeInto: ['dist', 'index.d.ts'],
  replace: {
    values: {
      __TYPE__: 'MockType',
    },
  },
});
```

### Prevent Assignment

```js
dtsMerger({
  include: [['tests', 'mock', 'src', 'assignment.d.ts']],
  mergeInto: ['tests', 'mock', 'dist', 'prevented-assignment.d.ts'],
  replace: {
    preventAssignment: true,
    values: {
      __ASSIGN__: 'Assigned',
    },
  },
});
```

#### assignment.d.ts Example

```typescript
// assignment.d.ts
__ASSIGN__ = '__ASSIGN__';
// or
// declare const __ASSIGN__ = '__ASSIGN__';
```

### Custom Delimiters

```js
dtsMerger({
  replace: {
    delimiters: ['<@', '@>'],
    values: {
      __DILIMITER__: 'kasukabe',
    },
  },
});
```

## Author

- Name: KasukabeTsumugi
- Email: futami16237@gmail.com

---

✨ Enjoy merging your TypeScript declarations! ✨
