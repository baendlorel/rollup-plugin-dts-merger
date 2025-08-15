import { describe, it, expect } from 'vitest';
import dtsMerger from '../src/index';

describe('dts-merger plugin', () => {
  it('should create a plugin instance with default options', () => {
    const plugin = dtsMerger();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('dts-merger');
    expect(typeof plugin.buildStart).toBe('function');
    expect(typeof plugin.generateBundle).toBe('function');
    expect(typeof plugin.writeBundle).toBe('function');
  });

  it('should accept custom options', () => {
    const options = {
      inputDir: 'custom/src',
      outputFile: 'custom/output.d.ts',
      includePrivate: true,
      header: '// Custom header',
    };

    const plugin = dtsMerger(options);

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('dts-merger');
  });

  it('should have the correct plugin name', () => {
    const plugin = dtsMerger();
    expect(plugin.name).toBe('dts-merger');
  });
});
