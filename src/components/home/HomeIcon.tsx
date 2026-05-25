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
    role: 'img' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  switch (name) {
    case 'clipboard-check':
      return (
        <svg {...commonProps}>
          <rect x="6.7" y="5.2" width="10.6" height="13.6" rx="2.1" />
          <path d="M9 4.8h6M9 8.2h6" />
          <path d="M9.1 13.4 10.8 15l4.1-4.1" />
        </svg>
      );
    case 'shield-heart':
      return (
        <svg {...commonProps}>
          <path d="M12 3.2 19 6v5.2c0 4.1-2.7 7.1-7 9.4-4.3-2.3-7-5.3-7-9.4V6l7-2.8Z" />
          <path d="M9 12.5c-.7-1.2.4-2.4 1.6-2 .5.1.9.6 1.4 1.1.5-.5.9-1 1.4-1.1 1.2-.4 2.3.8 1.6 2-.8 1.3-2.2 2.1-3 2.8-.8-.7-2.2-1.5-3-2.8Z" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 3.2 19 6v5.2c0 4.1-2.7 7.1-7 9.4-4.3-2.3-7-5.3-7-9.4V6l7-2.8Z" />
          <path d="M8.9 12.6 11.1 15l4.2-4.6" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...commonProps}>
          <path d="M3.5 7h9.2v8.5H3.5V7Z" />
          <path d="M12.7 9.2h3.1l2.7 2.8v3.5h-5.8V9.2Z" />
          <path d="M7.1 19a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM16.8 19a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...commonProps}>
          <path d="M18.5 15.7A8 8 0 0 1 8.3 5.5a7 7 0 1 0 10.2 10.2Z" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...commonProps}>
          <path d="m13 2-7.2 11h5.2l-1 9L18 10h-5l1-8Z" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3.2 13.8 8.8 19 10.6 13.8 12.4 12 18 10.2 12.4 5 10.6l5.2-1.8L12 3.2Z" />
        </svg>
      );
    case 'female':
      return (
        <svg {...commonProps}>
          <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 13v7.2M8.8 16.8h6.4" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...commonProps}>
          <path d="M5.2 18.8c7.8 0 12.8-5 13.6-13.6-7.6.8-13 5.8-13.6 13.6Z" />
          <path d="M5.2 18.8c3.3-4.2 6.6-7 11.7-9.7" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...commonProps}>
          <path d="M4.5 19V5.5" />
          <path d="M4.5 19h15" />
          <path d="M8.5 15v-4M12.5 15V8.3M16.5 15V7.2" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M3 12h18M12 3c2.2 2.4 3.2 5.3 3.2 9S14.2 18.6 12 21M12 3c-2.2 2.4-3.2 5.3-3.2 9S9.8 18.6 12 21" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M5.2 12.5 9.7 17l9.1-10" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M12 7.3v4.8l2.8 1.8" />
        </svg>
      );
    case 'plane':
      return (
        <svg {...commonProps}>
          <path d="m3 11 17.8-8-7.8 17.8-2-6.9-8-2.9Z" />
          <path d="m11 14 4-4" />
        </svg>
      );
    case 'quote':
      return (
        <svg {...commonProps}>
          <path d="M8 11H5.5C5.5 7.5 7 5.7 10 5v3c-1.3.3-2 1.2-2 3Zm9 0h-2.5c0-3.5 1.5-5.3 4.5-6v3c-1.3.3-2 1.2-2 3Z" />
        </svg>
      );
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4 4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
          <path d="M3.8 18.2c0-2.4 1.8-4.4 4.4-4.4s4.4 2 4.4 4.4" />
          <path d="M15.5 11a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" />
          <path d="M13.3 18.1c0-1.9 1.5-3.5 3.4-3.5 1.7 0 3.1 1.2 3.5 2.9" />
        </svg>
      );
    case 'headset':
      return (
        <svg {...commonProps}>
          <path d="M4.5 12a7.5 7.5 0 0 1 15 0" />
          <path d="M4.5 12v4.2c0 1.1.9 2 2 2h1.5v-5.4H6.5a2 2 0 0 0-2 2Z" />
          <path d="M19.5 12v4.2c0 1.1-.9 2-2 2H16v-5.4h1.5a2 2 0 0 1 2 2Z" />
          <path d="M9 18.2c0 1.2 1 2.1 3 2.1" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...commonProps}>
          <path d="M4 5h1.4l1.3 8.2h8.5l1.4-5.8H7.2" />
          <path d="M7.2 13.2 6.7 16h8.2" />
          <circle cx="8.2" cy="18.2" r="1.3" />
          <circle cx="15.3" cy="18.2" r="1.3" />
        </svg>
      );
    default:
      return null;
  }
}
