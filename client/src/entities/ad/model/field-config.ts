import type { AdCategory } from './types';

type FieldOption = {
  value: string;
  label: string;
};

export type ParamFieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  requiredForRevision: boolean;
  min?: number;
  options?: FieldOption[];
};

export const paramFieldConfig: Record<AdCategory, ParamFieldConfig[]> = {
  auto: [
    { name: 'brand', label: 'Марка', type: 'text', requiredForRevision: true },
    { name: 'model', label: 'Модель', type: 'text', requiredForRevision: true },
    {
      name: 'yearOfManufacture',
      label: 'Год выпуска',
      type: 'number',
      min: 1900,
      requiredForRevision: true,
    },
    {
      name: 'transmission',
      label: 'Коробка передач',
      type: 'select',
      requiredForRevision: true,
      options: [
        { value: 'automatic', label: 'Автомат' },
        { value: 'manual', label: 'Механика' },
      ],
    },
    {
      name: 'mileage',
      label: 'Пробег, км',
      type: 'number',
      min: 0,
      requiredForRevision: true,
    },
    {
      name: 'enginePower',
      label: 'Мощность, л.с.',
      type: 'number',
      min: 0,
      requiredForRevision: true,
    },
  ],
  real_estate: [
    {
      name: 'type',
      label: 'Тип недвижимости',
      type: 'select',
      requiredForRevision: true,
      options: [
        { value: 'flat', label: 'Квартира' },
        { value: 'house', label: 'Дом' },
        { value: 'room', label: 'Комната' },
      ],
    },
    {
      name: 'address',
      label: 'Адрес',
      type: 'text',
      requiredForRevision: true,
    },
    {
      name: 'area',
      label: 'Площадь, м²',
      type: 'number',
      min: 0,
      requiredForRevision: true,
    },
    {
      name: 'floor',
      label: 'Этаж',
      type: 'number',
      min: 1,
      requiredForRevision: true,
    },
  ],
  electronics: [
    {
      name: 'type',
      label: 'Тип устройства',
      type: 'select',
      requiredForRevision: true,
      options: [
        { value: 'phone', label: 'Телефон' },
        { value: 'laptop', label: 'Ноутбук' },
        { value: 'misc', label: 'Другое' },
      ],
    },
    { name: 'brand', label: 'Бренд', type: 'text', requiredForRevision: true },
    { name: 'model', label: 'Модель', type: 'text', requiredForRevision: true },
    {
      name: 'condition',
      label: 'Состояние',
      type: 'select',
      requiredForRevision: true,
      options: [
        { value: 'new', label: 'Новый' },
        { value: 'used', label: 'Б/у' },
      ],
    },
    { name: 'color', label: 'Цвет', type: 'text', requiredForRevision: true },
  ],
};
