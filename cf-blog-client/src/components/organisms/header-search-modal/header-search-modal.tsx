import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './header-search-modal.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

interface HeaderSearchModalProps {
  isOpen: boolean;
  keyword: string;
  onClose: () => void;
  onKeywordChange: (value: string) => void;
  onViewMore?: (value: string) => void;
}

export function HeaderSearchModal({
  isOpen,
  keyword,
  onClose,
  onKeywordChange,
  onViewMore,
}: HeaderSearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setDebouncedKeyword('');
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedKeyword(trimmedKeyword);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [keyword]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const { data, isFetching } = useQuery({
    queryKey: ['header-search', debouncedKeyword],
    queryFn: () =>
      articlesService.searchPublic({
        keyword: debouncedKeyword,
        page: 1,
        pageSize: 5,
      }),
    enabled: isOpen && debouncedKeyword.length >= 2,
    retry: false,
  });

  if (!isOpen) {
    return null;
  }

  const shouldShowResults = debouncedKeyword.length >= 2;
  const resultList = data?.list ?? [];

  const renderHighlightedTitle = (title: string): (string | JSX.Element)[] => {
    const normalizedKeyword = debouncedKeyword.trim();
    if (!normalizedKeyword) {
      return [title];
    }

    const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matchPattern = new RegExp(`(${escapedKeyword})`, 'ig');
    const parts = title.split(matchPattern);

    return parts
      .filter((part) => part.length > 0)
      .map((part, index) =>
        part.toLowerCase() === normalizedKeyword.toLowerCase() ? (
          <mark key={`${title}-${index}`} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        ),
      );
  };

  const getArticleDateText = (item: {
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createDate?: string;
    updateDate?: string;
  }): string => {
    const dateValue =
      item.publishedAt || item.createdAt || item.updatedAt || item.createDate || item.updateDate || '';
    return dateValue ? String(dateValue).slice(0, 10) : '未知日期';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>搜索</span>
            <span className={styles.subtitle}>搜索文章、摘要和正文</span>
          </div>
          <button aria-label="关闭搜索弹窗" className={styles.closeButton} onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <div className={styles.searchBox}>
          <SearchOutlined />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="请输入搜索关键词"
            type="text"
            value={keyword}
            onChange={(event) => {
              onKeywordChange(event.target.value);
            }}
          />
        </div>

        <div className={styles.content}>
          {!shouldShowResults ? <div className={styles.state}>请输入至少 2 个字符开始搜索。</div> : null}
          {shouldShowResults && isFetching ? <div className={styles.state}>搜索中...</div> : null}
          {shouldShowResults && !isFetching && resultList.length === 0 ? (
            <div className={styles.state}>未找到相关文章，请换个关键词。</div>
          ) : null}
          {resultList.length > 0 ? (
            <div className={styles.results}>
              {resultList.map((item) => (
                <Link
                  key={item.id}
                  className={styles.resultItem}
                  to={`/post/${item.slug}`}
                  onClick={onClose}
                >
                  <span className={styles.resultTitle}>{renderHighlightedTitle(item.title)}</span>
                  <span className={styles.resultMeta}>
                    {item.categoryName || '未分类'} · {getArticleDateText(item)}
                  </span>
                  <span className={styles.resultExcerpt}>{item.excerpt || '这篇文章暂无摘要。'}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.footer}>
          <button
            aria-label="查看更多结果"
            className={styles.viewMoreButton}
            disabled={!keyword.trim()}
            type="button"
            onClick={() => {
              onViewMore?.(keyword);
            }}
          >
            查看更多结果
          </button>
        </div>
      </div>
    </div>
  );
}
