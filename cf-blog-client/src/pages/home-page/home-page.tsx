import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import styles from './home-page.module.css';

import { CategoryBar } from '@/components/molecules/category-bar/category-bar';
import { PaginationBar } from '@/components/molecules/pagination-bar/pagination-bar';
import { PostCard } from '@/components/molecules/post-card/post-card';
import { HeroBanner } from '@/components/organisms/hero-banner/hero-banner';
import { SidebarPanel } from '@/components/organisms/sidebar-panel/sidebar-panel';
import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

export function HomePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: articleResult, isLoading } = useQuery({
    queryKey: ['public-articles', page, pageSize],
    queryFn: () => articlesService.getPublicList({ page, pageSize }),
  });
  const { data: recentArticleResult } = useQuery({
    queryKey: ['public-articles-recent-updated'],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 50 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: taxonomyService.getPublicCategories,
  });
  const { data: tags = [] } = useQuery({
    queryKey: ['public-tags'],
    queryFn: taxonomyService.getPublicTags,
  });

  const categoryBarItems = useMemo(
    () =>
      categories.slice(0, 8).map((item) => ({ name: item.name, path: `/categories/${item.slug}` })),
    [categories],
  );

  const featuredArticle = articleResult?.list[0];
  const recentUpdatedArticles = useMemo(
    () =>
      [...(recentArticleResult?.list ?? [])]
        .sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.publishedAt || a.createdAt).getTime();
          const timeB = new Date(b.updatedAt || b.publishedAt || b.createdAt).getTime();
          return timeB - timeA;
        })
        .slice(0, 3),
    [recentArticleResult?.list],
  );

  return (
    <div className={styles.container}>
      <HeroBanner featuredTitle={featuredArticle?.title} featuredSlug={featuredArticle?.slug} />
      <CategoryBar items={categoryBarItems} />

      <div className={styles.layout}>
        <section className={styles.posts}>
          {isLoading ? <div className={styles.state}>正在加载文章...</div> : null}
          {!isLoading && articleResult?.list.length === 0 ? (
            <div className={styles.state}>暂无文章，请先在后台发布内容。</div>
          ) : null}
          <div className={styles.grid}>
            {articleResult?.list.map((item, index) => {
              return (
                <div key={item.id}>
                  {/* 每3篇文章后插入广告 */}
                  {index > 0 && index % 3 === 0 && (
                    <div className={styles.adSlot}>
                      {/* 广告内容 */}
                      <div className={styles.adContent}>
                        <p>广告位</p>
                      </div>
                    </div>
                  )}
                  <PostCard item={item} />
                </div>
              );
            })}
          </div>
          <div className={styles.pagination}>
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={articleResult?.total ?? 0}
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          </div>
        </section>
        <SidebarPanel categories={categories} tags={tags} recentUpdatedArticles={recentUpdatedArticles} />
      </div>
    </div>
  );
}
