"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { KnowledgeCategory } from "@/types/chat";
import {
  healthKnowledge,
  knowledgeCategories,
  searchKnowledge,
} from "@/data/health-knowledge";

/**
 * 荣旺健康知识库浏览页面
 * 可搜索、可按分类筛选的专业健康知识库
 */
export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    KnowledgeCategory | "all"
  >("all");

  const filteredItems = useMemo(() => {
    // 如果有搜索词，优先使用搜索
    if (searchQuery.trim()) {
      const results = searchKnowledge(searchQuery);
      if (activeCategory !== "all") {
        return results.filter((r) => r.category === activeCategory);
      }
      return results;
    }

    // 无搜索词，按分类筛选
    if (activeCategory === "all") {
      return healthKnowledge;
    }
    return healthKnowledge.filter((item) => item.category === activeCategory);
  }, [searchQuery, activeCategory]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { all: healthKnowledge.length };
    for (const item of healthKnowledge) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 页面头部 */}
      <div className="knowledge-header">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            📚 荣旺健康知识库
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            涵盖营养补充剂、常见症状、中医养生、人群健康、器官养护等
            {healthKnowledge.length}+ 专业知识条目
          </p>

          {/* 搜索框 */}
          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索健康知识...例如：NMN、失眠、维生素C、中医养生"
                className="w-full rounded-2xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 分类标签 */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-teal text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-teal-bg hover:text-teal-dark"
            }`}
          >
            全部 ({categoryCount["all"]})
          </button>
          {knowledgeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-teal text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-teal-bg hover:text-teal-dark"
              }`}
            >
              {cat.icon} {cat.label} ({categoryCount[cat.id] || 0})
            </button>
          ))}
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <p className="mb-4 text-sm text-slate-500">
            搜索 &ldquo;{searchQuery}&rdquo; — 找到 {filteredItems.length}{" "}
            条相关知识
          </p>
        )}

        {/* 知识条目列表 */}
        {filteredItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const catMeta = knowledgeCategories.find(
                (c) => c.id === item.category
              );
              return (
                <article
                  key={item.id}
                  className="knowledge-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-base">{catMeta?.icon || "📄"}</span>
                    <span className="rounded-full bg-teal-bg px-2.5 py-0.5 text-[10px] font-medium text-teal-dark">
                      {catMeta?.label || item.category}
                    </span>
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-slate-800 group-hover:text-teal-dark">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500 line-clamp-4">
                    {item.content}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.keywords.slice(0, 4).map((kw) => (
                      <span
                        key={kw}
                        className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400">🔍 没有找到相关知识</p>
            <p className="mt-2 text-sm text-slate-400">
              试试其他关键词，或
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="text-teal hover:text-teal-dark"
              >
                查看全部知识
              </button>
            </p>
          </div>
        )}

        {/* 底部 CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-teal to-teal-dark p-8 text-center text-white">
          <h2 className="text-xl font-bold md:text-2xl">
            想获取更个性化的健康建议？
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
            AI健康顾问小旺可以根据您的具体情况，提供一对一的专业咨询和方案推荐
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/ai-service"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-dark shadow-md transition-shadow hover:shadow-lg"
            >
              🩺 开始AI健康咨询
            </Link>
            <Link
              href="/quiz"
              className="rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              📋 3分钟AI健康检测
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
