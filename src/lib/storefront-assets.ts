const storefrontBottleImages = {
  sleep: '/images/home/homepage-kit/assets/products/bottles/01-sleep-support.png',
  brain: '/images/home/homepage-kit/assets/products/bottles/02-brain-support.png',
  liver: '/images/home/homepage-kit/assets/products/bottles/03-liver-support.png',
  joint: '/images/home/homepage-kit/assets/products/bottles/04-joint-support.png',
  immune: '/images/home/homepage-kit/assets/products/bottles/05-immune-support.png',
  energy: '/images/home/homepage-kit/assets/products/bottles/06-energy-support.png',
} as const;

const fallbackOrder = [
  storefrontBottleImages.energy,
  storefrontBottleImages.immune,
  storefrontBottleImages.liver,
  storefrontBottleImages.joint,
  storefrontBottleImages.brain,
  storefrontBottleImages.sleep,
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function hashSeed(value: string): number {
  let total = 0;

  for (const character of value) {
    total += character.codePointAt(0) ?? 0;
  }

  return total;
}

export function getStorefrontBottleImage(input: { id?: string; title: string; category?: string | null }): string {
  const text = normalizeText(`${input.title} ${input.category ?? ''}`);

  if (text.includes('睡眠') || text.includes('压力')) {
    return storefrontBottleImages.sleep;
  }

  if (text.includes('脑') || text.includes('专注') || text.includes('记忆')) {
    return storefrontBottleImages.brain;
  }

  if (text.includes('肝') || text.includes('代谢')) {
    return storefrontBottleImages.liver;
  }

  if (text.includes('关节') || text.includes('骨')) {
    return storefrontBottleImages.joint;
  }

  if (text.includes('免疫') || text.includes('防护')) {
    return storefrontBottleImages.immune;
  }

  if (
    text.includes('能量') ||
    text.includes('活力') ||
    text.includes('维生素') ||
    text.includes('营养') ||
    text.includes('补充') ||
    text.includes('daily')
  ) {
    return storefrontBottleImages.energy;
  }

  const seed = input.id ? `${input.id}:${input.title}:${input.category ?? ''}` : `${input.title}:${input.category ?? ''}`;
  return fallbackOrder[hashSeed(seed) % fallbackOrder.length];
}
