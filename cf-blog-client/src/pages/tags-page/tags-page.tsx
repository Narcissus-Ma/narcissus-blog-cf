import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import styles from './tags-page.module.css';

import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function TagsPage() {
  const { data = [] } = useQuery({
    queryKey: ['tags-page'],
    queryFn: taxonomyService.getPublicTags,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>标签</h1>
      <div className={styles.wrap}>
        {data.map((item) => (
          <Link key={item.id} className={styles.tag} to={`/tags/${item.slug}`}>
            #{item.name} ({item.articleCount})
          </Link>
        ))}
      </div>
    </section>
  );
}
