import type { CategoryItem, TagItem } from '@narcissus/shared';
import { Link } from 'react-router-dom';

import styles from './sidebar-panel.module.css';

interface SidebarPanelProps {
  categories: CategoryItem[];
  tags: TagItem[];
}

export function SidebarPanel({ categories, tags }: SidebarPanelProps) {
  // 按文章数量排序分类
  const sortedCategories = [...categories].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  // 按文章数量排序标签
  const sortedTags = [...tags].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  const visibleTags = sortedTags.slice(0, 20);
  
  return (
    <aside className={styles.aside}>
      <section className={styles.card}>
        <h3 className={styles.title}>分类</h3>
        <div className={styles.list}>
          {sortedCategories.map((item) => (
            <Link key={item.id} className={styles.pill} to={`/categories/${item.slug}`}>
              {item.name} ({item.articleCount || 0})
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.card}>
        <h3 className={styles.title}>标签</h3>
        <div className={styles.list}>
          {visibleTags.map((item) => (
            <Link key={item.id} className={styles.pill} to={`/tags/${item.slug}`}>
              #{item.name} ({item.articleCount || 0})
            </Link>
          ))}
        </div>
        {sortedTags.length > 20 ? (
          <div className={styles.moreWrap}>
            <Link className={styles.moreLink} to="/tags">
              查看更多标签
            </Link>
          </div>
        ) : null}
      </section>
      <section className={styles.card}>
        <h3 className={styles.title}>热门文章</h3>
        <div className={styles.hotArticleList}>
          {/* 这里可以添加热门文章列表，需要从 API 获取 */}
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>1</span>
              <span className={styles.hotArticleTitle}>热门文章标题示例</span>
            </Link>
          </div>
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>2</span>
              <span className={styles.hotArticleTitle}>另一篇热门文章</span>
            </Link>
          </div>
          <div className={styles.hotArticleItem}>
            <Link to="#" className={styles.hotArticleLink}>
              <span className={styles.hotArticleRank}>3</span>
              <span className={styles.hotArticleTitle}>热门文章第三名</span>
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.card}>
        <h3 className={styles.title}>最新评论</h3>
        <div className={styles.commentList}>
          {/* 这里可以添加最新评论列表，需要从 API 获取 */}
          <div className={styles.commentItem}>
            <div className={styles.commentAvatar}>
              <img src="https://via.placeholder.com/40" alt="评论者头像" />
            </div>
            <div className={styles.commentContent}>
              <span className={styles.commentAuthor}>访客</span>
              <p className={styles.commentText}>这是一条评论示例</p>
              <Link to="#" className={styles.commentLink}>查看全文</Link>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
