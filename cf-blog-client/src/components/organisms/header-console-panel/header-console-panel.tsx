import { BulbOutlined, CloseOutlined, RetweetOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import styles from './header-console-panel.module.css';

import { articlesService } from '@/features/articles/services/articles-service';
import { useSiteStore } from '@/stores/site-store';

interface HeaderConsolePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onRandomPost: () => void;
  onToggleTheme: () => void;
}

export function HeaderConsolePanel({
  isOpen,
  onClose,
  onOpenSearch,
  onRandomPost,
  onToggleTheme,
}: HeaderConsolePanelProps) {
  const { navItems } = useSiteStore();
  const { data } = useQuery({
    queryKey: ['header-console-latest-posts'],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 5 }),
    enabled: isOpen,
    retry: false,
  });

  if (!isOpen) {
    return null;
  }

  const getArticleDateText = (item: {
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createDate?: string;
    updateDate?: string;
  }): string => {
    const dateValue =
      item.publishedAt || item.createdAt || item.updatedAt || item.createDate || item.updateDate || '';
    return dateValue ? String(dateValue).slice(0, 10) : '未知日期';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        aria-modal="true"
        className={styles.panel}
        role="dialog"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>中控台</h2>
            <p className={styles.subtitle}>集中访问导航、快捷操作和最近文章。</p>
          </div>
          <button aria-label="关闭中控台" className={styles.closeButton} type="button" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.content}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>快捷操作</h3>
            <div className={styles.actionGrid}>
              <button className={styles.actionButton} type="button" onClick={onOpenSearch}>
                <SearchOutlined />
                <span>搜索文章</span>
              </button>
              <button className={styles.actionButton} type="button" onClick={onRandomPost}>
                <RetweetOutlined />
                <span>随机文章</span>
              </button>
              <button className={styles.actionButton} type="button" onClick={onToggleTheme}>
                <BulbOutlined />
                <span>显示模式</span>
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>站点导航</h3>
            <div className={styles.linkGrid}>
              {navItems.map((item) => (
                <Link key={item.path} className={styles.navLink} to={item.path} onClick={onClose}>
                  {item.name}
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>最近更新</h3>
            <div className={styles.postList}>
              {data?.list.map((item) => (
                <Link key={item.id} className={styles.postLink} to={`/post/${item.slug}`} onClick={onClose}>
                  <span className={styles.postTitle}>{item.title}</span>
                  <span className={styles.postMeta}>
                    {item.categoryName || '未分类'} · {getArticleDateText(item)}
                  </span>
                </Link>
              ))}
              {!data?.list.length ? <div className={styles.empty}>暂无最新文章</div> : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
