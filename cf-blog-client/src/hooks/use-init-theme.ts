import { useEffect } from 'react';

import { useThemeStore } from '@/stores/theme-store';

export function useInitTheme() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
