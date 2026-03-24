import { CarOutlined, HomeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import { formatPrice, getCategoryLabel } from '@/entities/ad/lib/ad-formatters';
import type { AdCategory, AdListItem } from '@/entities/ad/model/types';
import type { AdCardViewMode } from './adCardViewMode';
import styles from './AdCard.module.css';

const categoryIconMap: Record<AdCategory, ReactNode> = {
  auto: <CarOutlined className={styles.mediaIcon} />,
  real_estate: <HomeOutlined className={styles.mediaIcon} />,
  electronics: <ThunderboltOutlined className={styles.mediaIcon} />,
};

export const AdCard = ({
  ad,
  onClick,
  viewMode,
}: {
  ad: AdListItem;
  onClick: () => void;
  viewMode: AdCardViewMode;
}) => (
  <Card className={`${styles.card} ${styles[viewMode]}`} hoverable onClick={onClick}>
    <div className={styles.inner}>
      <div className={styles.media}>{categoryIconMap[ad.category]}</div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <Tag className={styles.category}>{getCategoryLabel(ad.category)}</Tag>
          <Typography.Title className={styles.title} level={5}>
            {ad.title}
          </Typography.Title>
          <Typography.Text className={styles.price} strong>
            {formatPrice(ad.price)}
          </Typography.Text>
          {ad.needsRevision ? (
            <Tag className={styles.revision} icon={<div className={styles.warningDot} />}>
              Требует доработок
            </Tag>
          ) : null}
        </div>
      </div>
    </div>
  </Card>
);


