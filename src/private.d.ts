import { FilterPattern } from '@rollup/pluginutils';

declare global {
  interface __STRICT_OPTS__ {
    include: FilterPattern;
    exclude: FilterPattern;
    mergeInto: string;
    replaceLiteral: string[];
  }
}
