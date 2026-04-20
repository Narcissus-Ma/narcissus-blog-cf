import type { ArticleSummary } from '@narcissus/shared';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import styles from './post-card.module.css';

interface PostCardProps {
  item: ArticleSummary;
  coverPosition?: 'left' | 'right' | 'none';
  isSticky?: boolean;
  isNew?: boolean;
  isUnread?: boolean;
  commentCount?: number;
}

export function PostCard({ 
  item, 
  coverPosition = 'none', 
  isSticky = false, 
  isNew = false, 
  isUnread = false, 
  commentCount = 0 
}: PostCardProps) {
  return (
    <article className={`${styles.card} ${coverPosition !== 'none' ? styles.coverAlternate : ''} ${coverPosition === 'left' ? styles.coverLeft : coverPosition === 'right' ? styles.coverRight : ''}`}>
      {coverPosition !== 'none' && item.coverUrl && (
        <Link className={styles.coverLink} to={`/post/${item.slug}`}>
          <img
            className={styles.cover}
            src={item.coverUrl || 'https://via.placeholder.com/800x500?text=Narcissus+Blog'}
            alt={item.title}
          />
        </Link>
      )}
      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            {isSticky && (
              <span className={styles.stickyTag}>
                <i className="anzhiyufont anzhiyu-icon-thumbtack"></i>
                置顶
              </span>
            )}
            {isNew && (
              <span className={styles.newTag}>
                新
              </span>
            )}
            {isUnread && (
              <Link className={styles.unreadTag} to={`/post/${item.slug}`}>
                未读
              </Link>
            )}
          </div>
          {item.categorySlug ? (
            <Link className={styles.categoryLink} to={`/categories/${item.categorySlug}`}>
              {item.categoryName || '未分类'}
            </Link>
          ) : (
            <span className={styles.categoryLink}>{item.categoryName || '未分类'}</span>
          )}
        </div>
        <Link className={styles.title} to={`/post/${item.slug}`}>
          {item.title}
        </Link>
        <p className={styles.excerpt}>{item.excerpt || '暂无摘要内容。'}</p>
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.date}>
              {dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}
            </span>
            {commentCount > 0 && (
              <Link className={styles.commentLink} to={`/post/${item.slug}#comments`}>
                <i className="anzhiyufont anzhiyu-icon-comments"></i>
                {commentCount}
              </Link>
            )}
          </div>
          <div className={styles.tagWrap}>
            {(item.tagItems.length > 0 ? item.tagItems.slice(0, 2) : []).map((tag) => (
              <Link key={tag.id} className={styles.tagLink} to={`/tags/${tag.slug}`}>
                #{tag.name}
              </Link>
            ))}
            {item.tagItems.length === 0 ? <span className={styles.noTag}>无标签</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
