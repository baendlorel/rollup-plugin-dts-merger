// @ts-check
import { spawn } from 'node:child_process';

export function execute(command, ...args) {
  return new Promise((resolve) => {
    spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    }).on('close', () => {
      console.log(`${command} completed`);
      resolve(null);
    });
  });
}
