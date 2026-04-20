import type { ArticleSummary } from '@narcissus/shared';
import dayjs from 'dayjs';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from './post-card.module.css';

interface PostCardProps {
  item: ArticleSummary;
}

const DEFAULT_COVER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22800%22 height%3D%22450%22 viewBox%3D%220 0 800 450%22%3E%3Cdefs%3E%3ClinearGradient id%3D%22g%22 x1%3D%220%25%22 y1%3D%220%25%22 x2%3D%22100%25%22 y2%3D%22100%25%22%3E%3Cstop offset%3D%220%25%22 stop-color%3D%22%231a2a6c%22/%3E%3Cstop offset%3D%22100%25%22 stop-color%3D%22%23b21f1f%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width%3D%22800%22 height%3D%22450%22 fill%3D%22url(%23g)%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 fill%3D%22%23fff%22 font-size%3D%2240%22 font-family%3D%22Arial%2Csans-serif%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22%3ENarcissus Blog%3C/text%3E%3C/svg%3E';

export function PostCard({ item }: PostCardProps) {
  const navigate = useNavigate();

  const toPostPath = `/post/${item.slug}`;

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    // 点击卡片内其他链接时，保留原始跳转行为。
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(toPostPath);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(toPostPath);
    }
  };

  return (
    <article
      className={styles.card}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`打开文章：${item.title}`}
    >
      <Link className={styles.coverLink} to={toPostPath}>
        <img className={styles.cover} src={item.coverUrl || DEFAULT_COVER_IMAGE} alt={item.title} />
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>
          {item.categorySlug ? (
            <Link className={styles.categoryLink} to={`/categories/${item.categorySlug}`}>
              {item.categoryName || '未分类'}
            </Link>
          ) : (
            <span className={styles.categoryLink}>{item.categoryName || '未分类'}</span>
          )}
        </div>
        <Link className={styles.title} to={toPostPath}>
          {item.title}
        </Link>
        <div className={styles.footer}>
          <div className={styles.tagWrap}>
            {(item.tagItems.length > 0 ? item.tagItems.slice(0, 2) : []).map((tag) => (
              <Link key={tag.id} className={styles.tagLink} to={`/tags/${tag.slug}`}>
                #{tag.name}
              </Link>
            ))}
            {item.tagItems.length === 0 ? <span className={styles.noTag}>无标签</span> : null}
          </div>
          <span className={styles.date}>{dayjs(item.publishedAt || item.createdAt).format('M-D-YYYY')}</span>
        </div>
      </div>
    </article>
  );
}
