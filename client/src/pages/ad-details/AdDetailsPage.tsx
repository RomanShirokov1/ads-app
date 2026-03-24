import { ArrowLeftOutlined, EditOutlined, ExclamationCircleFilled, PictureOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adsApi } from '@/entities/ad/api/adApi';
import {
  formatPrice,
  getMissingFields,
  getParamEntries,
} from '@/entities/ad/lib/ad-formatters';
import type { Ad } from '@/entities/ad/model/types';
import { useEditedAdsStore } from '@/features/edit-ad-form/lib/useEditedAdsStore';
import { ErrorState, LoadingState } from '@/shared/ui/PageState';
import styles from './AdDetailsPage.module.css';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const AdDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasBeenEdited = useEditedAdsStore(state => (id ? state.editedAdIds.includes(Number(id)) : false));

  useEffect(() => {
    const controller = new AbortController();

    const loadAd = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await adsApi.getAd(Number(id), { signal: controller.signal });
        setAd(data);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Не удалось загрузить объявление',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void loadAd();
    }

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <LoadingState tip="Загружаем карточку объявления" />;
  }

  if (error || !ad) {
    return (
      <ErrorState
        title="Карточка не найдена"
        description={error ?? 'Объявление не существует или недоступно'}
        onRetry={() => navigate(0)}
      />
    );
  }

  const missingFields = getMissingFields(ad);
  const paramEntries = getParamEntries(ad);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div>
            <h1 className={styles.title}>{ad.title}</h1>
            <div className={styles.actionButtons}>
              <Button
                icon={<ArrowLeftOutlined />}
                className={styles.backButton}
                onClick={() => navigate('/ads')}
              >
                {'К списку объявлений'}
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                className={styles.editButton}
                onClick={() => navigate(`/ads/${ad.id}/edit`)}
              >
                {'Редактировать'}
              </Button>
            </div>
          </div>

          <div className={styles.meta}>
            <div className={styles.price}>{formatPrice(ad.price)}</div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>{'Опубликовано:'}</span>
              <span>{formatDateTime(ad.createdAt)}</span>
            </div>
            {hasBeenEdited ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{'Отредактировано:'}</span>
                <span>{formatDateTime(ad.updatedAt)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.mainSection}>
          <div className={styles.mediaBlock}>
            <div className={styles.placeholder} aria-label={'Фотография отсутствует'}>
              <PictureOutlined />
            </div>
          </div>

          <div className={styles.infoColumn}>
            {missingFields.length ? (
              <section className={styles.warningBox}>
                <div className={styles.warningHeader}>
                  <ExclamationCircleFilled className={styles.warningIcon} />
                  <span>{'Требуются доработки'}</span>
                </div>
                <p className={styles.warningText}>{'У объявления не заполнены поля:'}</p>
                <ul className={styles.warningList}>
                  {missingFields.map(field => (
                    <li key={field.path}>{field.label}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className={styles.sectionTitle}>{'Характеристики'}</h2>
              <div className={styles.propertiesList}>
                {paramEntries.map(entry => (
                  <div className={styles.propertyRow} key={entry.label}>
                    <span className={styles.propertyLabel}>{entry.label}</span>
                    <span className={styles.propertyValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>{'Описание'}</h2>
          <p className={styles.description}>
            {ad.description?.trim() || 'Отсутствует'}
          </p>
        </section>
      </div>
    </div>
  );
};