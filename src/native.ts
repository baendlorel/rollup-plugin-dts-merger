// native
export const isArray = Array.isArray;
export const { defineProperty, entries, keys } = Object;

// utils
export const isObject = (v: unknown): v is object => v !== null && typeof v === 'object';
export const isString = (v: unknown): v is string => typeof v === 'string';
export const mustBe = (name: string, what: string) => `${name} must be ${what}`;
