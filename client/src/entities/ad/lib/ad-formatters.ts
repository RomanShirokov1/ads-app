import dayjs from 'dayjs';
import type { Ad, AdCategory, MissingField } from '@/entities/ad/model/types';
import {
  categoryOptions,
  conditionLabels,
  electronicsTypeLabels,
  realEstateTypeLabels,
  transmissionLabels,
} from '@/entities/ad/model/constants';
import { paramFieldConfig } from '@/entities/ad/model/field-config';

export const getCategoryLabel = (category: AdCategory) =>
  categoryOptions.find(option => option.value === category)?.label ?? category;

export const formatPrice = (price: number | null) =>
  price === null
    ? 'Цена не указана'
    : new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(price);

export const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY');

export const isFilledValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

export const getMissingFields = (ad: Pick<Ad, 'category' | 'description' | 'params'>): MissingField[] => {
  const missing: MissingField[] = [];

  if (!isFilledValue(ad.description)) {
    missing.push({ path: 'description', label: 'Описание' });
  }

  for (const field of paramFieldConfig[ad.category]) {
    const fieldValue = ad.params[field.name as keyof typeof ad.params];

    if (!isFilledValue(fieldValue)) {
      missing.push({
        path: `params.${field.name}`,
        label: field.label,
      });
    }
  }

  return missing;
};

export const getParamEntries = (ad: Ad) =>
  paramFieldConfig[ad.category].map(field => {
    const rawValue = ad.params[field.name as keyof typeof ad.params];
    let formattedValue = 'Не указано';

    if (isFilledValue(rawValue)) {
      if (field.name === 'transmission' && typeof rawValue === 'string') {
        formattedValue = transmissionLabels[rawValue as 'automatic' | 'manual'];
      } else if (field.name === 'type' && ad.category === 'real_estate') {
        formattedValue = realEstateTypeLabels[rawValue as 'flat' | 'house' | 'room'];
      } else if (field.name === 'type' && ad.category === 'electronics') {
        formattedValue =
          electronicsTypeLabels[rawValue as 'phone' | 'laptop' | 'misc'];
      } else if (field.name === 'condition' && typeof rawValue === 'string') {
        formattedValue = conditionLabels[rawValue as 'new' | 'used'];
      } else {
        formattedValue = String(rawValue);
      }
    }

    return {
      label: field.label,
      value: formattedValue,
      missing: !isFilledValue(rawValue),
    };
    })
    .filter(entry => !entry.missing);

