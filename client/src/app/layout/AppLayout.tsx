import { Layout, Switch } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppTheme } from '@/app/providers/themeContext';
import styles from './AppLayout.module.css';

const { Content } = Layout;

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isDetailsOrEditPage = /^\/ads\/\d+(\/edit)?$/.test(pathname);
  const { mode, setMode } = useAppTheme();

  return (
    <Layout className={`${styles.shell} ${isDetailsOrEditPage ? styles.shellSurface : ''}`.trim()}>
      <div className={styles.themeToggle}>
        <span className={styles.themeLabel}>{mode === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
        <Switch
          checked={mode === 'dark'}
          onChange={checked => setMode(checked ? 'dark' : 'light')}
          aria-label="Переключение темы"
        />
      </div>
      <Content
        className={`${styles.content} ${isDetailsOrEditPage ? styles.contentWhite : ''}`.trim()}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};
