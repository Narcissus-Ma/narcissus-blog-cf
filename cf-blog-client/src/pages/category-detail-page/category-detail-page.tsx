import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useParams } from 'react-router-dom';

import styles from './category-detail-page.module.css';

import { PostCard } from '@/components/molecules/post-card/post-card';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function CategoryDetailPage() {
  const { slug = '' } = useParams();

  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: taxonomyService.getPublicCategories,
  });

  const currentCategory = categories.find((item) => item.slug === slug);

  const { data, isLoading } = useQuery({
    queryKey: ['category-detail-articles', slug],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 20, categorySlug: slug }),
    enabled: Boolean(slug),
  });

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>分类：{currentCategory?.name ?? slug}</h1>
        <p className={styles.desc}>{currentCategory?.description || '该分类下的文章列表。'}</p>
        <div className={styles.nav}>
          <NavLink className={styles.navItem} to="/">
            首页
          </NavLink>
          {categories.map((item) => (
            <NavLink
              key={item.id}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`.trim()
              }
              to={`/categories/${item.slug}`}
            >
              {item.name}
            </NavLink>
          ))}
          <Link className={styles.more} to="/categories">
            更多
          </Link>
        </div>
      </header>

      {isLoading ? <div className={styles.state}>正在加载分类文章...</div> : null}
      {!isLoading && (data?.list.length ?? 0) === 0 ? (
        <div className={styles.state}>该分类下暂无文章，试试其它分类。</div>
      ) : null}

      <div className={styles.grid}>
        {data?.list.map((item) => (
          <PostCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
