import { Link } from 'react-router-dom';

import styles from './not-found-page.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1>404</h1>
      <p>页面不存在，可能已经被移动或删除。</p>
      <Link to="/">返回首页</Link>
    </section>
  );
}
