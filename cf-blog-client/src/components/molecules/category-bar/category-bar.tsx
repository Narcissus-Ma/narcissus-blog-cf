import { Link, NavLink } from 'react-router-dom';

import styles from './category-bar.module.css';

export interface CategoryBarItem {
  name: string;
  path: string;
}

interface CategoryBarProps {
  items: CategoryBarItem[];
}

export function CategoryBar({ items }: CategoryBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        <NavLink
          className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
          to="/"
        >
          首页
        </NavLink>
        {items.map((item) => (
          <NavLink
            key={item.path}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
            to={item.path}
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      <Link className={styles.more} to="/categories">
        更多
      </Link>
    </div>
  );
}
