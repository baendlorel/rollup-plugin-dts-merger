import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('Replace Functionality', () => {
  it('should perform basic string replacements', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content with __PLACEHOLDER__\nexport {};\n',
      'src/test.d.ts': 'export interface Test { __PLACEHOLDER__: string; }',
    });

    const result = await testUtils.runPlugin({
      replace: {
        __PLACEHOLDER__: 'replacedValue',
      },
    });

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('replacedValue');
    expect(result.outputContent).not.toContain('__PLACEHOLDER__');
  });

  it('should handle function replacements', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Version: __VERSION__\nexport {};\n',
      'src/test.d.ts': 'export declare const VERSION: "__VERSION__";',
    });

    const result = await testUtils.runPlugin({
      replace: {
        __VERSION__: (key: string) => '2.0.0',
      },
    });

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('2.0.0');
    expect(result.outputContent).not.toContain('__VERSION__');
  });

  it('should handle multiple replacements', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// __APP_NAME__ v__VERSION__\nexport {};\n',
      'src/test.d.ts':
        'export declare const APP: "__APP_NAME__"; export declare const VER: "__VERSION__";',
    });

    const result = await testUtils.runPlugin({
      replace: {
        __APP_NAME__: 'MyApp',
        __VERSION__: '1.0.0',
      },
    });

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('MyApp');
    expect(result.outputContent).toContain('1.0.0');
    expect(result.outputContent).not.toContain('__APP_NAME__');
    expect(result.outputContent).not.toContain('__VERSION__');
  });

  it('should handle replace markers for export conversion', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/test.d.ts': readFileSync(
        join(process.cwd(), 'tests/mock/with-replace-markers.d.ts'),
        'utf8'
      ),
    });

    const result = await testUtils.runPlugin({
      replace: {
        '/*__FLAG__*/': 'export',
        '/*__EXPORT_FLAG__*/': 'readonly',
      },
    });

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('export interface ReplaceableInterface');
    expect(result.outputContent).toContain('export type ReplaceableType');
    expect(result.outputContent).toContain('export declare const REPLACEABLE_CONST');
    expect(result.outputContent).toContain('readonly name: string');
    expect(result.outputContent).not.toContain('/*__FLAG__*/');
    expect(result.outputContent).not.toContain('/*__EXPORT_FLAG__*/');
  });
});
