import { Button, Empty, Result, Space, Spin } from 'antd';
import type { ReactNode } from 'react';

type RetryProps = {
  onRetry?: () => void;
};

export const LoadingState = ({ tip }: { tip?: string }) => (
  <Result
    icon={<Spin size="large" />}
    title="Загрузка"
    subTitle={tip ?? 'Подготавливаем данные страницы'}
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
    status="error"
    title={title}
    subTitle={description}
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
