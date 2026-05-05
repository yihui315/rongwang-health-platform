import type { IconKey } from "@/lib/home/home-content";

interface HomeIconProps {
  name: IconKey;
  className?: string;
}

/**
 * 内联 SVG 图标组件 — 不依赖外部图标库 (lucide-react 等)。
 * 所有图标均为 outline 风格，stroke="currentColor"，便于通过 className 控制颜色。
 */
export default function HomeIcon({ name, className = "h-5 w-5" }: HomeIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "clipboard-check":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4V3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v1" />
          <path d="m9 13 2.2 2.2L15 11" />
        </svg>
      );
    case "shield-heart":
      return (
        <svg {...common}>
          <path d="M12 21s7-3.2 7-9V5.6L12 3 5 5.6V12c0 5.8 7 9 7 9Z" />
          <path d="M12 14.5s-2.6-1.5-2.6-3.4a1.5 1.5 0 0 1 2.6-1 1.5 1.5 0 0 1 2.6 1c0 1.9-2.6 3.4-2.6 3.4Z" />
        </svg>
      );
    case "shield-check":
      return (
        <svg {...common}>
          <path d="M12 21s7-3.2 7-9V5.6L12 3 5 5.6V12c0 5.8 7 9 7 9Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m13 3-2 7h5l-4 11 2-8H9Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 21s7-3.2 7-9V5.6L12 3 5 5.6V12c0 5.8 7 9 7 9Z" />
        </svg>
      );
    case "venus":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5.2" />
          <path d="M12 14.5V21" />
          <path d="M9 18h6" />
        </svg>
      );
    case "logic":
      return (
        <svg {...common}>
          <path d="M4 7h6" />
          <path d="M4 12h10" />
          <path d="M4 17h7" />
          <circle cx="17" cy="14" r="3" />
          <path d="M19.2 16.2 21 18" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 13 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13 13 0 0 1 0 18" />
          <path d="M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
    case "stethoscope":
      return (
        <svg {...common}>
          <path d="M5 3v6a4 4 0 0 0 8 0V3" />
          <path d="M9 13v3a4 4 0 0 0 8 0v-2" />
          <circle cx="17" cy="11" r="2" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01" />
          <path d="M11 12h1v5h1" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4l11-11-4-4L4 16Z" />
          <path d="m14 6 4 4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    default:
      return null;
  }
}
