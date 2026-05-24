import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  normalizeRedirectPath,
  verifyWorkspaceSessionToken,
  WORKSPACE_SESSION_COOKIE,
} from '@/src/lib/auth/session';

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeRedirectPath(firstSearchValue(params.next));
  const error = firstSearchValue(params.error);
  const loggedOut = firstSearchValue(params.loggedOut);
  const cookieStore = await cookies();
  const session = await verifyWorkspaceSessionToken(cookieStore.get(WORKSPACE_SESSION_COOKIE)?.value);

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="login-eyebrow">Workspace Access</p>
        <h1>运营工作台登录</h1>
        <p className="login-copy">
          工作台用于商品导入、内容生成和合规预检。请使用发布环境配置的运营账号登录。
        </p>

        {session ? (
          <div className="login-state">
            <p>已登录：{session.email}</p>
            <div className="login-actions">
              <Link className="login-primary-link" href={nextPath}>
                进入工作台
              </Link>
              <form method="post" action="/api/auth/logout">
                <button type="submit">退出登录</button>
              </form>
            </div>
          </div>
        ) : (
          <form className="login-form" method="post" action="/api/auth/login">
            <input type="hidden" name="next" value={nextPath} />
            <label>
              <span>邮箱</span>
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label>
              <span>密码</span>
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {error === 'invalid' ? <p className="login-error">账号或密码不正确，请检查后重试。</p> : null}
            {loggedOut === '1' ? <p className="login-success">已退出登录。</p> : null}
            <button type="submit">登录并进入工作台</button>
          </form>
        )}
      </section>
    </main>
  );
}
