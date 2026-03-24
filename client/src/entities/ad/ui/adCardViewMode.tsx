import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export type AdCardViewMode = 'grid' | 'list';

export const viewModeIcons: Record<AdCardViewMode, ReactNode> = {
  grid: <AppstoreOutlined />,
  list: <BarsOutlined />,
};
