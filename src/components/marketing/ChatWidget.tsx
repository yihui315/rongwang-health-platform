'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const channels = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      href: 'https://wa.me/85212345678?text=你好，我想咨询荣旺健康的产品',
      label: 'WhatsApp 咨询',
    },
    {
      name: '微信',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.177l-.326-1.233a.49.49 0 01.177-.554C23.296 18.153 24 16.585 24 14.886c0-3.256-3.103-5.962-7.062-6.028zm-2.395 2.725c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.842 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700',
      href: '#wechat',
      label: '微信咨询',
      isWechat: true,
    },
    {
      name: '邮件',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      color: 'bg-teal-500 hover:bg-teal-600',
      href: 'mailto:support@rongwang.health?subject=产品咨询',
      label: '邮件咨询',
    },
  ];

  const [showWechatQR, setShowWechatQR] = useState(false);

  return (
    <>
      {/* 浮动按钮 */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* 展开的频道列表 */}
        {isOpen && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-5 duration-200">
            {channels.map((ch) => (
              <a
                key={ch.name}
                href={ch.isWechat ? undefined : ch.href}
                target={ch.isWechat ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={ch.isWechat ? (e) => { e.preventDefault(); setShowWechatQR(true); setIsOpen(false); } : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-white shadow-lg transition-all ${ch.color}`}
              >
                {ch.icon}
                <span className="text-sm font-medium whitespace-nowrap">{ch.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* 主按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-600 hover:bg-slate-700 rotate-45'
              : 'bg-teal-600 hover:bg-teal-700 animate-bounce-slow'
          }`}
          aria-label="联系客服"
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          )}
        </button>
      </div>

      {/* 微信二维码弹窗 */}
      {showWechatQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWechatQR(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <button
              onClick={() => setShowWechatQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <p className="text-sm text-slate-400">微信二维码<br />请替换为实际图片</p>
            </div>
            <h3 className="text-lg font-bold text-slate-900">扫码添加微信客服</h3>
            <p className="mt-1 text-sm text-slate-500">微信号: rongwang_health</p>
          </div>
        </div>
      )}
    </>
  );
}
