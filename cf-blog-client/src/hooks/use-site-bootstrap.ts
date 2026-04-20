import { useEffect } from 'react';
import type { SiteSetting } from '@narcissus/shared';

import { siteService } from '@/features/site/services/site-service';
import { useSiteStore } from '@/stores/site-store';

let siteSettingPromise: Promise<SiteSetting> | null = null;

function getPublicSiteSettingOnce(): Promise<SiteSetting> {
  if (!siteSettingPromise) {
    siteSettingPromise = siteService.getPublicSiteSetting().catch((error) => {
      // 请求失败时释放缓存，后续页面可重试。
      siteSettingPromise = null;
      throw error;
    });
  }

  return siteSettingPromise;
}

export function useSiteBootstrap() {
  const setSiteConfig = useSiteStore((state) => state.setSiteConfig);

  useEffect(() => {
    let canceled = false;

    getPublicSiteSettingOnce()
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
