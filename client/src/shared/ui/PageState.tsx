import { Button, Empty, Result, Space, Spin } from 'antd';
import type { ReactNode } from 'react';

type RetryProps = {
  onRetry?: () => void;
};

export const LoadingState = ({ tip }: { tip?: string }) => (
  <Result
    className="pageStateResult"
    icon={<Spin size="large" style={{ color: 'var(--color-primary)' }} />}
    title={<span style={{ color: 'var(--color-text-title)' }}>Загрузка</span>}
    subTitle={
      <span style={{ color: 'var(--color-text-muted)' }}>
        {tip ?? 'Подготавливаем данные страницы'}
      </span>
    }
  />
);

export const ErrorState = ({
  title = 'Не удалось загрузить данные',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
} & RetryProps) => (
  <Result
    className="pageStateResult"
    status="error"
    title={<span style={{ color: 'var(--color-text-title)' }}>{title}</span>}
    subTitle={<span style={{ color: 'var(--color-text-muted)' }}>{description}</span>}
    extra={onRetry ? <Button onClick={onRetry}>Повторить</Button> : undefined}
  />
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <Empty
    description={
      <Space direction="vertical" size={4}>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </Space>
    }
  >
    {action}
  </Empty>
);
