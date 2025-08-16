export function expect(o: unknown, msg: string): asserts o {
  if (!o) {
    throw new Error('__NAME__: ' + msg);
  }
}
