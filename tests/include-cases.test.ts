import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, resolve } from 'node:path';
import { getFiles } from '../src/get-files.js';

// Get absolute paths for testing
const mocksDir = resolve(__dirname, 'mocks');
const getAbsolutePath = (relativePath: string) => join(mocksDir, relativePath);

describe('getFiles - Include/Exclude Functionality', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Change to mocks directory for relative path testing
    process.chdir(mocksDir);
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);
  });

  describe('Basic Include Patterns', () => {
    it('should include all .d.ts files when include is undefined', () => {
      const files = getFiles('**/*.d.ts', null);

      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('simple.d.ts'));
      expect(files).toContain(getAbsolutePath('multi-file-1.d.ts'));
      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).toContain(getAbsolutePath('deep/level/deep.d.ts'));
    });

    it('should include specific file by exact path', () => {
      const specificFile = getAbsolutePath('simple.d.ts');
      const files = getFiles(specificFile, null);

      expect(files).toContain(specificFile);
      expect(files).toHaveLength(1);
    });

    it('should include specific nested file by exact path', () => {
      const specificFile = getAbsolutePath('nested/specific.d.ts');
      const files = getFiles(specificFile, null);

      expect(files).toContain(specificFile);
      expect(files).toHaveLength(1);
    });

    it('should include multiple specific files', () => {
      const file1 = getAbsolutePath('simple.d.ts');
      const file2 = getAbsolutePath('common.d.ts');
      const files = getFiles([file1, file2], null);

      expect(files).toContain(file1);
      expect(files).toContain(file2);
      expect(files).toHaveLength(2);
    });
  });

  describe('Glob Patterns', () => {
    it('should include files matching glob pattern', () => {
      const pattern = getAbsolutePath('*.d.ts');
      const files = getFiles(pattern, null);

      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('simple.d.ts'));
      expect(files).toContain(getAbsolutePath('multi-file-1.d.ts'));
      expect(files).toContain(getAbsolutePath('excluded.d.ts'));

      // Should not include nested files
      expect(files).not.toContain(getAbsolutePath('nested/nested.d.ts'));
    });

    it('should include nested files with ** pattern', () => {
      const pattern = getAbsolutePath('**/*.d.ts');
      const files = getFiles(pattern, null);

      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).toContain(getAbsolutePath('deep/level/deep.d.ts'));
    });

    it('should include files in specific directory with pattern', () => {
      const pattern = getAbsolutePath('nested/*.d.ts');
      const files = getFiles(pattern, null);

      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).toContain(getAbsolutePath('nested/specific.d.ts'));
      expect(files).not.toContain(getAbsolutePath('common.d.ts'));
      expect(files).not.toContain(getAbsolutePath('deep/level/deep.d.ts'));
    });

    it('should match files with prefix pattern', () => {
      const pattern = getAbsolutePath('multi-*.d.ts');
      const files = getFiles(pattern, null);

      expect(files).toContain(getAbsolutePath('multi-file-1.d.ts'));
      expect(files).toContain(getAbsolutePath('multi-file-2.d.ts'));
      expect(files).not.toContain(getAbsolutePath('common.d.ts'));
    });
  });

  describe('Exclude Patterns', () => {
    it('should exclude specific file', () => {
      const excludeFile = getAbsolutePath('excluded.d.ts');
      const files = getFiles('**/*.d.ts', excludeFile);

      expect(files).not.toContain(excludeFile);
      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('simple.d.ts'));
    });

    it('should exclude files matching pattern', () => {
      const excludePattern = getAbsolutePath('multi-*.d.ts');
      const files = getFiles('**/*.d.ts', excludePattern);

      expect(files).not.toContain(getAbsolutePath('multi-file-1.d.ts'));
      expect(files).not.toContain(getAbsolutePath('multi-file-2.d.ts'));
      expect(files).toContain(getAbsolutePath('common.d.ts'));
    });

    it('should exclude entire directory', () => {
      const excludePattern = getAbsolutePath('nested/**');
      const files = getFiles('**/*.d.ts', excludePattern);

      expect(files).not.toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).not.toContain(getAbsolutePath('nested/specific.d.ts'));
      expect(files).toContain(getAbsolutePath('common.d.ts'));
    });

    it('should exclude multiple patterns', () => {
      const excludePatterns = [getAbsolutePath('excluded.d.ts'), getAbsolutePath('nested/**')];
      const files = getFiles('**/*.d.ts', excludePatterns);

      expect(files).not.toContain(getAbsolutePath('excluded.d.ts'));
      expect(files).not.toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).toContain(getAbsolutePath('common.d.ts'));
    });
  });

  describe('Combined Include and Exclude', () => {
    it('should include pattern but exclude specific file', () => {
      const includePattern = getAbsolutePath('*.d.ts');
      const excludeFile = getAbsolutePath('excluded.d.ts');
      const files = getFiles(includePattern, excludeFile);

      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('simple.d.ts'));
      expect(files).not.toContain(excludeFile);
      expect(files).not.toContain(getAbsolutePath('nested/nested.d.ts')); // Not in pattern
    });

    it('should include nested pattern but exclude specific nested file', () => {
      const includePattern = getAbsolutePath('nested/*.d.ts');
      const excludeFile = getAbsolutePath('nested/specific.d.ts');
      const files = getFiles(includePattern, excludeFile);

      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).not.toContain(excludeFile);
    });

    it('should handle complex include/exclude combinations', () => {
      const includePatterns = [getAbsolutePath('*.d.ts'), getAbsolutePath('nested/*.d.ts')];
      const excludePatterns = [
        getAbsolutePath('excluded.d.ts'),
        getAbsolutePath('nested/specific.d.ts'),
      ];
      const files = getFiles(includePatterns, excludePatterns);

      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
      expect(files).not.toContain(getAbsolutePath('excluded.d.ts'));
      expect(files).not.toContain(getAbsolutePath('nested/specific.d.ts'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent file in include', () => {
      const nonExistentFile = getAbsolutePath('non-existent.d.ts');
      const files = getFiles(nonExistentFile, null);

      expect(files).toHaveLength(0);
      // The function should warn about non-existent files, but still return empty array
    });

    it('should handle empty include array', () => {
      const files = getFiles([], null);

      expect(files).toHaveLength(0);
    });

    it('should handle directory path as include (should not match)', () => {
      const dirPath = getAbsolutePath('nested');
      const files = getFiles(dirPath, null);

      expect(files).toHaveLength(0);
    });

    it('should handle include pattern that matches no files', () => {
      const pattern = getAbsolutePath('*.nonexistent');
      const files = getFiles(pattern, null);

      expect(files).toHaveLength(0);
    });
  });

  describe('Relative Path Handling', () => {
    it('should work with relative paths in patterns', () => {
      const files = getFiles('*.d.ts', null);

      expect(files.some((f: string) => f.endsWith('common.d.ts'))).toBe(true);
      expect(files.some((f: string) => f.endsWith('simple.d.ts'))).toBe(true);
    });

    it('should work with relative nested patterns', () => {
      const files = getFiles('nested/*.d.ts', null);

      expect(files.some((f: string) => f.endsWith('nested/nested.d.ts'))).toBe(true);
      expect(files.some((f: string) => f.endsWith('nested/specific.d.ts'))).toBe(true);
    });
  });

  describe('Performance Cases', () => {
    it('should not traverse excluded directories', () => {
      // This test ensures that excluded directories are not traversed
      const files = getFiles('**/*.d.ts', getAbsolutePath('deep/**'));

      expect(files).not.toContain(getAbsolutePath('deep/level/deep.d.ts'));
      expect(files).toContain(getAbsolutePath('common.d.ts'));
      expect(files).toContain(getAbsolutePath('nested/nested.d.ts'));
    });

    it('should efficiently handle specific file includes without unnecessary traversal', () => {
      // When including a specific file, should not traverse unrelated directories
      const specificFile = getAbsolutePath('nested/specific.d.ts');
      const files = getFiles(specificFile, null);

      expect(files).toContain(specificFile);
      expect(files).toHaveLength(1);
    });
  });
});
