import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
};

export default function Button({ children, className = "" }: ButtonProps) {
  return (
    <button className={`rounded-full px-5 py-3 font-semibold transition ${className}`}>
      {children}
    </button>
  );
}
