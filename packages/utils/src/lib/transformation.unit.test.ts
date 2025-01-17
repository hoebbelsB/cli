import { describe, expect, it } from 'vitest';
import {
  countOccurrences,
  deepClone,
  distinct,
  factorOf,
  objectToEntries,
  objectToKeys,
  toArray,
} from './transformation';

describe('toArray', () => {
  it('should transform non-array value into array with single value', () => {
    expect(toArray('src/**/*.ts')).toEqual(['src/**/*.ts']);
  });

  it('should leave array value unchanged', () => {
    expect(toArray(['*.ts', '*.js'])).toEqual(['*.ts', '*.js']);
  });
});

describe('objectToKeys', () => {
  it('should transform object into array of keys', () => {
    const keys: 'prop1'[] = objectToKeys({ prop1: 1 });
    expect(keys).toEqual(['prop1']);
  });

  it('should transform empty object into empty array', () => {
    const keys: never[] = objectToKeys({});
    expect(keys).toEqual([]);
  });
});

describe('objectToEntries', () => {
  it('should transform object into array of entries', () => {
    const keys: ['prop1', number][] = objectToEntries({ prop1: 1 });
    expect(keys).toEqual([['prop1', 1]]);
  });

  it('should transform empty object into empty array', () => {
    const keys: [never, never][] = objectToEntries({});
    expect(keys).toEqual([]);
  });
});

describe('countOccurrences', () => {
  it('should return record with counts for each item', () => {
    expect(
      countOccurrences(['error', 'warning', 'error', 'error', 'warning']),
    ).toEqual({ error: 3, warning: 2 });
  });

  it('should return empty record for no matches', () => {
    expect(countOccurrences([])).toEqual({});
  });
});

describe('distinct', () => {
  it('should remove duplicate strings from array', () => {
    expect(
      distinct([
        'no-unused-vars',
        'no-invalid-regexp',
        'no-unused-vars',
        'no-invalid-regexp',
        '@typescript-eslint/no-unused-vars',
      ]),
    ).toEqual([
      'no-unused-vars',
      'no-invalid-regexp',
      '@typescript-eslint/no-unused-vars',
    ]);
  });
});

describe('deepClone', () => {
  it('should clone the object with nested array with objects, with null and undefined properties', () => {
    const obj = {
      a: 1,
      b: 2,
      c: [
        { d: 3, e: 4 },
        { f: 5, g: 6 },
      ],
      d: null,
      e: undefined,
    };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.c).toEqual(obj.c);
    expect(cloned.c).not.toBe(obj.c);
    expect(cloned.c[0]).toEqual(obj.c[0]);
    expect(cloned.c[0]).not.toBe(obj.c[0]);
    expect(cloned.c[1]).toEqual(obj.c[1]);
    expect(cloned.c[1]).not.toBe(obj.c[1]);
    expect(cloned.d).toBe(obj.d);
    expect(cloned.e).toBe(obj.e);
  });
});

describe('factorOf', () => {
  it.each([
    [[], 1],
    [[0, 0], 0],
    [[0, 1], 0.5],
    [[1, 1], 1],
  ])('should return correct factor items', (items, factor) => {
    expect(factorOf(items, i => i < 1)).toEqual(factor);
  });
});
