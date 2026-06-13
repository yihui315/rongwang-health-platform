import { redirect } from 'next/navigation'

// ai-check 路由已废弃，重定向到 AI 评估页
// 原路由可能是旧版评估系统的遗留引用
export default function AICheckPage() {
  redirect('/ai-consult')
}