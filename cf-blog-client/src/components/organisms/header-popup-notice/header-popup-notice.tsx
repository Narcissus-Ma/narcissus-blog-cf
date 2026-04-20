import type { PopupNoticeSetting } from '@narcissus/shared';
import { Link } from 'react-router-dom';

import styles from './header-popup-notice.module.css';

interface HeaderPopupNoticeProps {
  notice: PopupNoticeSetting;
  onClose: () => void;
}

export function HeaderPopupNotice({ notice, onClose }: HeaderPopupNoticeProps) {
  if (!notice.enabled) {
    return null;
  }

  return (
    <aside className={styles.notice}>
      <div className={styles.header}>
        <span className={styles.badge}>{notice.title}</span>
        <button aria-label="关闭通知弹窗" className={styles.closeButton} type="button" onClick={onClose}>
          关闭
        </button>
      </div>
      <p className={styles.message}>{notice.message}</p>
      <Link className={styles.link} to={notice.ctaLink} onClick={onClose}>
        {notice.ctaText}
      </Link>
    </aside>
  );
}
