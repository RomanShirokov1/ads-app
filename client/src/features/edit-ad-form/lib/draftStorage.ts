import type { EditAdFormValues } from '@/entities/ad/model/types';

const getDraftKey = (adId: number) => `ad-edit-draft:${adId}`;

export const draftStorage = {
  get(adId: number) {
    const rawValue = window.localStorage.getItem(getDraftKey(adId));

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as EditAdFormValues;
    } catch {
      window.localStorage.removeItem(getDraftKey(adId));
      return null;
    }
  },
  set(adId: number, value: EditAdFormValues) {
    window.localStorage.setItem(getDraftKey(adId), JSON.stringify(value));
  },
  clear(adId: number) {
    window.localStorage.removeItem(getDraftKey(adId));
  },
};
