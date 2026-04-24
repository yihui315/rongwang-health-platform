'use client';

import React from 'react';

interface WeChatCTAProps {
  /** 微信公众号客服二维码图片URL */
  qrCodeUrl?: string;
  /** 微信公众号ID（用于网页版跳转） */
  wechatId?: string;
  /** 自定义文案 */
  title?: string;
  description?: string;
  /** 是否显示为卡片模式（带背景） */
  cardMode?: boolean;
}

const DEFAULT_WECHAT_ID = 'rongwanghealth';
const DEFAULT_QR_URL = '';

export default function WeChatCTA({
  qrCodeUrl,
  wechatId = DEFAULT_WECHAT_ID,
  title = '添加健康顾问',
  description = '扫码领取你的专属健康方案，1对1指导',
  cardMode = true,
}: WeChatCTAProps) {
  const wechatUrl = `https://u.wechat.com/E/${wechatId}`;

  const content = (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="relative">
        <div className="w-44 h-44 rounded-2xl border-2 border-orange-200 bg-white flex items-center justify-center overflow-hidden shadow-md">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt="微信客服二维码"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm font-medium text-slate-700">微信客服</p>
              <p className="text-xs text-slate-500 mt-1">{wechatId}</p>
            </div>
          )}
        </div>
        {/* Animated ring */}
        <div className="absolute -inset-1 rounded-2xl border-2 border-orange-300 animate-pulse opacity-50" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-semibold text-slate-900 text-base">{title}</p>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {/* WeChat ID display */}
      {wechatId && !qrCodeUrl && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2">
          <span className="text-lg">💬</span>
          <span className="text-sm font-mono text-slate-600">{wechatId}</span>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(wechatId);
              }
            }}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            title="复制微信号"
          >
            复制
          </button>
        </div>
      )}

      {/* Web WeChat link (opens in browser) */}
      {wechatId && (
        <a
          href={wechatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
        >
          在微信中打开 →
        </a>
      )}
    </div>
  );

  if (!cardMode) return content;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6">
      {content}
    </div>
  );
}
