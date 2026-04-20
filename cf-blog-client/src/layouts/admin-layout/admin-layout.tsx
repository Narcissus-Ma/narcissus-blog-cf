import {
  AppstoreOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  ReadOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import styles from './admin-layout.module.css';

import { useInitTheme } from '@/hooks/use-init-theme';
import { useSiteBootstrap } from '@/hooks/use-site-bootstrap';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

interface AdminMenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: AdminMenuItem[] = [
  { label: '工作台', path: '/admin', icon: <DashboardOutlined /> },
  { label: '文章管理', path: '/admin/articles', icon: <FileTextOutlined /> },
  { label: '分类管理', path: '/admin/categories', icon: <AppstoreOutlined /> },
  { label: '标签管理', path: '/admin/tags', icon: <TagsOutlined /> },
  { label: '媒体资源', path: '/admin/media', icon: <PictureOutlined /> },
  { label: '站点设置', path: '/admin/settings', icon: <SettingOutlined /> },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(dayjs());

  useInitTheme();
  useSiteBootstrap();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentMenu = useMemo(
    () =>
      MENU_ITEMS.filter((item) =>
        item.path === '/admin'
          ? location.pathname === '/admin'
          : location.pathname.startsWith(item.path),
      ).sort((a, b) => b.path.length - a.path.length)[0],
    [location.pathname],
  );

  const menuContent = (
    <nav className={styles.menu}>
      {MENU_ITEMS.map((item) => {
        const active =
          item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
            to={item.path}
            onClick={() => {
              setMobileMenuOpen(false);
            }}
          >
            <span className={styles.menuIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.brand}>Narcissus CMS</div>
          <p className={styles.brandDesc}>内容管理控制台</p>
        </div>
        {menuContent}
      </aside>

      <div className={styles.contentWrap}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Button
              className={styles.menuButton}
              icon={<MenuOutlined />}
              onClick={() => {
                setMobileMenuOpen(true);
              }}
            />
            <div className={styles.breadcrumb}>后台 / {currentMenu?.label ?? '页面'}</div>
          </div>
          <div className={styles.topbarRight}>
            <Tag color="processing">开发环境</Tag>
            <span className={styles.clock}>{now.format('YYYY-MM-DD HH:mm:ss')}</span>
            <Button icon={<BgColorsOutlined />} onClick={toggleTheme}>
              主题切换
            </Button>
            <Button
              icon={<ReadOutlined />}
              onClick={() => {
                navigate('/');
              }}
            >
              返回博客
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={() => {
                clearAuth();
                navigate('/admin/login');
              }}
            >
              退出登录
            </Button>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <Drawer
        title="管理菜单"
        placement="left"
        open={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
        }}
        width={280}
      >
        {menuContent}
      </Drawer>
    </div>
  );
}
