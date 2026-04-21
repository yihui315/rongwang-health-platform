import Link from 'next/link';

const familyMembers = [
  { id: 1, name: '爸爸', age: 58, status: '血压偏高,关注心血管健康', plan: '心血管守护方案', color: 'from-blue-400 to-indigo-500' },
  { id: 2, name: '妈妈', age: 55, status: '更年期,需要钙和维D', plan: '骨骼健康方案', color: 'from-pink-400 to-rose-500' },
  { id: 3, name: '我', age: 32, status: '长期加班,疲劳睡眠差', plan: '抗疲劳+深度睡眠方案', color: 'from-teal-400 to-cyan-500' },
  { id: 4, name: '宝宝', age: 5, status: '幼儿园阶段,免疫力建设', plan: '儿童免疫方案', color: 'from-amber-400 to-orange-500' },
];

const benefits = [
  { icon: '👨‍👩‍👧‍👦', title: '统一管理', desc: '一个账号管理全家人健康档案,随时查看每个人的方案状态' },
  { icon: '💰', title: '家庭优惠', desc: '3人以上享8折,4人以上享7.5折,越多人越划算' },
  { icon: '🚚', title: '合并配送', desc: '全家方案一起配送,减少运输成本和包装浪费' },
  { icon: '🤖', title: 'AI个性化', desc: '为每位家庭成员单独定制,考虑年龄、性别、健康状况' },
];

export default function FamilyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-teal-50 to-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-700 mb-4">
            家庭健康管理
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            守护全家人的健康
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            统一管理家庭成员的健康档案,为每个人定制专属方案
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">家庭档案示例</h2>
          <p className="text-center text-slate-600 mb-12">看看其他家庭是如何管理健康的</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition"
              >
                <div className={`h-32 bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                  <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-4xl">
                    {member.name === '爸爸' && '👨'}
                    {member.name === '妈妈' && '👩'}
                    {member.name === '我' && '🧑'}
                    {member.name === '宝宝' && '👶'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                    <span className="text-sm text-slate-500">{member.age}岁</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{member.status}</p>
                  <div className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                    {member.plan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">为什么选择家庭方案?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                <p className="text-slate-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">家庭优惠价格</h2>

          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">家庭成员</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-700">折扣</th>
                  <th className="text-right px-6 py-4 font-semibold text-slate-700">月度均价</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-6 py-4 text-slate-900">1人</td>
                  <td className="text-center px-6 py-4 text-slate-500">无</td>
                  <td className="text-right px-6 py-4 font-semibold">¥299/人</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-900">2人</td>
                  <td className="text-center px-6 py-4 text-teal-600 font-semibold">9折</td>
                  <td className="text-right px-6 py-4 font-semibold">¥269/人</td>
                </tr>
                <tr className="bg-teal-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">3人</td>
                  <td className="text-center px-6 py-4 text-teal-600 font-bold">8折 推荐</td>
                  <td className="text-right px-6 py-4 font-bold text-teal-700">¥239/人</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-900">4人及以上</td>
                  <td className="text-center px-6 py-4 text-teal-600 font-semibold">7.5折</td>
                  <td className="text-right px-6 py-4 font-semibold">¥224/人</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">开始守护全家健康</h2>
          <p className="text-teal-100 mb-8">添加家庭成员,为每个人量身定制健康方案</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quiz"
              className="rounded-full bg-white text-teal-600 px-8 py-4 font-semibold hover:bg-teal-50 transition"
            >
              开始AI测验
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white/10 transition"
            >
              管理家庭档案
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
