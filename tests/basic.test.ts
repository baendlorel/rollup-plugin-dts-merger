import { describe, it, expect } from 'vitest';
import { run } from './runner.js';

describe('Functionality', () => {
  it('should merge .d.ts files', async () => {
    const { content, options } = run('common', '*.d.ts', {
      replace: {
        __FLAG__: 'fulaige',
      },
    });

    expect(content.includes('__FLAG__')).toBe(false);
    expect(content.includes('__FLAG2__')).toBe(true);
    expect(content.split('fulaige').length - 1).toBe(4);
  });
});
