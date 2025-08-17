// @ts-check
import { spawn } from 'node:child_process';

export function execute(args, opts = {}) {
  return new Promise((resolve) => {
    spawn(args[0], args.slice(1), {
      ...opts,
      stdio: 'inherit',
      shell: true,
    }).on('close', () => {
      console.log(`${args[0]} completed`);
      resolve(null);
    });
  });
}
