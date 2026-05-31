'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      router.push(searchParams.get('next') || '/workspace');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="lead-form-card lead-form-compact" onSubmit={handleSubmit}>
      <label>
        <span>管理员令牌</span>
        <input
          id="admin-token"
          name="token"
          aria-label="管理员令牌"
          autoComplete="current-password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          type="password"
        />
      </label>
      <button className="simple-page-button" type="submit" disabled={submitting}>
        {submitting ? '验证中...' : '进入工作台'}
      </button>
      {message ? <p className="lead-form-message">{message}</p> : null}
    </form>
  );
}
