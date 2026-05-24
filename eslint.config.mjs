import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      '.worktrees/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      '.rongwang-data/**',
      '网站图片/**',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default config;
