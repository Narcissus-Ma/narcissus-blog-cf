import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styles from './search-page.module.css';

import { PostCard } from '@/components/molecules/post-card/post-card';
import { articlesService } from '@/features/articles/services/articles-service';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = useMemo(() => searchParams.get('keyword') ?? '', [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['search-page', keyword],
    queryFn: () => articlesService.searchPublic({ page: 1, pageSize: 20, keyword }),
    enabled: Boolean(keyword),
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>搜索结果</h1>
      <p className={styles.subtitle}>关键词：{keyword || '（未输入）'}</p>
      {isLoading ? <div className={styles.state}>搜索中...</div> : null}
      {!isLoading && !keyword ? <div className={styles.state}>请输入关键词后再搜索。</div> : null}
      {!isLoading && keyword && data?.list.length === 0 ? (
        <div className={styles.state}>未找到相关文章，请换个关键词。</div>
      ) : null}
      <div className={styles.grid}>
        {data?.list.map((item) => (
          <PostCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
