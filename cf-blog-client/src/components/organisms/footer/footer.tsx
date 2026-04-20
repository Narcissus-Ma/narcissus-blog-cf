import { Link } from 'react-router-dom';

import styles from './footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.left}>
            <p className={styles.copyright}>
              © {currentYear} <Link to="/">Narcissus Blog</Link>. All rights reserved.
            </p>
          </div>
          <div className={styles.right}>
            <div className={styles.links}>
              <Link to="/">首页</Link>
              <span className={styles.separator}>|</span>
              <Link to="/archives">归档</Link>
              <span className={styles.separator}>|</span>
              <Link to="/categories">分类</Link>
              <span className={styles.separator}>|</span>
              <Link to="/tags">标签</Link>
              <span className={styles.separator}>|</span>
              <Link to="/about">关于</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
