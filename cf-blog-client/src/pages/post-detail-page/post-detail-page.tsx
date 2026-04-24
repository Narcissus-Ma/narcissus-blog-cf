import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import styles from './post-detail-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

interface TocItem {
  id: string;
  level: number;
  text: string;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '未知时间';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '未知时间';
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function toHeadingSlug(text: string, index: number) {
  const normalized = text
    .toLowerCase()
    .replace(/[`~!@#$%^&*()+=[\]{};:'",.<>/?\\|]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return normalized ? `toc-${normalized}-${index}` : `toc-section-${index}`;
}

function extractToc(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const list: TocItem[] = [];
  let index = 0;

  for (const match of content.matchAll(headingRegex)) {
    const hashes = match[1] ?? '';
    const text = (match[2] ?? '').trim();
    const level = hashes.length;
    index += 1;
    list.push({
      id: toHeadingSlug(text, index),
      level,
      text,
    });
  }

  return list;
}

export function PostDetailPage() {
  const { slug = '' } = useParams();
  const [copied, setCopied] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post-detail', slug],
    queryFn: () => articlesService.getPublicDetail(slug),
    enabled: Boolean(slug),
  });
  const { data: recommendationList = [] } = useQuery({
    queryKey: ['post-recommendations', slug],
    queryFn: () => articlesService.getRecommendations(slug, 3),
    enabled: Boolean(slug),
  });

  const toc = useMemo(() => extractToc(data?.content ?? ''), [data?.content]);

  const markdownComponents = useMemo(() => {
    let cursor = 0;

    const pickId = () => {
      const target = toc[cursor];
      cursor += 1;
      return target?.id ?? `toc-fallback-${cursor}`;
    };

    const createHeading = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') =>
      function Heading({ children }: { children?: ReactNode }) {
        return <Tag id={pickId()}>{children}</Tag>;
      };

    const components: Components = {
      h1: createHeading('h1'),
      h2: createHeading('h2'),
      h3: createHeading('h3'),
      h4: createHeading('h4'),
      h5: createHeading('h5'),
      h6: createHeading('h6'),
    };

    return components;
  }, [toc]);

  useEffect(() => {
    if (toc.length === 0) {
      setActiveTocId('');
      return;
    }

    setActiveTocId(toc[0].id);
  }, [toc]);

  useEffect(() => {
    if (toc.length === 0) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const headingElements = toc
      .map((item) => document.getElementById(item.id))
      .filter((item): item is HTMLElement => Boolean(item));

    if (headingElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          const topVisibleHeading = visibleEntries[0].target.id;
          setActiveTocId(topVisibleHeading);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0.2, 0.5, 1],
      },
    );

    headingElements.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [toc, data?.content]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const articleElement = document.querySelector<HTMLElement>(`.${styles.article}`);
      if (!articleElement) {
        return;
      }

      const rect = articleElement.getBoundingClientRect();
      const articleHeight = articleElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const totalScrollableDistance = Math.max(articleHeight - viewportHeight, 1);
      const passedDistance = Math.min(
        Math.max(window.scrollY - (window.scrollY + rect.top), 0),
        totalScrollableDistance,
      );

      const nextProgress = Math.round((passedDistance / totalScrollableDistance) * 100);
      setReadingProgress(Math.max(0, Math.min(100, nextProgress)));
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);

    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, [data?.id]);

  if (isLoading) {
    return <div className={styles.state}>文章加载中...</div>;
  }

  if (isError || !data) {
    return <div className={styles.state}>文章不存在或已下线。</div>;
  }

  const copyCurrentLink = async () => {
    try {
      const link = window.location.href;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const shareCurrentPost = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.excerpt,
          url: window.location.href,
        });
        return;
      }

      await copyCurrentLink();
    } catch {
      await copyCurrentLink();
    }
  };

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{data.title}</h1>
          <div className={styles.meta}>
            <span>发布于：{formatDateTime(data.publishedAt || data.createdAt)}</span>
            <span>更新于：{formatDateTime(data.updatedAt)}</span>
          </div>
          <div className={styles.meta}>
            <span>分类：</span>
            {data.categorySlug ? (
              <Link className={styles.metaLink} to={`/categories/${data.categorySlug}`}>
                {data.categoryName || '未分类'}
              </Link>
            ) : (
              <span>{data.categoryName || '未分类'}</span>
            )}
          </div>
          <div className={styles.meta}>
            <span>标签：</span>
            {data.tagItems.length > 0 ? (
              data.tagItems.map((item) => (
                <Link key={item.id} className={styles.metaLink} to={`/tags/${item.slug}`}>
                  #{item.name}
                </Link>
              ))
            ) : (
              <span>无标签</span>
            )}
          </div>
        </header>
        <section className={styles.markdown}>
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {data.content}
          </ReactMarkdown>
        </section>
        <footer className={styles.footer}>
          <div className={styles.shareWrap}>
            <button className={styles.shareButton} type="button" onClick={shareCurrentPost}>
              分享文章
            </button>
            <button className={styles.shareButton} type="button" onClick={copyCurrentLink}>
              复制链接
            </button>
            <span className={styles.shareState}>{copied ? '链接已复制' : '可直接分享给朋友'}</span>
          </div>
          <section className={styles.recommendWrap}>
            <h2 className={styles.recommendTitle}>推荐阅读</h2>
            {recommendationList.length === 0 ? (
              <p className={styles.recommendEmpty}>当前暂无推荐文章。</p>
            ) : (
              <ul className={styles.recommendList}>
                {recommendationList.map((item) => (
                  <li key={item.id}>
                    <Link className={styles.recommendLink} to={`/post/${item.slug}`}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className={styles.neighbors}>
            {data.prevPost ? (
              <Link className={styles.neighborLink} to={`/post/${data.prevPost.slug}`}>
                上一篇：{data.prevPost.title}
              </Link>
            ) : (
              <span className={styles.neighborText}>上一篇：已经是第一篇</span>
            )}
            {data.nextPost ? (
              <Link className={styles.neighborLink} to={`/post/${data.nextPost.slug}`}>
                下一篇：{data.nextPost.title}
              </Link>
            ) : (
              <span className={styles.neighborText}>下一篇：已经是最后一篇</span>
            )}
          </div>
        </footer>
      </article>

      <button
        className={styles.mobileTocButton}
        type="button"
        onClick={() => setIsMobileTocOpen((prev) => !prev)}
      >
        目录（{readingProgress}%）
      </button>

      <aside className={styles.tocPanel}>
        <div className={styles.tocHead}>
          <h2 className={styles.tocTitle}>目录</h2>
          <span className={styles.tocProgress}>阅读进度 {readingProgress}%</span>
        </div>
        {toc.length === 0 ? <p className={styles.tocEmpty}>当前文章没有可用目录。</p> : null}
        <ul className={`${styles.tocList} ${isMobileTocOpen ? styles.tocListOpen : ''}`}>
          {toc.map((item) => (
            <li key={item.id}>
              <a
                className={`${styles.tocLink} ${activeTocId === item.id ? styles.tocLinkActive : ''}`}
                href={`#${item.id}`}
                style={{ paddingLeft: `${(item.level - 1) * 10}px` }}
                aria-current={activeTocId === item.id ? 'true' : undefined}
                onClick={() => {
                  setActiveTocId(item.id);
                  setIsMobileTocOpen(false);
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
