import Image from 'next/image';

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <Image
      className={`brand-mark ${className}`.trim()}
      src="/images/home/homepage-kit/assets/branding/rongwang-health-logo-header.png"
      alt=""
      width={220}
      height={58}
      priority
    />
  );
}
