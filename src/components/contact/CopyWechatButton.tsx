'use client';

import { useState } from 'react';

import { contactChannels } from '@/src/lib/contact/contact-channels';

export default function CopyWechatButton() {
  const [message, setMessage] = useState('');

  async function copyWechatId() {
    try {
      await navigator.clipboard.writeText(contactChannels.wechatId);
      setMessage(`已复制微信号：${contactChannels.wechatId}`);
    } catch {
      setMessage(`请手动复制：${contactChannels.wechatId}`);
    }

    window.setTimeout(() => setMessage(''), 3200);
  }

  return (
    <div className="wechat-copy-action">
      <button type="button" onClick={copyWechatId} data-wechat-copy-button="true">
        {contactChannels.wechatCopyText}
      </button>
      <span aria-live="polite">{message}</span>
    </div>
  );
}
