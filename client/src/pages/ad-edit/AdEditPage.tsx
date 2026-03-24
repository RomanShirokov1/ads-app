import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adsApi } from '@/entities/ad/api/adApi';
import type { Ad } from '@/entities/ad/model/types';
import { EditAdForm } from '@/features/edit-ad-form/ui/EditAdForm';
import { ErrorState, LoadingState } from '@/shared/ui/PageState';

export const AdEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return <LoadingState tip={'Подготавливаем форму редактирования'} />;
  }

  if (error || !ad) {
    return (
      <ErrorState
        title={'Не удалось открыть форму'}
        description={error ?? 'Объявление не найдено'}
        onRetry={() => navigate(0)}
      />
    );
  }

  return <EditAdForm ad={ad} />;
};