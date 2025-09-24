import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('Edge Cases', () => {
  it('should handle files with only whitespace', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/whitespace.d.ts': readFileSync(
        join(process.cwd(), 'tests/mock/whitespace-only.d.ts'),
        'utf8'
      ),
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('// # from: src/whitespace.d.ts');
  });

  it('should handle files with unicode characters', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/unicode.d.ts': readFileSync(join(process.cwd(), 'tests/mock/unicode.d.ts'), 'utf8'),
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('中文测试');
    expect(result.outputContent).toContain('🚀🔥💯');
    expect(result.outputContent).toContain('特殊字符常量');
  });

  it('should handle deeply nested structures', async () => {
    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/nested.d.ts': readFileSync(join(process.cwd(), 'tests/mock/nested.d.ts'), 'utf8'),
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('NestedLevel1');
    expect(result.outputContent).toContain('namespace Nested');
    expect(result.outputContent).toContain('DeepInterface');
  });

  it('should handle large files', async () => {
    // Generate a large .d.ts file content
    let largeContent = '// Large file with many interfaces\n';
    for (let i = 0; i < 1000; i++) {
      largeContent += `export interface Interface${i} { prop${i}: string; }\n`;
    }

    testUtils.createTestEnvironment({
      'dist/index.d.ts': '// Initial content\nexport {};\n',
      'src/large.d.ts': largeContent,
    });

    const result = await testUtils.runPlugin();

    expect(result.success).toBe(true);
    expect(result.outputContent).toContain('Interface0');
    expect(result.outputContent).toContain('Interface999');
    expect(result.outputContent!.split('\n').length).toBeGreaterThan(1000);
  });
});
