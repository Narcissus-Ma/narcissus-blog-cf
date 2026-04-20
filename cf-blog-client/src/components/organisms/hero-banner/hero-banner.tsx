import { message } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import styles from './hero-banner.module.css';

import { articlesService } from '@/features/articles/services/articles-service';

interface HeroBannerProps {
  featuredTitle?: string;
  featuredSlug?: string;
}

export function HeroBanner({
  featuredTitle = '欢迎来到 Narcissus 博客',
  featuredSlug = '',
}: HeroBannerProps) {
  const navigate = useNavigate();
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  const handleRandomClick = async () => {
    if (isRandomLoading) {
      return;
    }

    setIsRandomLoading(true);
    try {
      const result = await articlesService.getRandomPublicArticle();
      navigate(`/post/${result.slug}`);
    } catch {
      message.warning('暂时没有可跳转的已发布文章');
    } finally {
      setIsRandomLoading(false);
    }
  };

  return (
    <section className={styles.hero}>
      <button
        className={styles.randomCard}
        disabled={isRandomLoading}
        type="button"
        onClick={() => {
          void handleRandomClick();
        }}
      >
        <div className={styles.randomTitle}>随便逛逛</div>
        <p className={styles.randomDesc}>保留旧站卡片化风格，支持随机文章引导。</p>
      </button>
      <div className={styles.featuredCard}>
        <div>
          <div className={styles.featuredTips}>推荐阅读</div>
          <h2 className={styles.featuredTitle}>{featuredTitle}</h2>
        </div>
        <Link className={styles.cta} to={featuredSlug ? `/post/${featuredSlug}` : '/archives'}>
          查看详情
        </Link>
      </div>
    </section>
  );
}
