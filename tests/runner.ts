import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { Plugin } from 'rollup';
import { dtsMerger } from '@/dts-merger.js';
import { RollupDtsMergerOptions } from '@/global.js';

/**
 * @param output output file name
 * @param dts relative to tests/mocks
 * @param options RollupDtsMergerOptions
 * @returns parsed file content and opts
 */
export function run(output: string, dts: string, options: RollupDtsMergerOptions) {
  options.include = join(process.cwd(), 'tests', 'mocks', dts);
  options.mergeInto = join(process.cwd(), 'tests', 'output', output);
  const plugin = dtsMerger(options);

  if (typeof plugin.writeBundle !== 'function') {
    throw new Error('Impossible for this.plugin.writeBundle not being a function');
  }
  Reflect.apply(plugin.writeBundle, null, []);
  const opts = Reflect.get(plugin, '__KSKB_TMG_OPTS__') as __STRICT_OPTS__;
  const content = readFileSync(opts.mergeInto, 'utf-8');

  return { content, options: opts };
}
