# 文章封面图自动生成规则

## 规则：每篇新文章必须有匹配内容的封面图

### 图片命名规范

```
public/images/articles/article-{数字}.jpg
```

**可用编号**：`article-01.jpg` ~ `article-19.jpg`

编号按文章分类映射：

| 分类/主题 | 对应图片编号 |
|-----------|-------------|
| 心脏/心血管健康 | article-01, article-06, article-13 |
| 骨骼/关节/钙质 | article-02, article-08, article-17 |
| 肝脏/解酒/护肝 | article-03, article-11, article-19 |
| 女性健康/妇科 | article-04, article-12, article-15 |
| 男性健康/睾酮 | article-05, article-09, article-18 |
| 睡眠/褪黑素 | article-07, article-14 |
| 肠道/益生菌/消化 | article-10, article-16 |
| 综合健康/免疫力 | article-19（备用）|

### 新文章添加流程

1. 在 `src/data/articles.ts` 中添加文章时，`coverImage` 字段**必须填写**，格式：
   ```ts
   coverImage: "/images/articles/article-XX.jpg",
   ```
2. 根据文章主题选择对应编号（见上表），避免重复使用
3. 图片已存在于 `public/images/articles/` 目录，无需上传
4. **禁止**使用不存在的文件名（如 `article-freque.jpg`、`article-antrod.jpg` 等）

### 当前已有图片清单

```
article-01.jpg  ~ article-19.jpg  （共19张）
```

### 违规处理

- 已移除的错误文件名（**禁止使用**）：
  - `article-freque.jpg` ❌
  - `article-antrod.jpg` ❌
  - `article-hangov.jpg` ❌
  - `article-women-.jpg` ❌
  - `article-iron-m.jpg` ❌
- 如需新图片，需设计师生成并上传到 `public/images/articles/`

---

## 图片内容参考（供设计师参考）

| 编号 | 主色调 | 适用场景 |
|------|--------|---------|
| 01 | 红色/心脏 | 心血管健康 |
| 02 | 骨骼白/米色 | 关节骨骼 |
| 03 | 绿色/肝脏 | 肝脏排毒 |
| 04 | 粉色/紫色 | 女性健康 |
| 05 | 深蓝/力量 | 男性健康 |
| 06 | 橙色渐变 | 心脏保健 |
| 07 | 蓝色/宁静 | 睡眠改善 |
| 08 | 米白/自然 | 骨骼健康 |
| 09 | 深蓝/活力 | 男性精力 |
| 10 | 绿色/清新 | 肠道益生菌 |
| 11 | 橙色/温暖 | 肝脏养护 |
| 12 | 玫红/优雅 | 女性调养 |
| 13 | 深红/尊贵 | 心脏保健 |
| 14 | 靛蓝/夜空 | 睡眠放松 |
| 15 | 粉橙/柔和 | 女性综合 |
| 16 | 浅绿/清新 | 肠道健康 |
| 17 | 灰白/科技 | 关节骨骼 |
| 18 | 藏青/稳重 | 男性健康 |
| 19 | 金色/综合 | 综合保健 |
