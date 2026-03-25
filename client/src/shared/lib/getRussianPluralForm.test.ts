import { describe, expect, it } from 'vitest';

import { getRussianPluralForm } from './getRussianPluralForm';

const forms: [string, string, string] = ['объявление', 'объявления', 'объявлений'];

describe('getRussianPluralForm', () => {
  it('returns singular form for values ending with 1 except 11', () => {
    expect(getRussianPluralForm(1, forms)).toBe('объявление');
    expect(getRussianPluralForm(21, forms)).toBe('объявление');
    expect(getRussianPluralForm(101, forms)).toBe('объявление');
  });

  it('returns few form for values ending with 2-4 except 12-14', () => {
    expect(getRussianPluralForm(2, forms)).toBe('объявления');
    expect(getRussianPluralForm(24, forms)).toBe('объявления');
    expect(getRussianPluralForm(42, forms)).toBe('объявления');
  });

  it('returns many form for 0, 5-20 and exception ranges 11-14', () => {
    expect(getRussianPluralForm(0, forms)).toBe('объявлений');
    expect(getRussianPluralForm(5, forms)).toBe('объявлений');
    expect(getRussianPluralForm(11, forms)).toBe('объявлений');
    expect(getRussianPluralForm(14, forms)).toBe('объявлений');
    expect(getRussianPluralForm(111, forms)).toBe('объявлений');
  });
});