
// # from: tests/mocks/common.d.ts
// File with replace markers for testing replacement functionality
/*fulaige*/ interface ReplaceableInterface {
  id: number;
  /*__EXPORT_FLAG__*/ name: string;
}

/*fulaige*/ type ReplaceableType = 'test' | 'prod';

/*fulaige*/ declare const REPLACEABLE_CONST: string;

// Some content that should not be replaced
export interface NormalInterface {
  value: boolean;
}

// # from: tests/mocks/variables.d.ts
type fulaige = 'test' | '__FLAG2__';

// Some content that should not be replaced
export interface NormalInterface {
  value: boolean;
}
