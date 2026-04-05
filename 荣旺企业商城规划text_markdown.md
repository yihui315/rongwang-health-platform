# Zero-cost AI marketing automation for China's health supplement market

**You can build a fully autonomous, AI-driven marketing system on a single Mac using open-source tools that already exist on GitHub — but the Chinese platform ecosystem demands careful navigation.** The most critical finding: a stack centered on LangGraph + Qwen3 (via Ollama) + AIWriteX + MediaCrawler + social-auto-upload can cover SEO, GEO, content generation, and multi-platform publishing at genuinely zero cost. However, Chinese social platforms aggressively detect automation, and health supplement content faces strict regulatory scrutiny under China's Advertising Law — making human-in-the-loop review non-negotiable for any customer-facing output.

This report maps every component needed: 40+ GitHub repos evaluated, platform-by-platform automation feasibility, a complete multi-agent architecture, and an 8-week implementation roadmap.

---

## The open-source toolkit already exists — here are the 15 repos that matter

The GitHub ecosystem for AI marketing has matured dramatically. Rather than building from scratch, your system should compose existing, battle-tested projects. Here are the highest-impact repos organized by function.

### Chinese market content automation (highest priority)

**AIWriteX** (github.com/iniwap/AIWriteX, ~598 stars, updated March 2026) is the single most relevant project. Built on CrewAI, it provides full-auto WeChat Official Account article generation and publishing, hot topic aggregation from Weibo/Douyin/Xiaohongshu, a **12-hour trend prediction engine**, anti-AI-detection that bypasses 朱雀, and multi-platform output for 小红书, 百家号, and 抖音. Its multi-agent pipeline follows Researcher → Writer → Reviewer → Designer, closely matching your target architecture.

**MediaCrawler** (github.com/NanmiCoder/MediaCrawler, **44,000 stars**) is indispensable. It crawls Xiaohongshu, Douyin, Kuaishou, Bilibili, Weibo, Zhihu, and Baidu Tieba using Playwright with anti-detection features, IP proxy support, and exports to SQLite/MySQL/CSV/JSON. This is your competitive intelligence and trend monitoring backbone.

**chatgpt-on-wechat** (github.com/zhayujie/chatgpt-on-wechat, **36,600 stars**) powers AI-driven WeChat bots supporting GPT, Claude, DeepSeek, Qwen, Kimi, and Ollama. It handles text/voice/image processing, agent-mode task planning, custom knowledge bases, and plugin systems across WeChat, 飞书, 钉钉, and 公众号.

### Cross-platform publishing and social media

**social-auto-upload** (github.com/dreammis/social-auto-upload, **8,800 stars**) provides CLI-based cross-platform auto-upload to Douyin, Xiaohongshu, WeChat Video (视频号), Bilibili, Kuaishou, TikTok, and YouTube via Playwright browser automation. Commands like `sau xiaohongshu upload-note` and `sau douyin upload-video` integrate cleanly into Python pipelines.

**AiToEarn** (github.com/yikart/AiToEarn, **10,400 stars**) is an Electron desktop app supporting **14+ platforms** with a calendar scheduler, AI agent content creation, and content redistribution. Open-sourced since v1.3.2 in November 2025.

**Autoxhs** (github.com/Gikiman/Autoxhs) automates Xiaohongshu content generation and publishing using LangChain + DALL-E 3, generating titles, text, tags, and images from themes. **xiaohongshu-mcp** (8,400 stars) provides an MCP server for AI agents to search, read, and publish XHS posts. **xiaohongshu-skills** (github.com/autoclaw-cc/xiaohongshu-skills) offers complete agent-controlled XHS operations via Chrome extension + Python scripts.

### SEO and GEO tools

**claude-seo** (github.com/AgriciDaniel/claude-seo) delivers **19 sub-skills, 12 subagents, and 3 extensions** covering technical SEO, E-E-A-T, schema, GEO/AEO, backlinks, and Google APIs. It's the most comprehensive open-source SEO agent skill available and integrates directly with Claude Code.

**ALwrity** (github.com/AJaySi/ALwrity, 917 stars) is a full AI digital marketing platform: blog writer, SEO dashboard with Google Search Console, social media editors, content calendar, podcast maker, and video studio — all with multi-model support.

**SerpBear** (github.com/towfiqi/serpbear) is a self-hosted rank tracker with unlimited keywords, Google Search Console integration, and free deployment on Docker. **SEOArticlegenAI** (github.com/JamesEBall/SEOArticlegenAI) generates tens of thousands of programmatic SEO articles from CSV templates.

**GEO-optim/GEO** (github.com/GEO-optim/GEO) is the original Princeton/IIT Delhi research implementation from KDD 2024, with benchmarks demonstrating **up to 40% visibility improvement** in AI-generated responses. **gego** (github.com/AI2HU/gego) schedules prompts across multiple LLMs for GEO tracking. **geo-analyzer** provides MCP-integrated local GEO analysis using Claude.

### Multi-agent frameworks

**CrewAI** (~25,000 stars) remains the easiest multi-agent framework to start with, while **LangGraph** (part of the 120,000+ star LangChain ecosystem) offers production-grade state management, persistence, and conditional routing — making it the better long-term foundation given your existing experience.

---

## Programmatic SEO and the Baidu equation

### Generating thousands of pages automatically

Programmatic SEO generates pages from templates + data matrices. For health supplements, this means creating pages for every combination of supplement × condition × demographic: "维生素D对中老年人骨密度的帮助" across hundreds of variations. **92.42% of all search queries have fewer than 10 monthly searches** — the long tail is where automated content dominance is feasible.

A zero-cost tech stack for programmatic SEO:

| Layer | Tool | Cost |
|-------|------|------|
| Framework | Next.js (SSG/ISR) | Free |
| Data source | Google Sheets or CSV | Free |
| Content generation | Qwen3 via Ollama | Free |
| Hosting | Vercel free tier or Cloudflare Pages | Free |
| Rank tracking | SerpBear (self-hosted) | Free |
| Keywords | Baidu Index + Google Keyword Planner | Free |
| Chinese keywords | 5118.com (free tier) | Free |

**Critical 2026 warning**: Google's August and December 2025 updates intensified enforcement of "Scaled Content Abuse." Pages must contain genuinely unique, useful data — not keyword-swapped thin content. Baidu is following a similar trajectory.

### Baidu SEO differs fundamentally from Google

Baidu's ranking algorithm rewards different signals. **Keyword positioning at the beginning of title tags strongly correlates with higher rankings.** Meta keywords tags still influence Baidu rankings (Google ignores them). Baidu places more emphasis on internal linking than Google. Content freshness is weighted more heavily. And crucially, **Baidu heavily favors its own properties** — Baijiahao, Baidu Baike, Baidu Zhidao, and Baidu Wenku all rank above organic results.

For a Hong Kong-based company without an ICP license: host on HK servers with a CDN that has Chinese PoPs, register Baidu Webmaster Tools (zhanzhang.baidu.com), submit sitemaps manually, ensure all content is in **Simplified Chinese** (not Traditional), remove all Google/Facebook scripts (blocked in China), and achieve page loads under 3 seconds from mainland China. A .com.hk or .hk domain earns slightly more Baidu trust than .com.

**Baijiahao (百家号) is your highest-ROI channel for Baidu SEO.** Content published there gets near-100% Baidu indexation, appears in Baidu Feed and Search with preferential ranking, and is instantly indexed without waiting for Baiduspider. The official Developer Service API (`https://baijiahao.baidu.com/builderinner/open/resource/article/publish`) allows legitimate automated publishing with app_id + app_token authentication. This is the safest, most impactful automation target.

### Free keyword research stack

Combine **Baidu Index** (index.baidu.com) for Chinese keyword trends, **5118.com** (free tier) for Baidu-specific keyword research, **Google Keyword Planner** for baseline data, **AnswerThePublic** for question-based long-tail keywords, and **Google Trends** for seasonality patterns. Use Google Search Console and Baidu Webmaster Tools for actual search query data driving your traffic.

---

## GEO changes everything about content strategy

### What Generative Engine Optimization actually means

**GEO optimizes content for citation by AI systems** — ChatGPT, Perplexity, Google AI Overviews, Claude, and Chinese AI platforms like 文心一言, DeepSeek, and Kimi — rather than for traditional SERP rankings. The term was formalized in a 2023 Princeton/IIT Delhi paper (Aggarwal et al., arXiv:2311.09735, published KDD 2024). AI-referred sessions have jumped **527% year-over-year** according to Previsible's 2025 data. ChatGPT processes 2.5 billion prompts daily. **58% of users now replace traditional search with AI tools for product discovery.**

Where SEO optimizes at the page level, GEO optimizes at the **fact level** — each statistic, definition, and claim becomes an independent unit that AI models can extract and cite. LLMs typically cite only **2-7 domains per response**, far fewer than Google's 10 blue links. The competition for citations is fierce.

### Research-backed strategies that actually work

The Princeton team tested 9 optimization methods. **Adding citations boosted visibility by 115.1%** for rank-5 sites — the single most impactful strategy. Adding statistics improved visibility by **40%**. Adding expert quotations improved it by **41%**. Keyword stuffing — the classic SEO tactic — actually **decreased** GEO performance by 10%.

The actionable framework:

Place a comprehensive, standalone answer in the first **40-60 words** after each heading (the "Answer Capsule" technique). Include a statistic every **150-200 words**. Reference authoritative sources throughout. Use H2→H3→bullet point hierarchies (40% more likely to be cited). FAQ content gets cited **2x more often**. Content exceeding 1,500 words doubles citation probability. Comparison tables are extracted effectively by AI models.

### Technical GEO implementation at zero cost

Configure `robots.txt` to explicitly allow AI crawlers: GPTBot, ClaudeBot, PerplexityBot, Googlebot-Extended. Create an **llms.txt** file listing your most important URLs for AI indexing — early adopters report improved citation rates. Implement priority schema markup: **FAQPage** (highest citation probability), **Article/BlogPosting** with author details, **Person** with credentials (name, jobTitle, worksFor, knowsAbout), **Product** for recommendation queries, and **Organization** for brand entity identity.

### GEO for Chinese AI platforms requires a parallel strategy

China's AI search ecosystem operates independently behind the Great Firewall. **Baidu ERNIE (文心一言)** dominates with 200M+ monthly active users and deep integration into Baidu Search, which underwent its largest overhaul in a decade in 2025 — transforming from link-based to AI-synthesized answers. **DeepSeek** prioritizes well-sourced Chinese content with high technical accuracy. **Doubao (豆包)** by ByteDance integrates with Douyin trends. **Tencent Yuanbao** uniquely searches WeChat Official Account articles.

For Chinese AI GEO: distribute content across Baidu-friendly platforms (your website, Zhihu, Bilibili), create AI-friendly content structures (FAQs, process explanations, experience summaries), publish on Baijiahao for Baidu knowledge graph penetration, and structure for ERNIE's semantic parsing with long-form, clearly hierarchical content.

Measurement is manual but feasible: query your target keywords directly in Perplexity, ChatGPT Search, and 文心一言 weekly, monitoring whether your content appears in citations. Track AI referral traffic in analytics by monitoring referral sources from chatgpt.com, claude.ai, perplexity.ai, and related domains. Check server logs for AI bot user-agent strings.

---

## Chinese social media automation — what actually works versus what gets you banned

### The honest risk matrix

| Platform | Official API? | Auto-Publish Risk | Best Approach |
|----------|:---:|:---:|---|
| **Baidu Baijiahao** | ✅ Yes | LOW | Official API publishing — safest automation target |
| **WeChat Official Account** | ✅ Yes (requires Chinese entity) | LOW-MED | Official API if you have access; AIWriteX otherwise |
| **Zhihu** | ❌ No public API | MODERATE | Manual posting, AI-assisted drafting |
| **Douyin** | ⚠️ Partial (expires every 1-3 days) | HIGH | Batch-generate videos, semi-manual upload |
| **Xiaohongshu** | ❌ No | VERY HIGH | AI content generation → cautious semi-automated posting |

**Xiaohongshu actively detects automation.** Banned words for health content include "best," "number 1," "health department recommended," "quick weight loss," "cure," and "treat." Direct advertising is prohibited — no product links, external websites, WeChat IDs, or phone numbers. A single flagged post can reduce entire account visibility for weeks. The recommended approach: use AI to draft KOC (Key Opinion Consumer) style content with ingredient education and wellness journey framing, add random delays exceeding 30 minutes between actions, never exceed 2 posts/day through automation, and always human-review before publishing.

**Douyin's risk control** requires fresh cookies frequently — authorization expires every 1-3 days. ByteDance uses sophisticated device fingerprinting and behavioral analysis. Use free AI video tools (Kling AI by Kuaishou, Jimeng AI by ByteDance, KreadoAI) for content creation, then publish via social-auto-upload or AiToEarn with human oversight.

**A February 2026 regulatory update prohibits KOL/influencer livestreaming for health foods** — only brand-owned livestreaming remains permitted. Fines reach 2 million RMB.

### The practical zero-cost workflow

The safest automation priority order:

1. **Baidu Baijiahao** via official API — legitimate, free, highest SEO impact
2. **Website/blog** programmatic SEO — fully controlled, no platform risk
3. **Zhihu** AI-assisted answers — manual posting, AI drafting for quality
4. **WeChat Official Account** — via AIWriteX or official API (requires Chinese business entity for full access)
5. **Xiaohongshu** — AI content generation with cautious semi-automated posting via social-auto-upload
6. **Douyin** — AI-generated videos with semi-manual upload

---

## Qwen3 on your Mac is the content engine

### Self-hosted LLMs for Chinese marketing content

**Qwen3 14B via Ollama is the optimal model for Chinese marketing content on Mac.** Alibaba's Qwen family has Apache 2.0 licensing, 150K+ token vocabulary optimized for Chinese, and consistently outperforms competitors on Chinese downstream tasks. One command gets you started: `ollama run qwen3:14b`.

| Mac Config | Best Model | Speed | Quality |
|---|---|---|---|
| 16GB RAM | Qwen3 8B (Q4_K_M) | 15-28 tok/s | Good for drafts |
| 24GB RAM | Qwen3 14B (Q4_K_M) | 15-25 tok/s | Excellent for production |
| 32GB RAM | Qwen3 32B (Q4_K_M) | 15-28 tok/s | Near-expert-level output |
| 48GB+ RAM | Qwen3 72B (Q4) | 10-15 tok/s | Premium quality |

**Memory bandwidth determines inference speed**, not chip generation. An M1 Max 64GB outperforms an M4 16GB because it loads larger models. For fine-tuning brand voice, Apple's **MLX framework** supports LoRA/QLoRA natively — a 7B model needs only ~7GB RAM for QLoRA training. Create a training dataset of approved health claims and brand copy in Chinese, then fine-tune Qwen3-8B with QLoRA. The adapter weights are just a few MB.

Alternative models worth evaluating: **DeepSeek-R1-Distill-7B** (MIT license, superior reasoning), **GLM-4-9B** (deep Chinese cultural understanding), and **Baichuan 2** (specializes in medicine and health domains).

### Image and video generation on Mac

**Draw Things** (free on Mac App Store) generates SD 1.5 images in 8-15 seconds on a 16GB M2 Pro — 3x faster than ComfyUI on the same hardware due to native Metal FlashAttention optimization. For production batch workflows, **ComfyUI** offers node-based pipelines but runs ~3x slower. **MFLUX** (pip install mflux) provides the fastest FLUX model inference on Mac via MLX-native optimization.

For video: full text-to-video models (Wan 2.1, CogVideoX) are **not practical on Mac** — they require NVIDIA GPUs. Instead, the practical pipeline is:

1. **Qwen3** writes video scripts in Chinese
2. **Draw Things/ComfyUI** generates spokesperson photos or product visuals
3. **SadTalker** (github.com/OpenTalker/SadTalker) animates photos into talking-head videos from a single image + audio
4. **Edge-TTS** (free Microsoft service) generates Chinese voiceover
5. **FFmpeg** + DaVinci Resolve (free) for final compositing

**LivePortrait** (by Kuaishou) offers higher quality portrait animation but requires more compute. **Linly-Talker** (github.com/Kedreamix/Linly-Talker) provides an integrated digital human pipeline: LLM + TTS + avatar animation with voice cloning via GPT-SoVITS.

---

## The multi-agent architecture that ties everything together

### LangGraph as the orchestration backbone

**LangGraph is the right choice** given your experience. It reached v1.0 in late 2025, offers the highest reliability in production benchmarks, has native Langfuse integration, and its graph-based state machine maps perfectly to marketing workflows with conditional routing (draft → review → approve → publish). Use CrewAI only for rapid prototyping before migrating to LangGraph for production.

AutoGen is **now in maintenance mode** — Microsoft is shifting focus to a broader framework. Agency Swarm is primarily OpenAI-focused. Neither is recommended for new projects.

### Eight specialized agents

```
┌─────────────────────────────────────────────────┐
│        ORCHESTRATOR (LangGraph Supervisor)        │
├────────┬────────┬─────────┬──────────┬──────────┤
│  SEO   │Content │ Image   │ Social   │  GEO     │
│Research│Writer  │Generator│Publisher │Optimizer │
├────────┼────────┼─────────┼──────────┼──────────┤
│Analytics│Compet.│Customer │          │          │
│Monitor │Analysis│Engage.  │          │          │
└────────┴────────┴─────────┴──────────┴──────────┘
    ↕            ↕           ↕            ↕
[SQLite]    [ChromaDB]   [Langfuse]    [Ollama]
```

**SEO Research Agent** runs daily at 2 AM: keyword tracking, SERP scraping, content gap analysis. Uses Ollama (Qwen3 8B sufficient) + web scraping tools + SerpBear API. Feeds data to Content Writer and GEO Optimizer.

**Content Writer Agent** runs weekly on Mondays: generates blog posts, social media posts, and product descriptions from SEO briefs. Uses Qwen3 14B for Chinese content quality. Cross-platform adaptation: blog/WeChat article (1,500-3,000 characters, educational), Xiaohongshu (300-500 characters, personal experience, emoji-rich), Douyin script (30-60 second, hook in first 3 seconds), Baijia article (long-form SEO-optimized).

**Image Generator Agent** runs on-demand: product images and social media visuals via Draw Things or ComfyUI + FLUX Schnell. Targets XHS (1080×1440 for carousels), Douyin (1080×1920 covers), WeChat (900px wide articles).

**Social Media Publisher Agent** runs per calendar: scheduled posting via social-auto-upload and AiToEarn with human-approval gates. Manages platform-specific formatting and rate limiting.

**GEO Optimization Agent** runs weekly: restructures content for AI citation using the Answer Capsule technique, statistic injection, citation integration, and schema markup generation.

**Analytics Monitor Agent** runs hourly: queries Umami API for web analytics, tracks AI referral traffic, monitors social media performance, generates anomaly alerts.

**Competitor Analysis Agent** runs daily: uses MediaCrawler to monitor competitor content across Chinese platforms, identifies trending topics and content gaps.

**Customer Engagement Agent** runs every 15 minutes: monitors comments and questions, drafts responses using RAG (ChromaDB knowledge base with FAQ and brand guidelines), routes to human approval for customer-facing output.

### System architecture on a single Mac

| Component | Tool | Resource Impact |
|---|---|---|
| Orchestration | LangGraph | Low (Python process) |
| Scheduling | APScheduler + SQLite jobstore | Minimal |
| LLM inference | Ollama (Qwen3 14B) | High (8-16GB RAM during inference) |
| Database | SQLite (primary) + ChromaDB (vectors) | Low |
| Web analytics | Umami (Docker + PostgreSQL) | Low-Medium |
| Observability | Langfuse (self-hosted Docker) | Low-Medium |
| Image generation | Draw Things or ComfyUI | High (during generation) |
| API layer | FastAPI + Uvicorn | Low |
| Dashboard | Streamlit | Low |

**APScheduler over Celery** — Celery requires Redis/RabbitMQ and is designed for distributed systems. APScheduler runs in-process with an SQLite jobstore, integrates natively with FastAPI's async loop, and handles missed-job recovery on restart. Use `launchd` to auto-start the FastAPI service on boot, `caffeinate -s` to prevent Mac sleep, and add Ollama to Login Items.

**Storage estimate**: ~100-200GB recommended free space (50-100GB for Ollama models, 5-10GB/year for SQLite data, 5-10GB for SD models, 5-10GB/year for generated images, 2-5GB/year for Langfuse traces).

### Langfuse as the observability layer

Self-host Langfuse via Docker on the same Mac — free, full data ownership. The native LangGraph callback handler captures every agent step, token usage, latency, and error. Build LLM-as-a-judge quality scoring: after content generation, have a separate Ollama call rate the output on brand voice, compliance, and SEO optimization. Track cost optimization by monitoring token usage per agent.

---

## Health supplement compliance is the non-negotiable constraint

China's Advertising Law and health supplement regulations create hard boundaries around what AI can generate. Products with **Blue Hat certification** (保健食品批准文号) may use 24 approved health function claims — including "assist in boosting immunity," "alleviate physical fatigue," and "assist in maintaining joint health" (newly added 2026). Everything else must avoid disease treatment, prevention, or cure claims entirely.

**Banned language**: "cure," "treat," "prevent [disease]," "safety, no toxic side effects," "natural = safe," "hot product," "shopping rush," "refund for invalidity." Xiaohongshu uses automated scanning plus manual review to flag violations. Fines reach **2 million RMB or 3-10x advertising fees**.

Implementation: hard-code approved claims into LLM system prompts, run a Python banned-word filter on all output, require human review for 100% of health-related content, and train a QLoRA adapter on approved brand copy to maintain compliant brand voice.

---

## Eight-week implementation roadmap

**Weeks 1-2 (Foundation)**: Install Ollama + Qwen3, set up FastAPI + APScheduler + SQLite, deploy Langfuse and Umami via Docker, build the SEO Research Agent as the first working agent, configure `launchd` for Mac auto-start. **Exit criteria**: SEO agent completing daily keyword research with Langfuse traces.

**Weeks 3-4 (Core content pipeline)**: Build Content Writer Agent + GEO Optimizer, set up Stable Diffusion via Draw Things, implement LangGraph graph connecting SEO → Content Writer → Image Generator, add human-in-the-loop approval nodes. **Exit criteria**: 3+ blog post drafts per week with matching visuals, all GEO-optimized.

**Weeks 5-6 (Social media integration)**: Build Social Media Publisher with Baijia API integration first (lowest risk), configure social-auto-upload for XHS/Douyin, build Customer Engagement Agent with ChromaDB RAG. **Exit criteria**: auto-publishing to 3+ platforms on schedule with human approval gates.

**Weeks 7-8 (Analytics and optimization)**: Build Analytics Monitor with Umami API integration, connect analytics feedback to content agents (closed loop), build comprehensive Streamlit dashboard, implement A/B testing for social posts. **Exit criteria**: automated weekly reports, system running 24/7 with <5% downtime.

**Target metrics at week 8**: 3-5 auto-drafted blog posts per week, 15-20 social posts across platforms, <30 minute response drafts for customer comments, 100+ keywords auto-monitored, top 20 brand queries tracked for GEO citations, >95% system uptime, **$0/month** infrastructure cost.

---

## Conclusion

The zero-cost constraint is genuinely achievable for the content generation, SEO, and orchestration layers — Qwen3 via Ollama matches commercial LLM quality for Chinese content, and LangGraph + APScheduler + SQLite provide production-grade agent infrastructure without cloud dependencies. The real bottleneck isn't technology but **platform risk**: Chinese social platforms treat automation as adversarial, and health supplement content sits at the intersection of two enforcement regimes (platform ToS and national advertising law).

The highest-ROI first move is not social media automation but **Baidu Baijiahao + programmatic SEO** — the only channel combination offering legitimate API access, near-100% indexation, and preferential search ranking. Social media should layer on gradually, starting with AI-assisted content drafting and cautious semi-automated publishing rather than full autonomous operation. GEO represents the most underexploited opportunity: with 527% year-over-year growth in AI-referred sessions, optimizing for AI citation today builds a durable competitive moat as Chinese consumers increasingly discover health products through 文心一言, DeepSeek, and Kimi rather than traditional search.