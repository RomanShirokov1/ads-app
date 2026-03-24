import { Button, Card, Checkbox, Divider, Switch } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { categoryOptions } from '@/entities/ad/model/constants';
import type { AdCategory } from '@/entities/ad/model/types';
import styles from './AdsFiltersPanel.module.css';

export const AdsFiltersPanel = ({
  categories,
  needsRevision,
  onCategoriesChange,
  onNeedsRevisionChange,
  onReset,
}: {
  categories: AdCategory[];
  needsRevision: boolean;
  onCategoriesChange: (categories: AdCategory[]) => void;
  onNeedsRevisionChange: (value: boolean) => void;
  onReset: () => void;
}) => (
  <div className={styles.panel}>
    <Card className={styles.filtersCard}>
      <div className={styles.section}>
        <h2 className={styles.title}>Фильтры</h2>

        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <span>Категория</span>
            <UpOutlined />
          </div>
          <Checkbox.Group
            className={styles.options}
            value={categories}
            onChange={(values) => onCategoriesChange(values as AdCategory[])}
            options={categoryOptions}
          />
        </div>

        <Divider className={styles.separator} />

        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>Только требующие доработок</span>
          <Switch
            checked={needsRevision}
            onChange={onNeedsRevisionChange}
            aria-label="Только требующие доработок"
          />
        </div>
      </div>
    </Card>

    <Button className={styles.resetButton} block onClick={onReset}>
      Сбросить фильтры
    </Button>
  </div>
);
