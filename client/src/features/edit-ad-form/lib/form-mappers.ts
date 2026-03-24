import type {
  Ad,
  EditAdFormValues,
  UpdateAdPayload,
} from '@/entities/ad/model/types';

export const mapAdToFormValues = (ad: Ad): EditAdFormValues => ({
  category: ad.category,
  title: ad.title,
  description: ad.description ?? '',
  price: ad.price,
  params: { ...ad.params },
});

export const mapFormValuesToUpdatePayload = (
  values: EditAdFormValues,
): UpdateAdPayload => {
  const payloadBase = {
    category: values.category,
    title: values.title.trim(),
    description: values.description?.trim() || undefined,
    price: Number(values.price),
  };

  const params = Object.entries(values.params).reduce<
    Record<string, string | number>
  >((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return acc;
    }

    acc[key] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {});

  if (values.category === 'auto') {
    return { ...payloadBase, category: 'auto', params };
  }

  if (values.category === 'real_estate') {
    return { ...payloadBase, category: 'real_estate', params };
  }

  return { ...payloadBase, category: 'electronics', params };
};
