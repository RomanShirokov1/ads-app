import { App as AntdApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRouter } from '@/app/router/AppRouter';

export const AppProviders = () => (
  <ConfigProvider
    locale={ruRU}
    theme={{
      token: {
        colorPrimary: '#c76a18',
        colorInfo: '#c76a18',
        colorSuccess: '#15803d',
        colorWarning: '#d97706',
        colorError: '#dc2626',
        borderRadius: 16,
      },
    }}
  >
    <AntdApp>
      <AppRouter />
    </AntdApp>
  </ConfigProvider>
);
