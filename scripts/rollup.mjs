// @ts-check
import { statSync } from 'node:fs';
import renamer from '../plugins/renamer.mjs';
import rollupConfig from '../rollup.config.mjs';
import { execute } from './execute.mjs';
import { join } from 'node:path';

const toArr = (o) => (Array.isArray(o) ? o : typeof o === 'object' && o !== null ? [] : [o]);

function getOutputFiles() {
  const output = [];
  toArr(rollupConfig).forEach((c) => output.push(...toArr(c.output)));
  return output.map((o) => o.file);
}

function printSize(files) {
  const mapper =
    (maxLen) =>
    ({ file, size }) =>
      `${file.padEnd(maxLen, ' ')} - ${(size / 1024).toFixed(3)} KB`;
  let maxLen = 0;
  let total = 0;
  const info = [];
  files.forEach((file) => {
    try {
      const size = statSync(file).size;
      maxLen = Math.max(maxLen, file.length);
      total += size;
      info.push({ file, size });
    } catch (e) {
      this.warn(`${file}: Not found or no permission to read`);
    }
  });

  info.sort((a, b) => a.size - b.size);
  info.push({ file: 'Total', size: total });
  console.log(info.map(mapper(maxLen)).join('\n'));
}

async function run() {
  renamer.changeName();
  await execute('rimraf', 'dist');
  await execute('rollup', '-c');
  renamer.changeName();
  const files = getOutputFiles();
  printSize(files);
}

run();
