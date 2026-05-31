import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

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
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
