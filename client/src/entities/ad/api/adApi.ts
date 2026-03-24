import { http } from '@/shared/api/http';
import type {
  Ad,
  AdsListQuery,
  AdsListResponse,
  UpdateAdPayload,
} from '@/entities/ad/model/types';

type RequestOptions = {
  signal?: AbortSignal;
};

export const adsApi = {
  async getAds(query: AdsListQuery, options?: RequestOptions) {
    const params = {
      q: query.q || undefined,
      limit: query.limit,
      skip: query.skip,
      categories: query.categories.length ? query.categories.join(',') : undefined,
      needsRevision: query.needsRevision || undefined,
      sortColumn: query.sortColumn,
      sortDirection: query.sortDirection,
    };

    const { data } = await http.get<AdsListResponse>('/items', {
      params,
      signal: options?.signal,
    });

    return data;
  },

  async getAd(id: number, options?: RequestOptions) {
    const { data } = await http.get<Ad>(`/items/${id}`, {
      signal: options?.signal,
    });

    return data;
  },

  async updateAd(id: number, payload: UpdateAdPayload) {
    const { data } = await http.put<{ success: boolean }>(`/items/${id}`, payload);
    return data;
  },
};
