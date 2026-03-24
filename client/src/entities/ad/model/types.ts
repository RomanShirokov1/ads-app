export type AdCategory = 'auto' | 'real_estate' | 'electronics';

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

export type Ad = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
} & (
  | { category: 'auto'; params: AutoItemParams }
  | { category: 'real_estate'; params: RealEstateItemParams }
  | { category: 'electronics'; params: ElectronicsItemParams }
);

export type AdListItem = Pick<
  Ad,
  'id' | 'category' | 'title' | 'price' | 'needsRevision'
>;

export type AdsSortColumn = 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export type AdsListQuery = {
  q: string;
  limit: number;
  skip: number;
  categories: AdCategory[];
  needsRevision: boolean;
  sortColumn: AdsSortColumn;
  sortDirection: SortDirection;
};

export type AdsListResponse = {
  items: AdListItem[];
  total: number;
};

export type UpdateAdPayload = {
  title: string;
  description?: string;
  price: number;
} & (
  | { category: 'auto'; params: AutoItemParams }
  | { category: 'real_estate'; params: RealEstateItemParams }
  | { category: 'electronics'; params: ElectronicsItemParams }
);

export type EditAdFormValues = {
  category: AdCategory;
  title: string;
  description?: string;
  price: number | null;
  params: Record<string, string | number | undefined>;
};

export type MissingField = {
  path: string;
  label: string;
};
