import type { AdCategory } from './types';

export const AD_PAGE_SIZE = 10;

export const categoryOptions: Array<{ value: AdCategory; label: string }> = [
  { value: 'auto', label: 'Авто' },
  { value: 'real_estate', label: 'Недвижимость' },
  { value: 'electronics', label: 'Электроника' },
];

export const sortOptions = [
  { value: 'createdAt:desc', label: 'По новизне (сначала новые)' },
  { value: 'createdAt:asc', label: 'По новизне (сначала старые)' },
  { value: 'title:asc', label: 'По названию (А-Я)' },
  { value: 'title:desc', label: 'По названию (Я-А)' },
] as const;

export const transmissionLabels: Record<'automatic' | 'manual', string> = {
  automatic: 'Автомат',
  manual: 'Механика',
};

export const realEstateTypeLabels: Record<'flat' | 'house' | 'room', string> = {
  flat: 'Квартира',
  house: 'Дом',
  room: 'Комната',
};

export const electronicsTypeLabels: Record<'phone' | 'laptop' | 'misc', string> = {
  phone: 'Телефон',
  laptop: 'Ноутбук',
  misc: 'Другое',
};

export const conditionLabels: Record<'new' | 'used', string> = {
  new: 'Новый',
  used: 'Б/у',
};
