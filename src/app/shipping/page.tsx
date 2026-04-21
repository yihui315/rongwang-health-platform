/**
 * 配送與退貨頁面
 */

export const metadata = {
  title: "配送與退貨 | 荣旺健康",
  description: "了解荣旺健康的配送方式、運費、跨境清關及退貨退款流程。",
};

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">配送與退貨</h1>
      <p className="text-sm text-slate-500 mb-10">最後更新日期：2026 年 4 月 9 日</p>

      <div className="prose prose-slate max-w-none space-y-8">
        {/* ─── 配送 ─── */}
        <section>
          <h2 className="text-xl font-semibold mb-3">一、配送範圍</h2>
          <p className="text-slate-700 leading-relaxed">
            我們提供香港本地配送及跨境配送服務，覆蓋香港、澳門、中國內地、台灣、新加坡及馬來西亞。
            其他地區請聯繫客服確認是否可以配送。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">二、配送方式與時效</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-4 py-2 text-left">地區</th>
                  <th className="border border-slate-200 px-4 py-2 text-left">配送方式</th>
                  <th className="border border-slate-200 px-4 py-2 text-left">預計時效</th>
                  <th className="border border-slate-200 px-4 py-2 text-left">運費</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border border-slate-200 px-4 py-2">香港</td>
                  <td className="border border-slate-200 px-4 py-2">順豐速運 / SF Locker</td>
                  <td className="border border-slate-200 px-4 py-2">1-2 個工作天</td>
                  <td className="border border-slate-200 px-4 py-2">滿 HK$300 免運費，否則 HK$30</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-2">澳門</td>
                  <td className="border border-slate-200 px-4 py-2">順豐速運</td>
                  <td className="border border-slate-200 px-4 py-2">2-3 個工作天</td>
                  <td className="border border-slate-200 px-4 py-2">HK$45</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">中國內地</td>
                  <td className="border border-slate-200 px-4 py-2">順豐跨境 / 中通快遞</td>
                  <td className="border border-slate-200 px-4 py-2">3-7 個工作天</td>
                  <td className="border border-slate-200 px-4 py-2">滿 HK$500 免運費，否則 HK$60</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-4 py-2">台灣 / 東南亞</td>
                  <td className="border border-slate-200 px-4 py-2">國際快遞</td>
                  <td className="border border-slate-200 px-4 py-2">5-10 個工作天</td>
                  <td className="border border-slate-200 px-4 py-2">按重量計算，結帳時顯示</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">三、跨境清關與關稅</h2>
          <p className="text-slate-700 leading-relaxed">
            跨境訂單可能需要通過目的地海關檢查。進口關稅、增值稅及其他政府收費由買方承擔。
            中國內地個人進口保健品適用跨境電商綜合稅率（通常為 9.1%），
            單次交易限值為人民幣 5,000 元，年度交易限值為人民幣 26,000 元。
            我們會在包裹上如實申報產品名稱及價值。如因海關原因導致包裹被退回，
            我們將在扣除實際運費後為您安排退款。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">四、訂單追蹤</h2>
          <p className="text-slate-700 leading-relaxed">
            訂單發貨後，我們會透過電郵發送物流追蹤號碼。
            您可以在「我的訂單」頁面即時查看配送狀態。
            如超過預計時效仍未收到包裹，請聯繫我們的客服團隊。
          </p>
        </section>

        {/* ─── 退貨退款 ─── */}
        <section>
          <h2 className="text-xl font-semibold mb-3">五、退貨條件</h2>
          <p className="text-slate-700 leading-relaxed">
            自收貨之日起 14 天內，如符合以下條件可申請退貨：
            商品保持原始包裝、未開封且完好無損；附有原始發票或訂單確認。
            以下情況不予退貨：已開封或已使用的產品（衛生原因）；
            定制化方案產品（根據 AI 推薦特別配製）；
            超過 14 天退貨期限的商品。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">六、退貨流程</h2>
          <p className="text-slate-700 leading-relaxed">
            第一步：登入帳戶，在「我的訂單」中選擇需要退貨的訂單，填寫退貨申請。
            第二步：我們的客服團隊會在 1 個工作天內審核並回覆。
            第三步：審核通過後，按照指引將商品寄回指定地址（退貨運費由買方承擔）。
            第四步：我們收到退回商品並確認合格後，7 個工作天內原路退回款項。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">七、損壞或錯誤商品</h2>
          <p className="text-slate-700 leading-relaxed">
            如收到的商品有損壞、過期或發錯貨品，請在收貨後 48 小時內聯繫我們，
            並提供照片作為證據。經確認後，我們將免費補寄正確商品或全額退款，
            退貨運費由我們承擔。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">八、訂閱取消</h2>
          <p className="text-slate-700 leading-relaxed">
            月度訂閱可隨時在帳戶設定中取消。取消後，當月已配送的產品不予退款，
            但不會再產生下月的費用。如在當月配送前取消，可申請當月全額退款。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">九、聯繫客服</h2>
          <p className="text-slate-700">
            電郵：support@rongwang.health<br />
            客服時間：週一至週五 09:00-18:00（香港時間）<br />
            通常在 1 個工作天內回覆
          </p>
        </section>
      </div>
    </main>
  );
}
