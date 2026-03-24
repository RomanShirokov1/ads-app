import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type EditedAdsState = {
  editedAdIds: number[];
  markAdAsEdited: (id: number) => void;
};

export const useEditedAdsStore = create<EditedAdsState>()(
  persist(
    (set, get) => ({
      editedAdIds: [],
      markAdAsEdited: id => {
        if (get().editedAdIds.includes(id)) {
          return;
        }

        set(state => ({
          editedAdIds: [...state.editedAdIds, id],
        }));
      },
    }),
    {
      name: 'edited-ads-store',
    },
  ),
);
