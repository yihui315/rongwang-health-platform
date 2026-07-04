"use client";

import React, { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with email collection backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 max-w-md mx-auto text-center">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-emerald-700 font-semibold">✓ 订阅成功</p>
          <p className="text-sm text-emerald-600 mt-1">我们已将优惠信息发送到您的邮箱，请注意查收。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-md mx-auto">
      <p className="text-sm text-slate-500 mb-2">关注公众号，获取专属优惠和健康资讯</p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="输入邮箱，领取9折券"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-[var(--teal)] hover:bg-[var(--teal-dark)] text-white text-sm font-semibold rounded-lg transition"
        >
          领取
        </button>
      </form>
    </div>
  );
}
