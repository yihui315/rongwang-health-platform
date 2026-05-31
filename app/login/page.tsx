import { Suspense } from 'react';

import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="simple-page">
      <section className="simple-page-card">
        <p className="simple-page-eyebrow">Admin</p>
        <h1>运营工作台登录</h1>
        <p>请输入管理员访问令牌后继续。公开页面不需要登录。</p>
        <Suspense
          fallback={
            <div className="lead-form-card lead-form-compact">
              <p className="lead-form-hint">登录表单加载中...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
