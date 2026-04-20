import { ConfigProvider, theme } from 'antd';

import { AppRouter } from '@/router/app-router';
import { useThemeStore } from '@/stores/theme-store';

function App() {
  const currentTheme = useThemeStore((state) => state.theme);

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentTheme === 'dark' ? '#f2b94b' : '#425aef',
        },
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
