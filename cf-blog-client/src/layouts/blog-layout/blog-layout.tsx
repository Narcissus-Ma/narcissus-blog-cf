import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import styles from './blog-layout.module.css';

import { ClickEffect } from '@/components/atoms/click-effect/click-effect';
import { Loading } from '@/components/atoms/loading/loading';
import { UniverseEffect } from '@/components/atoms/universe-effect/universe-effect';
import { Footer } from '@/components/organisms/footer/footer';
import { HeaderNav } from '@/components/organisms/header-nav/header-nav';
import { HeaderPopupNotice } from '@/components/organisms/header-popup-notice/header-popup-notice';
import { useInitTheme } from '@/hooks/use-init-theme';
import { useSiteBootstrap } from '@/hooks/use-site-bootstrap';
import { useSiteStore } from '@/stores/site-store';
import { useThemeStore } from '@/stores/theme-store';

export function BlogLayout() {
  useInitTheme();
  useSiteBootstrap();
  const location = useLocation();
  const theme = useThemeStore((state) => state.theme);
  const popupNotice = useSiteStore((state) => state.popupNotice);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);

  const shouldShowPopup = useMemo(() => {
    if (isPopupDismissed || !popupNotice.enabled) {
      return false;
    }

    if (!popupNotice.homeOnly) {
      return true;
    }

    return location.pathname === '/';
  }, [isPopupDismissed, location.pathname, popupNotice]);

  return (
    <div className={styles.page}>
      <Loading />
      <UniverseEffect isDarkMode={theme === 'dark'} />
      <ClickEffect type="fireworks" />
      <HeaderNav />
      <main className={styles.main}>
        <Outlet />
      </main>
      {location.pathname === '/' && <Footer />}
      {shouldShowPopup ? (
        <HeaderPopupNotice
          notice={popupNotice}
          onClose={() => {
            setIsPopupDismissed(true);
          }}
        />
      ) : null}
    </div>
  );
}
