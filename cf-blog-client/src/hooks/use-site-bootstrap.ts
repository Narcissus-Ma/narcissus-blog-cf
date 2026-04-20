import { useEffect } from 'react';

import { siteService } from '@/features/site/services/site-service';
import { useSiteStore } from '@/stores/site-store';

export function useSiteBootstrap() {
  const setSiteConfig = useSiteStore((state) => state.setSiteConfig);

  useEffect(() => {
    let canceled = false;

    siteService
      .getPublicSiteSetting()
      .then((setting) => {
        if (canceled) {
          return;
        }

        setSiteConfig({
          siteName: setting.siteName,
          siteDescription: setting.siteDescription,
          navItems: setting.navItems,
          popupNotice: setting.popupNotice,
        });
      })
      .catch(() => {
        // 接口失败时保留本地默认站点配置
      });

    return () => {
      canceled = true;
    };
  }, [setSiteConfig]);
}
