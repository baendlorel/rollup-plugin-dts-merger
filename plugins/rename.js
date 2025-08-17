// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Because Node.js finds the package from current project first,
 * we need to rename the package temporarily to make it search node_modules
 */
function rename() {
  const NAME1 = '"name": "rollup-plugin-dts-merger"';
  const NAME2 = '"name": "temporary-plugin-name"';
  const packageJsonPath = join(process.cwd(), 'package.json');
  const content = readFileSync(packageJsonPath, 'utf-8');
  if (content.includes(NAME1)) {
    const updatedContent = content.replace(NAME1, NAME2);
    writeFileSync(packageJsonPath, updatedContent, 'utf-8');
  }
  if (content.includes(NAME2)) {
    const updatedContent = content.replace(NAME2, NAME1);
    writeFileSync(packageJsonPath, updatedContent, 'utf-8');
  }
}
rename();
