/**
 * 服務條款頁面
 */

export const metadata = {
  title: "服務條款 | 荣旺健康",
  description: "香港榮旺健康科技有限公司服務條款，包括購買條件、退款政策及免責聲明。",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">服務條款</h1>
      <p className="text-sm text-slate-500 mb-10">最後更新日期：2026 年 4 月 9 日</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">一、接受條款</h2>
          <p className="text-slate-700 leading-relaxed">
            歡迎使用香港榮旺健康科技有限公司（以下簡稱「榮旺健康」）提供的網站及服務。
            當您訪問本網站、註冊帳戶或下單購買時，即表示您同意遵守本服務條款。
            如您不同意本條款的任何部分，請勿使用本網站。
            本條款受香港特別行政區法律管轄。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">二、產品說明與免責</h2>
          <p className="text-slate-700 leading-relaxed">
            本網站銷售的所有產品均為膳食補充劑（保健品），並非藥品。
            產品資訊僅供參考，不構成醫療建議、診斷或治療方案。
            AI 健康檢測結果及營養方案推薦僅供參考，不能替代專業醫療意見。
            如您正在服藥、懷孕、哺乳或有已知健康狀況，請在使用任何產品前諮詢醫生。
            產品效果因人而異，我們不保證特定的健康效果。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">三、帳戶與訂購</h2>
          <p className="text-slate-700 leading-relaxed">
            您須提供真實、準確的個人資料進行註冊。您有責任維護帳戶的安全性，
            包括保管好您的密碼。所有通過您帳戶進行的訂單，均視為由您本人授權。
            訂單一經確認付款，即構成具有法律約束力的購買合同。
            我們保留因庫存不足、定價錯誤或其他合理原因拒絕或取消訂單的權利。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">四、價格與付款</h2>
          <p className="text-slate-700 leading-relaxed">
            所有價格以港幣（HKD）標示，除非另有說明。價格可能隨時變動，恕不另行通知。
            促銷價格僅在指定期間內有效。付款透過 Stripe 安全支付平台處理，
            支持信用卡、Apple Pay、Google Pay 等方式。
            跨境訂單可能涉及額外的關稅及進口稅，由買方自行承擔。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">五、訂閱服務</h2>
          <p className="text-slate-700 leading-relaxed">
            月度訂閱服務自首次付款日起按月自動續費。您可以在下一個賬單日期前隨時取消訂閱。
            取消後，您仍可享用當月已付費的服務至該計費週期結束。
            訂閱價格如有調整，我們會提前 14 天透過電郵通知您。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">六、退款與退貨政策</h2>
          <p className="text-slate-700 leading-relaxed">
            自收貨之日起 14 天內，您可申請退貨退款。退貨商品須保持原始包裝、未開封且狀態完好。
            已開封的產品因衛生原因不予退貨，除非產品存在質量問題。
            退貨運費由買方承擔，除非是因我們的錯誤（如發錯貨品）。
            退款將在我們收到退回商品並確認合格後 7 個工作天內原路退回。
            訂閱服務的退款按剩餘天數比例計算。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">七、知識產權</h2>
          <p className="text-slate-700 leading-relaxed">
            本網站所有內容，包括但不限於文字、圖片、商標、AI 生成的健康報告、
            版面設計及軟件代碼，均為榮旺健康或其授權方的知識產權。
            未經書面許可，不得複製、修改、分發或用於商業目的。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">八、責任限制</h2>
          <p className="text-slate-700 leading-relaxed">
            在法律允許的最大範圍內，榮旺健康對因使用本網站或產品而產生的任何間接、
            附帶、特殊或後果性損害不承擔責任。我們的總賠償責任不超過您在爭議事件前
            12 個月內向我們支付的金額。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">九、爭議解決</h2>
          <p className="text-slate-700 leading-relaxed">
            本條款受香港特別行政區法律管轄。任何因本條款或服務引起的爭議，
            應首先通過友好協商解決。如協商不成，
            雙方同意提交香港國際仲裁中心按其仲裁規則進行仲裁。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">十、聯繫方式</h2>
          <p className="text-slate-700">
            電郵：support@rongwang.health<br />
            地址：香港九龍觀塘觀塘道 388 號<br />
            香港榮旺健康科技有限公司
          </p>
        </section>
      </div>
    </main>
  );
}
