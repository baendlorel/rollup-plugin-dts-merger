export const isArray = Array.isArray;
export const { defineProperty, entries, keys } = Object;
export const isObject = (v: unknown): v is object => v !== null && typeof v === 'object';
