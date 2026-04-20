import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { HeaderPopupNotice } from './header-popup-notice';

describe('HeaderPopupNotice', () => {
  it('应展示弹窗内容并支持关闭', () => {
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <HeaderPopupNotice
          notice={{
            enabled: true,
            title: '通知',
            message: '欢迎回来',
            ctaText: '查看详情',
            ctaLink: '/about',
            homeOnly: true,
          }}
          onClose={onClose}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('通知')).toBeInTheDocument();
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看详情' })).toHaveAttribute('href', '/about');

    fireEvent.click(screen.getByRole('button', { name: '关闭通知弹窗' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
