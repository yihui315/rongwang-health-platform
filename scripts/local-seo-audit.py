#!/usr/bin/env python3
"""
本地 SEO Audit — rongwang.hk
=============================
不需要任何 API key，直接用 curl 抓取页面分析 SEO 元素

输出：
  - public/_geoflow_cache/local_seo_audit.json  （完整审计数据）
  - 控制台摘要报告
"""

import subprocess
import re
import json
import time
from collections import defaultdict

SITE_URL = "https://rongwang.hk"
OUTPUT_FILE = "public/_geoflow_cache/local_seo_audit.json"

# 46篇文章 slugs
ARTICLE_SLUGS = [
    "8b5ybrio", "wl6zzw4a", "ejazfw2h", "pimu4agd", "3giuwn20",
    "fi9s05my", "31jy5wfm", "h8q9vnxo", "jm7ns5da", "bvtrhw4l",
    "h9q0znbq", "m1l7r7u7",
    "chest-tightness-coq10", "coq10-male-fertility", "gaba-vs-melatonin",
    "leaky-gut-systemic", "996-heart-palpitations", "alcohol-liver-protection",
    "slow-metabolism-weight-loss", "visceral-fat-reduction", "skin-dullness-internal",
    "25plus-oral-skincare", "hair-loss-nutrition", "free-radical-skin-coq10",
    "ibs-probiotics-coq10", "bloating-digestive-enzymes", "post-antibiotic-gut",
    "996-subhealth-syndrome", "mitochondrial-chronic-fatigue",
    "subclinical-nutrient-deficiency", "insomnia-melatonin-root",
    "sleep-deprivation-costs", "deep-sleep-how-to", "anxiety-insomnia-gaba",
    "elevated-alt-liver-support", "fatty-liver-reversal", "statin-coq10",
    "milk-thistle-before-drinking", "weight-loss-hunger-control",
    "weight-loss-plateau", "pcos-weight-loss", "hypertension-coq10",
    "ecg-abnormal-coq10", "35plus-male-heart-checkup", "coq10-male-sexual-health",
    "antioxidant-vs-anti-glycation",
]

def fetch_page(url):
    """用 curl 获取页面 HTML"""
    try:
        result = subprocess.run(
            [
                "curl", "-s", "-L", "--max-time", "15",
                "-A", "Mozilla/5.0 (compatible; SEOAuditBot/1.0)",
                url
            ],
            capture_output=True, text=True, timeout=20
        )
        return result.stdout
    except Exception as e:
        return ""

def extract_meta(html):
    """提取 SEO meta 标签"""
    def get_meta(name_pattern, html):
        # og:image 可能有多个
        matches = re.findall(
            rf'<meta[^>]+(?:name|property)=["\']' + name_pattern + r'["\'][^>]+content=["\']([^"\']+)["\']',
            html, re.IGNORECASE
        )
        if matches:
            return matches[0]
        # 也尝试反序
        matches = re.findall(
            rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:name|property)=["\']' + name_pattern + r'["\']',
            html, re.IGNORECASE
        )
        return matches[0] if matches else ""

    def get_og(name, html):
        return get_meta(f'og:{name}', html)

    # title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else ""

    # description
    description = get_meta("description", html)

    # og:image
    og_images = re.findall(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.IGNORECASE
    )
    if not og_images:
        og_images = re.findall(
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            html, re.IGNORECASE
        )
    og_image = og_images[0] if og_images else ""

    # h1
    h1_matches = re.findall(r'<h1[^>]*>([^<]+)</h1>', html, re.IGNORECASE)
    h1 = [t.strip() for t in h1_matches]

    # canonical
    canonical_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    canonical = canonical_match.group(1) if canonical_match else ""

    # robots
    robots_match = re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    robots = robots_match.group(1) if robots_match else ""

    # charset
    charset_match = re.search(r'<meta[^>]+charset=["\']([^"\']+)["\']', html, re.IGNORECASE)
    charset = charset_match.group(1) if charset_match else ""

    return {
        "title": title,
        "title_length": len(title),
        "description": description,
        "description_length": len(description),
        "og_image": og_image,
        "h1": h1,
        "h1_count": len(h1),
        "canonical": canonical,
        "robots": robots,
        "charset": charset,
    }

def check_http_status(url):
    """检查 HTTP 状态码"""
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "10", url],
            capture_output=True, text=True, timeout=15
        )
        return result.stdout.strip()
    except:
        return "000"

def audit_articles():
    """审计所有文章"""
    print("=" * 60)
    print("🔍 本地 SEO Audit — rongwang.hk")
    print("=" * 60)
    print(f"📄 审计文章数: {len(ARTICLE_SLUGS)}")
    print()

    results = []
    issues = defaultdict(list)

    for i, slug in enumerate(ARTICLE_SLUGS):
        url = f"{SITE_URL}/articles/{slug}"
        status = check_http_status(url)

        print(f"[{i+1:2d}/{len(ARTICLE_SLUGS)}] {status} {url}", end="")

        if status == "200":
            html = fetch_page(url)
            meta = extract_meta(html)

            # 检查问题
            if meta["description_length"] == 0:
                issues["missing_description"].append(slug)
                print(" ⚠️ 无 description")
            elif meta["description_length"] < 50:
                issues["short_description"].append(slug)
                print(f" ⚠️ desc={meta['description_length']}chars")
            elif meta["description_length"] > 160:
                issues["long_description"].append(slug)
                print(f" ⚠️ desc={meta['description_length']}chars (过长)")
            else:
                print(f" ✅ desc={meta['description_length']}chars")

            if meta["h1_count"] == 0:
                issues["missing_h1"].append(slug)
            if not meta["og_image"]:
                issues["missing_og_image"].append(slug)
            if not meta["canonical"]:
                issues["missing_canonical"].append(slug)

            results.append({
                "slug": slug,
                "url": url,
                "status": status,
                **meta,
            })
        else:
            issues["http_error"].append((slug, status))
            print(f" ❌ HTTP {status}")
            results.append({
                "slug": slug,
                "url": url,
                "status": status,
                "title": "",
                "title_length": 0,
                "description": "",
                "description_length": 0,
                "og_image": "",
                "h1": [],
                "h1_count": 0,
                "canonical": "",
                "robots": "",
                "charset": "",
            })

    return results, issues

def print_report(results, issues):
    """打印审计报告"""
    print("\n" + "=" * 60)
    print("📋 SEO Audit 报告摘要")
    print("=" * 60)

    total = len(results)
    ok = sum(1 for r in results if r["status"] == "200" and r["description_length"] >= 50)
    http_errors = [r for r in results if r["status"] != "200"]

    print(f"\n✅ 正常文章: {ok}/{total}")
    print(f"❌ HTTP 错误: {len(http_errors)}")
    if http_errors:
        for r in http_errors:
            print(f"   ❌ {r['status']} {r['url']}")

    print(f"\n--- 问题统计 ---")
    print(f"⚠️  无 description: {len(issues.get('missing_description', []))}")
    print(f"⚠️  description 偏短 (<50): {len(issues.get('short_description', []))}")
    print(f"⚠️  description 偏长 (>160): {len(issues.get('long_description', []))}")
    print(f"⚠️  无 h1 标签: {len(issues.get('missing_h1', []))}")
    print(f"⚠️  无 og:image: {len(issues.get('missing_og_image', []))}")
    print(f"⚠️  无 canonical: {len(issues.get('missing_canonical', []))}")

    if issues.get("missing_description"):
        print(f"\n无 description 的文章:")
        for slug in issues["missing_description"][:5]:
            print(f"   - {SITE_URL}/articles/{slug}")

    if issues.get("short_description"):
        print(f"\ndescription 偏短 (<50 chars):")
        for slug in issues["short_description"]:
            r = next((x for x in results if x["slug"] == slug), {})
            print(f"   - {slug}: {r.get('description_length', 0)} chars")

    if issues.get("missing_og_image"):
        print(f"\n无 og:image 的文章:")
        for slug in issues["missing_og_image"][:5]:
            print(f"   - {SITE_URL}/articles/{slug}")

    # SEO 评分
    score = 0
    if total > 0:
        score = int(ok / total * 100)
    print(f"\n🏆 SEO 健康度评分: {score}/100")

def save_results(results, issues):
    """保存结果到 JSON"""
    import os
    os.makedirs("public/_geoflow_cache", exist_ok=True)

    report = {
        "audited_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "site": SITE_URL,
        "total_articles": len(results),
        "issues": dict(issues),
        "articles": results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 完整报告已保存 → {OUTPUT_FILE}")

if __name__ == "__main__":
    results, issues = audit_articles()
    print_report(results, issues)
    save_results(results, issues)
