import { create } from 'zustand';
import { AD_PAGE_SIZE } from '@/entities/ad/model/constants';
import type {
  AdCategory,
  AdsListQuery,
  AdsSortColumn,
  SortDirection,
} from '@/entities/ad/model/types';

type FiltersState = AdsListQuery & {
  setSearch: (q: string) => void;
  setCategories: (categories: AdCategory[]) => void;
  setNeedsRevision: (needsRevision: boolean) => void;
  setSort: (sortColumn: AdsSortColumn, sortDirection: SortDirection) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const initialState: AdsListQuery = {
  q: '',
  limit: AD_PAGE_SIZE,
  skip: 0,
  categories: [],
  needsRevision: false,
  sortColumn: 'createdAt',
  sortDirection: 'desc',
};

export const useAdsFiltersStore = create<FiltersState>(set => ({
  ...initialState,
  setSearch: q =>
    set(state => ({
      ...state,
      q,
      skip: 0,
    })),
  setCategories: categories =>
    set(state => ({
      ...state,
      categories,
      skip: 0,
    })),
  setNeedsRevision: needsRevision =>
    set(state => ({
      ...state,
      needsRevision,
      skip: 0,
    })),
  setSort: (sortColumn, sortDirection) =>
    set(state => ({
      ...state,
      sortColumn,
      sortDirection,
      skip: 0,
    })),
  setPage: page =>
    set(state => ({
      ...state,
      skip: (page - 1) * state.limit,
    })),
  reset: () => set(initialState),
}));
