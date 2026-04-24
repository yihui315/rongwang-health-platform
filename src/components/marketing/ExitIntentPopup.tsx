'use client';

import { useState, useEffect, useCallback } from 'react';
import NewsletterSignup from './NewsletterSignup';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showPopup = useCallback(() => {
    // 只显示一次，且不在已关闭的情况下再次显示
    if (dismissed) return;

    // 检查是否在本次会话中已经关闭过
    try {
      const lastDismissed = sessionStorage.getItem('rw_exit_popup_dismissed');
      if (lastDismissed) return;
    } catch {}

    setIsVisible(true);
  }, [dismissed]);

  useEffect(() => {
    // 检查是否已经关闭过
    try {
      if (sessionStorage.getItem('rw_exit_popup_dismissed')) {
        setDismissed(true);
        return;
      }
    } catch {}

    // 退出意图检测：鼠标移出视窗上方
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // 移动端：页面不活跃时（切换标签页）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 延迟显示，避免用户快速切换时打扰
        setTimeout(() => {
          if (document.visibilityState === 'hidden') return;
          showPopup();
        }, 500);
      }
    };

    // 延迟5秒后才开始监听，避免用户刚进来就弹窗
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showPopup]);

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem('rw_exit_popup_dismissed', '1');
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="关闭"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 顶部图标 */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>

        {/* 优惠提示 */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-3">
            限时福利
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            别急着走！送你一份专属优惠
          </h3>
          <p className="text-sm text-slate-500">
            订阅健康资讯，立享新人 <span className="text-teal-600 font-bold">9折优惠券</span>
          </p>
        </div>

        {/* 邮件订阅表单 */}
        <NewsletterSignup variant="popup" onSuccess={handleClose} />
      </div>
    </div>
  );
}
