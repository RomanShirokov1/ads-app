import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';

const { Content } = Layout;

export const AppLayout = () => {
  const { pathname } = useLocation();
  const isDetailsOrEditPage = /^\/ads\/\d+(\/edit)?$/.test(pathname);

  return (
    <Layout className={styles.shell}>
      <Content
        className={`${styles.content} ${isDetailsOrEditPage ? styles.contentWhite : ''}`.trim()}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};
