export type MediaGenerationInput = {
  productId: string;
  shortTitle: string;
  shortDescription: string;
};

export type MediaGenerationResult = {
  coverPrompt: string;
  shortVideoScript: string;
  assets: Array<{ type: 'image' | 'video'; url: string }>;
};

export async function runGenerateMediaAgent(input: MediaGenerationInput): Promise<MediaGenerationResult> {
  return {
    coverPrompt: `创建一张健康商品展示封面图，主题：${input.shortTitle}`,
    shortVideoScript: `15 秒短视频脚本：先展示产品主视觉，再展示卖点“${input.shortDescription}”，最后强调跨境合规说明。`,
    assets: [],
  };
}
