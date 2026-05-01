"use client";

import { useState } from "react";

const channels = [
  {
    name: "WhatsApp",
    href: "https://wa.me/85212345678?text=你好，我想咨询荣旺健康AI评估和产品方案",
    label: "WhatsApp咨询",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    name: "Email",
    href: "mailto:support@rongwang.health?subject=荣旺健康咨询",
    label: "邮件咨询",
    color: "bg-[var(--teal)] hover:bg-[var(--teal-dark)]",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWechatQR, setShowWechatQR] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 sm:right-6">
        {isOpen ? (
          <div className="flex flex-col gap-2">
            {channels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target={channel.name === "WhatsApp" ? "_blank" : undefined}
                rel={channel.name === "WhatsApp" ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-md ${channel.color}`}
              >
                {channel.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowWechatQR(true);
                setIsOpen(false);
              }}
              className="rounded-lg bg-[#1aad19] px-4 py-2.5 text-left text-sm font-medium text-white shadow-md hover:bg-[#148914]"
            >
              微信咨询
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={`flex h-14 w-14 items-center justify-center rounded-lg shadow-md ${
            isOpen ? "bg-[var(--surface-strong)]" : "bg-[var(--teal)] hover:bg-[var(--teal-dark)]"
          }`}
          aria-label={isOpen ? "关闭客服入口" : "打开客服入口"}
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M8 10h8M8 14h5m8-2a8 8 0 0 1-11.9 7L4 20l1.2-4A8 8 0 1 1 21 12Z"
              />
            )}
          </svg>
        </button>
      </div>

      {showWechatQR ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="关闭微信二维码"
            className="absolute inset-0 bg-black/45"
            onClick={() => setShowWechatQR(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-[var(--surface)] p-7 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowWechatQR(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="关闭"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                微信二维码
                <br />
                待替换为实际图片
              </p>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">扫码添加微信客服</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">微信号：rongwang_health</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
