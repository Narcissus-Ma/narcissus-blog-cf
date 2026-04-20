import {
  AppstoreOutlined,
  FileTextOutlined,
  PictureOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import styles from './admin-dashboard-page.module.css';

const QUICK_LINKS = [
  {
    title: '文章管理',
    path: '/admin/articles',
    icon: <FileTextOutlined />,
    desc: '创建与发布文章',
  },
  {
    title: '分类管理',
    path: '/admin/categories',
    icon: <AppstoreOutlined />,
    desc: '维护文章分类',
  },
  { title: '标签管理', path: '/admin/tags', icon: <TagsOutlined />, desc: '维护文章标签' },
  { title: '媒体资源', path: '/admin/media', icon: <PictureOutlined />, desc: '上传与管理素材' },
  {
    title: '站点设置',
    path: '/admin/settings',
    icon: <SettingOutlined />,
    desc: '导航与 SEO 配置',
  },
];

export function AdminDashboardPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>后台工作台</h1>
        <p>从下方入口进入对应功能模块。</p>
      </div>

      <div className={styles.grid}>
        {QUICK_LINKS.map((item) => (
          <Link key={item.path} className={styles.card} to={item.path}>
            <span className={styles.icon}>{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
