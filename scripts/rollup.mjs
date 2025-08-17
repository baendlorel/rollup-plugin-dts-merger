import { spawn } from 'node:child_process';
import renamer from '../plugins/renamer.mjs';

function runRollup() {
  let resolve;
  const promise = new Promise((res) => (resolve = res));

  spawn('rimraf', ['dist'], {
    stdio: 'inherit',
    shell: true,
  }).on('close', () => {
    console.log('rimraf completed');

    spawn('rollup', ['-c'], {
      stdio: 'inherit',
      shell: true,
    }).on('close', () => {
      console.log('rollup completed');
      resolve();
    });
  });

  return promise;
}

async function run() {
  renamer.changeName();
  await runRollup();
  renamer.changeName();
}
run();
