/**
 * 隐私政策頁面
 * 符合香港《個人資料（私隱）條例》
 */

export const metadata = {
  title: "隱私政策 | 荣旺健康",
  description: "香港榮旺健康科技有限公司隱私政策，了解我們如何收集、使用及保護您的個人資料。",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">隱私政策</h1>
      <p className="text-sm text-slate-500 mb-10">最後更新日期：2026 年 4 月 9 日</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">一、概述</h2>
          <p className="text-slate-700 leading-relaxed">
            香港榮旺健康科技有限公司（以下簡稱「我們」或「榮旺健康」）深知個人資料對您的重要性，
            並會盡力保護您的私隱。本隱私政策說明我們在您使用本網站及相關服務時，
            如何收集、使用、儲存、分享及保護您的個人資料，
            適用於香港特別行政區《個人資料（私隱）條例》（第 486 章）的規定。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">二、我們收集的資料</h2>
          <p className="text-slate-700 leading-relaxed mb-3">當您使用我們的服務時，我們可能收集以下資料：</p>
          <p className="text-slate-700 leading-relaxed">
            <strong>帳戶資料：</strong>姓名、電郵地址、電話號碼、送貨地址。
            <strong>健康問卷資料：</strong>您在 AI 健康檢測問卷中提供的健康相關資訊，用於生成個性化營養建議。
            <strong>交易資料：</strong>訂單記錄、付款資訊（我們不直接儲存完整信用卡號碼，付款由 Stripe 安全處理）。
            <strong>使用資料：</strong>瀏覽紀錄、頁面互動、設備資訊、IP 地址（透過 Google Analytics 及 Plausible 收集）。
            <strong>通訊資料：</strong>您透過客服系統或電郵與我們的對話內容。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">三、資料使用目的</h2>
          <p className="text-slate-700 leading-relaxed">
            我們使用您的資料用於以下目的：處理及配送訂單；透過 AI 系統提供個性化健康方案推薦；
            發送訂單確認、配送通知及服務更新；改善網站功能及用戶體驗；
            在您同意的情況下，發送營銷資訊及優惠通知；遵守法律法規要求。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">四、Cookie 政策</h2>
          <p className="text-slate-700 leading-relaxed">
            我們使用 Cookie 及類似追蹤技術來改善您的瀏覽體驗。必要性 Cookie 用於維持網站基本功能（如購物車、登入狀態）；
            分析性 Cookie（Google Analytics、Plausible）用於了解用戶如何使用我們的網站；
            營銷 Cookie 用於提供個性化廣告和推薦。您可以透過瀏覽器設定管理或刪除 Cookie。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">五、資料共享與轉移</h2>
          <p className="text-slate-700 leading-relaxed">
            我們不會出售您的個人資料。我們可能在以下情況分享您的資料：
            支付處理商（Stripe）處理付款交易；物流合作夥伴配送訂單；
            雲端服務供應商（Supabase、Cloudflare）託管數據；
            法律要求或政府機關的合法要求。跨境數據轉移將按照香港私隱條例的規定進行。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">六、資料保留</h2>
          <p className="text-slate-700 leading-relaxed">
            我們會在實現收集目的所需的期間內保留您的個人資料。帳戶資料在帳戶有效期內保留；
            交易資料保留 7 年（按稅務法規要求）；健康問卷資料在您刪除帳戶後 30 天內銷毀；
            分析數據以匿名形式保留。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">七、您的權利</h2>
          <p className="text-slate-700 leading-relaxed">
            根據香港《個人資料（私隱）條例》，您有權：查閱我們持有的您的個人資料；
            要求更正不準確的資料；要求刪除您的個人資料；撤回對營銷通訊的同意；
            就我們的資料處理方式向個人資料私隱專員公署投訴。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">八、資料安全</h2>
          <p className="text-slate-700 leading-relaxed">
            我們採用行業標準的安全措施保護您的資料，包括 SSL/TLS 加密傳輸、
            定期安全審計、存取權限控制及數據加密儲存。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">九、聯繫我們</h2>
          <p className="text-slate-700 leading-relaxed">
            如您對本隱私政策有任何疑問，或希望行使您的資料權利，請透過以下方式聯繫我們的資料保護主任：
          </p>
          <p className="text-slate-700 mt-2">
            電郵：privacy@rongwang.health<br />
            地址：香港九龍觀塘觀塘道 388 號<br />
            香港榮旺健康科技有限公司 · 隱私事務部
          </p>
        </section>
      </div>
    </main>
  );
}
