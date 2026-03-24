import { useEffect, useMemo, useState } from 'react';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AppRouter } from '@/app/router/AppRouter';
import { ThemeContext, type ThemeMode } from './themeContext';

const THEME_STORAGE_KEY = 'ads-app-theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
};

const sharedThemeToken = {
  colorPrimary: 'var(--color-primary)',
  colorInfo: 'var(--color-primary)',
  colorSuccess: 'var(--color-success)',
  colorWarning: 'var(--color-warning)',
  colorError: 'var(--color-danger)',
  colorBgBase: 'var(--color-bg-page)',
  colorBgContainer: 'var(--color-bg-surface)',
  colorBorder: 'var(--color-border-default)',
  colorTextBase: 'var(--color-text-primary)',
  borderRadius: 16,
};

export const AppProviders = () => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const themeContextValue = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ConfigProvider
        locale={ruRU}
        theme={{
          algorithm:
            mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: sharedThemeToken,
        }}
      >
        <AntdApp>
          <AppRouter />
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
