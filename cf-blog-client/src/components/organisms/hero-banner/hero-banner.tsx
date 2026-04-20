import { Link } from 'react-router-dom';

import styles from './hero-banner.module.css';

interface HeroBannerProps {
  featuredTitle?: string;
  featuredSlug?: string;
}

export function HeroBanner({
  featuredTitle = '欢迎来到 Narcissus 博客',
  featuredSlug = '',
}: HeroBannerProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.randomCard}>
        <div className={styles.randomTitle}>随便逛逛</div>
        <p className={styles.randomDesc}>保留旧站卡片化风格，支持随机文章引导。</p>
      </div>
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
