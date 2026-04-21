import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}
