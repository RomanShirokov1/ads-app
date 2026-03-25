import type { EditAdFormValues } from '@/entities/ad/model/types';

const getDraftKey = (adId: number) => `ad-edit-draft:${adId}`;

export const draftStorage = {
  get(adId: number) {
    try {
      const rawValue = window.localStorage.getItem(getDraftKey(adId));

      if (!rawValue) {
        return null;
      }

      return JSON.parse(rawValue) as EditAdFormValues;
    } catch {
      try {
        window.localStorage.removeItem(getDraftKey(adId));
      } catch {
        // ignore storage cleanup errors
      }

      return null;
    }
  },

  set(adId: number, value: EditAdFormValues) {
    try {
      window.localStorage.setItem(getDraftKey(adId), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  clear(adId: number) {
    try {
      window.localStorage.removeItem(getDraftKey(adId));
    } catch {
      // ignore storage cleanup errors
    }
  },
};