import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('Functionality', () => {
  it('should merge basic .d.ts files', async () => {
    // Setup test environment
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/types.d.ts': 'export interface TestType { id: number; }',
      'src/constants.d.ts': 'export declare const TEST_CONSTANT: string;',
    });

    // Run plugin
    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toBeDefined();
    expect(result.outputContent).toContain('interface TestType');
    expect(result.outputContent).toContain('TEST_CONSTANT');
    expect(result.outputContent).toContain('// # from: src/types.d.ts');
    expect(result.outputContent).toContain('// # from: src/constants.d.ts');
  });

  it('should handle empty source directory', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toBe('// Initial content\nexport {};\n');
  });

  it('should handle empty .d.ts files', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/empty.d.ts': '',
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('// # from: src/empty.d.ts');
  });
});
