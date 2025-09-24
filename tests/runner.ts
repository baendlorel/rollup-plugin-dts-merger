import { join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import type { Plugin } from 'rollup';
import { dtsMerger } from '../src/dts-merger.js';
import type { RollupDtsMergerOptions } from '../src/global.js';

/**
 * Test utility class for testing rollup-plugin-dts-merger
 */
export class DtsMergerTestUtils {
  private readonly testDir = join(process.cwd(), 'tests');
  private outputDir: string;

  constructor(testName: string) {
    this.outputDir = join(this.testDir, 'output', testName);
  }

  /**
   * Create a test environment with specified files
   */
  createTestEnvironment(files: Record<string, string>): void {
    // Clean and create output directory
    if (existsSync(this.outputDir)) {
      rmSync(this.outputDir, { recursive: true, force: true });
    }
    mkdirSync(this.outputDir, { recursive: true });

    // Create test files
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = join(this.outputDir, filePath);
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(fullPath, content, 'utf8');
    });
  }

  /**
   * Run the plugin with options and return the result
   */
  async runPlugin(options?: RollupDtsMergerOptions): Promise<{
    success: boolean;
    error?: Error;
    outputContent?: string;
  }> {
    try {
      // Change to test directory
      const originalCwd = process.cwd();
      process.chdir(this.outputDir);

      try {
        const plugin = dtsMerger(options);

        // Execute the plugin's writeBundle hook
        if (plugin.writeBundle && typeof plugin.writeBundle === 'function') {
          await plugin.writeBundle.call({} as any, {} as any, {} as any);
        }

        // Read the output file if it exists
        const mergeInto = options?.mergeInto || 'dist/index.d.ts';
        const outputPath = join(this.outputDir, mergeInto);
        const outputContent = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : undefined;

        return {
          success: true,
          outputContent,
        };
      } finally {
        process.chdir(originalCwd);
      }
    } catch (error) {
      // Make sure we restore the working directory even if there's an error
      const currentCwd = process.cwd();
      const originalCwd = join(this.testDir, '..');
      if (currentCwd !== originalCwd) {
        try {
          process.chdir(originalCwd);
        } catch (e) {
          // Ignore chdir errors in cleanup
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Get the content of a file in the test environment
   */
  readTestFile(relativePath: string): string {
    const fullPath = join(this.outputDir, relativePath);
    return readFileSync(fullPath, 'utf8');
  }

  /**
   * Check if a file exists in the test environment
   */
  testFileExists(relativePath: string): boolean {
    const fullPath = join(this.outputDir, relativePath);
    return existsSync(fullPath);
  }

  /**
   * Clean up test environment
   */
  cleanup(): void {
    if (existsSync(this.outputDir)) {
      rmSync(this.outputDir, { recursive: true, force: true });
    }
  }
}
