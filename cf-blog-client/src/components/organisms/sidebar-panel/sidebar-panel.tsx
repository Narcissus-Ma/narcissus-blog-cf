import type { CategoryItem } from '@narcissus/shared';
import { Link } from 'react-router-dom';

import styles from './sidebar-panel.module.css';

interface SidebarPanelProps {
  categories: CategoryItem[];
}

export function SidebarPanel({ categories }: SidebarPanelProps) {
  // 按文章数量排序分类
  const sortedCategories = [...categories].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  
  return (
    <aside className={styles.aside}>
      <section className={styles.card}>
        <h3 className={styles.title}>关于我</h3>
        <p className={styles.text}>Narcissus，记录前端、服务端与 AI 学习实践。</p>
      </section>
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
