import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import styles from './archives-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

export function ArchivesPage() {
  const { data } = useQuery({
    queryKey: ['archives-page'],
    queryFn: () => articlesService.getPublicList({ page: 1, pageSize: 100 }),
  });

  const grouped = useMemo(() => {
    const source = data?.list ?? [];
    const map = new Map<string, { ym: string; monthLabel: string; items: typeof source }>();

    source.forEach((item) => {
      const baseDate = dayjs(item.publishedAt || item.createdAt);
      const year = baseDate.format('YYYY');
      const ym = baseDate.format('YYYY-MM');
      const monthLabel = baseDate.format('MM 月');
      const groupKey = `${year}-${ym}`;

      const found = map.get(groupKey);
      if (found) {
        found.items.push(item);
        return;
      }

      map.set(groupKey, {
        ym,
        monthLabel,
        items: [item],
      });
    });

    const byYear = new Map<string, { ym: string; monthLabel: string; items: typeof source }[]>();

    map.forEach((group) => {
      const year = group.ym.slice(0, 4);
      const bucket = byYear.get(year);
      if (bucket) {
        bucket.push(group);
        return;
      }
      byYear.set(year, [group]);
    });

    return Array.from(byYear.entries())
      .sort(([left], [right]) => Number(right) - Number(left))
      .map(([year, months]) => ({
        year,
        months: months.sort((left, right) => right.ym.localeCompare(left.ym)),
      }));
  }, [data?.list]);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>归档</h1>
      {grouped.map((yearGroup) => (
        <section key={yearGroup.year} className={styles.yearSection}>
          <h2 className={styles.yearTitle}>{yearGroup.year}</h2>
          {yearGroup.months.map((monthGroup) => (
            <div key={monthGroup.ym} className={styles.monthGroup}>
              <h3 className={styles.monthTitle}>
                {monthGroup.monthLabel}
                <span>{monthGroup.items.length} 篇</span>
              </h3>
              <ul className={styles.list}>
                {monthGroup.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span>{dayjs(item.publishedAt || item.createdAt).format('YYYY-MM-DD')}</span>
                    <div className={styles.itemMain}>
                      <Link className={styles.postLink} to={`/post/${item.slug}`}>
                        {item.title}
                      </Link>
                      <div className={styles.itemMeta}>
                        {item.categorySlug ? (
                          <Link className={styles.metaLink} to={`/categories/${item.categorySlug}`}>
                            {item.categoryName}
                          </Link>
                        ) : null}
                        {item.tagItems.slice(0, 2).map((tag) => (
                          <Link key={tag.id} className={styles.metaLink} to={`/tags/${tag.slug}`}>
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}
