import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useParams } from 'react-router-dom';

import styles from './tag-detail-page.module.css';

import { PostCard } from '@/components/molecules/post-card/post-card';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function TagDetailPage() {
  const { slug = '' } = useParams();

  const { data: tags = [] } = useQuery({
    queryKey: ['public-tags'],
    queryFn: taxonomyService.getPublicTags,
  });

  const currentTag = tags.find((item) => item.slug === slug);

  const { data, isLoading } = useQuery({
    queryKey: ['tag-detail-articles', slug],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 20, tagSlug: slug }),
    enabled: Boolean(slug),
  });

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>标签：{currentTag?.name ?? slug}</h1>
        <div className={styles.nav}>
          {tags.map((item) => (
            <NavLink
              key={item.id}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`.trim()
              }
              to={`/tags/${item.slug}`}
            >
              #{item.name}
            </NavLink>
          ))}
          <Link className={styles.more} to="/tags">
            更多
          </Link>
        </div>
      </header>

      {isLoading ? <div className={styles.state}>正在加载标签文章...</div> : null}
      {!isLoading && (data?.list.length ?? 0) === 0 ? (
        <div className={styles.state}>该标签下暂无文章，试试其它标签。</div>
      ) : null}

      <div className={styles.grid}>
        {data?.list.map((item) => (
          <PostCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
