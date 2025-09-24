// @ts-check
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execute } from './execute.mjs';

const toArr = (/** @type {any} */ o) =>
  Array.isArray(o) ? o : typeof o === 'object' && o !== null ? [] : [o];

/**
 * @param {import("rollup").RollupOptions[]} rollupConfig
 */
function getOutputFiles(rollupConfig) {
  /**
   * @type {any[]}
   */
  const output = [];
  toArr(rollupConfig).forEach((c) => output.push(...toArr(c.output)));
  return output.map((o) => o.file);
}

/**
 * @param {any[]} files
 */
function printSize(files) {
  const mapper =
    (/** @type {number} */ maxLen) =>
    (/** @type {{file: string,size: number}} */ { file, size }) =>
      `${file.padEnd(maxLen, ' ')} - ${(size / 1024).toFixed(3)} KB`;
  let maxLen = 0;
  let total = 0;
  /**
   * @type {{ file: any; size: any; }[]}
   */
  const info = [];
  files.forEach((/** @type {string} */ file) => {
    try {
      const size = statSync(file).size;
      maxLen = Math.max(maxLen, file.length);
      total += size;
      info.push({ file, size });
    } catch (e) {
      console.warn(`${file}: Not found or no permission to read`);
    }
  });

  info.sort((a, b) => a.size - b.size);
  info.push({ file: 'Total', size: total });
  console.log(info.map(mapper(maxLen)).join('\n'));
}

/**
 * Because Node.js finds the package from current project first,
 * we need to rename the package temporarily to make it search node_modules
 */
class Renamer {
  origin = '';
  packageJson;

  /**
   * @param {import("fs").PathOrFileDescriptor} packageJsonPath
   */
  constructor(packageJsonPath) {
    this.packageJsonPath = packageJsonPath;
    this.origin = readFileSync(packageJsonPath, 'utf-8');
    this.packageJson = JSON.parse(this.origin);
  }

  get realName() {
    return JSON.parse(this.origin).name;
  }

  read() {
    return readFileSync(this.packageJsonPath, 'utf-8');
  }

  /**
   * @param {string | NodeJS.ArrayBufferView<ArrayBufferLike>} content
   */
  write(content) {
    return writeFileSync(this.packageJsonPath, content, 'utf-8');
  }

  useTempName() {
    this.origin = this.read();
    const j = JSON.parse(this.origin);
    j.name = 'kasukabe-tsumugi-temporary-name';
    this.write(JSON.stringify(j));
  }

  restoreRealName() {
    this.write(this.origin);
  }
}

async function run() {
  const renamer = new Renamer(join(import.meta.dirname, '..', 'package.json'));

  process.env.KSKB_TSUMUGI_REAL_NAME = renamer.realName;

  renamer.useTempName();

  await execute(['rimraf', 'dist']);

  const { name, version, projectType } = renamer.packageJson;
  console.log(`Building`, `[${projectType}]`, name, version);

  // ! Must read configs here, or nodejs will not
  // ! be able to find the installed package of this project
  const rollupConfig = (await import('../rollup.config.mjs')).default;

  await execute(['rollup', '-c'], { env: { ...process.env } });

  renamer.restoreRealName();
  const files = getOutputFiles(rollupConfig);
  printSize(files);
}

run();
