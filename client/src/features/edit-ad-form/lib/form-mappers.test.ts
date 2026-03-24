import { describe, expect, it } from 'vitest';
import type { Ad, EditAdFormValues } from '@/entities/ad/model/types';
import { mapAdToFormValues, mapFormValuesToUpdatePayload } from './form-mappers';

const sourceAd: Ad = {
  id: 1,
  category: 'electronics',
  title: '  iPhone 15  ',
  description: '  Отличное состояние  ',
  price: 90000,
  createdAt: '2026-03-20T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
  needsRevision: false,
  params: {
    type: 'phone',
    brand: 'Apple',
    model: '15',
    condition: 'used',
    color: 'black',
  },
};

describe('form-mappers', () => {
  it('mapAdToFormValues maps ad fields and clones params', () => {
    const result = mapAdToFormValues(sourceAd);

    expect(result).toEqual({
      category: 'electronics',
      title: '  iPhone 15  ',
      description: '  Отличное состояние  ',
      price: 90000,
      params: {
        type: 'phone',
        brand: 'Apple',
        model: '15',
        condition: 'used',
        color: 'black',
      },
    });
    expect(result.params).not.toBe(sourceAd.params);
  });

  it('mapFormValuesToUpdatePayload trims title/description and removes empty params', () => {
    const values: EditAdFormValues = {
      category: 'real_estate',
      title: '  Студия у метро  ',
      description: '  С ремонтом  ',
      price: 5500000,
      params: {
        type: 'flat',
        address: '  Москва, ул. Пушкина  ',
        area: 34,
        floor: 8,
        skipUndefined: undefined,
        skipEmpty: '',
        skipSpaces: '   ',
      },
    };

    const result = mapFormValuesToUpdatePayload(values);

    expect(result).toEqual({
      category: 'real_estate',
      title: 'Студия у метро',
      description: 'С ремонтом',
      price: 5500000,
      params: {
        type: 'flat',
        address: 'Москва, ул. Пушкина',
        area: 34,
        floor: 8,
        skipSpaces: '',
      },
    });
  });

  it('mapFormValuesToUpdatePayload sets description to undefined when blank', () => {
    const values: EditAdFormValues = {
      category: 'auto',
      title: ' BMW X5 ',
      description: '   ',
      price: 3000000,
      params: {
        brand: ' BMW ',
        model: ' X5 ',
      },
    };

    const result = mapFormValuesToUpdatePayload(values);

    expect(result).toEqual({
      category: 'auto',
      title: 'BMW X5',
      description: undefined,
      price: 3000000,
      params: {
        brand: 'BMW',
        model: 'X5',
      },
    });
  });
});
