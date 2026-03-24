import { describe, expect, it } from 'vitest';
import type { Ad } from '@/entities/ad/model/types';
import {
  formatDate,
  formatPrice,
  getCategoryLabel,
  getMissingFields,
  getParamEntries,
  isFilledValue,
} from './ad-formatters';

describe('ad-formatters', () => {
  it('getCategoryLabel returns known label and falls back for unknown category', () => {
    expect(getCategoryLabel('auto')).toBe('Авто');
    expect(getCategoryLabel('unknown' as never)).toBe('unknown');
  });

  it('formatDate formats ISO date as DD.MM.YYYY', () => {
    expect(formatDate('2026-01-05T00:00:00.000Z')).toBe('05.01.2026');
  });

  it('formatPrice formats null and numeric values', () => {
    expect(formatPrice(null)).toBe('Цена не указана');
    expect(formatPrice(120000)).toContain('120');
  });

  it('isFilledValue handles nullish and blank string values', () => {
    expect(isFilledValue(null)).toBe(false);
    expect(isFilledValue(undefined)).toBe(false);
    expect(isFilledValue('   ')).toBe(false);
    expect(isFilledValue('text')).toBe(true);
    expect(isFilledValue(0)).toBe(true);
  });

  it('getMissingFields returns description and missing required params', () => {
    const missing = getMissingFields({
      category: 'electronics',
      description: ' ',
      params: {
        type: undefined,
        brand: 'Apple',
        model: undefined,
        condition: 'used',
        color: 'black',
      },
    });

    const paths = missing.map(item => item.path);

    expect(paths).toContain('description');
    expect(paths).toContain('params.type');
    expect(paths).toContain('params.model');
    expect(paths).not.toContain('params.brand');
  });

  it('getParamEntries maps select values and hides missing fields', () => {
    const ad: Ad = {
      id: 2,
      category: 'electronics',
      title: 'Laptop',
      description: 'Good',
      price: 50000,
      createdAt: '2026-03-20T10:00:00.000Z',
      updatedAt: '2026-03-21T10:00:00.000Z',
      needsRevision: false,
      params: {
        type: 'laptop',
        brand: 'Lenovo',
        model: 'ThinkPad',
        condition: 'new',
        color: '',
      },
    };

    const entries = getParamEntries(ad);
    const values = entries.map(item => item.value);

    expect(values).toContain('Ноутбук');
    expect(values).toContain('Новый');
    expect(values).toContain('Lenovo');
    expect(values).not.toContain('Не указано');
    expect(entries.length).toBe(4);
  });
});

