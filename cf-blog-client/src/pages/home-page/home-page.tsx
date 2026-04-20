import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';

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

  const { data: categories = [] } = useQuery({
    queryKey: ['public-categories'],
    queryFn: taxonomyService.getPublicCategories,
  });

  const categoryBarItems = useMemo(
    () =>
      categories.slice(0, 8).map((item) => ({ name: item.name, path: `/categories/${item.slug}` })),
    [categories],
  );

  const featuredArticle = articleResult?.list[0];

  // 检查文章是否未读
  const checkIsUnread = (articleId: string): boolean => {
    const readArticles = localStorage.getItem('readArticles');
    if (!readArticles) return true;
    const readArticleIds = JSON.parse(readArticles);
    return !readArticleIds.includes(articleId);
  };

  // 检查文章是否为新文章（7天内发布）
  const checkIsNew = (publishedAt: string | Date): boolean => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(publishedAt) > sevenDaysAgo;
  };

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
              // 计算封面位置（交替布局）
              const coverPosition = item.coverUrl ? (index % 2 === 0 ? 'left' : 'right') : 'none';
              
              return (
                <React.Fragment key={item.id}>
                  {/* 每3篇文章后插入广告 */}
                  {index > 0 && index % 3 === 0 && (
                    <div className={styles.adSlot}>
                      {/* 广告内容 */}
                      <div className={styles.adContent}>
                        <p>广告位</p>
                      </div>
                    </div>
                  )}
                  <PostCard 
                    item={item} 
                    coverPosition={coverPosition}
                    isSticky={(item as any).isSticky || false}
                    isNew={checkIsNew(item.publishedAt || item.createdAt)}
                    isUnread={checkIsUnread(item.id)}
                    commentCount={(item as any).commentCount || 0}
                  />
                </React.Fragment>
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
        <SidebarPanel categories={categories} />
      </div>
    </div>
  );
}
