import { Alert, Space } from 'antd';

import { UiButton } from '@/shared/ui/controls';

import styles from './DraftAlert.module.css';

type DraftAlertProps = {
  onRestore: () => void;
  onDiscard: () => void;
};

export const DraftAlert = ({ onRestore, onDiscard }: DraftAlertProps) => (
  <Alert
    className={styles.draftAlert}
    type="warning"
    showIcon
    message="Найден черновик"
    description="Можно восстановить локально сохранённые изменения или сбросить их."
    action={
      <Space wrap>
        <UiButton tone="secondary" size="small" onClick={onRestore}>
          Восстановить
        </UiButton>
        <UiButton tone="secondary" size="small" onClick={onDiscard}>
          Сбросить
        </UiButton>
      </Space>
    }
  />
);