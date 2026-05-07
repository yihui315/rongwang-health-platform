import type { HomeIconName } from '@/src/lib/home/home-content';

type HomeIconProps = {
  name: HomeIconName;
  className?: string;
};

export default function HomeIcon({ name, className = '' }: HomeIconProps) {
  const commonProps = {
    className: `home-icon ${className}`.trim(),
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  switch (name) {
    case 'clipboard-check':
      return (
        <svg {...commonProps}>
          <path d="M9 4h6l1 2h2v14H6V6h2l1-2Z" />
          <path d="M9 13.2 11 15l4-4.2" />
        </svg>
      );
    case 'shield-heart':
      return (
        <svg {...commonProps}>
          <path d="M12 3 19 6v5.5c0 4.2-2.8 7.3-7 9.5-4.2-2.2-7-5.3-7-9.5V6l7-3Z" />
          <path d="M8.8 12.2c-.9-1.4.6-3 2-2 .5.3.8.8 1.2 1.3.4-.5.7-1 1.2-1.3 1.4-1 2.9.6 2 2-.7 1.2-2.1 2.1-3.2 3-1.1-.9-2.5-1.8-3.2-3Z" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 3 19 6v5.5c0 4.2-2.8 7.3-7 9.5-4.2-2.2-7-5.3-7-9.5V6l7-3Z" />
          <path d="M8.5 12.5 11 15l4.5-5" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...commonProps}>
          <path d="M3 6h11v9H3V6Z" />
          <path d="M14 9h3.5L21 12.5V15h-7V9Z" />
          <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...commonProps}>
          <path d="M19 15.7A8 8 0 0 1 8.3 5a7 7 0 1 0 10.7 10.7Z" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...commonProps}>
          <path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3 14 9l6 2-6 2-2 8-2-8-6-2 6-2 2-6Z" />
        </svg>
      );
    case 'female':
      return (
        <svg {...commonProps}>
          <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 13v8M8.5 17h7" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...commonProps}>
          <path d="M5 19c8 0 13-5 14-14-8 1-14 6-14 14Z" />
          <path d="M5 19c3.5-4.5 7-7.5 12-10" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...commonProps}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15v-4M12 15V8M16 15v-7" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9S14.4 18.5 12 21M12 3c-2.4 2.5-3.5 5.5-3.5 9S9.6 18.5 12 21" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M5 12.5 10 17l9-10" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'plane':
      return (
        <svg {...commonProps}>
          <path d="m3 11 18-8-8 18-2-7-8-3Z" />
          <path d="m11 14 4-4" />
        </svg>
      );
    case 'quote':
      return (
        <svg {...commonProps}>
          <path d="M8 11H5.5C5.5 7.5 7 5.7 10 5v3c-1.3.3-2 1.2-2 3Zm9 0h-2.5c0-3.5 1.5-5.3 4.5-6v3c-1.3.3-2 1.2-2 3Z" />
        </svg>
      );
    default:
      return null;
  }
}
