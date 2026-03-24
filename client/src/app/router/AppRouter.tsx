import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layout/AppLayout';
import { LoadingState } from '@/shared/ui/PageState';

const AdsListPage = lazy(() =>
  import('@/pages/ads-list/AdsListPage').then(module => ({
    default: module.AdsListPage,
  })),
);

const AdDetailsPage = lazy(() =>
  import('@/pages/ad-details/AdDetailsPage').then(module => ({
    default: module.AdDetailsPage,
  })),
);

const AdEditPage = lazy(() =>
  import('@/pages/ad-edit/AdEditPage').then(module => ({
    default: module.AdEditPage,
  })),
);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingState tip="Загружаем интерфейс" />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/ads" replace />} />
          <Route path="/ads" element={<AdsListPage />} />
          <Route path="/ads/:id" element={<AdDetailsPage />} />
          <Route path="/ads/:id/edit" element={<AdEditPage />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);
