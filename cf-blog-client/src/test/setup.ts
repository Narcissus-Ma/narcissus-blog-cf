import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
        // 兼容旧版 API，无需实现
      },
      removeListener: () => {
        // 兼容旧版 API，无需实现
      },
      addEventListener: () => {
        // 测试环境占位实现
      },
      removeEventListener: () => {
        // 测试环境占位实现
      },
      dispatchEvent: () => false,
    }),
  });
}
