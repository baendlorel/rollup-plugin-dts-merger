In the following code:

```ts
const lookbehind = preventAssignment ? '(?<!\\b(?:const|let|var)\\s*)' : '';
const lookahead = preventAssignment ? '(?!\\s*=[^=])' : '';
const pattern = new RegExp(
  `${lookbehind}${delimiters[0]}(${keys.join('|')})${delimiters[1]}${lookahead}`,
  'g'
);
```

1. When `preventAssignment` is true, `@rollup/plugin-replace` prepends `(?<!\\b(?:const|let|var)\\s*)` to the pattern. However, this only blocks cases like `const a = 3`, while assignments such as `const a=3,b=2` still slip through.
2. Also, the so-called `lookbehind` here seems more like it’s functioning as a lookahead—am I misunderstanding something?
