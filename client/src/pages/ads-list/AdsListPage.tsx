import { SearchOutlined } from '@ant-design/icons';
import { Alert, Card, Input, Pagination, Select, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adsApi } from '@/entities/ad/api/adApi';
import { AD_PAGE_SIZE, sortOptions } from '@/entities/ad/model/constants';
import type { AdCategory, AdListItem } from '@/entities/ad/model/types';
import { AdCard } from '@/entities/ad/ui/AdCard';
import {
  type AdCardViewMode,
  viewModeIcons,
} from '@/entities/ad/ui/adCardViewMode';
import { useAdsFiltersStore } from '@/features/ad-filters/model/useAdsFiltersStore';
import { AdsFiltersPanel } from '@/features/ad-filters/ui/AdsFiltersPanel';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/PageState';
import styles from './AdsListPage.module.css';

const areCategoriesEqual = (left: AdCategory[], right: AdCategory[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return [...left].sort().every((value, index) => value === [...right].sort()[index]);
};

export const AdsListPage = () => {
  const navigate = useNavigate();
  const {
    q,
    limit,
    skip,
    categories,
    needsRevision,
    sortColumn,
    sortDirection,
    setSearch,
    setCategories,
    setNeedsRevision,
    setSort,
    setPage,
    reset,
  } = useAdsFiltersStore();

  const [items, setItems] = useState<AdListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<AdCardViewMode>('grid');
  const [searchValue, setSearchValue] = useState(q);
  const [selectedCategories, setSelectedCategories] = useState<AdCategory[]>(categories);
  const [needsRevisionOnly, setNeedsRevisionOnly] = useState(needsRevision);

  const selectedSort = `${sortColumn}:${sortDirection}`;
  const currentPage = skip / AD_PAGE_SIZE + 1;

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  useEffect(() => {
    setSelectedCategories(categories);
  }, [categories]);

  useEffect(() => {
    setNeedsRevisionOnly(needsRevision);
  }, [needsRevision]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchValue !== q) {
        setSearch(searchValue);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [q, searchValue, setSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!areCategoriesEqual(selectedCategories, categories)) {
        setCategories(selectedCategories);
      }

      if (needsRevisionOnly !== needsRevision) {
        setNeedsRevision(needsRevisionOnly);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [categories, needsRevision, needsRevisionOnly, selectedCategories, setCategories, setNeedsRevision]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAds = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await adsApi.getAds(
          {
            q,
            limit,
            skip,
            categories,
            needsRevision,
            sortColumn,
            sortDirection,
          },
          { signal: controller.signal },
        );
        setItems(data.items);
        setTotal(data.total);
        setHasLoadedOnce(true);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Не удалось загрузить список объявлений',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadAds();

    return () => controller.abort();
  }, [categories, limit, needsRevision, q, skip, sortColumn, sortDirection]);

  const adsCountLabel = useMemo(() => {
    const formattedTotal = new Intl.NumberFormat('ru-RU').format(total);
    return `${formattedTotal} ${total === 1 ? 'объявление' : 'объявления'}`;
  }, [total]);

  const handleResetFilters = () => {
    setSearchValue('');
    setSelectedCategories([]);
    setNeedsRevisionOnly(false);
    reset();
  };

  if (!hasLoadedOnce && loading) {
    return <LoadingState tip="Получаем список объявлений продавца" />;
  }

  if (error && !items.length) {
    return <ErrorState description={error} onRetry={() => navigate(0)} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Мои объявления</h1>
        <span className={styles.subtitle}>{adsCountLabel}</span>
      </div>

      <div className={styles.toolbar}>
        <Input
          allowClear
          className={styles.search}
          prefix={<SearchOutlined />}
          placeholder="Найти объявление...."
          value={searchValue}
          onChange={event => setSearchValue(event.target.value)}
        />

        <div className={styles.actions}>
          <div className={styles.viewSwitch} aria-label="Выбор отображения объявлений">
            {(['grid', 'list'] as const).map((mode, index) => (
              <div key={mode} className={styles.viewButtonWrap}>
                <button
                  type="button"
                  className={`${styles.viewButton} ${mode === viewMode ? styles.viewButtonActive : ''}`}
                  aria-pressed={mode === viewMode}
                  aria-label={mode === 'grid' ? 'Сетка' : 'Список'}
                  onClick={() => setViewMode(mode)}
                >
                  {viewModeIcons[mode]}
                </button>
                {index === 0 ? <span className={styles.viewDivider} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>

          <Select
            className={styles.sort}
            value={selectedSort}
            options={[...sortOptions]}
            onChange={value => {
              const [nextSortColumn, nextSortDirection] = value.split(':') as [
                'title' | 'createdAt',
                'asc' | 'desc',
              ];
              setSort(nextSortColumn, nextSortDirection);
            }}
          />
        </div>
      </div>

      <div className={styles.layout}>
        <AdsFiltersPanel
          categories={selectedCategories}
          needsRevision={needsRevisionOnly}
          onCategoriesChange={values => setSelectedCategories(values)}
          onNeedsRevisionChange={setNeedsRevisionOnly}
          onReset={handleResetFilters}
        />

        <div className={styles.content}>
          {error ? <Alert className={styles.error} type="error" showIcon message={error} /> : null}

          {loading && hasLoadedOnce ? (
            <div className={styles.inlineLoading}>
              <Spin size="small" />
              <span>Обновляем список объявлений</span>
            </div>
          ) : null}

          {!loading && !items.length ? (
            <Card className={styles.empty}>
              <EmptyState
                title="Ничего не найдено"
                description="Попробуйте изменить строку поиска или сбросить фильтры."
              />
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? styles.grid : styles.list}>
              {items.map(item => (
                <AdCard
                  key={item.id}
                  ad={item}
                  viewMode={viewMode}
                  onClick={() => navigate(`/ads/${item.id}`)}
                />
              ))}
            </div>
          )}

          <div className={styles.pagination}>
            <Pagination
              current={currentPage}
              pageSize={AD_PAGE_SIZE}
              total={total}
              showSizeChanger={false}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
