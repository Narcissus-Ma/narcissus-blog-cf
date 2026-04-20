import type { PopupNoticeSetting } from '@narcissus/shared';
import { create } from 'zustand';

interface NavItem {
  name: string;
  path: string;
}

interface SiteStore {
  siteName: string;
  siteDescription: string;
  navItems: NavItem[];
  popupNotice: PopupNoticeSetting;
  setSiteConfig: (payload: {
    siteName: string;
    siteDescription: string;
    navItems: NavItem[];
    popupNotice: PopupNoticeSetting;
  }) => void;
}

export const useSiteStore = create<SiteStore>((set) => ({
  siteName: 'Narcissus的个人博客',
  siteDescription: '分享一些程序员开发，生活学习记录',
  navItems: [
    { name: '隧道', path: '/archives' },
    { name: '分类', path: '/categories' },
    { name: '标签', path: '/tags' },
  ],
  popupNotice: {
    enabled: false,
    title: '通知',
    message: '你好呀',
    ctaText: '查看更多',
    ctaLink: '/about',
    homeOnly: true,
  },
  setSiteConfig(payload) {
    set(payload);
  },
}));
