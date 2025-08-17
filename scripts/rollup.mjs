import { spawn } from 'node:child_process';
import renamer from '../plugins/renamer.mjs';
renamer.changeName();

function runRollup() {
  let resolve;
  const promise = new Promise((res) => (resolve = res));

  spawn('pnpm', ['rebuild'], {
    stdio: 'inherit',
    shell: true,
  }).on('close', resolve);

  return promise;
}

async function run() {
  renamer.changeName();
  await runRollup();
  renamer.changeName();
}
run();
