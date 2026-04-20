import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

import styles from './categories-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');

  const { data = [] } = useQuery({
    queryKey: ['categories-page'],
    queryFn: taxonomyService.getPublicCategories,
  });

  if (slug) {
    return <Navigate to={`/categories/${slug}`} replace />;
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>分类</h1>
      <div className={styles.grid}>
        {data.map((item) => (
          <Link key={item.id} className={styles.card} to={`/categories/${item.slug}`}>
            <h3>{item.name}</h3>
            <p>{item.description || '暂无分类描述'}</p>
            <span>{item.articleCount} 篇文章</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
