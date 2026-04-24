'use client';

import React, { useState } from 'react';

interface LeadCaptureModalProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 提交成功的回调 */
  onSubmit: (data: LeadData) => Promise<void>;
  /** 背景模糊层（默认true） */
  backdrop?: boolean;
}

export interface LeadData {
  name: string;
  phone: string;
  wechatId?: string;
  /** 保留答题结果 */
  quizAnswers?: Array<{ questionId: number; answer: string }>;
  recommendations?: string[];
  aiSummary?: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  backdrop = true,
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 11) return false;
    setPhone(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请填写您的称呼');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('请填写正确的手机号');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, phone, wechatId: wechatId.trim() || undefined });
    } catch {
      setError('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6 text-center">
            <div className="text-4xl mb-2">🎁</div>
            <h2 className="text-xl font-bold text-white">解锁完整报告</h2>
            <p className="text-orange-100 text-sm mt-1">
              填写信息，获取你的个性化AI健康方案
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                您的称呼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：张先生 / 李小姐"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => validatePhone(e.target.value)}
                placeholder="用于接收健康方案和顾问联系"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                maxLength={11}
              />
              <p className="text-xs text-slate-400 mt-1">手机号仅用于健康顾问联系，不会用于营销短信</p>
            </div>

            {/* WeChat ID (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                微信号 <span className="text-slate-400 font-normal">(选填)</span>
              </label>
              <input
                type="text"
                value={wechatId}
                onChange={(e) => setWechatId(e.target.value)}
                placeholder="方便顾问直接添加你微信"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中...
                </span>
              ) : (
                '解锁完整AI健康报告'
              )}
            </button>

            {/* Privacy note */}
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              提交即表示同意《隐私政策》，你的信息仅用于健康顾问联系，不会泄露给第三方
            </p>
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition-colors"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}
