import { describe, expect, it } from 'vitest';
import { getNestedValue } from './nested-value';

interface ExampleRow {
  readonly name: string;
  readonly company: {
    readonly name: string;
  } | null;
}

describe('getNestedValue', () => {
  it('reads a direct property', () => {
    const row: ExampleRow = { name: 'Ada', company: { name: 'Analytical Engines' } };

    expect(getNestedValue(row, 'name')).toBe('Ada');
  });

  it('reads a nested property', () => {
    const row: ExampleRow = { name: 'Ada', company: { name: 'Analytical Engines' } };

    expect(getNestedValue(row, 'company.name')).toBe('Analytical Engines');
  });

  it('returns undefined when an intermediate property is null', () => {
    const row: ExampleRow = { name: 'Ada', company: null };

    expect(getNestedValue(row, 'company.name')).toBeUndefined();
  });
});
