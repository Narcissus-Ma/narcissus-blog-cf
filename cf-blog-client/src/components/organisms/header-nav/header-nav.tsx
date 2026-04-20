import { AppstoreOutlined, BulbOutlined, RetweetOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

import styles from './header-nav.module.css';
import { useHeaderActions } from './use-header-actions';

import { HeaderConsolePanel } from '@/components/organisms/header-console-panel/header-console-panel';
import { HeaderSearchModal } from '@/components/organisms/header-search-modal/header-search-modal';
import { useSiteStore } from '@/stores/site-store';
import { useThemeStore } from '@/stores/theme-store';

export function HeaderNav() {
  const location = useLocation();
  const { siteName, navItems } = useSiteStore();
  const { toggleTheme } = useThemeStore();
  const {
    closeConsole,
    closeSearch,
    goRandomPost,
    goSearchPage,
    isConsoleOpen,
    isRandomLoading,
    isSearchOpen,
    keyword,
    openConsole,
    openSearch,
    setKeyword,
  } = useHeaderActions();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link className={styles.logo} to="/">
            {siteName}
          </Link>
          <nav className={styles.menu}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
                to={item.path}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className={styles.actions}>
            <button
              aria-label="随机文章"
              className={styles.actionButton}
              disabled={isRandomLoading}
              type="button"
              onClick={() => {
                void goRandomPost();
              }}
            >
              <RetweetOutlined />
              <span>随机文章</span>
            </button>
            <button aria-label="搜索" className={styles.actionButton} type="button" onClick={openSearch}>
              <SearchOutlined />
              <span>搜索</span>
            </button>
            <button aria-label="中控台" className={styles.actionButton} type="button" onClick={openConsole}>
              <AppstoreOutlined />
              <span>中控台</span>
            </button>
            <button aria-label="切换主题" className={styles.iconButton} type="button" onClick={toggleTheme}>
              <BulbOutlined />
            </button>
          </div>
        </div>
      </header>
      <HeaderSearchModal
        isOpen={isSearchOpen}
        keyword={keyword}
        onClose={closeSearch}
        onKeywordChange={setKeyword}
        onViewMore={goSearchPage}
      />
      <HeaderConsolePanel
        isOpen={isConsoleOpen}
        onClose={closeConsole}
        onOpenSearch={() => {
          closeConsole();
          openSearch();
        }}
        onRandomPost={() => {
          void goRandomPost();
        }}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}
